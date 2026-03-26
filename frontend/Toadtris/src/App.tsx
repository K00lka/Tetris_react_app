
import Board from './components/Board'
import { EmptyCell } from './components/types'

const board = Array(20)
  .fill(null)
  .map(() => Array(10).fill(EmptyCell.Empty))

function App() {
  return (
    <div className='App'>
      <h1>Toadtris Game</h1>
      <Board currentBoard={board} />
    </div>
  )
}

export default App
