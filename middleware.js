const db = require('better-sqlite3')('ProjetoCop30.db');

function validarIdiomas(idiomas) {
    return idiomas.length <= 3;
}

function validarEmailUnico(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    return !user;
}

function validarUsernameUnico(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);
    return !user;
}

module.exports = { validarIdiomas, validarEmailUnico, validarUsernameUnico };