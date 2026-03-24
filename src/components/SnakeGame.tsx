import { useEffect, useRef, useState, useCallback } from 'react';
import { Gamepad2 } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 80;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Use refs for state that needs to be accessed in the game loop without triggering re-renders
  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const foodRef = useRef(food);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const hasStartedRef = useRef(hasStarted);

  useEffect(() => {
    snakeRef.current = snake;
    directionRef.current = direction;
    foodRef.current = food;
    gameOverRef.current = gameOver;
    isPausedRef.current = isPaused;
    hasStartedRef.current = hasStarted;
  }, [snake, direction, food, gameOver, isPaused, hasStarted]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setHasStarted(true);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !gameOverRef.current) {
        if (!hasStartedRef.current) {
          setHasStarted(true);
        } else {
          setIsPaused((p) => !p);
        }
        return;
      }

      if (!hasStartedRef.current || isPausedRef.current || gameOverRef.current) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let lastTime = 0;
    let animationFrameId: number;

    const gameLoop = (time: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      if (!hasStartedRef.current || isPausedRef.current || gameOverRef.current) {
        draw();
        return;
      }

      // Calculate speed based on score (gets faster)
      const currentSpeed = Math.max(30, BASE_SPEED - Math.floor(score / 10) * 5);

      if (time - lastTime >= currentSpeed) {
        lastTime = time;
        update();
      }
      draw();
    };

    const update = () => {
      const currentSnake = [...snakeRef.current];
      const head = { ...currentSnake[0] };
      const dir = directionRef.current;

      head.x += dir.x;
      head.y += dir.y;

      // Wall collision
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      // Self collision
      if (
        currentSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        return;
      }

      currentSnake.unshift(head);

      // Food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore((s) => s + 10);
        const newFood = generateFood(currentSnake);
        setFood(newFood);
        foodRef.current = newFood; // Update ref immediately for draw
      } else {
        currentSnake.pop();
      }

      setSnake(currentSnake);
      snakeRef.current = currentSnake; // Update ref immediately for draw
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#0a0a0a'; // Dark background
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw grid lines (optional, for neon effect)
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.2)'; // Magenta grid
      ctx.lineWidth = 1;
      for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
      }

      // Draw Food (Magenta)
      const f = foodRef.current;
      ctx.shadowBlur = 0; // Raw pixel look
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(
        f.x * CELL_SIZE,
        f.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );

      // Draw Snake (Cyan)
      const s = snakeRef.current;
      
      s.forEach((segment, index) => {
        const isHead = index === 0;
        
        if (isHead) {
          ctx.fillStyle = '#ffffff';
        } else {
          // Glitchy alternating colors for tail sometimes
          ctx.fillStyle = Math.random() > 0.95 ? '#ff00ff' : '#00ffff';
        }
        
        ctx.fillRect(
          segment.x * CELL_SIZE,
          segment.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
      });

      // Reset shadow for text
      ctx.shadowBlur = 0;
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score, generateFood]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-6 font-['VT323']">
      <div className="flex justify-between items-center w-full mb-6 border-b-4 border-[#ff00ff] pb-2">
        <div className="text-[#00ffff] flex items-center gap-4">
          <Gamepad2 className="w-8 h-8" />
          <span className="text-3xl font-['Press_Start_2P'] drop-shadow-[2px_2px_0_#ff00ff]">SECTOR_7</span>
        </div>
        <div className="text-4xl text-[#ff00ff] drop-shadow-[2px_2px_0_#00ffff]">
          DATA: 0x{score.toString(16).padStart(4, '0').toUpperCase()}
        </div>
      </div>

      <div className="relative group">
        <div className="relative bg-black p-1 border-4 border-[#00ffff]">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="bg-black cursor-crosshair"
          />

          {/* Overlays */}
          {(!hasStarted || isPaused || gameOver) && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 border-4 border-[#ff00ff] m-1">
              {!hasStarted && !gameOver && (
                <div className="text-center">
                  <p className="text-[#00ffff] text-3xl font-['Press_Start_2P'] mb-4 drop-shadow-[4px_4px_0_#ff00ff] animate-pulse">
                    AWAITING INPUT...
                  </p>
                  <p className="text-[#ff00ff] text-2xl mb-6">EXECUTE: [SPACE]</p>
                  <button
                    onClick={() => setHasStarted(true)}
                    className="px-8 py-3 bg-black border-4 border-[#00ffff] text-[#00ffff] text-2xl font-['VT323'] hover:bg-[#00ffff] hover:text-black transition-none uppercase tracking-widest"
                  >
                    INITIALIZE
                  </button>
                </div>
              )}

              {isPaused && !gameOver && hasStarted && (
                <div className="text-center">
                  <p className="text-[#ff00ff] text-3xl font-['Press_Start_2P'] mb-6 drop-shadow-[4px_4px_0_#00ffff] glitch-text" data-text="SIGNAL LOST">
                    SIGNAL LOST
                  </p>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="px-8 py-3 bg-black border-4 border-[#ff00ff] text-[#ff00ff] text-2xl font-['VT323'] hover:bg-[#ff00ff] hover:text-black transition-none uppercase tracking-widest"
                  >
                    RECONNECT
                  </button>
                </div>
              )}

              {gameOver && (
                <div className="text-center">
                  <p 
                    className="text-[#ff00ff] text-4xl md:text-5xl font-['Press_Start_2P'] mb-4 drop-shadow-[4px_4px_0_#00ffff] uppercase glitch-text"
                    data-text="CRITICAL FAILURE"
                  >
                    CRITICAL FAILURE
                  </p>
                  <p className="text-[#00ffff] text-3xl mb-8">
                    CORRUPTION LEVEL: 0x{score.toString(16).toUpperCase()}
                  </p>
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-black border-4 border-[#00ffff] text-[#00ffff] text-2xl font-['VT323'] hover:bg-[#00ffff] hover:text-black transition-none uppercase tracking-widest"
                  >
                    REBOOT SYSTEM
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-[#ff00ff] text-xl flex gap-8 border-t-2 border-[#00ffff] pt-2 w-full justify-center">
        <span>[SPACE] HALT/RESUME</span>
        <span>[WASD] OVERRIDE</span>
      </div>
    </div>
  );
}
