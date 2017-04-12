var requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 700;
canvas.height = 480;
document.body.appendChild(canvas);


var lastTime;
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
};

function init() {
    document.getElementById('play-easy').addEventListener('click', function () {
        config = configEasy;
        player.sprite = config.sprite;
        reset();
    });
    document.getElementById('play-medium').addEventListener('click', function () {
        config = configMedium;
        player.sprite = config.sprite;
        reset();
    });
    document.getElementById('play-hard').addEventListener('click', function () {
        config = configHard;
        player.sprite = config.sprite;
        reset();
    });

    addCity();
    lastTime = Date.now();
    main();
    gameOver();
    updateLives();
}

function updateLives() {
    var parent = document.getElementById('lives');
    parent.innerHTML = '';
    for (var i = 0; i < lives; ++i) {
        var liveImage = document.createElement('img');
        liveImage.setAttribute('src', 'img/live.png');
        liveImage.setAttribute('id', 'live');
        parent.insertBefore(liveImage, parent.firstChild);
    }
}

resources.load([
    'img/pipe-up.png',
    'img/pipe-down.png',
    'img/bird.png',
    'img/live.png',
    'img/turtle.png',
    'img/city.jpg',
]);
resources.onReady(init);


var player = {
    pos: { x: 0, y: 0 },
    speedY: 0,
    lastPipe: null,
    sprite: null,
    lastCollisionTime: null,
};


var pipes = [];
var backgrounds = [];
var lastFire = Date.now();
var gameTime = 0;
var isGameOver;
var cityPattern;
var score = 0;
var scoreEl = document.getElementById('score');
var lives = 3;
var liveEl = document.getElementById('live').src = 'img/live.png';
var g = 700;
var impulse = -300;
var gameStated = false;
var distance = 0;
var nextPipeDistance = 250;
var pipeInset = 50;
var blinkTime = 2;

var playerSprites = {
    sprite1: new Sprite('img/bird.png', [0, 0], [82.5, 75], 16, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]),
    sprite2: new Sprite('img/turtle.png', [0, 0], [125, 92], 25, [0, 1, 2, 3])
}

var config = null;

var configEasy = {
    worldSpeed: 2,
    holeSize: 200,
    spriteSpace: 20,
    sprite: playerSprites.sprite1,
};

var configMedium = {
    worldSpeed: 3,
    holeSize: 150,
    spriteSpace: 20,
    sprite: playerSprites.sprite1,
};

var configHard = {
    worldSpeed: 3,
    holeSize: 200,
    spriteSpace: 5,
    sprite: playerSprites.sprite2,
};


function update(dt) {
    gameTime += dt;

    handleInput(dt);
    updateEntities(dt);
    checkCollisions();
    checkPlayerScore();
    scoreEl.innerHTML = score;
};

function addPipe() {
    var holeY = pipeInset + Math.random() * (canvas.height - config.holeSize - 2 * pipeInset);
    var topPipe = {
        pos: [canvas.width, holeY - 480],
        sprite: new Sprite('img/pipe-down.png', [0, 0], [60, 480])
    };
    var bottomPipe = {
        pos: [canvas.width, holeY + config.holeSize],
        sprite: new Sprite('img/pipe-up.png', [0, 0], [60, 480])
    };

    pipes.push(topPipe);
    pipes.push(bottomPipe);
}

function addCity() {
    var x = 0;
    if (backgrounds.length) {
        var lastCity = backgrounds[backgrounds.length - 1];
        x = lastCity.pos[0] + 1574;
    }
    backgrounds.push(
        {
            pos: [x, 0],
            sprite: new Sprite('img/city.jpg', [0, 0], [1574, 480]),
        }
    );
}

function handleInput(dt) {
    if (input.isDown('SPACE')) {
        if (isGameOver) {
            if (!config) {
                config = configEasy;
                player.sprite = config.sprite;
            }
            reset();
        }
        else {
            if (!gameStated) {
                gameStated = true;
                addPipe();
            }
        }

        player.speedY = impulse; 1
    }
}

