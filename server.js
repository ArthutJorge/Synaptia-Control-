const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Inicializa o servidor Express
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

// Servir os arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// Quando um cliente se conecta
io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    // Enviar o estado atual das barras para o cliente
    socket.emit('initialState', {
        overall: overallProgress,
        bars: barsProgress
    });

    // Escutar mudanças nas barras de progresso
    socket.on('updateProgress', (data) => {
        if (data.id === 'overall') {
            // Atualiza o progresso da barra geral
            overallProgress = data.width;
        } else {
            // Atualiza o progresso das barras individuais
            barsProgress[data.id] = data.width;
        }

        // Emitir para todos os outros clientes
        io.emit('progressUpdated', data);
    });

    // Limpeza ao desconectar
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar o servidor na porta 4040
server.listen(4040, () => {
    console.log('Servidor rodando na porta 4040');
});
