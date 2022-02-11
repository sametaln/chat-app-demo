import './App.css';

import { useState, useRef } from 'react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: 'AIzaSyAnhjmsLbzNdOkWSICqBBUWUcodPSbr5SQ',
  authDomain: 'chat-app-abb4b.firebaseapp.com',
  projectId: 'chat-app-abb4b',
  storageBucket: 'chat-app-abb4b.appspot.com',
  messagingSenderId: '965097236573',
  appId: '1:965097236573:web:74071034c2d73b66e545b4',
  measurementId: 'G-0EDRX0SML3',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1>SAMTE-CHAT DEMO</h1>
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in With Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid } = auth.currentUser;

    await messagesRef
      .add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
      })
      .then((docRef) => console.log(docRef.id));

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid } = props.message;

  const [isHover, setHover] = useState(false);
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div
      className={`message ${messageClass}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <p>{text}</p>
      {isHover && <a onClick={() => props.message.deleteMessage}>x</a>}
    </div>
  );
}

export default App;
