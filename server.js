const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: ['http://localhost:5500', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const apiRouter = require('./api');
app.use('/api', apiRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});