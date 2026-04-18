
import Board from './components/Board'
import UpcomingBlocks from './components/UpcomingBlocks';
import { useTetris } from './hooks/useTetris';
import LogoutButton from './components/LogoutButton';
import LoginButton from './components/LoginButton';


function App() {
  const { board, isPlaying, startGame, score, upcomingBlocks } = useTetris();

  return (
    <div className='App'>
      <div><h1>Toadtris Game</h1> <LoginButton /> <LogoutButton /></div>
      <Board currentBoard={board} />
      <div className='controls'>
        <h2>Score: {score}</h2>
        {isPlaying ? (<UpcomingBlocks upcomingBlocks={upcomingBlocks} />) : (<button onClick={startGame}>New Game</button>)}
      </div>
    </div>
  )
}

export default App
