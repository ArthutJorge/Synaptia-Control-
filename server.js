require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const stateSchema = new mongoose.Schema({
    overallProgress: Number,
    barsProgress: Object,
}, { collection: 'states' });

const State = mongoose.model('State', stateSchema);

async function loadState() {
    try {
        const state = await State.findOne();
        if (state) {
            return state;
        } else {
            const initialState = {
                overallProgress: 0,
                barsProgress: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
            };
            await new State(initialState).save();
            return initialState;
        }
    } catch (err) {
        console.error('Erro ao carregar o estado inicial:', err.message);
        throw err;
    }
}

async function saveState(state) {
    try {
        await State.updateOne({}, { $set: state });
    } catch (err) {
        console.error('Erro ao salvar o estado:', err.message);
    }
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Conexão com o MongoDB estabelecida.');

        const initialState = await loadState();

        let { overallProgress, barsProgress } = initialState;

        app.use(express.static('public'));

        io.on('connection', (socket) => {
            console.log('Novo cliente conectado');

            socket.emit('initialState', {
                overall: overallProgress,
                bars: barsProgress,
            });

            socket.on('updateProgress', async (data) => {
                if (data.id === 'overall') {
                    overallProgress = data.width;
                } else {
                    barsProgress[data.id] = data.width;
                }

                await saveState({ overallProgress, barsProgress });

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
    })
    .catch((err) => {
        console.error('Erro ao conectar ao MongoDB:', err.message);
        process.exit(1);
    });
