
import Board from './components/Board'
import { EmptyCell } from './components/types'
import { useTetris } from './hooks/useTetris';

const board = Array(20)
  .fill(null)
  .map(() => Array(10).fill(EmptyCell.Empty))

function App() {
  const { board, isPlaying, startGame } = useTetris();

  return (
    <div className='App'>
      <h1>Toadtris Game</h1>
      <Board currentBoard={board} />
      <div className='controls'>
        {isPlaying ? null : (<button onClick={startGame}>New Game</button>)}
      </div>
    </div>
  )
}

export default App
