const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('./ProjetoCop30.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    senha_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    cidade TEXT NOT NULL,
    idioma TEXT NOT NULL,
    disponibilidade BOOLEAN NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    angel_id INTEGER NOT NULL,
    visitor_id INTEGER NOT NULL,
    FOREIGN KEY (angel_id) REFERENCES users (id),
    FOREIGN KEY (visitor_id) REFERENCES users (id)
  )`);
});

app.post('/CadastroAngel', async (req, res) => {
  const { username, senha, email, cidade, idioma, disponibilidade } = req.body;
  const senha_hash = await bcrypt.hash(senha, 10);
  const role = 'angel';

  db.run(
    'INSERT INTO users (username, senha_hash, email, role, cidade, idioma, disponibilidade) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, senha_hash, email, role, cidade, idioma, disponibilidade],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.post('/CadastroVisitor', async (req, res) => {
  const { username, senha, email, cidade, idioma, disponibilidade } = req.body;
  const senha_hash = await bcrypt.hash(senha, 10);
  const role = 'visitor';

  db.run(
    'INSERT INTO users (username, senha_hash, email, role, cidade, idioma, disponibilidade) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, senha_hash, email, role, cidade, idioma, disponibilidade],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.get('/ListarAngel', (req, res) => {
  db.all(
    'SELECT username, email FROM users WHERE role = ?',
    ['angel'],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.get('/ListarVisitor', (req, res) => {
  db.all(
    'SELECT username, email FROM users WHERE role = ?',
    ['visitor'],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.post('/Associar', async (req, res) => {
  const { angel_id, visitor_id } = req.body;

  db.get(
    'SELECT COUNT(*) as count FROM matches WHERE angel_id = ?',
    [angel_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row.count >= 3) {
        return res.status(400).json({ error: 'Um angel pode ter no máximo 3 visitors' });
      }

      db.run(
        'INSERT INTO matches (angel_id, visitor_id) VALUES (?, ?)',
        [angel_id, visitor_id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ id: this.lastID });
        }
      );
    }
  );
});

app.get('/BuscarAngel', (req, res) => {
  const { idioma, cidade, disponibilidade } = req.query;

  db.all(
    'SELECT id, username, email FROM users WHERE role = ? AND idioma = ? AND cidade = ? AND disponibilidade = ?',
    ['angel', idioma, cidade, disponibilidade],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
