const { db } = require('../database/sqlite');
module.exports = {
  all() { return db.prepare('SELECT * FROM products WHERE available = 1 ORDER BY id').all(); },
  find(id) { return db.prepare('SELECT * FROM products WHERE id = ?').get(id); },
  updateStock(id, delta) { return db.prepare('UPDATE products SET stock = MAX(0, stock + ?) WHERE id = ?').run(delta,id); }
};
