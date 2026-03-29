
import Board from './components/Board'

import { useTetris } from './hooks/useTetris';


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
