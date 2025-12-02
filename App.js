import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, TextInput, Button, FlatList, TouchableOpacity, Switch } from 'react-native';
import { auth, db } from './firebase';
import { signInWithPhoneNumber, PhoneAuthProvider } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, doc, updateDoc, serverTimestamp, getDoc, increment } from 'firebase/firestore';
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

  const isAdmin = user?.phoneNumber === ADMIN_PHONE;

  useEffect(() => {
    auth.onAuthStateChanged(setUser);
    getLocation();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'questions'));
    onSnapshot(q, snap => setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
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
      Alert.alert('OTP sent!');
    } catch (e) { Alert.alert(e.message); }
  };

  const verifyOTP = async () => {
    try {
      await confirmation.confirm(otp);
    } catch (e) { Alert.alert('Wrong OTP'); }
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
            <Button title="Verify" onPress={verifyOTP} />
          </>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <Text style={{ color: 'white', padding: 20, fontSize: 20 }}>Hi {isAdmin ? 'Admin' : 'User'}</Text>
      {isAdmin && <AdminPanel />}
      <FlatList
        data={questions}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <QuestionCard q={item} user={user} location={location} onPress={() => setSelectedQ(item)} />}
      />
      {selectedQ && <ResultsModal question={selectedQ} user={user} location={location} onClose={() => setSelectedQ(null)} />}
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
    setTitle(''); setOptions(''); Alert.alert('Created!');
  };

  return (
    <View style={{ padding: 15, backgroundColor: '#1E293B' }}>
      <Text style={{ color: 'gold', fontSize: 18 }}>Admin: Create Question</Text>
      <TextInput placeholder="Question title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="One option per line" value={options} onChangeText={setOptions} multiline style={styles.input} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Evergreen weekly re-vote</Text>
        <Switch value={evergreen} onValueChange={setEvergreen} />
      </View>
      <Button title="CREATE" onPress={create} color="#10B981" />
    </View>
  );
}

// Question Card + Voting
function QuestionCard({ q, user, location, onPress }) {
  const [voted, setVoted] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (q.votes && q.votes[user.uid]) setVoted(true);
  }, [q]);

  const vote = async () => {
    if (!selected) return;
    const ref = doc(db, 'questions', q.id);
    await updateDoc(ref, {
      ['votes.${user.uid}']: selected,
      heatmap: location 
     ? [...(q.heatmap || []), { latitude: location.latitude, longitude: location.longitude, weight: 1 }]
     : q.heatmap || []
    });
    setVoted(true);
    Alert.alert('Voted!');
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={{ color: 'white', fontSize: 18 }}>{q.title}</Text>
      {q.evergreen && <Text style={{ color: '#10B981' }}>Evergreen (weekly reset)</Text>}
      {!voted ? (
        <>
          {q.options.map((opt, i) => (
            <TouchableOpacity key={i} onPress={() => setSelected(opt)} style={{ padding: 10 }}>
              <Text style={{ color: selected === opt ? '#10B981' : 'white' }}>{opt}</Text>
            </TouchableOpacity>
          ))}
          <Button title="Submit Vote" onPress={vote} />
        </>
      ) : (
        <Text style={{ color: '#10B981' }}>You voted</Text>
      )}
    </TouchableOpacity>
  );
}

// Results + Heatmap (hidden until voted)
function ResultsModal({ question, user, location, onClose }) {
  const hasVoted = question.votes && question.votes[user.uid];

  if (!hasVoted) {
    return (
      <View style={styles.modal}>
        <Text style={{ color: 'white', fontSize: 20 }}>Vote first to see results!</Text>
        <Button title="Close" onPress={onClose} />
      </View>
    );
  }

  const total = Object.keys(question.votes || {}).length;

  return (
    <View style={styles.modal}>
      <Text style={{ color: 'white', fontSize: 22 }}>{question.title}</Text>
      {question.options.map(opt => {
        const count = Object.values(question.votes || {}).filter(v => v === opt).length;
        return (
          <Text key={opt} style={{ color: 'white' }}>
            {opt}: {count} ({total ? Math.round(count/total*100) : 0}%)
          </Text>
        );
      })}
      <Text style={{ color: 'gold', marginTop: 20 }}>Global Heatmap</Text>
      <MapView style={{ width: '100%', height: 300, marginVertical: 10 }}>
        <Heatmap points={question.heatmap || []} radius={50} opacity={0.7} gradient={{ colors: ['#0000FF', '#00FF00', '#FFFF00', '#FF0000'], startPoints: [0, 0.3, 0.6, 1] }} />
      </MapView>
      <Button title="Close" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#0F172A', padding: 20 },
  title: { fontSize: 40, color: 'white', textAlign: 'center', marginBottom: 50 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginVertical: 10 },
  card: { backgroundColor: '#1E293B', margin: 10, padding: 15, borderRadius: 12 },
  modal: { position: 'absolute', top: 50, left: 20, right: 20, backgroundColor: '#0F172A', padding: 20, borderRadius: 15, elevation: 10 }
});
