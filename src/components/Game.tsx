import { useState } from "preact/hooks";
import styles from "./Game.module.css";
import { classListBuilder } from "@maneren/utils/react";
import { iter, range } from "@maneren/utils/iterator";
import { invoke } from "@tauri-apps/api/tauri";

import { TileData, Player, Board } from "./Board.jsx";

const cls = classListBuilder(styles);

const nextPlayer = (current: Player) =>
  current === Player.X ? Player.O : Player.X;

export const Game = () => {
  const [board, setBoard] = useState(generateBoard(15));
  const [currentPlayer, setCurrentPlayer] = useState(Player.X);
  const [moves, setMoves] = useState([] as [number, number][]);
  const [loading, setLoading] = useState(false);

  const onTileClick = ([x, y]: [number, number]) => {
    if (board[y][x] === null) {
      const newBoard = cloneBoard(board);
      newBoard[y][x] = currentPlayer;

      setBoard(newBoard);
      setCurrentPlayer(nextPlayer);
      setMoves([...moves, [x, y]]);
    }
  };

  const calculate = async () => {
    setLoading(true);
    const fen = boardToString(board);
    console.log(fen);

    const {
      tile: { x, y },
    } = (await invoke("calculate", {
      timeLimit: 5000,
      board: fen,
      player: currentPlayer,
    })) as {
      tile: { x: number; y: number };
    };

    onTileClick([x, y]);

    setLoading(false);
  };

  return (
    <div className={cls("game")}>
      <h1>Gomoku</h1>
      <button onClick={calculate}>Calculate</button>
      <Board board={board} onTileClick={loading ? () => null : onTileClick} />
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
