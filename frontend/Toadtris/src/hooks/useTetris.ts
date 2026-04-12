import { useCallback, useEffect, useState } from 'react';
import { useInterval } from './useinterval';
import { getRandomBlock, hasCollisions, useTetrisBoard, BOARD_HEIGHT, getEmptyBoard } from './useTetrisBoard';
import { BoardShape, Block, BlockShape, SHAPES, EmptyCell } from '../components/types';

enum TickSpeed {
    Normal = 800,
    Sliding = 100,
    Fast = 50,
    Level2 = 500,
    Level3 = 400,
    Level4 = 300,
    Level5 = 200,
}

function levelUP(score: number): number {
    if (score >= 5000) {
        return 5;
    } else if (score >= 2500) {
        return 4;
    } else if (score >= 1000) {
        return 3;
    } else if (score >= 500) {
        return 2;
    } else {
        return 1;
    }
}

function getTickSpeed(level: number): TickSpeed {
    switch (level) {
        case 5:
            return TickSpeed.Level5;
        case 4:
            return TickSpeed.Level4;
        case 3:
            return TickSpeed.Level3;
        case 2:
            return TickSpeed.Level2;
        default:
            return TickSpeed.Normal;
    }
}

function getPoints(numCleared: number): number {
    switch (numCleared) {
        case 0:
            return 0;
        case 1:
            return 100;
        case 2:
            return 300;
        case 3:
            return 500;
        case 4:
            return 800;
        default:
            throw new Error('Invalid number of lines cleared');
    }
}

export function useTetris() {
    const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);
    const [isCommitting, setIsCommitting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
    const [score, setScore] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);

    const [
        { board, droppingRow, droppingColumn, droppingBlock, droppingShape },
        dispatchBoardState,
    ] = useTetrisBoard();

    const startGame = useCallback(() => {
        const startingBlocks = [
            getRandomBlock(),
            getRandomBlock(),
            getRandomBlock(),
        ];

        setUpcomingBlocks(startingBlocks);
        setIsCommitting(false);
        setScore(0);
        setCurrentLevel(1);
        setIsPlaying(true);
        setTickSpeed(TickSpeed.Normal);
        dispatchBoardState({ type: 'start' });
    }, [dispatchBoardState]);

    const commitPosition = useCallback(() => {
        if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
            setIsCommitting(false);
            setTickSpeed(TickSpeed.Normal);
            return;
        }

        const newBoard = structuredClone(board) as BoardShape;
        addShapeToBoard(
            newBoard,
            droppingBlock,
            droppingShape,
            droppingRow,
            droppingColumn
        );

        let numCleared = 0;
        for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
            if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
                numCleared++;
                newBoard.splice(row, 1);
            }
        }

        const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
        const newBlock = newUpcomingBlocks.pop() as Block;
        newUpcomingBlocks.unshift(getRandomBlock());

        const pointsGained = getPoints(numCleared);
        const newScore = score + pointsGained;
        const newLevel = levelUP(newScore);

        setScore(newScore);
        setCurrentLevel(newLevel);

        if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
            setIsPlaying(false);
            setTickSpeed(null);
        } else {
            setTickSpeed(getTickSpeed(newLevel));
        }

        setUpcomingBlocks(newUpcomingBlocks);
        dispatchBoardState({
            type: 'commit',
            newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard],
            newBlock,
        });
        setIsCommitting(false);
    }, [
        board,
        dispatchBoardState,
        droppingBlock,
        droppingColumn,
        droppingRow,
        droppingShape,
        upcomingBlocks,
        score,
    ]);

    const gameTick = useCallback(() => {
        if (isCommitting) {
            commitPosition();
        } else if (
            hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)
        ) {
            setTickSpeed(TickSpeed.Sliding);
            setIsCommitting(true);
        } else {
            dispatchBoardState({ type: 'drop' });
        }
    }, [
        board,
        commitPosition,
        dispatchBoardState,
        droppingColumn,
        droppingRow,
        droppingShape,
        isCommitting,
    ]);

    useInterval(() => {
        if (!isPlaying) {
            return;
        }
        gameTick();
    }, tickSpeed);

    useEffect(() => {
        if (!isPlaying) {
            return;
        }

        let isPressingLeft = false;
        let isPressingRight = false;
        let moveIntervalID: ReturnType<typeof setInterval> | undefined;

        const updateMovementInterval = () => {
            clearInterval(moveIntervalID);
            dispatchBoardState({
                type: 'move',
                isPressingLeft,
                isPressingRight,
            });
            moveIntervalID = setInterval(() => {
                dispatchBoardState({
                    type: 'move',
                    isPressingLeft,
                    isPressingRight,
                });
            }, 300);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) {
                return;
            }

            if (event.key === 'ArrowDown') {
                setTickSpeed(TickSpeed.Fast);
            }

            if (event.key === 'ArrowUp') {
                dispatchBoardState({
                    type: 'move',
                    isRotating: true,
                });
            }

            if (event.key === 'ArrowLeft') {
                isPressingLeft = true;
                updateMovementInterval();
            }

            if (event.key === 'ArrowRight') {
                isPressingRight = true;
                updateMovementInterval();
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'ArrowDown') {
                setTickSpeed(getTickSpeed(currentLevel));
            }

            if (event.key === 'ArrowLeft') {
                isPressingLeft = false;
                updateMovementInterval();
            }

            if (event.key === 'ArrowRight') {
                isPressingRight = false;
                updateMovementInterval();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            clearInterval(moveIntervalID);
            setTickSpeed(getTickSpeed(currentLevel));
        };
    }, [dispatchBoardState, isPlaying, currentLevel]);

    const renderedBoard = structuredClone(board) as BoardShape;
    if (isPlaying) {
        addShapeToBoard(
            renderedBoard,
            droppingBlock,
            droppingShape,
            droppingRow,
            droppingColumn
        );
    }

    return {
        board: renderedBoard,
        startGame,
        isPlaying,
        upcomingBlocks,
        score,
        currentLevel,
    };
}

function addShapeToBoard(
    board: BoardShape,
    droppingBlock: Block,
    droppingShape: BlockShape,
    droppingRow: number,
    droppingColumn: number
) {
    droppingShape
        .filter((row: boolean[]) => row.some((isSet) => isSet))
        .forEach((row: boolean[], rowIndex: number) => {
            row.forEach((isSet: boolean, colIndex: number) => {
                if (isSet) {
                    board[droppingRow + rowIndex][droppingColumn + colIndex] = droppingBlock;
                }
            });
        });
}