import { useState } from "preact/hooks";
import styles from "./Game.module.css";
import { classListBuilder } from "@maneren/utils/react";
import { iter, range } from "@maneren/utils/iterator";
import { invoke } from "@tauri-apps/api/tauri";

import { TileData, Player, Board } from "./Board.jsx";

const cls = classListBuilder(styles);

const nextPlayer = (current: Player) =>
  current === Player.X ? Player.O : Player.X;

type Move = { tile: { x: number; y: number }; score: number };
type Tile = [number, number];

export const Game = () => {
  const [board, setBoard] = useState(generateBoard(15));
  const [currentPlayer, setCurrentPlayer] = useState(Player.X);
  const [moves, setMoves] = useState([] as Tile[]);
  const [loading, setLoading] = useState(false);

  const onTileClick = ([x, y]: Tile) => {
    if (board[y][x] !== null) return;
    const newBoard = cloneBoard(board);
    newBoard[y][x] = currentPlayer;

    setBoard(newBoard);
    setCurrentPlayer(nextPlayer);
    setMoves([...moves, [x, y]]);
  };

  const calculate = () => {
    setLoading(true);
    const fen = boardToString(board);
    console.log(fen);

    invoke<Move>("calculate", {
      timeLimit: 5000,
      board: fen,
      player: currentPlayer,
    }).then(({ tile: { x, y } }) => {
      onTileClick([x, y]);
      setLoading(false);
    });
  };

  const undo = () => {
    if (moves.length === 0) return;

    let movesIter = iter(moves);
    let newMoves = movesIter.take(moves.length - 1).collect();

    let [x, y] = movesIter.next().value ?? [0, 0];

    const newBoard = cloneBoard(board);
    newBoard[y][x] = null;

    setBoard(newBoard);
    setCurrentPlayer(nextPlayer);
    setMoves(newMoves);
  };

  return (
    <div className={cls("game")}>
      <h1>Gomoku</h1>
      <div className={cls("buttons")}>
        <button onClick={calculate}>Calculate</button>
        <button onClick={undo}>Undo</button>
      </div>
      <div>
        <label for="time-limit">Engine time limit: </label>
        <input
          id="time-limit"
          type="number"
          value={5000}
          placeholder="Time limit"
          width="100px"
        />
      </div>
      <Board board={board} onTileClick={loading ? () => null : onTileClick} />

      {/* loading && <div className={cls("loading")}>Loading...</div> */}
    </div>
  );
};

const cloneBoard = (board: TileData[][]) =>
  iter(board)
    .map((row) => [...row])
    .collect();

const generateBoard = (size: number) =>
  range(size)
    .map((_) =>
      range(size)
        .map((_) => null as TileData)
        .collect(),
    )
    .collect();

const boardToString = (board: TileData[][]) =>
  board
    .map((row) => row.map((tile) => tile?.toString() ?? "-").join(""))
    .join("\n");
