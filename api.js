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
router.get('/ListarAngel', listarAngels);
router.get('/ListarVisitor', listarVisitors);
router.post('/Login', login);

module.exports = router;