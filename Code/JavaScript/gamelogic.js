

// Retrieve the existing data from localStorage
const storedData = localStorage.getItem('highScore');

let highScore;

if (storedData) {
    console.log("Stored Data:", storedData);

    try {
        // Parse the stored data into a JavaScript object
        const highscoreData = JSON.parse(storedData);

        // Retrieve the 'highScore' property and store it in a variable
        highScore = highscoreData.highScore;

        // Log the highScore value
        console.log("Current High Score:", highScore);
    } catch (error) {
        console.error("Error parsing stored data as JSON:", error);
    }
} else {
    console.log("No 'highScore' key found in localStorage.");
}

// Function to update the high score in localStorage
function updateHighScore(newScore) {
    // Retrieve the existing data from localStorage
    const storedData = localStorage.getItem('highScore');

    let highscoreData;

    if (storedData) {
        try {
            // Parse the stored data into a JavaScript object
            highscoreData = JSON.parse(storedData);

            // Update the 'highScore' property with the new score
            highscoreData.highScore = newScore;

            // Save the updated data back to localStorage
            localStorage.setItem('highScore', JSON.stringify(highscoreData));

            // Log the updated highScore value
            console.log("Updated High Score:", newScore);
        } catch (error) {
            console.error("Error parsing stored data as JSON:", error);
        }
    } else {
        console.log("No 'highScore' key found in localStorage.");
    }
}

