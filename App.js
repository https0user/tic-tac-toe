import React, { useState, useEffect, useMemo, useRef } from "react";
import { useHistoryTravel } from "ahooks";
import { IconO, IconX } from "./Icons";
import "./styles.scss";

function TurnIndicator(props) {
  return <span>Current turn: {props.turn}</span>;
}

function GameOver(props) {
  const message = props.winner ? `Player ${props.winner} won!` : "Draw game.";
  return <span>Game over! {message}</span>;
}

function Cell(props) {
  const { cell, onClick, disabled } = props;

  const marker = cell.marker;
  const isO = marker === "O";
  const isX = marker === "X";

  const className = [
    "cell",
    isO ? "o" : "",
    isX ? "x" : "",
    cell.won ? "won" : "",
    disabled ? "disabled" : "",
  ] 
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} onClick={disabled ? undefined : onClick}>
      {isO && <IconO />}
      {isX && <IconX />}
    </div>
  );
}

function Row(props) {
  const { rowData, rowIndex, onCellClick, disabled } = props;

  function renderCells() {
    return rowData.map((cell, cellIndex) => {
      return (
        <Cell
          key={`${rowIndex}-${cellIndex}`}
          cell={cell}
          disabled={disabled}
          onClick={() => onCellClick([rowIndex, cellIndex])}
        />
      );
    });
  }

  return (
    <div className="board-row">
      {renderCells()}
    </div>
  );
}

const initialStateForTimeTravel = {
  boardData: [],
  gameOver: false,
  moveCount: 0,
  turn: "O",
  winner: "",
};

function getBoardLayout(size = 3) {
  const _boardData = [];

  for (let i = 0; i < size; i++) {
    _boardData.push([]);

    for (let j = 0; j < size; j++) {
      _boardData[i].push({
        line: "",
        marker: "",
        won: false,
      });
    }
  }

  return _boardData;
}

function isValidMove(cell) {
  return !cell;
}

function hasWinner(_boardData, marker, rowIndex, cellIndex) {
  const size = _boardData.length;

  // 1) vertical
  let winningCells = [];

  for (let i = 0; i < size; i++) {
    if (_boardData[i][cellIndex].marker !== marker) break;
    winningCells.push([i, cellIndex]);

    if (i === size - 1) {
      return {
        line: "vertical",
        winner: marker,
        winningCells,
      };
    }
  }

  // 2) horizontal
  winningCells = [];

  for (let i = 0; i < size; i++) {
    if (_boardData[rowIndex][i].marker !== marker) break;
    winningCells.push([rowIndex, i]);

    if (i === size - 1) {
      return {
        line: "horizontal",
        winner: marker,
        winningCells,
      };
    }
  }

  // 3) main diagonal
  if (rowIndex === cellIndex) {
    winningCells = [];

    for (let i = 0; i < size; i++) {
      if (_boardData[i][i].marker !== marker) break;
      winningCells.push([i, i]);

      if (i === size - 1) {
        return {
          line: "diagonal-main",
          winner: marker,
          winningCells,
        };
      }
    }
  }

  // 4) anti diagonal
  if (rowIndex + cellIndex === size - 1) {
    winningCells = [];

    for (let i = 0; i < size; i++) {
      const j = size - 1 - i;
      if (_boardData[i][j].marker !== marker) break;
      winningCells.push([i, j]);

      if (i === size - 1) {
        return {
          line: "diagonal-anti",
          winner: marker,
          winningCells,
        };
      }
    }
  }

  return {
    line: "",
    winner: "",
    winningCells: [],
  };
}

