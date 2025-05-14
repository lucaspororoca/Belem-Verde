const express = require('express');
const router = express.Router();
const {
    cadastrarAngel,
    cadastrarVisitor,
    listarAngels,
    listarVisitors,
    login
} = require('./controllers');

router.post('/CadastroAngel', cadastrarAngel);
router.post('/CadastroVisitor', cadastrarVisitor);
router.get('/ListarAngel', listarAngels);
router.get('/ListarVisitor', listarVisitors);
router.post('/Login', login);

module.exports = router;
