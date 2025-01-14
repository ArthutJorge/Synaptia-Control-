const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Variáveis para armazenar os estados das barras
let overallProgress = 0;
let barsProgress = {
    1: 0, // Alma
    2: 0, // Lutie
    3: 0, // Mikka
    4: 0, // Lucas
    5: 0, // Marcos
    6: 0  // Heitor
};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    socket.emit('initialState', {
        overall: overallProgress,
        bars: barsProgress
    });

    socket.on('updateProgress', (data) => {
        if (data.id === 'overall') {
            overallProgress = data.width;
        } else {
            barsProgress[data.id] = data.width;
        }

        io.emit('progressUpdated', data);
    });

    socket.on('limparDados', () => {
        io.emit('limparDados');
    });

    socket.on('addWarning', (data) => {
        io.emit('addWarning', data); 
    });

    socket.on('addCall', (data) => {
        io.emit('addCall', data);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(4040, () => {
    console.log('Servidor rodando na porta 4040');
});
