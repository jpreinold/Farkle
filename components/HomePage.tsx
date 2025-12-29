// components/HomePage.tsx
import React, { useContext } from 'react';
import CustomButton from './CustomButton';
import Header from './Header';
import { ThemeContext } from './ThemeContext';

interface HomePageProps {
  onNewGame: () => void;
  onContinueGame: () => void;
  onStats: () => void;
  onClearData: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNewGame, onContinueGame, onStats, onClearData }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <>
      <Header onPress={onNewGame} onClearData={onClearData} />
      <div
        className="flex-1 flex flex-col justify-center items-center p-4"
        style={{ backgroundColor: theme.background }}
      >
        <h1
          className="text-3xl font-bold mb-0"
          style={{ color: theme.titleText }}
        >
          Welcome to Farkle
        </h1>
        <img
          src="/assets/dice.png"
          alt="Dice"
          className="w-4/5 mb-3"
          style={{ objectFit: 'contain' }}
        />
        <div className="w-full flex flex-col items-center">
          <CustomButton title="New Game" onPress={onNewGame} style={{ marginVertical: 12, width: '80%' }} />
          <CustomButton title="Continue Game" onPress={onContinueGame} style={{ marginVertical: 12, width: '80%' }} />
          <CustomButton title="Stats" onPress={onStats} style={{ marginVertical: 12, width: '80%' }} />
        </div>
      </div>
    </>
  );
};

export default HomePage;
