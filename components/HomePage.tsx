// components/HomePage.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import CustomButton from './CustomButton';
import Header from './Header';

interface HomePageProps {
  onNewGame: () => void;
  onContinueGame: () => void;
  onStats: () => void;
  onClearData: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNewGame, onContinueGame, onStats, onClearData }) => {
  return (
    <>
      <Header onPress={onNewGame} onClearData={onClearData} />
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Farkle</Text>
        <Image 
          source={require('../assets/dice.png')}
          style={styles.diceImage}
          resizeMode="contain"
        />
        <View style={styles.buttonContainer}>
          <CustomButton title="New Game" onPress={onNewGame} style={styles.button} />
          <CustomButton title="Continue Game" onPress={onContinueGame} style={styles.button} />
          <CustomButton title="Stats" onPress={onStats} style={styles.button} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
  },
  diceImage: {
    width: '80%',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    marginVertical: 12,
    width: '80%',
  },
});

export default HomePage;
