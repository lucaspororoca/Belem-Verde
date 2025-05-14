const db = require('better-sqlite3')('ProjetoCop30.db');
const { criptografarSenha, compararSenhas } = require('./cript');
const { validarIdiomas, validarEmailUnico, validarUsernameUnico } = require('./middleware');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        nome TEXT,
        email TEXT UNIQUE,
        idade INTEGER,
        genero TEXT,
        senha TEXT,
        status TEXT,
        nacionalidade TEXT,
        cidade TEXT,
        idiomas TEXT,
        disponibilidade BOOLEAN
    )
`);

async function cadastrarUsuario(dados, status) {
    if (!validarIdiomas(dados.idiomas)) {
        throw new Error('Máximo de 3 idiomas permitido');
    }

    if (!validarEmailUnico(dados.email)) {
        throw new Error('E-mail já cadastrado');
    }

    if (!validarUsernameUnico(dados.username)) {
        throw new Error('Username já cadastrado');
    }

    const senhaCriptografada = await criptografarSenha(dados.senha);

    const stmt = db.prepare(`
        INSERT INTO users (username, nome, email, idade, genero, senha, status, nacionalidade, cidade, idiomas, disponibilidade)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
        dados.username,
        dados.nome,
        dados.email,
        dados.idade,
        dados.genero,
        senhaCriptografada,
        status,
        dados.nacionalidade,
        dados.cidade,
        JSON.stringify(dados.idiomas),
        dados.disponibilidade
    );
}

async function cadastrarAngel(req, res) {
    try {
        await cadastrarUsuario(req.body, 'angel');
        res.status(201).json({ message: 'Angel cadastrado com sucesso' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function cadastrarVisitor(req, res) {
    try {
        await cadastrarUsuario(req.body, 'visitor');
        res.status(201).json({ message: 'Visitor cadastrado com sucesso' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

function listarAngels(req, res) {
    const stmt = db.prepare('SELECT * FROM users WHERE status = ?');
    const angels = stmt.all('angel');
    res.json(angels);
}

function listarVisitors(req, res) {
    const stmt = db.prepare('SELECT * FROM users WHERE status = ?');
    const visitors = stmt.all('visitor');
    res.json(visitors);
}

async function login(req, res) {
    const { username, senha } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await compararSenhas(senha, user.senha);
    if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({ nome: user.nome, email: user.email });
}

module.exports = {
    cadastrarAngel,
    cadastrarVisitor,
    listarAngels,
    listarVisitors,
    login
};
