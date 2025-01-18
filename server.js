const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conexão com o MongoDB estabelecida'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err.message));

const stateSchema = new mongoose.Schema({
    overallProgress: { type: Number, required: true, default: 0 },
    barsProgress: {
        type: Map,
        of: Number,
        required: true,
        default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    }
});

const State = mongoose.model('State', stateSchema);

async function loadState() {
    let state = await State.findOne();
    if (!state) {
        state = new State({
            overallProgress: 0,
            barsProgress: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
        });
        await state.save();
    }
    return state;
}

async function saveState(overallProgress, barsProgress) {
    let state = await State.findOne();
    if (!state) {
        state = new State({ overallProgress, barsProgress });
    } else {
        state.overallProgress = overallProgress;
        state.barsProgress = barsProgress;
    }
    await state.save();
}

// Variáveis para estado inicial
let overallProgress = 0;
let barsProgress = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

(async () => {
    try {
        const state = await loadState();
        overallProgress = state.overallProgress;
        barsProgress = Object.fromEntries(state.barsProgress); 

        // Iniciar servidor após carregar o estado
        server.listen(4040, () => {
            console.log('Servidor rodando na porta 4040');
        });
    } catch (err) {
        console.error('Erro ao carregar o estado inicial:', err.message);
        process.exit(1); 
    }
})();

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    socket.emit('initialState', {
        overall: overallProgress,
        bars: barsProgress
    });

    socket.on('updateProgress', async (data) => {
        if (data.id === 'overall') {
            overallProgress = data.width;
        } else {
            barsProgress[data.id] = data.width;
        }
        await saveState(overallProgress, barsProgress);

        io.emit('progressUpdated', data);
    });

    // Limpar dados
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