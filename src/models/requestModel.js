const { db } = require('../database/sqlite');
function create(userId, productId, token, expires) {
  return db.prepare(`INSERT INTO requests(user_id,product_id,status,token,token_expires_at) VALUES(?,?, 'Aguardando retirada', ?, ?)`)
    .run(userId,productId,token,expires);
}
module.exports = {
  create,
  findByToken(token) { return db.prepare(`SELECT r.*, p.name product_name, p.stock FROM requests r JOIN products p ON p.id=r.product_id WHERE r.token=?`).get(token); },
  forUser(userId) { return db.prepare(`SELECT r.*,p.name product_name FROM requests r JOIN products p ON p.id=r.product_id WHERE r.user_id=? ORDER BY r.id DESC`).all(userId); },
  consume(id) { return db.prepare(`UPDATE requests SET status='Retirado', used_at=CURRENT_TIMESTAMP WHERE id=? AND status='Aguardando retirada'`).run(id); }
};
