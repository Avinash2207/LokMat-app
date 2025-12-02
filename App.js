import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, TextInput, Button, FlatList, TouchableOpacity, Switch } from 'react-native';
import { auth, db } from './firebase';
import { signInWithPhoneNumber } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
import MapView, { Heatmap } from 'react-native-maps';

const ADMIN_PHONE = '+918884441704';

export default function App() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQ, setSelectedQ] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    getLocation();
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'questions'));
    const unsub = onSnapshot(q, snap => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    }
  };

  const sendOTP = async () => {
    try {
      const conf = await signInWithPhoneNumber(auth, phone);
      setConfirmation(conf);
      Alert.alert('OTP sent to ' + phone);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const verifyOTP = async () => {
    try {
      await confirmation.confirm(otp);
      Alert.alert('Logged in!');
    } catch (e) {
      Alert.alert('Wrong OTP');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>LokMat</Text>
        <TextInput placeholder="+918884441704" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
        <Button title="Send OTP" onPress={sendOTP} />
        {confirmation && (
          <>
            <TextInput placeholder="123456" value={otp} onChangeText={setOtp} style={styles.input} keyboardType="number-pad" />
            <Button title="Verify OTP" onPress={verifyOTP} />
          </>
        )}
      </View>
    );
  }

  const isAdmin = user.phoneNumber === ADMIN_PHONE;

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <Text style={{ color: 'gold', padding: 20, fontSize: 20 }}>
        {isAdmin ? 'Admin Mode' : 'Welcome'}
      </Text>

      {isAdmin && <AdminPanel />}
      
      <FlatList
        data={questions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <QuestionCard q={item} user={user} location={location} onOpen={() => setSelectedQ(item)} />}
      />

      {selectedQ && <ResultsScreen q={selectedQ} user={user} location={location} onClose={() => setSelectedQ(null)} />}
    </View>
  );
}

// Admin Panel
function AdminPanel() {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState('');
  const [evergreen, setEvergreen] = useState(false);

  const create = async () => {
    await addDoc(collection(db, 'questions'), {
      title,
      options: options.split('\n').filter(o => o.trim()),
      evergreen,
      votes: {},
      heatmap: [],
      createdAt: serverTimestamp()
    });
    Alert.alert('Question created!');
    setTitle(''); setOptions('');
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#1E293B' }}>
      <Text style={{ color: 'gold', fontSize: 18 }}>Create New Question</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="One option per line" value={options} onChangeText={setOptions} multiline style={styles.input} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <Text style={{ color: 'white' }}>Evergreen </Text>
        <Switch value={evergreen} onValueChange={setEvergreen} />
      </View>
      <Button title="CREATE" onPress={create} color="#10B981" />
    </View>
  );
}

// Question Card + Voting
function QuestionCard({ q, user, location, onOpen }) {
  const [selected, setSelected] = useState('');
  const hasVoted = q.votes?.[user.uid];

  const vote = async () => {
  if (!selected) return;
  const ref = doc(db, 'questions', q.id);
  const heatmapEntry = location ? [{ latitude: location.latitude, longitude: location.longitude, weight: 1 }] : [];
  await updateDoc(ref, {
    [votes.${user.uid}]: selected,
    heatmap: q.heatmap ? [...q.heatmap, ...heatmapEntry] : heatmapEntry
  });
  Alert.alert('Voted!');
};

  return (
    <TouchableOpacity style={styles.card} onPress={onOpen}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{q.title}</Text>
      {q.evergreen && <Text style={{ color: '#10B981' }}>Evergreen</Text>}
      {!hasVoted ? (
        <>
          {q.options.map((opt, i) => (
            <TouchableOpacity key={i} onPress={() => setSelected(opt)} style={{ padding: 8 }}>
              <Text style={{ color: selected === opt ? '#10B981' : 'white' }}>{opt}</Text>
            </TouchableOpacity>
          ))}
          <Button title="Vote" onPress={vote} />
        </>
      ) : (
        <Text style={{ color: '#10B981' }}>You voted</Text>
      )}
    </TouchableOpacity>
  );
}

// Results + Heatmap
function ResultsScreen({ q, user, onClose }) {
  const hasVoted = q.votes?.[user.uid];
  if (!hasVoted) {
    return (
      <View style={styles.modal}>
        <Text style={{ color: 'white', fontSize: 20 }}>Vote first!</Text>
        <Button title="Close" onPress={onClose} />
      </View>
    );
  }

  return (
    <View style={styles.modal}>
      <Text style={{ color: 'gold', fontSize: 22 }}>{q.title}</Text>
      {q.options.map(opt => {
        const count = Object.values(q.votes || {}).filter(v => v === opt).length;
        const total = Object.keys(q.votes || {}).length;
        return <Text key={opt} style={{ color: 'white' }}>{opt}: {count} ({total ? Math.round(count/total*100) : 0}%)</Text>;
      })}
      <Text style={{ color: 'gold', marginTop: 20 }}>Global Heatmap</Text>
      <MapView style={{ width: '100%', height: 300 }}>
        <Heatmap points={q.heatmap || []} radius={50} opacity={0.8} />
      </MapView>
      <Button title="Close" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#0F172A' },
  title: { fontSize: 40, color: 'white', textAlign: 'center', marginBottom: 50 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginVertical: 10 },
  card: { backgroundColor: '#1E293B', margin: 10, padding: 15, borderRadius: 12 },
  modal: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: '#0F172A', padding: 20, borderRadius: 15, elevation: 20 }
});
