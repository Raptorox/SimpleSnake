class Timer {
  // constructorons

  constructor(update, render, frames) {
    this.update = update;
    this.render = render;

    this.interval = 1000 / frames;
    this.running = false;

    this.lastTime = null;

    this.deltaTime = 0;
  }

  loop(time) {
    if (!this.running) return;

    if (this.lastTime != null) {
      this.deltaTime += time - this.lastTime;

      while (this.deltaTime >= this.interval) {
        this.update(this.interval);
        this.deltaTime -= this.interval;
      }

      this.render();
    }

    this.lastTime = time;

    requestAnimationFrame((time) => this.loop(time));
  }

  start() {
    this.running = true;
    requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.running = false;
    this.lastTime = null;
  }
}

class Snek {
  constructor(width, height) {
    this.blockSize = 20;
    this.newSnek(width, height);

    this.bodyColor = "#1299FF";
    this.headColor = "#23EF77";

    this.accumulatedTime = 0;
    this.timeRequiredToMove = 200;
  }

  newSnek(width, height) {
    this.xCordsRange = width / this.blockSize;
    this.yCordsRange = height / this.blockSize;
    const headX = Math.floor(Math.random() * this.xCordsRange);
    const headY = Math.floor(Math.random() * this.yCordsRange);
    this.blocks = [
      [headX, headY],
      [headX, headY + 1],
    ];

    this.velocity = [0, 0];

    this.toGrow = false;
    this.died = false;
  }

  update(interval, apple) {
    this.accumulatedTime += interval;

    while (this.accumulatedTime >= this.timeRequiredToMove) {
      this.handleCollisionsWithApple(apple);
      this.handleSelfCollision();
      this.move();

      this.accumulatedTime -= this.timeRequiredToMove;
    }
  }

  handleSelfCollision() {
    for (const block of this.blocks) {
      if (
        block[0] == this.head[0] &&
        block[1] == this.head[1] &&
        block != this.head
      ) {
        this.died = true;
      }
    }
  }

  handleCollisionsWithApple(apple) {
    if (this.head[0] == apple.x && this.head[1] == apple.y) {
      this.toGrow = true;

      while (this.checkCollisionOfAppleAndSnekBody(apple)) {
        apple.randomCords();
      }
    }
  }

  checkCollisionOfAppleAndSnekBody(apple) {
    for (const block of this.blocks) {
      if (block[0] == apple.x && block[1] == apple.y) {
        return true;
      }
    }

    return false;
  }

  move() {
    if (this.velocity[0] == 0 && this.velocity[1] == 0) return;

    if (!this.toGrow) {
      this.blocks.pop();
    } else {
      this.toGrow = false;
    }

    let newX = this.head[0] + this.velocity[0];
    let newY = this.head[1] + this.velocity[1];

    if (newX == this.xCordsRange) {
      newX = 0;
    }
    if (newY == this.yCordsRange) {
      newY = 0;
    }
    if (newX == -1) {
      newX = this.xCordsRange - 1;
    }
    if (newY == -1) {
      newY = this.yCordsRange - 1;
    }

    this.blocks = [[newX, newY]].concat(this.blocks);
  }

  render(context) {
    context.fillStyle = this.bodyColor;
    for (const block of this.blocks) {
      context.fillRect(
        block[0] * this.blockSize,
        block[1] * this.blockSize,
        this.blockSize,
        this.blockSize
      );
    }

    context.fillStyle = this.headColor;
    context.fillRect(
      this.head[0] * this.blockSize,
      this.head[1] * this.blockSize,
      this.blockSize,
      this.blockSize
    );
  }

  get head() {
    return this.blocks[0];
  }
}

class Apple {
  constructor(width, height) {
    this.blockSize = 20;
    this.xCordsRange = width / this.blockSize;
    this.yCordsRange = height / this.blockSize;

    this.randomCords();

    this.bodyColor = "#EF6723";
  }

  randomCords() {
    this.x = Math.floor(Math.random() * this.xCordsRange);
    this.y = Math.floor(Math.random() * this.yCordsRange);
  }

  update(interval) {}

  render(context) {
    context.fillStyle = this.bodyColor;
    context.fillRect(
      this.x * this.blockSize,
      this.y * this.blockSize,
      this.blockSize,
      this.blockSize
    );
  }
}

function update(interval, snek, apple, timer) {
  snek.update(interval, apple);
  apple.update(interval);

  if (snek.died) {
    timer.stop();
    alert("Umierles");
  }
}

function render(context, snek, apple) {
  context.fillStyle = "#2c2f33";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  snek.render(context);
  apple.render(context);
}

function main() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  const snek = new Snek(canvas.width, canvas.height);
  document.onkeydown = (event) => {
    if (event.key == "ArrowRight") {
      if (snek.velocity[0] != -1) {
        snek.velocity = [1, 0];
      }
    }
    if (event.key == "ArrowDown") {
      if (snek.velocity[1] != -1) {
        snek.velocity = [0, 1];
      }
    }
    if (event.key == "ArrowLeft") {
      if (snek.velocity[0] != 1) {
        snek.velocity = [-1, 0];
      }
    }
    if (event.key == "ArrowUp") {
      if (snek.velocity[1] != 1) {
        snek.velocity = [0, -1];
      }
    }
  };

  const apple = new Apple(canvas.width, canvas.height);
  const timer = new Timer(
    (interval) => update(interval, snek, apple, timer),
    () => render(context, snek, apple),
    60
  );
  timer.start();
}

main();

