class HeroisDaProtecao {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações do jogo
        this.gameWidth = 400;
        this.gameHeight = 600;
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
        
        // Estado do jogo
        this.gameState = 'menu'; // 'menu', 'playing', 'gameOver'
        this.score = 0;
        this.highScore = localStorage.getItem('heroesHighScore') || 0;
        
        // Player
        this.player = {
            x: this.gameWidth / 2 - 15,
            y: this.gameHeight - 100,
            width: 30,
            height: 40,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            hasShield: false,
            shieldTime: 0
        };
        
        // Física
        this.gravity = 0.5;
        this.jumpPower = -15;
        this.moveSpeed = 5;
        this.cameraY = 0;
        
        // Elementos do jogo
        this.platforms = [];
        this.obstacles = [];
        this.collectibles = [];
        
        // Mensagens educativas
        this.educationalMessages = [
            "O amor e o respeito são a base de uma família feliz!",
            "Conversar sobre os problemas é sempre a melhor solução!",
            "Pedir ajuda é um ato de coragem, não de fraqueza!",
            "Todos merecem viver em paz e segurança!",
            "O diálogo constrói pontes, a violência as destrói!",
            "A família deve ser um lugar de proteção e carinho!",
            "Nunca tenha medo de falar com um adulto de confiança!",
            "O respeito mútuo fortalece todas as relações!",
            "A violência nunca é a resposta para resolver conflitos!",
            "Cada pessoa tem o direito de se sentir segura em casa!"
        ];
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    }
    
    initializeGame() {
        // Criar plataformas iniciais
        this.platforms = [];
        this.obstacles = [];
        this.collectibles = [];
        
        // Plataforma inicial
        this.platforms.push({
            x: this.gameWidth / 2 - 50,
            y: this.gameHeight - 50,
            width: 100,
            height: 20,
            type: 'normal',
            text: 'INÍCIO'
        });
        
        // Gerar plataformas
        this.generatePlatforms();
    }
    
    generatePlatforms() {
        for (let i = 1; i <= 50; i++) {
            const y = this.gameHeight - 50 - (i * 120);
            const x = Math.random() * (this.gameWidth - 80);
            
            let type = 'normal';
            let text = this.getRandomPlatformText();
            
            // Tipos especiais de plataforma
            if (Math.random() < 0.1) {
                type = 'boost';
                text = '❤️';
            } else if (Math.random() < 0.05) {
                type = 'shield';
                text = '🛡️';
            } else if (Math.random() < 0.1) {
                type = 'breakable';
            }
            
            this.platforms.push({
                x: x,
                y: y,
                width: 80,
                height: 15,
                type: type,
                text: text,
                broken: false
            });
            
            // Adicionar obstáculos ocasionalmente
            if (Math.random() < 0.1 && i > 5) {
                this.obstacles.push({
                    x: Math.random() * (this.gameWidth - 40),
                    y: y - 60,
                    width: 40,
                    height: 40,
                    type: 'cloud'
                });
            }
            
            // Adicionar colecionáveis
            if (Math.random() < 0.3) {
                this.collectibles.push({
                    x: Math.random() * (this.gameWidth - 20),
                    y: y - 40,
                    width: 20,
                    height: 20,
                    type: 'star',
                    collected: false
                });
            }
        }
    }
    
    getRandomPlatformText() {
        const texts = ['AMOR', 'RESPEITO', 'PAZ', 'DIÁLOGO', 'APOIO', 'PROTEÇÃO'];
        return texts[Math.floor(Math.random() * texts.length)];
    }
    
    setupEventListeners() {
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                    this.player.velocityX = -this.moveSpeed;
                }
                if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                    this.player.velocityX = this.moveSpeed;
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (this.gameState === 'playing') {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                    e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
                    this.player.velocityX = 0;
                }
            }
        });
        
        // Controles de toque
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                
                if (x < this.gameWidth / 2) {
                    this.player.velocityX = -this.moveSpeed;
                } else {
                    this.player.velocityX = this.moveSpeed;
                }
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.player.velocityX = 0;
            }
        });
        
        // Botões
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('closePanel').addEventListener('click', () => {
            this.closeEducationalPanel();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.player.x = this.gameWidth / 2 - 15;
        this.player.y = this.gameHeight - 100;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.hasShield = false;
        this.player.shieldTime = 0;
        this.cameraY = 0;
        
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'none';
        
        this.initializeGame();
        this.gameLoop();
    }
    
    restartGame() {
        this.startGame();
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    update() {
        // Atualizar player
        this.player.velocityY += this.gravity;
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Wrap horizontal
        if (this.player.x < -this.player.width) {
            this.player.x = this.gameWidth;
        } else if (this.player.x > this.gameWidth) {
            this.player.x = -this.player.width;
        }
        
        // Atualizar escudo
        if (this.player.hasShield) {
            this.player.shieldTime--;
            if (this.player.shieldTime <= 0) {
                this.player.hasShield = false;
            }
        }
        
        // Verificar colisões com plataformas
        this.checkPlatformCollisions();
        
        // Verificar colisões com obstáculos
        this.checkObstacleCollisions();
        
        // Verificar colisões com colecionáveis
        this.checkCollectibleCollisions();
        
        // Atualizar câmera
        this.updateCamera();
        
        // Verificar game over
        if (this.player.y > this.cameraY + this.gameHeight + 100) {
            this.gameOver();
        }
        
        // Atualizar pontuação
        this.updateScore();
    }
    
    checkPlatformCollisions() {
        this.player.onGround = false;
        
        for (let platform of this.platforms) {
            if (platform.broken) continue;
            
            if (this.player.velocityY > 0 && 
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height + 10) {
                
                this.player.y = platform.y - this.player.height;
                this.player.onGround = true;
                
                // Diferentes tipos de plataforma
                if (platform.type === 'boost') {
                    this.player.velocityY = this.jumpPower * 1.5;
                } else if (platform.type === 'shield') {
                    this.player.velocityY = this.jumpPower;
                    this.player.hasShield = true;
                    this.player.shieldTime = 300; // 5 segundos a 60fps
                } else if (platform.type === 'breakable') {
                    this.player.velocityY = this.jumpPower;
                    platform.broken = true;
                } else {
                    this.player.velocityY = this.jumpPower;
                }
                
                break;
            }
        }
    }
    
    checkObstacleCollisions() {
        for (let obstacle of this.obstacles) {
            if (this.player.x < obstacle.x + obstacle.width &&
                this.player.x + this.player.width > obstacle.x &&
                this.player.y < obstacle.y + obstacle.height &&
                this.player.y + this.player.height > obstacle.y) {
                
                if (!this.player.hasShield) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    checkCollectibleCollisions() {
        for (let collectible of this.collectibles) {
            if (!collectible.collected &&
                this.player.x < collectible.x + collectible.width &&
                this.player.x + this.player.width > collectible.x &&
                this.player.y < collectible.y + collectible.height &&
                this.player.y + this.player.height > collectible.y) {
                
                collectible.collected = true;
                this.score += 10;
            }
        }
    }
    
    updateCamera() {
        const targetCameraY = this.player.y - this.gameHeight * 0.7;
        if (targetCameraY < this.cameraY) {
            this.cameraY = targetCameraY;
        }
    }
    
    updateScore() {
        const heightScore = Math.max(0, Math.floor((this.gameHeight - this.player.y) / 10));
        this.score = Math.max(this.score, heightScore);
        document.getElementById('score').textContent = this.score;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('heroesHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
        
        document.getElementById('restartButton').style.display = 'inline-block';
        this.showEducationalMessage();
    }
    
    showEducationalMessage() {
        const message = this.educationalMessages[
            Math.floor(Math.random() * this.educationalMessages.length)
        ];
        document.getElementById('educationalMessage').textContent = message;
        document.getElementById('educationalPanel').style.display = 'flex';
    }
    
    closeEducationalPanel() {
        document.getElementById('educationalPanel').style.display = 'none';
    }
    
    updateHighScoreDisplay() {
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    draw() {
        // Limpar canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Desenhar fundo gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#4169E1');
        gradient.addColorStop(1, '#191970');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Salvar contexto para transformações de câmera
        this.ctx.save();
        this.ctx.translate(0, -this.cameraY);
        
        // Desenhar plataformas
        this.drawPlatforms();
        
        // Desenhar obstáculos
        this.drawObstacles();
        
        // Desenhar colecionáveis
        this.drawCollectibles();
        
        // Desenhar player
        this.drawPlayer();
        
        // Restaurar contexto
        this.ctx.restore();
        
        // Desenhar UI
        this.drawUI();
    }
    
    drawPlatforms() {
        for (let platform of this.platforms) {
            if (platform.broken) continue;
            
            // Cor da plataforma baseada no tipo
            let color = '#00b894';
            if (platform.type === 'boost') color = '#fd79a8';
            else if (platform.type === 'shield') color = '#74b9ff';
            else if (platform.type === 'breakable') color = '#fdcb6e';
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Borda
            this.ctx.strokeStyle = '#2d3436';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            
            // Texto
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(platform.text, 
                platform.x + platform.width / 2, 
                platform.y + platform.height / 2 + 3);
        }
    }
    
    drawObstacles() {
        for (let obstacle of this.obstacles) {
            this.ctx.fillStyle = '#636e72';
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x + obstacle.width / 2, 
                        obstacle.y + obstacle.height / 2, 
                        obstacle.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Rosto triste
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('☁️', 
                obstacle.x + obstacle.width / 2, 
                obstacle.y + obstacle.height / 2 + 5);
        }
    }
    
    drawCollectibles() {
        for (let collectible of this.collectibles) {
            if (collectible.collected) continue;
            
            this.ctx.fillStyle = '#ffeaa7';
            this.ctx.beginPath();
            this.ctx.arc(collectible.x + collectible.width / 2, 
                        collectible.y + collectible.height / 2, 
                        collectible.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#fdcb6e';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⭐', 
                collectible.x + collectible.width / 2, 
                collectible.y + collectible.height / 2 + 4);
        }
    }
    
    drawPlayer() {
        // Escudo
        if (this.player.hasShield) {
            this.ctx.strokeStyle = '#74b9ff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + this.player.width / 2, 
                        this.player.y + this.player.height / 2, 
                        this.player.width / 2 + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Corpo do policial
        this.ctx.fillStyle = '#00b894';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Borda
        this.ctx.strokeStyle = '#2d3436';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Rosto
        this.ctx.fillStyle = '#fdbcb4';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 5, this.player.width - 10, 15);
        
        // Uniforme
        this.ctx.fillStyle = '#74b9ff';
        this.ctx.fillRect(this.player.x + 3, this.player.y + 20, this.player.width - 6, 15);
        
        // Emoji policial
        this.ctx.fillStyle = '#2d3436';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('👮', 
            this.player.x + this.player.width / 2, 
            this.player.y + this.player.height / 2 + 3);
    }
    
    drawUI() {
        if (this.gameState === 'menu') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Heróis da Proteção', this.gameWidth / 2, this.gameHeight / 2 - 50);
            
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Clique em "Começar Jogo" para iniciar!', this.gameWidth / 2, this.gameHeight / 2);
        }
        
        if (this.gameState === 'gameOver') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Fim de Jogo', this.gameWidth / 2, this.gameHeight / 2 - 50);
            
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`Pontuação: ${this.score}`, this.gameWidth / 2, this.gameHeight / 2);
            this.ctx.fillText(`Recorde: ${this.highScore}`, this.gameWidth / 2, this.gameHeight / 2 + 30);
        }
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new HeroisDaProtecao();
});

