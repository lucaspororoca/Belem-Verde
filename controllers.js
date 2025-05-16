const db = require('better-sqlite3')('ProjetoCop30.db');
const crypto = require('crypto');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT,
        salt TEXT,
        idade INTEGER,
        genero TEXT,
        nacionalidade TEXT,
        cidade TEXT,
        idiomas TEXT DEFAULT '[]',
        disponibilidade INTEGER DEFAULT 0,
        is_angel INTEGER DEFAULT 0,
        is_visitor INTEGER DEFAULT 0
    )
`);

async function hashPassword(password, salt) {
    return new Promise((resolve) => {
        crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derivedKey) => {
            resolve(derivedKey.toString('hex'));
        });
    });
}

async function cadastrarUsuario(dados, tipo) {
    const salt = crypto.randomBytes(16).toString('hex');
    const senhaHash = await hashPassword(dados.senha, salt);

    const stmt = db.prepare(`
        INSERT INTO users (
            username, nome, email, senha, salt, idade, genero, 
            nacionalidade, cidade, idiomas, disponibilidade, 
            is_angel, is_visitor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
        dados.username,
        dados.nome,
        dados.email,
        senhaHash,
        salt,
        dados.idade,
        dados.genero,
        dados.nacionalidade,
        dados.cidade,
        dados.idiomas || '[]',
        dados.disponibilidade || 0,
        tipo === 'angel' ? 1 : 0,
        tipo === 'visitor' ? 1 : 0
    );
}

async function login(req, res) {
    const { username, senha } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaHash = await hashPassword(senha, user.salt);
    if (senhaHash !== user.senha) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user.id }, 'SEGREDO_JWT', { expiresIn: '1h' });
    res.json({ 
        nome: user.nome, 
        token, 
        is_angel: user.is_angel, 
        is_visitor: user.is_visitor 
    });
}

module.exports = {
    cadastrarAngel: async (req, res) => {
        try {
            await cadastrarUsuario(req.body, 'angel');
            res.status(201).json({ message: 'Angel cadastrado com sucesso' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    cadastrarVisitor: async (req, res) => {
        try {
            await cadastrarUsuario(req.body, 'visitor');
            res.status(201).json({ message: 'Visitor cadastrado com sucesso' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    listarAngels: (req, res) => {
        const stmt = db.prepare('SELECT * FROM users WHERE is_angel = 1');
        res.json(stmt.all());
    },
    listarVisitors: (req, res) => {
        const stmt = db.prepare('SELECT * FROM users WHERE is_visitor = 1');
        res.json(stmt.all());
    },
    login
};
