import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { auth, db } from './firebase';
import { signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import MapView, { Heatmap } from 'react-native-maps';

export default function App() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Check if user is admin
  const isAdmin = user?.phoneNumber === '+918884441704';

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'questions'));
    const unsub = onSnapshot(q, snap => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const sendOTP = async () => {
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone);
      setConfirmation(confirmation);
      Alert.alert('OTP sent!');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const verifyOTP = async () => {
    try {
      await confirmation.confirm(otp);
      Alert.alert('Logged in!');
    } catch (e) { Alert.alert('Wrong OTP'); }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to LokMat</Text>
        <TextInput placeholder="+918884441704" value={phone} onChangeText={setPhone} style={styles.input} />
        <Button title="Send OTP" onPress={sendOTP} />
        {confirmation && (
          <>
            <TextInput placeholder="Enter OTP" value={otp} onChangeText={setOtp} style={styles.input} />
            <Button title="Verify OTP" onPress={verifyOTP} />
          </>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ padding: 20, fontSize: 20 }}>Hello {isAdmin ? 'Admin 👑' : 'User'}</Text>
      {isAdmin && <AdminPanel />}
      <QuestionList questions={questions} user={user} setSelectedQuestion={setSelectedQuestion} />
      {selectedQuestion && <ResultsScreen question={selectedQuestion} user={user} />}
    </View>
  );
}

// Admin Panel (only you see this)
function AdminPanel() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Poll');
  const [options, setOptions] = useState('');
  const [evergreen, setEvergreen] = useState(false);

  const create = async () => {
    await addDoc(collection(db, 'questions'), {
      title,
      type,
      options: options.split('\n').filter(o => o),
      evergreen,
      createdAt: serverTimestamp(),
      votes: {}
    });
    setTitle(''); setOptions(''); Alert.alert('Question created!');
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#1E293B' }}>
      <Text style={{ color: 'white', fontSize: 18 }}>Create Question</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Options (one per line)" value={options} onChangeText={setOptions} multiline style={styles.input} />
      <Button title="Create Poll/Survey/Forecast" onPress={create} />
      <Button title={evergreen ? "Evergreen ON" : "Evergreen OFF"} onPress={() => setEvergreen(!evergreen)} />
    </View>
  );
}

// Rest of components (QuestionList, voting, hidden results, heatmap) coming in next message if you want them one by one

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#0F172A' },
  title: { fontSize: 32, color: 'white', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: 'white', padding: 15, margin: 10, borderRadius: 8 }
});
