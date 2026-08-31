const bcrypt=require('bcryptjs');
const {db,initDatabase}=require('./src/database/sqlite');
initDatabase();
const users=[
 ['Usuário Aluno','aluno@techcampus.local','123456','aluno'],
 ['Professor TechCampus','professor@techcampus.local','123456','professor'],
 ['Secretaria TechCampus','secretaria@techcampus.local','123456','secretaria'],
 ['Gestor TechCampus','gestor@techcampus.local','123456','gestor'],
 ['Portaria TechCampus','portaria@techcampus.local','123456','portaria']
];
const insUser=db.prepare('INSERT OR IGNORE INTO users(name,email,password,role) VALUES(?,?,?,?)');
for(const u of users) insUser.run(u[0],u[1],bcrypt.hashSync(u[2],10),u[3]);
const count=db.prepare('SELECT COUNT(*) c FROM products').get().c;
if(!count){const ins=db.prepare('INSERT INTO products(name,description,category,stock,image) VALUES(?,?,?,?,?)');ins.run('Uniforme Escolar','Camisa oficial da rede. Conforto e identidade para o dia a dia escolar.','Uniformes',25,'uniforme');ins.run('Bolinha de Ping Pong','Bolinha oficial para treinos e campeonatos internos.','Esportes',43,'pingpong');ins.run('Bola de Futebol','Bola oficial para jogos e treinamentos.','Esportes',8,'futebol');ins.run('Boné TechCampus','Boné institucional para alunos e colaboradores.','Acessórios',9,'bone');}
const noticeCount=db.prepare('SELECT COUNT(*) c FROM notices').get().c;
if(!noticeCount){const gestor=db.prepare(`SELECT id FROM users WHERE role='gestor' LIMIT 1`).get();const p=db.prepare('INSERT INTO notices(title,body,category,audience,created_by) VALUES(?,?,?,?,?)');p.run('Novo aviso da AAPM','Confira as novidades sobre benefícios e atividades.','Aviso geral','todos',gestor.id);p.run('Semana de Integração 2026','Participe da semana de integração e conheça novas oportunidades.','Evento','todos',gestor.id);p.run('Período de solicitação de uniformes','Fique atento às datas para solicitar seu uniforme com desconto.','Uniformes','aluno',gestor.id);}
const evCount=db.prepare('SELECT COUNT(*) c FROM events').get().c;
if(!evCount){const gestor=db.prepare(`SELECT id FROM users WHERE role='gestor' LIMIT 1`).get();const e=db.prepare('INSERT INTO events(title,description,event_date,vacancies,created_by) VALUES(?,?,?,?,?)');e.run('Semana de Integração 2026','Atividades e palestras para a comunidade escolar.','2026-09-15 09:00',100,gestor.id);e.run('Palestra de Tecnologia','Encontro sobre carreira e inovação.','2026-09-25 14:00',60,gestor.id);}
console.log('Banco TechCampus preparado.');
