const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { db } = require('../database/sqlite');
const { requireAuth, requireRoles } = require('../middlewares/auth');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const requestModel = require('../models/requestModel');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, ['application/pdf','image/jpeg','image/png'].includes(file.mimetype))
});

router.get('/health', (_,res)=>res.json({ok:true,service:'TechCampus'}));

router.post('/auth/login', (req,res)=>{
  const { email, password } = req.body;
  const user = userModel.findByEmail(String(email || '').trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password)) return res.status(401).json({error:'E-mail ou senha incorretos.'});
  req.session.user = { id:user.id, name:user.name, email:user.email, role:user.role };
  res.json({user:req.session.user});
});
router.post('/auth/logout', (req,res)=>req.session.destroy(()=>res.json({ok:true})));
router.get('/auth/me', requireAuth, (req,res)=>res.json({user:req.session.user}));
router.post('/auth/register', (req,res)=>{
  const {name,email,password,role='aluno'}=req.body;
  if (!name || !email || !password) return res.status(400).json({error:'Preencha nome, e-mail e senha.'});
  if (!['aluno','professor','secretaria','gestor','portaria'].includes(role)) return res.status(400).json({error:'Perfil inválido.'});
  try {
    const hash=bcrypt.hashSync(password,10);
    const result=userModel.create({name,email:email.toLowerCase(),password:hash,role});
    res.status(201).json({id:result.lastInsertRowid});
  } catch(e) { res.status(409).json({error:'Este e-mail já está cadastrado.'}); }
});

router.get('/dashboard', requireAuth, (req,res)=>{
  const role=req.session.user.role;
  const userId=req.session.user.id;
  const data={
    role,
    notices: db.prepare(`SELECT * FROM notices WHERE audience='todos' OR audience=? ORDER BY id DESC LIMIT 3`).all(role),
    events: db.prepare(`SELECT * FROM events WHERE event_date >= datetime('now') ORDER BY event_date LIMIT 5`).all(),
    notifications: db.prepare(`SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 5`).all(userId)
  };
  if(role==='aluno') {
    data.requests=requestModel.forUser(userId).slice(0,5);
    const total=db.prepare('SELECT COUNT(*) c FROM attendance WHERE student_id=?').get(userId).c;
    const present=db.prepare('SELECT COUNT(*) c FROM attendance WHERE student_id=? AND present=1').get(userId).c;
    data.attendance={total,present,percentage:total?Math.round(present/total*100):100};
    data.absenceRequests=db.prepare('SELECT * FROM absence_requests WHERE student_id=? ORDER BY id DESC LIMIT 5').all(userId);
  }
  res.json(data);
});

router.get('/notices', requireAuth, (req,res)=>res.json(db.prepare(`SELECT n.*,u.name author FROM notices n LEFT JOIN users u ON u.id=n.created_by WHERE n.audience='todos' OR n.audience=? ORDER BY n.id DESC`).all(req.session.user.role)));
router.post('/notices', requireRoles('professor','secretaria','gestor'), (req,res)=>{
  const {title,body,category='Geral',audience='todos'}=req.body;
  const r=db.prepare('INSERT INTO notices(title,body,category,audience,created_by) VALUES(?,?,?,?,?)').run(title,body,category,audience,req.session.user.id);
  res.status(201).json({id:r.lastInsertRowid});
});

router.get('/products', requireAuth, (_,res)=>res.json(productModel.all()));
router.get('/requests', requireAuth, (req,res)=>res.json(requestModel.forUser(req.session.user.id)));
router.post('/requests', requireAuth, (req,res)=>{
  const product=productModel.find(Number(req.body.productId));
  if(!product || product.stock<1) return res.status(400).json({error:'Produto sem estoque.'});
  const token=String(Math.floor(100000+Math.random()*900000));
  const expires=new Date(Date.now()+15*60*1000).toISOString();
  requestModel.create(req.session.user.id,product.id,token,expires);
  res.status(201).json({token,expiresAt:expires,product:product.name});
});

router.post('/iot/validate', (req,res)=>{
  const token=String(req.body.token||'').trim();
  const request=requestModel.findByToken(token);
  if(!request) return res.status(404).json({valid:false,error:'Token não encontrado.'});
  if(request.status!=='Aguardando retirada') return res.status(409).json({valid:false,error:'Token já utilizado ou encerrado.'});
  if(new Date(request.token_expires_at)<new Date()) return res.status(410).json({valid:false,error:'Token expirado.'});
  if(request.stock<1) return res.status(409).json({valid:false,error:'Produto sem estoque.'});
  res.json({valid:true,requestId:request.id,product:request.product_name});
});
router.post('/iot/confirm', (req,res)=>{
  const request=requestModel.findByToken(String(req.body.token||'').trim());
  if(!request) return res.status(404).json({error:'Token não encontrado.'});
  if(new Date(request.token_expires_at)<new Date()) return res.status(410).json({error:'Token expirado.'});
  const tx=db.transaction(()=>{
    const changed=requestModel.consume(request.id);
    if(!changed.changes) throw new Error('Token já consumido.');
    productModel.updateStock(request.product_id,-1);
    db.prepare(`INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)`).run(request.user_id,'Retirada confirmada',`Seu ${request.product_name} foi retirado na máquina TechCampus.`);
  });
  try { tx(); res.json({ok:true,message:'Retirada registrada e estoque atualizado.'}); }
  catch(e){res.status(409).json({error:e.message});}
});

