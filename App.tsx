// App.tsx
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import HomePage from './components/HomePage';
import UpdateNotification from './components/UpdateNotification';
import GameSetup from './components/GameSetup';
import Game from './components/Game';
import HistoryPage from './components/HistoryPage';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <div
        className="flex flex-col min-h-screen"
        style={{ paddingTop: 'var(--header-height, 0px)' }}
      >
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
