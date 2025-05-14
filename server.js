const express = require('express');
const app = express();
const apiRouter = require('./api');

app.use(express.json());
app.use('/api', apiRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
