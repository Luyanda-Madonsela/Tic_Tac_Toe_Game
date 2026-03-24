'use client';

import { useState, useEffect } from 'react';

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
  const [playerXName, setPlayerXName] = useState(initialSettings?.playerXName || '');
  const [playerOName, setPlayerOName] = useState(initialSettings?.playerOName || '');
  const [gameMode, setGameMode] = useState(initialSettings?.gameMode || MODES.TWO_PLAYER);

  const handleSave = () => {
    const settings = {
      playerXName: playerXName.trim() || 'Player X',
      playerOName: gameMode === MODES.VS_AI ? 'AI' : (playerOName.trim() || 'Player O'),
      gameMode
    };
    onStartGame(settings);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="settings-page">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-black" style={{ fontFamily: 'serif' }}>
          GAME SETTING&apos;S
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
        {/* Game Mode Selection */}
        <div className="mb-8 w-full max-w-md">
          <p className="text-lg text-green-700 mb-3" style={{ fontFamily: 'serif' }}>Game Mode:</p>
          <div className="flex gap-4">
            <button
              data-testid="mode-two-player"
              onClick={() => setGameMode(MODES.TWO_PLAYER)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                gameMode === MODES.TWO_PLAYER 
                  ? 'border-green-600 bg-green-50 text-green-700' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Two Players
            </button>
            <button
              data-testid="mode-vs-ai"
              onClick={() => setGameMode(MODES.VS_AI)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                gameMode === MODES.VS_AI 
                  ? 'border-green-600 bg-green-50 text-green-700' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              vs AI
            </button>
          </div>
        </div>

        {/* Player X Name */}
        <div className="mb-6 w-full max-w-md">
          <p className="text-lg text-black mb-2" style={{ fontFamily: 'serif' }}>Player X&apos;s Name:</p>
          <input
            data-testid="player-x-input"
            type="text"
            value={playerXName}
            onChange={(e) => setPlayerXName(e.target.value)}
            placeholder="Enter name..."
            className="w-full px-4 py-3 border border-black rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Player O Name (only for two player mode) */}
        {gameMode === MODES.TWO_PLAYER && (
          <div className="mb-6 w-full max-w-md">
            <p className="text-lg text-black mb-2" style={{ fontFamily: 'serif' }}>Player O&apos;s Name:</p>
            <input
              data-testid="player-o-input"
              type="text"
              value={playerOName}
              onChange={(e) => setPlayerOName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-4 py-3 border border-black rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}
      </div>

      {/* Bottom Bar with Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#2A2A2A] py-4 px-6 flex justify-center">
        <button
          data-testid="save-btn"
          onClick={handleSave}
          className="bg-[#2A2A2A] border-2 border-white text-white px-12 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          SAVE
        </button>
      </div>
    </div>
  );
}

// Game Board Component
function GameBoard({ settings, onBackToSettings }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [round, setRound] = useState(1);
  const [gameResult, setGameResult] = useState(null);
  const [winningLine, setWinningLine] = useState(null);

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
    const savedRound = localStorage.getItem('ticTacToeRound');
    if (savedRound) {
      setRound(parseInt(savedRound, 10));
    }
  }, []);

  // Save scores to localStorage
  useEffect(() => {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
    localStorage.setItem('ticTacToeRound', round.toString());
  }, [scores, round]);

  // AI move
  useEffect(() => {
    if (settings.gameMode === MODES.VS_AI && !isXNext && !gameResult) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...board]);
        if (bestMove !== null) {
          handleCellClick(bestMove, true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, gameResult, settings.gameMode]);

  const handleCellClick = (index, isAI = false) => {
    if (board[index] || gameResult) return;
    if (!isAI && settings.gameMode === MODES.VS_AI && !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinningLine(result.line);
      setGameResult(result.winner);
      setScores(prev => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1
      }));
    } else if (checkDraw(newBoard)) {
      setGameResult('draw');
    } else {
      setIsXNext(!isXNext);
    }
  };

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameResult(null);
    setWinningLine(null);
    setRound(prev => prev + 1);
  };

  const handleResetScores = () => {
    setScores({ X: 0, O: 0 });
    setRound(1);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameResult(null);
    setWinningLine(null);
    localStorage.removeItem('ticTacToeScores');
    localStorage.removeItem('ticTacToeRound');
  };

  const currentPlayer = isXNext ? 'X' : 'O';
  const currentPlayerName = isXNext ? settings.playerXName : settings.playerOName;

  return (
    <div className="min-h-screen bg-white flex" data-testid="game-board">
      {/* Sidebar - Score Board */}
      <div className="w-72 bg-[#2A2A2A] text-white p-6 flex flex-col" data-testid="score-board">
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-600 pb-2" style={{ fontFamily: 'serif' }}>
          Score Board:
        </h2>
        
        {/* Player X Score */}
        <div className="mb-4">
          <p className="text-sm text-gray-300">Player X&apos;s</p>
          <p className="text-lg font-semibold">{settings.playerXName}</p>
          <p className="text-sm text-gray-400">Round: {round} | Score: <span className="text-green-400">{scores.X}</span></p>
        </div>

        {/* Player O Score */}
        <div className="mb-6">
          <p className="text-sm text-gray-300">Player O&apos;s</p>
          <p className="text-lg font-semibold">{settings.playerOName}</p>
          <p className="text-sm text-gray-400">Round: {round} | Score: <span className="text-green-400">{scores.O}</span></p>
        </div>

        {/* Turn Indicator */}
        <div className="mt-auto">
          <p className="text-lg mb-2" style={{ fontFamily: 'serif' }}>
            Player <span className={currentPlayer === 'X' ? 'text-white' : 'text-green-400'}>{currentPlayer}&apos;s</span>
          </p>
          <p className="text-2xl font-bold text-red-500" style={{ fontFamily: 'serif' }}>
            {gameResult ? (gameResult === 'draw' ? 'Draw!' : `${gameResult} Wins!`) : `${currentPlayerName}'s Turn`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          <button
            data-testid="settings-btn"
            onClick={onBackToSettings}
            className="w-full py-2 border border-white rounded hover:bg-gray-700 transition-colors text-sm"
          >
            Settings
          </button>
          <button
            data-testid="reset-scores-btn"
            onClick={handleResetScores}
            className="w-full py-2 border border-white rounded hover:bg-gray-700 transition-colors text-sm"
          >
            Reset Scores
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-wider text-black" style={{ fontFamily: 'serif' }}>
          Tic-Tac-Toe
        </h1>

        {/* Game Grid */}
        <div className="grid grid-cols-3 gap-2" data-testid="game-grid">
          {board.map((cell, index) => {
            const isWinningCell = winningLine?.includes(index);
            return (
              <button
                key={index}
                data-testid={`cell-${index}`}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!gameResult}
                className={`w-24 h-24 md:w-28 md:h-28 border-4 rounded-lg text-5xl md:text-6xl font-bold flex items-center justify-center transition-all
                  ${cell === 'X' ? 'border-black text-black' : ''}
                  ${cell === 'O' ? 'border-green-600 text-green-600' : ''}
                  ${!cell ? 'border-black hover:bg-gray-100' : ''}
                  ${isWinningCell ? 'bg-yellow-100 animate-pulse' : ''}
                `}
                style={{ fontFamily: 'serif' }}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {/* Game Result & Play Again */}
        {gameResult && (
          <div className="mt-8 text-center" data-testid="game-result">
            <p className="text-2xl font-bold mb-4 text-black">
              {gameResult === 'draw' 
                ? "It's a Draw!" 
                : `${gameResult === 'X' ? settings.playerXName : settings.playerOName} Wins!`}
            </p>
            <button
              data-testid="play-again-btn"
              onClick={handlePlayAgain}
              className="bg-[#2A2A2A] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
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
