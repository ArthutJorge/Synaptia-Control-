const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Caminho do arquivo para salvar os estados
const STATE_FILE = './state.json';

// Função para carregar o estado do arquivo
function loadState() {
    try {
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Erro ao carregar o estado:', err.message);
        return { overallProgress: 0, barsProgress: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } };
    }
}

// Função para salvar o estado no arquivo
function saveState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (err) {
        console.error('Erro ao salvar o estado:', err.message);
    }
}

// Carregar estado inicial
let { overallProgress, barsProgress } = loadState();

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    // Enviar estado inicial ao cliente
    socket.emit('initialState', {
        overall: overallProgress,
        bars: barsProgress,
    });

    // Atualizar progresso geral ou individual
    socket.on('updateProgress', (data) => {
        if (data.id === 'overall') {
            overallProgress = data.width;
        } else {
            barsProgress[data.id] = data.width;
        }

        // Salvar estado atualizado no arquivo
        saveState({ overallProgress, barsProgress });

        // Emitir atualização para todos os clientes
        io.emit('progressUpdated', data);
    });

    // Limpar dados
    socket.on('limparDados', () => {
        overallProgress = 0;
        barsProgress = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        // Salvar estado limpo no arquivo
        saveState({ overallProgress, barsProgress });

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
