const express = require('express');
const router = express.Router();
const {
    cadastrarAngel,
    cadastrarVisitor,
    listarAngels,
    listarVisitors,
    login
} = require('./controllers');

router.post('/CadastrarAngel', cadastrarAngel);
router.post('/CadastrarVisitor', cadastrarVisitor);
router.post('/CadastrarEstudante', cadastrarEstudante);
router.post('/CadastrarEstudanteEstrangeiro', cadastrarEstudanteEstrangeiro);
router.get('/ListarAngel', listarAngels);
router.get('/ListarVisitor', listarVisitors);
router.get('/ListarEstudante', listarEstudante);
router.get('/ListarEstudanteEstrangeiro', listarEstudanteEstrangeiro);
router.post('/Login', login);

module.exports = router;
