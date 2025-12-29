// App.tsx
import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import HomePage from './components/HomePage';
import UpdateNotification from './components/UpdateNotification';
import GameSetup from './components/GameSetup';
import Game from './components/Game';
import HistoryPage from './components/HistoryPage';

export default function App() {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  /**
   * iOS PWA Keyboard Scroll Fix
   *
   * Problem: On iOS PWAs, when the virtual keyboard opens, iOS pushes the page content
   * up to keep the focused input visible. When the keyboard closes, iOS doesn't properly
   * restore the scroll position, leaving the content "stuck" in the pushed-up state.
   * Users cannot scroll back to the top of the page.
   *
   * Solution: Use the visualViewport API to detect when the keyboard closes (viewport
   * height increases significantly), then reset `window.scrollTo(0, 0)` to unlock the
   * scroll. We preserve and restore the main content scroll position so users don't
   * lose their place.
   *
   * The 100px threshold ensures we only trigger on actual keyboard close events,
   * not minor viewport adjustments.
   */
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let previousHeight = viewport.height;

    const handleResize = () => {
      const currentHeight = viewport.height;
      // Keyboard closed - viewport got taller
      if (currentHeight > previousHeight + 100) {
        const mainScroll = mainRef.current?.scrollTop ?? 0;
        window.scrollTo(0, 0);
        if (mainRef.current) {
          mainRef.current.scrollTop = mainScroll;
        }
      }
      previousHeight = currentHeight;
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ThemeProvider>
      <div
        ref={mainRef}
        className="flex flex-col min-h-screen overflow-y-auto"
        style={{ 
          paddingTop: 'var(--header-height, 0px)',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain'
        }}
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
