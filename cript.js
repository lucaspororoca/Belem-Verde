const bcrypt = require('bcrypt');
const saltRounds = 10;

async function criptografarSenha(senha) {
    return await bcrypt.hash(senha, saltRounds);
}

async function compararSenhas(senhaDigitada, senhaHash) {
    return await bcrypt.compare(senhaDigitada, senhaHash);
}

module.exports = { criptografarSenha, compararSenhas };