// Wait for the window to load before executing the code
window.addEventListener('load', function () {
    // Canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1500;
    canvas.height = 500;

    // Input handler class to manage keyboard input
    class InputHandler {
        constructor(game) {
            this.game = game;
            // Event+ listener for keydown events
            window.addEventListener('keydown', e => {
                // Check if the pressed key is ArrowUp or ArrowDown and not already in the keys array
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if (e.key === ' '){
                    this.game.player.shootMiddle();
                    const audio = new Audio('../Asset/Pew Sound Effect.mp4');
                    audio.play();
                }else if (e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
            });
            // Event listener for keyup events
            window.addEventListener('keyup', e => {
                // Remove the key from the keys array if it exists
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }


    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image = document.getElementById('projectile');
        }
        update(){
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
        }
    }


    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears')
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
        }
        update(){
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size)
                this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize,
                this.spriteSize, this.spriteSize, this.x, this.y, this.size, this.size)
        }
    }

    // Player class representing the user-controlled character
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 210;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 1;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 5000;
        }

        // Update player state based on keyboard input
        update(deltaTime) {
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            //boundaries
            if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;
            //handle projectiles
            this.projectiles.forEach(projectile => {
               projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            //sprite animation
            if (this.frameX < this.maxFrame){
                this.frameX++;
            }else {
                this.frameX = 0;
            }
            //power up
            if (this.powerUp){
                if (this.powerUpTimer > this.powerUpLimit){
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
        }

        // Draw the player on the canvas
        draw(context) {
            if (game.debug) {
                // Draw a stroke around the bounding box for debugging purposes
                context.strokeRect(this.x, this.y, this.width, this.height);
            }

            // Draw each projectile
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });

            // Always draw the first frame in the sprite sheet (frameX set to 0)
            context.drawImage(
                this.image,
                0,                        // X coordinate of the source rectangle (set to 0 for the first frame)
                this.frameY * this.height, // Y coordinate of the source rectangle
                this.width,                // Width of the source rectangle
                this.height,               // Height of the source rectangle
                this.x,                    // X coordinate of the destination rectangle
                this.y,                    // Y coordinate of the destination rectangle
                this.width,                // Width of the destination rectangle
                this.height                // Height of the destination rectangle
            );
        }
        shootMiddle(){
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 130, this.y + 80));
                this.game.ammo--;
            }
            if (this.powerUp) this.shootWings();
        }
        shootWings(){
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 150));
            }
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
            }
        }
        enterPowerUp(){
            this.game.score -= 25;
            this.powerUpTimer = 0;
            this.powerUp = true;
             this.game.ammo = this.game.maxAmmo;
        }
    }


    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 0;
        }
        update(){
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            //sprite animation
            if (this.frameX < this.maxFrame){
                this.frameX++;
            }else this.frameX = 0;
        }
        draw(context){
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width,
                this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            if (this.game.debug){
                context.font = '20px Silkscreen';
                context.fillText(this.lives, this.x, this.y);
            }
        }
    }
    class  Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 2;
            this.score = this.lives;
        }
    }
    class  Angler2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 170;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
        }
    }
    class  LuckyFish extends Enemy {
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = 15;
            this.type = 'lucky';
        }
    }


    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if (this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }


    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.2)
            this.layer2 = new Layer(this.game, this.image2, 0.4)
            this.layer3 = new Layer(this.game, this.image3, 1)
            this.layer4 = new Layer(this.game, this.image4, 1.5)
            this.layers = [this.layer1,this.layer2, this.layer3];
        }
        update(){
            this.layers.forEach(layer => layer.update());
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }


    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Silkscreen';
            this.colour = 'white';
        }
        draw(context){
            context.save();
            context.fillStyle = this.colour;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            //highscore
            context.fillText('highScore: ' + this.game.highScore, 1250, 40);
            //score
            context.fillText('Score: ' + this.game.score, 20, 40);
            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100)
            //game over messages
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                let message3;
                let score;
                if (this.game.score > this.game.highScore) {
                    message1 = 'New High Score!!';
                    message2 = 'Well Done';
                    score = 'Score: ' + this.game.score;
                    updateHighScore(this.game.score);
                } else {
                    message1 = 'Game Over!!';
                    message2 = 'Try Again!!';
                    message3 = 'Everyone Died!!';
                }

                context.font = '70px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
                context.font = '25px ' + this.fontFamily;
                if (this.game.score > 0) context.fillText(score, this.game.width * 0.5, this.game.height * 0.5 + 50);
                else context.fillText(message3, this.game.width * 0.5, this.game.height * 0.5 + 50);
            }

            //ammo
            if (this.game.player.powerUp) context.fillStyle = '#ffffbd'
            context.fillStyle = this.colour;
            for (let i = 0; i < this.game.ammo; i++){
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            context.restore();
        }
    }

    // Game class managing the game state
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = []; // Array to store pressed keys
            this.enemies = [];
            this.particles = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.highScore = highScore;
            this.gameTime = 0;
            this.timeLimit = 15000;
            this.speed = 1;
            this.debug = false;
        }

        // Update game state
        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval){
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion)
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                    for (let i = 0; i < 10; i++){
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5,
                            enemy.y + enemy.height * 0.5));
                    }
                    if (enemy.type = 'lucky') this.player.enterPowerUp();
                    else this.score--;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5,
                            enemy.y + enemy.height * 0.5));
                        if (enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                            if (!this.gameOver)this.score+= enemy.score;
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }

        // Draw game elements on the canvas
        draw(context) {
            this.background.draw(context)
            this.player.draw(context);
            this.ui.draw(context);
            this.particles.forEach(particle => particle.draw(context));
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.background.layer4.draw(context);
        }
        addEnemy(){
            const randomise = Math.random();
            if (randomise < 0.3) this.enemies.push(new Angler1(this));
            else if (randomise < 0.6) this.enemies.push(new Angler2(this));
            else this.enemies.push(new LuckyFish(this));
        }
        checkCollision(rect1, rect2){
            return(     rect1.x < rect2.x + rect2.width &&
                        rect1.x + rect1.width > rect2.x &&
                        rect1.y < rect2.y + rect2.height &&
                        rect1.height + rect1.y > rect2.y)
        }
    }

    // Create an instance of the Game class
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // Animation loop function
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Update and draw game elements
        game.update(deltaTime);
        game.draw(ctx);
        // Request the next animation frame
        requestAnimationFrame(animate);
    }

    // Start the animation loop
    animate(0);
});