
let windowOpen = false;
let windowMaximized = false;

const contextMenu = document.querySelector(".context-menu");
const taskbarIcon = document.getElementById("taskbar-icon");

taskbarIcon.addEventListener("contextmenu", (event) => {
event.preventDefault(); 
const { clientX: mouseX, clientY: mouseY } = event;

contextMenu.style.top = `${mouseY - taskbarIcon.getBoundingClientRect().top - 10}px`;
contextMenu.style.left = `${mouseX}px`;
contextMenu.style.display = "block";

const closeContextMenu = (e) => {
    contextMenu.style.display = "none";
    document.removeEventListener("click", closeContextMenu);
};
document.addEventListener("click", closeContextMenu);
});

function toggleWindow(){
    if(windowOpen){
        minimizeWindow()
    } else{
        openWindow()
    }
}
// Abre a janela
function openWindow() {
    document.getElementById("window").style.display = "flex";
    document.getElementById("taskbar-icon").style.display = "flex";
    document.querySelector(".taskbar-icon").style.backgroundColor = "rgba(255, 255, 255, 0.2)"; 
    windowOpen = true;
}

// Minimizar a janela
function minimizeWindow() {
    document.getElementById("window").style.display = "none";
    document.querySelector(".taskbar-icon").style.backgroundColor = "transparent"; 
    windowOpen = false;
}

function maximizeWindow() {
    const windowElement = document.getElementById("window");

    if (windowMaximized) {
        windowElement.classList.remove("maximized");
        windowMaximized = false;
    } else {
        windowElement.classList.add("maximized");
        windowMaximized = true;
    }
}

function closeWindow() {
    document.getElementById("window").style = "display: none;position: absolute !important;"
    document.getElementById("taskbar-icon").style.display = "none";
    windowOpen = false;
}

function handleIconClick() {
    const Icon = document.querySelector(".icon");
    Icon.classList.add("focused");
    event.stopPropagation();
    // Remove a borda ao clicar em qualquer outro lugar
    document.addEventListener("click", (event) => {
        if (!Icon.contains(event.target)) {
            Icon.classList.remove("focused");
        }
    }, { once: true });
}

const windowElement = document.getElementById('window');
const windowHeader = document.querySelector('.window-header');

let isDragging = false;
let offsetX, offsetY;

windowHeader.addEventListener('mousedown', (event) => {
    if (windowMaximized) {
        return; 
    }
    isDragging = true;
    offsetX = event.clientX - windowElement.getBoundingClientRect().left;
    offsetY = event.clientY - windowElement.getBoundingClientRect().top;

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);

    windowElement.style.transition = 'none'; 
    windowElement.style.transform = 'none'; 
    windowElement.style.position = 'absolute'; 
});

function handleDrag(event) {
    if (isDragging) {
        const posX = event.clientX - offsetX;
        const posY = event.clientY - offsetY;

        windowElement.style.left = `${posX}px`;
        windowElement.style.top = `${posY}px`;
    }
}

function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);

    windowElement.style.transition = 'all 0.3s ease-in-out';
}

let isSelecting = false;
let selectionBox = document.getElementById('selectionBox');
let startX, startY;

const desktop = document.querySelector('.desktop');
const icon = document.querySelector('.icon'); 

// Função para verificar se o ícone está parcialmente dentro da área de seleção
function isIconInSelectionBox() {
    const iconRect = icon.getBoundingClientRect();
    const selectionRect = selectionBox.getBoundingClientRect();

    // Verifica se há qualquer interseção entre o ícone e a caixa de seleção
    return (
        iconRect.right > selectionRect.left &&
        iconRect.left < selectionRect.right &&
        iconRect.bottom > selectionRect.top &&
        iconRect.top < selectionRect.bottom
    );
}

desktop.addEventListener('mousedown', (e) => {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0';
    selectionBox.style.height = '0';
    selectionBox.style.display = 'block';

    icon.style.backgroundColor = ''; 
});

desktop.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;

    let width = e.clientX - startX;
    let height = e.clientY - startY;

    if (width < 0) {
        selectionBox.style.left = `${e.clientX}px`;
        width = Math.abs(width);
    }

    if (height < 0) {
        selectionBox.style.top = `${e.clientY}px`;
        height = Math.abs(height);
    }

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    if (isIconInSelectionBox()) {
        icon.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; 
    } else {
        icon.style.backgroundColor = ''; 
    }
});

desktop.addEventListener('mouseup', () => {
    isSelecting = false;
    selectionBox.style.display = 'none';
});