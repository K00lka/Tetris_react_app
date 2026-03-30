
import { Block, BoardShape, BlockShape, SHAPES, EmptyCell } from "../components/types"
import { useReducer, Dispatch } from "react";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;


export type BoardState = {
   board: BoardShape
   droppingRow: number;
   droppingColumn: number; 
   droppingBlock: Block;
   droppingShape: BlockShape;
}

export function useTetrisBoard() : [BoardState, Dispatch<Action>] {
    const [boardState, dispatchBoardState] = useReducer(
        boardReducer,
        {
            board: [],
            droppingRow: 0,
            droppingColumn: 0,
            droppingBlock: Block.I,
            droppingShape: SHAPES.I.shape, 
        },
        (emptyState) => {
            const state = {
                ...emptyState,
                board: getEmptyBoard(),
            };
            return state;
        }
    );
    return [boardState, dispatchBoardState];
}


export function getEmptyBoard(height = BOARD_HEIGHT): BoardShape {
    return Array(height)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
}

export function getRandomBlock(): Block {
    const blockValues = Object.values(Block);
    return blockValues[Math.floor(Math.random() * blockValues.length)] as Block;
}

export function hasCollisions(
    board: BoardShape,
    currentShape: BlockShape,
    row: number,
    column: number
): boolean {
    let hasCollisions = false;
    
    currentShape
        .filter((shapeRow) => shapeRow.some((isSet) => isSet))
        .forEach((shapeRow: boolean[], rowIndex: number) => {
            shapeRow.forEach((isSet: boolean, colIndex: number) => {
                if (
                    isSet &&
                    (row + rowIndex >= board.length ||
                    column + colIndex < 0 ||
                    column + colIndex >= board[0].length ||
                    board[row + rowIndex][column + colIndex] !== EmptyCell.Empty)
                ) {
                    hasCollisions = true;
                }
            });
        });
    
    return hasCollisions;
}

function rotateBlock(shape: BlockShape): BlockShape {
    const rows = shape.length;
    const columns = shape[0].length;
    const rotated: BlockShape = Array(rows)
        .fill(null)
        .map(() => Array(columns).fill(false));

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            rotated[col][rows - 1 - row] = shape[row][col];
        }
    }

    return rotated;
}

type Action = {
  type: 'start' | 'drop' | 'commit' | 'move';
  newBoard?: BoardShape;
  newBlock?: Block;
  isPressingLeft?: boolean;
  isPressingRight?: boolean;
  isRotating?: boolean;
};

function boardReducer(state: BoardState, action: Action): BoardState {
  let newState = { ...state };

  switch (action.type) {
    case 'start':
      const firstBlock = getRandomBlock();
      return {
        board: getEmptyBoard(),
        droppingRow: 0,
        droppingColumn: 3,
        droppingBlock: firstBlock,
        droppingShape: SHAPES[firstBlock].shape,
      };
    case 'drop':
      newState.droppingRow++;
      break;
    case 'commit':
      return {
        board: [
          ...getEmptyBoard(BOARD_HEIGHT - action.newBoard!.length),
          ...action.newBoard!,
        ],
        droppingRow: 0,
        droppingColumn: 3,
        droppingBlock: action.newBlock!,
        droppingShape: SHAPES[action.newBlock!].shape,
      };
    case 'move':
      const rotatedShape = action.isRotating
        ? rotateBlock(newState.droppingShape)
        : newState.droppingShape;
      let columnOffset = action.isPressingLeft ? -1 : 0;
      columnOffset = action.isPressingRight ? 1 : columnOffset;
      if (
        !hasCollisions(
          newState.board,
          rotatedShape,
          newState.droppingRow,
          newState.droppingColumn + columnOffset
        )
      ) {
        newState.droppingColumn += columnOffset;
        newState.droppingShape = rotatedShape;
      }
      break;
    default:
      const unhandledType: never = action.type;
      throw new Error(`Unhandled action type: ${unhandledType}`);
  }

  return newState;
}
   