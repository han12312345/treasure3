// 图片资源URLs
const explorerImageSrc = 'explorer.png';
const libraryImageSrc = 'library.png';
const templeImageSrc = 'temple.png';
const guardImageSrc = 'guard.png';
const blackPearlImageSrc = 'blackPearl.png';

// 图片对象
let explorerImage = new Image();
let libraryImage = new Image();
let templeImage = new Image();
let guardImage = new Image();
let blackPearlImage = new Image();

// 初始化图片对象
explorerImage.src = explorerImageSrc;
libraryImage.src = libraryImageSrc;
templeImage.src = templeImageSrc;
guardImage.src = guardImageSrc;
blackPearlImage.src = blackPearlImageSrc;

// 确保图片加载完成后再开始游戏
window.onload = function () {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('start-btn').addEventListener('click', playBackgroundMusic); // 点击开始按钮时播放背景音乐
};

// TreasureMap 类定义
class TreasureMap {
    static async getInitialClue() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("在图书馆里找到了一个线索...");
            }, 1000);
        });
    }

    static async decodeAncientScript(clue) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!clue) {
                    reject("没有线索可以解码!");
                }
                resolve("解码成功!有一把钥匙，宝藏在一座古老的神庙中...");
            }, 1500);
        });
    }
}

// 设置图书馆、神庙、探险者和守卫的初始位置
let library = { x: 100, y: 100, radius: 10 };
let temple = { x: 500, y: 500, radius: 20 };
let explorer = { x: 0, y: 0, radius: 10 };
let guard = { x: 150, y: 150, radius: 10 };
let blackPearl = { x: 600, y: 100, radius: 15 };
const gridSize = 700;
let gameRunning = false;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = gridSize;
canvas.height = gridSize;

