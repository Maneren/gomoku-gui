#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use gomoku_lib::{Board, Move, Player, TilePointer};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug, Copy, Clone)]
enum PlayerWrapper {
    X,
    O,
}

impl PlayerWrapper {
    pub fn unwrap(self) -> Player {
        match self {
            PlayerWrapper::X => Player::X,
            PlayerWrapper::O => Player::O,
        }
    }
}

#[derive(Serialize, Debug, Copy, Clone)]
pub struct TilePointerWrapper {
    x: u8,
    y: u8,
}

impl TilePointerWrapper {
    pub fn unwrap(self) -> TilePointer {
        TilePointer {
            x: self.x,
            y: self.y,
        }
    }
}

#[derive(Serialize, Debug)]
struct MoveWrapper {
    tile: TilePointerWrapper,
    score: i32,
}

impl MoveWrapper {
    fn new(tile: TilePointer, score: i32) -> Self {
        Self {
            tile: TilePointerWrapper {
                x: tile.x,
                y: tile.y,
            },
            score,
        }
    }
}

#[tauri::command]
fn calculate(board: String, player: PlayerWrapper, time_limit: u64) -> MoveWrapper {
    let mut board = Board::from_string(&board).expect("Invalid board");

    println!("{board}");

    let Move { tile, score } = gomoku_lib::decide(&mut board, player.unwrap(), time_limit)
        .expect("Error deciding")
        .0;

    MoveWrapper::new(tile, score)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![calculate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    let _ = gomoku_lib::set_thread_count(6);
}
