import styles from "./Board.module.css";
import { classListBuilder } from "@maneren/utils/react";

const cls = classListBuilder(styles);

interface TileProps {
  value: string;
  idx: [number, number];
  onClick: (idx: [number, number]) => void;
}
const Tile = ({ onClick, value, idx }: TileProps) => {
  return (
    <div className={cls("tile")} onClick={() => onClick(idx)}>
      {value}
    </div>
  );
};

export enum Player {
  X = "X",
  O = "O",
}

export type TileData = Player | null;

interface BoardProps {
  board: TileData[][];
  onTileClick: (idx: [number, number]) => void;
}

export const Board = ({ board, onTileClick }: BoardProps) => (
  <div className={cls("board")}>
    {board.map((row, y) => (
      <div key={`${y}`} className={cls("row")}>
        {row.map((tile, x) => (
          <Tile
            key={`${x}`}
            value={tile?.toString() ?? " "}
            onClick={onTileClick}
            idx={[x, y]}
          />
        ))}
      </div>
    ))}
  </div>
);
