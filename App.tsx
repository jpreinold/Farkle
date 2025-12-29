// App.tsx
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import HomePage from './components/HomePage';
import GameSetup from './components/GameSetup';
import Scoreboard from './components/Scoreboard';
import HistoryPage from './components/HistoryPage';
import UpdateNotification from './components/UpdateNotification';
import GameSetupSimulation from './components/GameSetupSimulation';
import Game from './components/Game';

export default function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <UpdateNotification />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<GameSetup />} />
          <Route path="/game-setup" element={<GameSetupSimulation />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/game" element={<Game />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
