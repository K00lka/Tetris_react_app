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

type Action = {
    type: 'start' | 'drop' | 'commit' | 'move';
}

function boardReducer(state: BoardState, action: Action): BoardState {
    let newState = {...state};

    switch (action.type) {
        case 'start':
            const firstBlock = getRandomBlock();
            return {
                board: getEmptyBoard(),
                droppingRow: 0,
                droppingColumn: 3,
                droppingBlock: firstBlock,
                droppingShape: SHAPES[firstBlock].shape,
            }
        case 'drop':
            newState.droppingRow += 1;
            break;
        case 'commit':
        case 'move':
            break;
        default:
            const unhandledType: never = action.type;
            throw new Error(`Unhandled action type: ${unhandledType}`);
    }

    return newState;
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
