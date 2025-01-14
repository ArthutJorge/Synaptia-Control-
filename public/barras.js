const socket = io(); // Conecta ao servidor Socket.IO

const numBars = 6;
const overallBar = document.getElementById('overall-bar').firstElementChild;
const warnings = document.getElementById('warnings');
const calls = document.getElementById('calls');

window.onload = () => {
    const controlButtons = document.querySelectorAll('.control');
    controlButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled'); // Adiciona a classe disabled para estilização
    });
}

function login() {
    const username = prompt("Digite o seu nome de usuário:");
    const password = prompt("Digite a sua senha:");

    // Lista de usuários e senhas
    const users = {
        "Alma": "emopt",
        "Lucas": "mteop",
        "Mikka": "oempt",
        "Heitor": "pmoet",
        "Marcos": "tmoep",
        "Lutie": "tempo",
        "Pera": "04130211Pera"
    };

    // Verificar credenciais
    if (users[username] === password) {
        // Desabilitar todos os botões de controle
        const controlButtons = document.querySelectorAll('.control');
        controlButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('disabled'); // Adicionar a classe disabled
        });

        if (username === "Pera") {
            // Tornar visíveis os botões inv para o Pera
            const invButtons = document.querySelectorAll('.inv');
            invButtons.forEach(button => button.style.visibility = 'visible');
        } else {
            // Habilitar os botões do usuário específico
            const userButtons = document.querySelectorAll(`.grid-item[data-user="${username}"] .control`);
            userButtons.forEach(button => {
                button.disabled = false;
                button.classList.remove('disabled'); // Remover a classe disabled
            });
        }
    }
}


// Função para atualizar a barra geral
function updateInd(change) {
    let currentWidth = (parseFloat(overallBar.style.width) || 0) + change;
    
    // Limitar entre 0 e 100 e arredondar se próximo
    currentWidth = Math.min(100, Math.max(0, currentWidth));
    if (Math.abs(currentWidth - 100) < 0.5) currentWidth = 100; // Arredonda para 100 se próximo
    if (Math.abs(currentWidth) < 0.5) currentWidth = 0;         // Arredonda para 0 se próximo
    
    overallBar.style.width = `${currentWidth}%`;
    // Enviar a atualização da barra geral para o servidor
    socket.emit('updateProgress', { id: 'overall', width: currentWidth });
}

// Função para atualizar o progresso de barras individuais
function updateProgress(id, change) {
    const bar = document.getElementById(`bar-${id}`).firstElementChild;
    let individualWidth = Math.min(100, Math.max(0, (parseFloat(bar.style.width) || 0) + change));
    
    if ((change > 0 && individualWidth > parseFloat(bar.style.width) || 0) ||
        (change < 0 && individualWidth < parseFloat(bar.style.width) || 0)) {
        bar.style.width = `${individualWidth}%`;
        updateOverall(change > 0 ? 3.33 : -3.33);

        // Enviar a atualização para o servidor
        socket.emit('updateProgress', { id: id, width: individualWidth });
    }
}

// Função para atualizar a barra geral
function updateOverall(change) {
    let currentWidth = (parseFloat(overallBar.style.width) || 0) + change;
    
    // Limitar entre 0 e 100 e arredondar se próximo
    currentWidth = Math.min(100, Math.max(0, currentWidth));
    if (Math.abs(currentWidth - 100) < 0.5) currentWidth = 100; // Arredonda para 100 se próximo
    if (Math.abs(currentWidth) < 0.5) currentWidth = 0;         // Arredonda para 0 se próximo
    
    overallBar.style.width = `${currentWidth}%`;
    // Enviar a atualização para o servidor
    socket.emit('updateProgress', { id: 'overall', width: currentWidth });
}

// Funções para adicionar mensagens de advertência e chamados
function addWarning(name) {
    const div = document.createElement('div');
    div.textContent = `${name} está sendo advertido.`;
    warnings.appendChild(div);
}

function addCall(name) {
    const div = document.createElement('div');
    div.textContent = `${name} está sendo chamado.`;
    calls.appendChild(div);
}

// Ouvir eventos de atualização de progresso enviados pelo servidor
socket.on('progressUpdated', (data) => {
    if (data.id === 'overall') {
        overallBar.style.width = `${data.width}%`; // Atualiza a barra geral
    } else {
        const bar = document.getElementById(`bar-${data.id}`).firstElementChild;
        bar.style.width = `${data.width}%`; // Atualiza a barra de acordo com os dados recebidos
    }
});

// Ouvir evento de estado inicial ao se conectar
socket.on('initialState', (data) => {
    overallBar.style.width = `${data.overall}%`;
    for (let id in data.bars) {
        const bar = document.getElementById(`bar-${id}`).firstElementChild;
        bar.style.width = `${data.bars[id]}%`;
    }
});
