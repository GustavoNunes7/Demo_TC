const { db } = require('../database/sqlite');
module.exports = {
  findByEmail(email) { return db.prepare('SELECT * FROM users WHERE email = ?').get(email); },
  findById(id) { return db.prepare('SELECT id,name,email,role,created_at FROM users WHERE id = ?').get(id); },
  all() { return db.prepare('SELECT id,name,email,role,created_at FROM users ORDER BY name').all(); },
  create({name,email,password,role}) { return db.prepare('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)').run(name,email,password,role); }
};
