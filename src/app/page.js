'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Game modes
const MODES = {
  TWO_PLAYER: 'two-player',
  VS_AI: 'vs-ai'
};

// Check for winner
const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
};

// Check for draw
const checkDraw = (board) => {
  return board.every(cell => cell !== null);
};

// AI move using minimax
const minimax = (board, depth, isMaximizing, alpha, beta) => {
  const result = checkWinner(board);
  if (result) {
    return result.winner === 'O' ? 10 - depth : depth - 10;
  }
  if (checkDraw(board)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const evalScore = minimax(board, depth + 1, false, alpha, beta);
        board[i] = null;
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        const evalScore = minimax(board, depth + 1, true, alpha, beta);
        board[i] = null;
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
};

const getBestMove = (board) => {
  let bestScore = -Infinity;
  let bestMove = null;
  
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
};

// Settings Page Component
function SettingsPage({ onStartGame, initialSettings }) {
  const [playerOName, setPlayerOName] = useState(initialSettings?.playerOName || '');
  const [playerXName, setPlayerXName] = useState(initialSettings?.playerXName || '');
  const [maxRounds, setMaxRounds] = useState(initialSettings?.maxRounds || 10);
  const [gameMode, setGameMode] = useState(initialSettings?.gameMode || MODES.TWO_PLAYER);

  const handleSave = () => {
    const settings = {
      playerOName: gameMode === MODES.VS_AI ? 'AI' : (playerOName.trim() || 'Player O'),
      playerXName: playerXName.trim() || 'Player X',
      maxRounds: maxRounds,
      gameMode
    };
    onStartGame(settings);
  };

  const handleBack = () => {
    // If there are saved settings, go back to game
    const savedSettings = localStorage.getItem('ticTacToeSettings');
    if (savedSettings) {
      onStartGame(JSON.parse(savedSettings));
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative" data-testid="settings-page">
      {/* Back Arrow */}
      {initialSettings && (
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 text-3xl text-black hover:opacity-70 transition-opacity"
          data-testid="back-btn"
        >
          ←
        </button>
      )}

      {/* Title */}
      <div className="pt-12 pb-8 text-center">
        <h1 
          className="text-5xl md:text-6xl font-bold tracking-wide text-black"
          style={{ fontFamily: 'var(--font-joti-one)' }}
        >
          GAME SETTINGS
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-8 pb-40 max-w-lg mx-auto w-full">
        {/* Game Mode Selection */}
        <div className="mb-8 w-full">
          <p 
            className="text-xl text-green-500 mb-3 italic"
            style={{ fontFamily: 'var(--font-joti-one)' }}
          >
            Game Mode:
          </p>
          <div className="flex gap-4">
            <button
              data-testid="mode-two-player"
              onClick={() => setGameMode(MODES.TWO_PLAYER)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-bold ${
                gameMode === MODES.TWO_PLAYER 
                  ? 'border-green-500 bg-green-50 text-green-600' 
                  : 'border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
            >
              Two Players
            </button>
            <button
              data-testid="mode-vs-ai"
              onClick={() => setGameMode(MODES.VS_AI)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-bold ${
                gameMode === MODES.VS_AI 
                  ? 'border-green-500 bg-green-50 text-green-600' 
                  : 'border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
            >
              vs AI
            </button>
          </div>
        </div>

        {/* Change Player Names Section */}
        <div className="w-full mb-8">
          <p 
            className="text-xl text-green-500 mb-4 italic"
            style={{ fontFamily: 'var(--font-joti-one)' }}
          >
            Change Player Names:
          </p>
          
          {/* Player O */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-lg text-black w-24">Player O:</label>
            <input
              data-testid="player-o-input"
              type="text"
              value={playerOName}
              onChange={(e) => setPlayerOName(e.target.value)}
              placeholder=""
              disabled={gameMode === MODES.VS_AI}
              className="flex-1 px-4 py-2 border border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Player X */}
          <div className="flex items-center gap-4">
            <label className="text-lg text-black w-24">Player X:</label>
            <input
              data-testid="player-x-input"
              type="text"
              value={playerXName}
              onChange={(e) => setPlayerXName(e.target.value)}
              placeholder=""
              className="flex-1 px-4 py-2 border border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Other Settings Section */}
        <div className="w-full mb-8">
          <p 
            className="text-xl text-green-500 mb-4 italic"
            style={{ fontFamily: 'var(--font-joti-one)' }}
          >
            Other Settings:
          </p>
          
          {/* Max Rounds */}
          <div className="flex items-center gap-4">
            <label className="text-lg text-black">Max no. of rounds:</label>
            <input
              data-testid="max-rounds-input"
              type="number"
              min="1"
              max="99"
              value={maxRounds}
              onChange={(e) => setMaxRounds(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-3 py-2 border border-black rounded text-black text-center focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          data-testid="save-btn"
          onClick={handleSave}
          className="bg-[#3a3a3a] text-white px-16 py-3 rounded-lg text-xl font-bold btn-3d mt-4"
        >
          SAVE
        </button>
      </div>

      {/* Curved Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-[#2A2A2A] curved-bottom" />
    </div>
  );
}

// Game Board Component
function GameBoard({ settings, onBackToSettings }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(false); // O starts first
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [gameResult, setGameResult] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null);

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
    const savedRound = localStorage.getItem('ticTacToeRound');
    if (savedRound) {
      setCurrentRound(parseInt(savedRound, 10));
    }
  }, []);

  // Save scores to localStorage
  useEffect(() => {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
    localStorage.setItem('ticTacToeRound', currentRound.toString());
  }, [scores, currentRound]);

  // AI move
  useEffect(() => {
    if (settings.gameMode === MODES.VS_AI && !isXNext && !gameResult && !roundWinner) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...board]);
        if (bestMove !== null) {
          handleCellClick(bestMove, true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, gameResult, roundWinner, settings.gameMode]);

  const handleCellClick = (index, isAI = false) => {
    if (board[index] || gameResult || roundWinner) return;
    if (!isAI && settings.gameMode === MODES.VS_AI && !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinningLine(result.line);
      setRoundWinner(result.winner);
      setScores(prev => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1
      }));
    } else if (checkDraw(newBoard)) {
      setRoundWinner('draw');
    } else {
      setIsXNext(!isXNext);
    }
  };

  const handlePlayAgain = () => {
    if (currentRound >= settings.maxRounds) {
      // Game over - show final result
      setGameResult(scores.X > scores.O ? 'X' : scores.O > scores.X ? 'O' : 'draw');
    } else {
      setBoard(Array(9).fill(null));
      setIsXNext(false); // O always starts
      setRoundWinner(null);
      setWinningLine(null);
      setCurrentRound(prev => prev + 1);
    }
  };

  const handleRestartGame = () => {
    setScores({ X: 0, O: 0 });
    setCurrentRound(1);
    setBoard(Array(9).fill(null));
    setIsXNext(false);
    setGameResult(null);
    setRoundWinner(null);
    setWinningLine(null);
    localStorage.removeItem('ticTacToeScores');
    localStorage.removeItem('ticTacToeRound');
  };

  const handleResetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(false);
    setRoundWinner(null);
    setWinningLine(null);
  };

  const currentPlayer = isXNext ? 'X' : 'O';
  const currentPlayerName = isXNext ? settings.playerXName : settings.playerOName;
  const roundsLeft = settings.maxRounds - currentRound + 1;

  return (
    <div className="min-h-screen bg-white flex flex-col relative" data-testid="game-board">
      {/* Title */}
      <div className="pt-8 pb-12 text-center">
        <h1 
          className="text-5xl md:text-7xl font-bold tracking-wide text-black"
          style={{ fontFamily: 'var(--font-joti-one)' }}
        >
          Tic-Tac-Toe
        </h1>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex justify-center items-start gap-6 px-8 pb-40 pr-[200px]">
        {/* Left Side - Round Winner & Score Board */}
        <div className="flex flex-col items-start">
          {/* Round Winner Announcement */}
          {roundWinner && roundWinner !== 'draw' && (
            <p 
              className="text-3xl text-green-500 mb-6 italic"
              style={{ fontFamily: 'var(--font-joti-one)' }}
              data-testid="round-winner"
            >
              {roundWinner === 'X' ? settings.playerXName : settings.playerOName} wins this round!
            </p>
          )}

          {/* Score Board */}
          <div 
            className="bg-[#2A2A2A] text-white p-8 rounded-3xl scoreboard-shadow min-w-[380px]"
            data-testid="score-board"
          >
            <h2 
              className="text-4xl font-bold mb-6 text-center"
              style={{ fontFamily: 'var(--font-joti-one)' }}
            >
              SCORE BOARD
            </h2>
            
            <div className="space-y-3 text-2xl">
              <p>
                {settings.playerXName} (X): <span className="text-green-400 font-bold">{scores.X}</span>
              </p>
              <p>
                {settings.playerOName} (O): <span className="text-green-400 font-bold">{scores.O}</span>
              </p>
              <p className="mt-6">
                Rounds left: <span className="text-red-400 font-bold">{roundsLeft}</span> / {settings.maxRounds}
              </p>
            </div>
          </div>
        </div>

        {/* Center - Game Grid */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-2" data-testid="game-grid">
            {board.map((cell, index) => {
              const isWinningCell = winningLine?.includes(index);
              return (
                <motion.button
                  key={index}
                  data-testid={`cell-${index}`}
                  onClick={() => handleCellClick(index)}
                  disabled={!!cell || !!roundWinner}
                  className={`w-32 h-32 md:w-40 md:h-40 border-[6px] rounded-xl text-6xl md:text-8xl font-bold flex items-center justify-center game-cell
                    ${cell ? 'border-green-500' : 'border-black'}
                    ${cell === 'X' ? 'text-black' : ''}
                    ${cell === 'O' ? 'text-black' : ''}
                    ${!cell && !roundWinner ? 'hover:bg-gray-100 cursor-pointer' : ''}
                    ${isWinningCell ? 'bg-green-100' : 'bg-white'}
                  `}
                  style={{ fontFamily: 'var(--font-joti-one)' }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={!cell && !roundWinner ? { scale: 1.05 } : {}}
                  animate={isWinningCell ? {
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0)",
                      "0 0 20px 10px rgba(34, 197, 94, 0.5)",
                      "0 0 0 0 rgba(34, 197, 94, 0)"
                    ]
                  } : {}}
                  transition={isWinningCell ? {
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : {}}
                >
                  <AnimatePresence mode="wait">
                    {cell && (
                      <motion.span
                        key={cell}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={isWinningCell ? {
                          scale: [1, 1.2, 1],
                          rotate: 0
                        } : { scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={isWinningCell ? {
                          scale: {
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut"
                          },
                          rotate: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }
                        } : { 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 20 
                        }}
                      >
                        {cell}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          {/* Play Again Button */}
          {roundWinner && !gameResult && (
            <button
              data-testid="play-again-btn"
              onClick={handlePlayAgain}
              className="mt-8 bg-[#3a3a3a] text-white px-12 py-4 rounded-xl text-xl font-bold btn-3d"
            >
              {currentRound >= settings.maxRounds ? 'VIEW RESULTS' : 'NEXT ROUND'}
            </button>
          )}

          {/* Final Game Result */}
          {gameResult && (
            <div className="mt-8 text-center" data-testid="game-result">
              <p 
                className="text-4xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-joti-one)' }}
              >
                {gameResult === 'draw' 
                  ? "Game Over - It's a Tie!" 
                  : `${gameResult === 'X' ? settings.playerXName : settings.playerOName} Wins the Game!`}
              </p>
              <p className="text-2xl mb-6">
                Final Score: {settings.playerXName} {scores.X} - {scores.O} {settings.playerOName}
              </p>
              <button
                data-testid="new-game-btn"
                onClick={handleRestartGame}
                className="bg-[#3a3a3a] text-white px-12 py-4 rounded-xl text-xl font-bold btn-3d"
              >
                NEW GAME
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Control Buttons */}
        <div className="flex flex-col gap-4">
          <button
            data-testid="restart-game-btn"
            onClick={handleRestartGame}
            className="bg-[#3a3a3a] text-white px-8 py-4 rounded-xl font-bold btn-3d text-lg whitespace-nowrap"
          >
            RESTART GAME
          </button>
          <button
            data-testid="reset-board-btn"
            onClick={handleResetBoard}
            className="bg-[#3a3a3a] text-white px-8 py-4 rounded-xl font-bold btn-3d text-lg whitespace-nowrap"
          >
            RESET BOARD
          </button>
          <button
            data-testid="settings-btn"
            onClick={onBackToSettings}
            className="bg-[#3a3a3a] text-white px-8 py-4 rounded-xl font-bold btn-3d text-lg whitespace-nowrap"
          >
            SETTINGS
          </button>
        </div>
      </div>

      {/* Curved Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-[#2A2A2A] curved-bottom" />
    </div>
  );
}

// Main App Component
export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [settings, setSettings] = useState(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('ticTacToeSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setGameStarted(true);
    }
  }, []);

  const handleStartGame = (newSettings) => {
    setSettings(newSettings);
    setGameStarted(true);
    localStorage.setItem('ticTacToeSettings', JSON.stringify(newSettings));
  };

  const handleBackToSettings = () => {
    setGameStarted(false);
  };

  if (!gameStarted) {
    return <SettingsPage onStartGame={handleStartGame} initialSettings={settings} />;
  }

  return <GameBoard settings={settings} onBackToSettings={handleBackToSettings} />;
}
