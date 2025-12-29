// App.tsx
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import HomePage from './components/HomePage';
import UpdateNotification from './components/UpdateNotification';
import GameSetup from './components/GameSetup';
import Game from './components/Game';
import HistoryPage from './components/HistoryPage';

export default function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <UpdateNotification />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game-setup" element={<GameSetup />} />
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
