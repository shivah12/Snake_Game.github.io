import React, { useState, useEffect, useRef } from 'react';
import './SnakeGame.css';
import backgroundMusic from './music.mp3';

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const backgroundMusicRef = useRef(new Audio(backgroundMusic));
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState(generateRandomFood(snake));
  const [direction, setDirection] = useState('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const storedHighScore = localStorage.getItem('snakeHighScore');
    return storedHighScore ? parseInt(storedHighScore, 10) : 0;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resetGame = () => {
      setSnake([{ x: 10, y: 10 }]);
      setFood(generateRandomFood([]));
      setDirection('RIGHT');
      setIsGameOver(false);
      setScore(0);
    };

    const updateGame = () => {
      if (isGameOver) return;

      const newSnake = moveSnake(snake, direction);

      if (isCollidingWithWall(newSnake[0]) || isCollidingWithSelf(newSnake)) {
        setIsGameOver(true);

        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snakeHighScore', score.toString());
        }

        return;
      }

      if (isCollidingWithFood(newSnake[0], food)) {
        setFood(generateRandomFood(newSnake));
        setSnake([...newSnake, { x: -1, y: -1 }]);
        setScore((prevScore) => prevScore + 10);
      } else {
        setSnake(newSnake);
      }
    };

    const drawGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(
        food.x * 20,
        food.y * 20,
        (food.x + 1) * 20,
        (food.y + 1) * 20
      );
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(1, 'orange');
      ctx.fillStyle = gradient;
      drawCircle(ctx, food.x * 20 + 10, food.y * 20 + 10, 10);

      ctx.fillStyle = 'red';
      snake.forEach((segment) => {
        drawCircle(ctx, segment.x * 20 + 10, segment.y * 20 + 10, 10);
        ctx.fillStyle = 'black';
        drawCircle(ctx, segment.x * 20 + 11, segment.y * 20 + 11, 10);
        ctx.fillStyle = 'black';
      });

      const scoreContainer = document.getElementById('score-container');
      if (scoreContainer) {
        scoreContainer.innerHTML = `Score: ${score}`;
      }

      if (isGameOver) {
        const highScoreContainer = document.getElementById('high-score-container');
        if (highScoreContainer) {
          highScoreContainer.innerHTML = `High Score: ${highScore}`;
        }

        ctx.fillStyle = 'white';
        ctx.font = '30px PressStart2P';
        ctx.fillText('Game Over', 175, 300);
      }
    };

    const gameLoop = () => {
      updateGame();
      drawGame();
    };

    const handleKeyPress = (e) => {
      if (isGameOver) {
        resetGame();
      } else {
        if (e.key === 'ArrowUp' && direction !== 'DOWN') {
          setDirection('UP');
        } else if (e.key === 'ArrowDown' && direction !== 'UP') {
          setDirection('DOWN');
        } else if (e.key === 'ArrowLeft' && direction !== 'RIGHT') {
          setDirection('LEFT');
        } else if (e.key === 'ArrowRight' && direction !== 'LEFT') {
          setDirection('RIGHT');
        }
      }
    };

    const handleTouchStart = (e) => {
      const touchStartX = e.touches[0].clientX;
      const touchStartY = e.touches[0].clientY;

      window.addEventListener('touchmove', (e) => {
        e.preventDefault();

        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0 && direction !== 'LEFT') {
            setDirection('RIGHT');
          } else if (deltaX < 0 && direction !== 'RIGHT') {
            setDirection('LEFT');
          }
        } else {
          if (deltaY > 0 && direction !== 'UP') {
            setDirection('DOWN');
          } else if (deltaY < 0 && direction !== 'DOWN') {
            setDirection('UP');
          }
        }
      });

      window.addEventListener('touchend', () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouchStart);

    backgroundMusicRef.current.play();

    const intervalId = setInterval(gameLoop, 75);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [snake, food, direction, isGameOver, score, highScore]);

  return (
    <div>
      <div id="score-container" className="score-container">Score: {score}</div>
      <div id="high-score-container" className="score-container">High Score: {highScore}</div>
      <div className="game-container">
        <canvas ref={canvasRef} width={700} height={550} className={isGameOver ? 'game-over' : ''} />
        <div className='right-image'>
          @shreeti2024
        </div>
      </div>
    </div>
  );
};

const moveSnake = (snake, direction) => {
  const newSnake = [...snake];
  const head = { ...newSnake[0] };

  if (direction === 'UP') {
    head.y -= 1;
  } else if (direction === 'DOWN') {
    head.y += 1;
  } else if (direction === 'LEFT') {
    head.x -= 1;
  } else if (direction === 'RIGHT') {
    head.x += 1;
  }

  for (let i = newSnake.length - 1; i > 0; i--) {
    newSnake[i] = { ...newSnake[i - 1] };
  }
  newSnake[0] = head;

  return newSnake;
};

const isCollidingWithFood = (head, food) => {
  return head.x === food.x && head.y === food.y;
};

const isCollidingWithWall = (head) => {
  return head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 30;
};

const isCollidingWithSelf = (snake) => {
  const head = snake[0];
  return snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y);
};

const generateRandomFood = (snake) => {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * 30),
      y: Math.floor(Math.random() * 30),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

  return newFood;
};

const drawCircle = (ctx, x, y, radius) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
};

export default SnakeGame;
