const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0;
let currentScore = 0;
let highScore = 0;

const brickRowCount = 9;
const brickColumnCount = 5;

// DOM Load event
document.addEventListener('DOMContentLoaded', updateHighScore);

// Create ball properties
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4
};

// Create paddle properties
const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0
}

// Create brick properties
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true
};

// Create Bricks
const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = {
      x,
      y,
      ...brickInfo
    };
  }
}

// Draw ball on canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "#1aff1a";
  ctx.fill();
  ctx.closePath();
}

// Draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "#1aff1a";
  ctx.fill();
  ctx.closePath();
}

// Draw score on cancas
function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillText(`High Score: ${highScore}`, 20, 30);
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}

// Draw bricks on canvas
function drawBricks() {
  bricks.forEach(column => {
    column.forEach(brick => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? '#1aff1a' : 'transparent';
      ctx.fill();
      ctx.closePath();
    });
  });
}

// Default State
function defaultState() {
  playBtn.classList.remove('play');
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  paddle.x = canvas.width / 2 - 40;
  paddle.y = canvas.height - 20;
}

//Move paddle on Canvas
function movePaddle() {
  if (playBtn.classList.contains('play')) {
    paddle.x += paddle.dx;
  }

  // Wall detection
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

// Move Ball
function moveBall() {
  if (playBtn.classList.contains('play')) {
    ball.x += ball.dx;
    ball.y += ball.dy;
  }
  // Collision detection on X-axis
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
  }
  // Collision detection on Y-axis
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (ball.x - ball.size > paddle.x && ball.x + ball.size < paddle.x + paddle.w && ball.y + ball.size > paddle.y) {
    ball.dy = -ball.speed;
  }

  // Bricks Collision
  bricks.forEach(column => {
    column.forEach(brick => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x && // left brick side check
          ball.x + ball.size < brick.x + brick.w && // right brick side check
          ball.y + ball.size > brick.y && // top brick side check
          ball.y - ball.size < brick.y + brick.h // bottom brick side check
        ) {
          ball.dy *= -1;
          brick.visible = false;

          // Increase score for each broken brick
          increaseScore();
        }
      }
    });
  });

  // Hit bottom wall
  if (ball.y + ball.size > canvas.height) {
    currentScore = score;
    updateHighScore(currentScore);
    defaultState();
    showAllBricks();
    score = 0;
  }
}

// Update canvas drawing and animation.
function update() {
  movePaddle();
  moveBall();

  // Draw everything
  draw();

  requestAnimationFrame(update);
}

update();

// Increase score
function increaseScore() {
  score++;

  if (score % (brickRowCount * brickColumnCount) === 0) {
    showAllBricks();
  }
}

// Get score in local storage
function getScore() {
  let Storedscore;
  if (localStorage.getItem('Storedscore') === null) {
    Storedscore = 0;
  } else {
    Storedscore = JSON.parse(localStorage.getItem('Storedscore'));
  }
  return Storedscore;
}

// Set score in local storage
function setScore(score) {
  let Storedscore;
  if(localStorage.getItem('Storedscore') === null){
    Storedscore = 0;
  } else {
    Storedscore = JSON.parse(localStorage.getItem('Storedscore'));
  }

  Storedscore = score;

  localStorage.setItem('Storedscore', JSON.stringify(Storedscore));
}

function updateHighScore(currentScore) {
  if(currentScore > getScore()) {
    highScore = currentScore;
    setScore(currentScore);
    //alert('Yayy you beat the high score!');
    // Sweet alert
    swal({
      title: "Congratulations✨🎊!",
      text: "You beat the high score!",
      icon: "success",
      button: "Oh yeah!",
      timer: 3000,
    });
  } else {
    highScore = getScore();
  }
}

// Make all bricks appear
function showAllBricks() {
  bricks.forEach(column => {
    column.forEach(brick => brick.visible = true);
  });
}

// Draw everything
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();
}

// Keydown event
function keyDown(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    paddle.dx = -paddle.speed;
  }
}

function keyUp(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft') {
    paddle.dx = 0;
  }
}

// Keyboard event handlers
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);


// Event Listeners
rulesBtn.addEventListener('click', (e) => {
  rules.classList.add('show');
});

closeBtn.addEventListener('click', (e) => {
  rules.classList.remove('show');
});

document.addEventListener('click', (e) => {
  const classes = e.target.classList;
  if (!(classes.contains('rules-btn') || classes.contains('pause-btn') || classes.contains('stop-btn'))) {
    if (rules.classList.contains('show')) {
      rules.classList.remove('show');
    }
  }
});

document.addEventListener('keypress', (e) => {
  playBtn.classList.add('play');
  rules.classList.remove('show');
});

playBtn.addEventListener('click', (e) => {
  playBtn.classList.add('play');
});

pauseBtn.addEventListener('click', (e) => {
  playBtn.classList.remove('play');
});

stopBtn.addEventListener('click', (e) => {
  defaultState();
  showAllBricks();
  score = 0;
});