function Board(props) {
  const { initialBoardData = [] } = props;
  const size = initialBoardData.length;

  const {
    value,
    setValue,
    backLength,
    forwardLength,
    back,
    forward,
    reset,
  } = useHistoryTravel({
    ...initialStateForTimeTravel,
    boardData: initialBoardData,
  });

  const { boardData, gameOver, moveCount, turn, winner } = value;

  function handlePlayerMove(cell) {
    const [rowIndex, cellIndex] = cell;

    if (gameOver) return;

    if (!isValidMove(boardData[rowIndex][cellIndex].marker)) return;

    const newState = { ...value };
    const _newBoardData = JSON.parse(JSON.stringify(boardData));

    _newBoardData[rowIndex][cellIndex].marker = turn;
    newState.boardData = _newBoardData;
    newState.moveCount = moveCount + 1;

    const winResult = hasWinner(_newBoardData, turn, rowIndex, cellIndex);
    const { line, winner: winPlayer, winningCells } = winResult;

    if (winPlayer) {
      newState.winner = winPlayer;
      newState.gameOver = true;

      for (let i = 0; i < winningCells.length; i++) {
        const r = winningCells[i][0];
        const c = winningCells[i][1];
        _newBoardData[r][c].won = true;
        _newBoardData[r][c].line = line;
      }
    } else {
      const maxMoves = size * size;

      if (newState.moveCount >= maxMoves) {
        newState.gameOver = true;
        newState.winner = "";
      } else {
        newState.turn = turn === "O" ? "X" : "O";
      }
    }

    setValue(newState);
  }

  const firstUpdate = useRef(true);

  useEffect(function on_setupEffect() {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    reset(
      {
        ...initialStateForTimeTravel,
        boardData: initialBoardData,
      },
      [initialBoardData]
    );
  }, [initialBoardData, reset]);

  function handleOnReset() {
    reset();
  }

  function renderRows() {
    return boardData.map((rowData, rowIndex) => {
      return (
        <Row
          key={rowIndex}
          rowData={rowData}
          rowIndex={rowIndex}
          onCellClick={handlePlayerMove}
          disabled={gameOver}
        />
      );
    });
  }

  const gridTemplate = useMemo(() => {
    return {
      gridTemplateRows: `repeat(${size}, 1fr)`,
    };
  }, [size]);

  const rowTemplate = useMemo(() => {
    return {
      gridTemplateColumns: `repeat(${size}, 1fr)`,
    };
  }, [size]);

  return (
    <>
      <div className="info">
        {!gameOver && <TurnIndicator turn={turn} />}
        {gameOver && <GameOver winner={winner} />}
        <div className="small">Moves: {moveCount}</div>
      </div>

      <div className="board" style={gridTemplate}>
        {boardData.map((rowData, rowIndex) => (
          <div key={rowIndex} className="board-row" style={rowTemplate}>
            {rowData.map((cell, cellIndex) => (
              <Cell
                key={`${rowIndex}-${cellIndex}`}
                cell={cell}
                disabled={gameOver}
                onClick={() => handlePlayerMove([rowIndex, cellIndex])}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="history">
        <button onClick={back} disabled={backLength <= 0}>
          Undo
        </button>
        <button onClick={forward} disabled={forwardLength <= 0}>
          Redo
        </button>
        <button onClick={handleOnReset}>Reset</button>
      </div>
    </>
  );
}

function TicTacToe(props) {
  const { size: _size = 3, maxSize = 9 } = props;

  const minSize = 3;

  const [size, setSize] = useState(_size);

  const initialBoardData = useMemo(function getInitialBoardData() {
    return getBoardLayout(size);
  }, [size]);

  // controller data
  const [targetSize, setTargetSize] = useState(size);

  function handleOnChangeInputSize(e) {
    setTargetSize(parseInt(e.target.value.slice(0, 1), 10));
  }

  function handleCreateBoard() {
    if (targetSize >= minSize && targetSize <= maxSize) {
      setSize(targetSize);
    } else {
      setTargetSize(size);
    }
  }

  return (
    <div className="app">
      <h1>Tic Tac Toe</h1>

      <div className="controls">
        <label>
          Size:
          <input
            type="number"
            min={minSize}
            max={maxSize}
            value={targetSize}
            onChange={handleOnChangeInputSize}
          />
        </label>
        <button onClick={handleCreateBoard}>Create board</button>
      </div>

      <Board initialBoardData={initialBoardData} />
    </div>
  );
}

export default function App() {
  return <TicTacToe />;
}
