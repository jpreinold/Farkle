// components/HomePage.tsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from './CustomButton';
import Header from './Header';
import { ThemeContext } from './ThemeContext';
import storage from '../utils/storage';

const HomePage: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleNewGame = () => {
    navigate('/setup');
  };

  const handleContinueGame = async () => {
    // Check if there's a saved game state
    try {
      const savedState = await storage.getItem('GAME_STATE');
      if (savedState) {
        navigate('/scoreboard');
      } else {
        // Optionally show a message that no saved game exists
        alert('No saved game found.');
      }
    } catch (error) {
      console.error('Error checking for saved game:', error);
    }
  };

  const handleNewSimulation = () => {
    navigate('/game-setup');
  };

  const handleStats = () => {
    navigate('/history');
  };

  const handleClearData = async () => {
    try {
      await storage.clear();
      console.log('Local storage cleared.');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };
  return (
    <>
      <Header onClearData={handleClearData} />
      <div
        className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 min-h-screen"
        style={{ backgroundColor: theme.background }}
      >
        {/* Hero Section */}
        <div className="w-full max-w-md text-center mb-8 animate-fade-in">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: theme.titleText }}
          >
            Welcome to Farkle
          </h1>
          <p
            className="text-lg md:text-xl mb-8 opacity-80"
            style={{ color: theme.text }}
          >
            The classic dice game scorekeeper
          </p>
          
          {/* Dice Image with glow effect */}
          <div className="mb-8 flex justify-center">
            <div 
              className="rounded-2xl p-4 shadow-lg"
              style={{ 
                backgroundColor: theme.cardBackground,
                boxShadow: `0 8px 24px ${theme.shadowColor}`,
              }}
            >
              <img
                src="/assets/dice.png"
                alt="Dice"
                className="w-48 md:w-64 h-auto"
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
              />
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="w-full max-w-md space-y-4 animate-slide-up">
          <div 
            className="card card-hover"
            style={{ 
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <CustomButton 
              title="New Game" 
              onPress={handleNewGame} 
              style={{ width: '100%', marginBottom: 0 }} 
            />
          </div>

          <div 
            className="card card-hover"
            style={{ 
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <CustomButton 
              title="New Simulation" 
              onPress={handleNewSimulation} 
              style={{ width: '100%', marginBottom: 0 }} 
            />
          </div>
          
          <div 
            className="card card-hover"
            style={{ 
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <CustomButton 
              title="Continue Game" 
              onPress={handleContinueGame} 
              style={{ width: '100%', marginBottom: 0 }} 
            />
          </div>
          
          <div 
            className="card card-hover"
            style={{ 
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <CustomButton 
              title="Stats" 
              onPress={handleStats} 
              style={{ width: '100%', marginBottom: 0 }} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