function updateEntities(dt) {
    if (gameStated) {
        player.speedY += g * dt;
        for (var i = 0; i < pipes.length; i++) {
            var pipe = pipes[i];
            pipe.pos[0] -= config.worldSpeed;
        }
        for (var j = 0; j < backgrounds.length; ++j) {
            var city = backgrounds[j];
            city.pos[0] -= config.worldSpeed / 2;
            city.pos[1] = 0;
        }
    }
    if (backgrounds.length) {
        var lastCity = backgrounds[backgrounds.length - 1];
        if (lastCity.pos[0] + 1574 <= canvas.width) {
            addCity();
        }
    }

    if(backgrounds.length) {
        var lastCity = backgrounds[0];
        if (lastCity.pos[0] + 1574 < 0) {
            backgrounds.shift();
        }
    }

    if (pipes.length) {
        var lastPipe = pipes[pipes.length - 1];
        if (lastPipe.pos[0] < canvas.width - nextPipeDistance) {
            addPipe();
        }
    }

    
    if (pipes.length) {
        var lastPipe = pipes[0];
        if (lastPipe.pos[0] + lastPipe.sprite.size[0] < 0) {
            pipes.shift();
            pipes.shift();
        }
    }


    player.pos[1] += player.speedY * dt;

    
    if (player.sprite) {
        player.sprite.update(dt);
    }

    
    if (gameStated) {
        distance += config.worldSpeed;
    }
}


function checkCollisions() {
    checkPlayerBounds();

    if (!player.sprite) {
        return;
    }

    if (checkIntersectionFloor(player)) {
        lives = 0;
        updateLives();
        gameOver();
    }

    
    if (gameTime - player.lastCollisionTime > blinkTime) {
        for (var i = 0; i < pipes.length; i++) {
            var pipe = pipes[i];
            if (checkIntersection(pipe, player)) {
                lives--;
                updateLives();
                if (lives == 0) {
                    gameOver();
                }
                else {
                    player.lastCollisionTime = gameTime;
                }
            }
        }
    }
}

function checkIntersection(obj1, obj2) {
    if (obj1.pos[0] > obj2.pos[0] + obj2.sprite.size[0] - config.spriteSpace ||
        obj1.pos[0] + obj1.sprite.size[0] < obj2.pos[0] + config.spriteSpace ||
        obj1.pos[1] > obj2.pos[1] + obj2.sprite.size[1] - config.spriteSpace ||
        obj1.pos[1] + obj1.sprite.size[1] < obj2.pos[1] + config.spriteSpace) {
        return false;
    }
    return true;
}

function checkIntersectionFloor(obj) {
    if (obj.pos[1] + obj.sprite.size[1] >= canvas.height) {
        return true;
    }
    return false;
}

function checkPlayerBounds() {
    if (!player.sprite) {
        return;
    }
    
    if (player.pos[0] < 0) {
        player.pos[0] = 0;
    }
    else if (player.pos[0] > canvas.width - player.sprite.size[0]) {
        player.pos[0] = canvas.width - player.sprite.size[0];
    }

    if (player.pos[1] < 0) {
        player.pos[1] = 0;
    }
    else if (player.pos[1] > canvas.height - player.sprite.size[1]) {
        player.pos[1] = canvas.height - player.sprite.size[1];
    }
}

function checkPlayerScore() {
    if (isGameOver) {
        return;
    }
    if (pipes.length) {
        const lastPipe = pipes[0];
        if (player.lastPipe !== lastPipe && player.pos[0] > lastPipe.pos[0]) {
            player.lastPipe = lastPipe;
            score += 1;
        }
    }
}

function render() {
    ctx.fillStyle = cityPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderEntities(backgrounds);
    renderEntities(pipes);

    if (player.lastCollisionTime &&
        gameTime - player.lastCollisionTime < blinkTime &&
        !isGameOver) {
        var dc = gameTime - player.lastCollisionTime;
        if (parseInt((dc) * 10) % 2 == 0) {
            renderEntity(player);
        }
    }
    else {
        renderEntity(player);
    }

   
};

function renderEntities(list) {
    for (var i = 0; i < list.length; i++) {
        renderEntity(list[i]);
    }
}

function renderEntity(entity) {
    if (entity.sprite) {
        ctx.save();
        ctx.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(ctx);
        ctx.restore();
    }
}


function gameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
    isGameOver = true;
}


function reset() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    isGameOver = false;
    gameTime = 0;
    gameStated = false;
    score = 0;
    lives = 3;
    distance = 0;
    pipes = [];
    player.pos = [50, canvas.height / 2];
    player.speedY = 0;
    player.lastCollisionTime = null;
    backgrounds = [];
    updateLives();
    addCity();
};
