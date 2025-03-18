// components/Header.tsx
import React from 'react';
import { SafeAreaView, TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';

interface HeaderProps {
  onPress?: () => void;
  onClearData?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPress, onClearData }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onPress} style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Farkle</Text>
        </TouchableOpacity>
        {onClearData && (
          <TouchableOpacity onPress={onClearData} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear Data</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#4A90E2',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    // This container holds the title and responds to onPress.
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default Header;