// 绘制函数
function drawCircle(position, color) {
    ctx.beginPath();
    ctx.arc(position.x, position.y, position.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLibrary() {
    const imageSize = library.radius * 9;
    ctx.drawImage(libraryImage, library.x - imageSize / 2, library.y - imageSize / 2, imageSize, imageSize);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('图书馆', library.x - 40, library.y + 10);
}

function drawTemple() {
    const imageSize = temple.radius * 7;
    ctx.drawImage(templeImage, temple.x - imageSize / 2, temple.y - imageSize / 2, imageSize, imageSize);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('神庙', temple.x - 40, temple.y + 10);
}

function drawExplorer() {
    const imageSize = explorer.radius * 6;
    ctx.drawImage(explorerImage, explorer.x - imageSize / 2, explorer.y - imageSize / 2, imageSize, imageSize);
}

function drawGuard() {
    const imageSize = guard.radius * 6;
    ctx.drawImage(guardImage, guard.x - imageSize / 2, guard.y - imageSize / 2, imageSize, imageSize);
}

function drawBlackPearl() {
    const imageSize = blackPearl.radius * 8;
    ctx.drawImage(blackPearlImage, blackPearl.x - imageSize / 2, blackPearl.y - imageSize / 2, imageSize, imageSize);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('黑珍珠号', blackPearl.x - 50, blackPearl.y + 30);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function checkCollisionWith(position1, position2) {
    const dx = position1.x - position2.x;
    const dy = position1.y - position2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedRadii = position1.radius + position2.radius;
    return distance <= combinedRadii;
}

function drawMessage(message) {
    ctx.font = '28px Arial';
    ctx.fillStyle = 'darkred';
    const metrics = ctx.measureText(message);
    const textWidth = metrics.width;
    const textHeight = parseInt(ctx.font);
    const x = (canvas.width / 2) - (textWidth / 2);
    const y = canvas.height - (textHeight / 2);
    ctx.fillText(message, x, y);
}

// 游戏状态和消息
let guardActive = false;
let currentMessage = "";

// 游戏主绘制函数
function draw() {
    clearCanvas();
    drawLibrary();
    drawTemple();
    drawExplorer();
    drawBlackPearl();
    if (guardActive) {
        drawGuard();
    }
    if (currentMessage) {
        drawMessage(currentMessage);
    }
}

// 显示消息序列的异步函数
async function displayMessageSequence(messages) {
    for (const message of messages) {
        currentMessage = message;
        draw();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// 探险者前往目标位置的函数
function moveExplorerTo(target) {
    const stepSize = 10;
    const dx = target.x - explorer.x;
    const dy = target.y - explorer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > stepSize) {
        explorer.x += (dx / distance) * stepSize;
        explorer.y += (dy / distance) * stepSize;
    } else {
        explorer.x = target.x;
        explorer.y = target.y;
    }
}

// 游戏的主逻辑
async function startGame() {
    gameRunning = true;
    // 探险者前往图书馆
    while (!checkCollisionWith(explorer, library)) {
        moveExplorerTo(library);
        draw();
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 在图书馆找到线索
    currentMessage = await TreasureMap.getInitialClue();
    draw();

    // 解码线索
    currentMessage = await TreasureMap.decodeAncientScript(currentMessage);
    draw();

    // 探险者前往神庙，激活守卫
    guardActive = true;
    while (!checkCollisionWith(explorer, temple) && !checkCollisionWith(explorer, guard)) {
        moveExplorerTo(temple);
        if (guardActive) {
            moveGuardAroundTemple();
        }
        draw();
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 停止游戏和角色移动
    gameRunning = false;
    guardActive = false;

    if (checkCollisionWith(explorer, guard)) {
        currentMessage = "糟糕，遇到了神庙守卫，游戏结束。";
        draw();
    } else if (checkCollisionWith(explorer, temple)) {
        await displayMessageSequence([
            "找到了一个神秘的箱子...",
            "用钥匙将锁打开后发现一张地图",
            "上面有着前往遗失的文明：黑珍珠号的地图，还有一个圣杯",
            "黑珍珠号有历代海盗抢来的珍宝，只有圣杯才可以打开它",
            "于是探险者冒着风雨前往黑珍珠号..."
        ]);

        // 探险者继续前往黑珍珠号
        while (!checkCollisionWith(explorer, blackPearl)) {
            moveExplorerTo(blackPearl);
            draw();
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        currentMessage = "探险者成功到达黑珍珠号，发现了海盗宝藏!";
        draw();
    }
}

// 守卫移动逻辑
function moveGuardAroundTemple() {
    if (guardActive) {
        const directions = ['up', 'down', 'left', 'right'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const moveDistance = guard.radius * 3;

        switch (direction) {
            case 'up':
                guard.y = Math.max(guard.radius, guard.y - moveDistance);
                break;
            case 'down':
                guard.y = Math.min(gridSize - guard.radius, guard.y + moveDistance);
                break;
            case 'left':
                guard.x = Math.max(guard.radius, guard.x - moveDistance);
                break;
            case 'right':
                guard.x = Math.min(gridSize - guard.radius, guard.x + moveDistance);
                break;
        }
    }
}

// 从 locations.txt 文件异步加载位置数据
async function loadLocations() {
    try {
        const response = await fetch('locations.txt'); // 获取 locations.txt 文件
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== ''); // 过滤空行
        const locations = {};

        lines.forEach(line => {
            const parts = line.split(','); // 按逗号分隔每个属性
            const name = parts[0].trim(); // 位置的名称

            // 存储位置的属性
            const location = {};
            parts.slice(1).forEach(part => {
                const [key, value] = part.split(':');
                location[key.trim()] = isNaN(value) ? value.trim() : Number(value);
            });

            locations[name] = location;
        });

        return locations;
    } catch (error) {
        console.error("加载位置文件时出错:", error);
    }
}

// 初始化游戏并加载位置信息
async function initializeGame() {
    const locations = await loadLocations();
    if (locations) {
        console.log(locations); // 打印加载的位置信息

        // 使用加载的位置信息
        library.x = locations['library'].x;
        library.y = locations['library'].y;
        temple.x = locations['temple'].x;
        temple.y = locations['temple'].y;
        guard.x = locations['guard'].x;
        guard.y = locations['guard'].y;
        blackPearl.x = locations['blackPearl'].x;
        blackPearl.y = locations['blackPearl'].y;

        // 更新图像位置
        draw();
    }
}

// 游戏初始化
initializeGame();

// 存储玩家信息和游戏历史
function savePlayerInfo(playerId, nickname, gameHistory) {
    const playerInfo = {
        playerId,
        nickname,
        gameHistory,
    };
    localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
}

// 获取玩家信息
function loadPlayerInfo() {
    const storedInfo = localStorage.getItem('playerInfo');
    if (storedInfo) {
        return JSON.parse(storedInfo);
    } else {
        return null; // 没有存储的玩家信息
    }
}

// 显示玩家信息和历史记录
function displayPlayerHistory() {
    const playerInfo = loadPlayerInfo();
    if (playerInfo) {
        console.log(`欢迎回来, ${playerInfo.nickname}`);
        console.log(`游戏历史: ${playerInfo.gameHistory.join(', ')}`);

        // 显示玩家历史
        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = `<h3>游戏历史记录</h3><ul>`;
        playerInfo.gameHistory.forEach(history => {
            historyDiv.innerHTML += `<li>${history}</li>`;
        });
        historyDiv.innerHTML += `</ul>`;
    } else {
        console.log('欢迎新玩家!');
    }
}

// 获取背景音乐元素
const backgroundMusic = new Audio('背景音乐.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
// 控制背景音乐播放的函数
function playBackgroundMusic() {
    // 确保音乐没有播放多次
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    }
}

// 游戏初始化时显示玩家历史
displayPlayerHistory();
