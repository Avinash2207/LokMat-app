import React from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.big}>🎉 LokMat is ALIVE! 🎉</Text>
      <Text style={styles.small}>Your phone OTP + heatmap app is working!</Text>
      <Text style={styles.small}>Next step: Firebase → real login & polls</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  big: { fontSize: 32, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  small: { fontSize: 18, color: '#94A3B8' }
});

