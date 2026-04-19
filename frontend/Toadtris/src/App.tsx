
import Board from './components/Board'
import UpcomingBlocks from './components/UpcomingBlocks';
import { useTetris } from './hooks/useTetris';
import LogoutButton from './components/LogoutButton';
import LoginButton from './components/LoginButton';
import Leaderboard from './components/Leaderboard';
import { useAuth0 } from "@auth0/auth0-react";



function App() {
  const { user, isAuthenticated } = useAuth0();
  const { board, isPlaying, startGame, score, upcomingBlocks } = useTetris();


return (
    <div className='App'>
      <div className='navbar'>
        <div style={{ width: 120 }} />
        <div className='navbar-title'>Toadtris Game</div>
        <div className='navbar-buttons'>
          <LoginButton />
          <LogoutButton />
        </div>
      </div>
      <div className="main-content">
        <Board currentBoard={board} />
        <div className='side-panel'>
          <div className='controls'>
            <h2>Score: {score}</h2>
            {isPlaying ? (
              <UpcomingBlocks upcomingBlocks={upcomingBlocks} />
            ) : (
              <button onClick={startGame}>New Game</button>
            )}
          </div>
          <div className='leaderboard-container'>
            <Leaderboard userNickname={isAuthenticated && user ? user.nickname : undefined} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