router.get('/documents', requireAuth, (req,res)=>res.json(db.prepare('SELECT * FROM documents WHERE user_id=? ORDER BY id DESC').all(req.session.user.id)));
router.post('/documents', requireAuth, upload.single('document'), (req,res)=>{
  if(!req.file) return res.status(400).json({error:'Envie PDF, JPG ou PNG de até 10 MB.'});
  const r=db.prepare(`INSERT INTO documents(user_id,original_name,stored_name,mime_type,size) VALUES(?,?,?,?,?)`).run(req.session.user.id,req.file.originalname,req.file.filename,req.file.mimetype,req.file.size);
  res.status(201).json({id:r.lastInsertRowid,message:'Documento enviado.'});
});
router.get('/documents/all', requireRoles('secretaria','gestor'), (_,res)=>res.json(db.prepare(`SELECT d.*,u.name user_name,u.email FROM documents d JOIN users u ON u.id=d.user_id ORDER BY d.id DESC`).all()));
router.patch('/documents/:id', requireRoles('secretaria','gestor'), (req,res)=>{db.prepare('UPDATE documents SET status=? WHERE id=?').run(req.body.status,req.params.id);res.json({ok:true});});

router.get('/events', requireAuth, (_,res)=>res.json(db.prepare('SELECT * FROM events ORDER BY event_date').all()));
router.post('/events', requireRoles('professor','gestor','secretaria'), (req,res)=>{const {title,description,eventDate,vacancies=0}=req.body; const r=db.prepare('INSERT INTO events(title,description,event_date,vacancies,created_by) VALUES(?,?,?,?,?)').run(title,description,eventDate,vacancies,req.session.user.id);res.status(201).json({id:r.lastInsertRowid});});
router.post('/events/:id/register', requireAuth, (req,res)=>{try{const e=db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id);if(!e)return res.status(404).json({error:'Evento não encontrado.'});const count=db.prepare('SELECT COUNT(*) c FROM event_registrations WHERE event_id=?').get(e.id).c;if(count>=e.vacancies && e.vacancies>0)return res.status(409).json({error:'Não há vagas.'});db.prepare('INSERT INTO event_registrations(event_id,user_id) VALUES(?,?)').run(e.id,req.session.user.id);res.json({ok:true});}catch(e){res.status(409).json({error:'Você já está inscrito.'});}});

router.get('/attendance', requireAuth, (req,res)=>{
  if(req.session.user.role==='aluno') return res.json(db.prepare(`SELECT * FROM attendance WHERE student_id=? ORDER BY attendance_date DESC`).all(req.session.user.id));
  res.json(db.prepare(`SELECT a.*,s.name student_name FROM attendance a JOIN users s ON s.id=a.student_id ORDER BY attendance_date DESC LIMIT 100`).all());
});
router.post('/attendance', requireRoles('professor'), (req,res)=>{const {studentId,className,date,present}=req.body;db.prepare('INSERT INTO attendance(student_id,professor_id,class_name,attendance_date,present) VALUES(?,?,?,?,?)').run(studentId,req.session.user.id,className,date,present?1:0);res.status(201).json({ok:true});});

router.get('/absence-requests', requireAuth, (req,res)=>{if(req.session.user.role==='aluno')return res.json(db.prepare('SELECT * FROM absence_requests WHERE student_id=? ORDER BY id DESC').all(req.session.user.id));res.json(db.prepare(`SELECT a.*,u.name student_name FROM absence_requests a JOIN users u ON u.id=a.student_id ORDER BY a.id DESC`).all());});
router.post('/absence-requests', requireRoles('aluno'), (req,res)=>{const r=db.prepare('INSERT INTO absence_requests(student_id,reason) VALUES(?,?)').run(req.session.user.id,req.body.reason);res.status(201).json({id:r.lastInsertRowid});});
router.patch('/absence-requests/:id', requireRoles('secretaria','gestor'), (req,res)=>{db.prepare('UPDATE absence_requests SET status=? WHERE id=?').run(req.body.status,req.params.id);res.json({ok:true});});

router.get('/users', requireRoles('gestor'), (_,res)=>res.json(userModel.all()));
router.get('/stats', requireRoles('gestor'), (_,res)=>res.json({users:db.prepare('SELECT COUNT(*) c FROM users').get().c,products:db.prepare('SELECT COUNT(*) c FROM products').get().c,stock:db.prepare('SELECT COALESCE(SUM(stock),0) c FROM products').get().c,requests:db.prepare('SELECT COUNT(*) c FROM requests').get().c,documents:db.prepare('SELECT COUNT(*) c FROM documents').get().c}));
router.get('/notifications', requireAuth, (req,res)=>res.json(db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC').all(req.session.user.id)));
router.patch('/notifications/:id/read', requireAuth, (req,res)=>{db.prepare('UPDATE notifications SET read=1 WHERE id=? AND user_id=?').run(req.params.id,req.session.user.id);res.json({ok:true});});

module.exports=router;
