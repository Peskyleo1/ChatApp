import React, { useRef, useState } from 'react';
import './App.css';

//We will import the firebase SDKs
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

//We'll import a couple of hooks to make it easier to work with firebase and React
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//We will make the following call to identify our project
firebase.initializeApp({
    apiKey: "AIzaSyDKSDMFlVweVmqIXxJEpnhRp7SB9NUnTy4",
    authDomain: "chat-app-3f0da.firebaseapp.com",
    databaseURL: "https://chat-app-3f0da.firebaseio.com",
    projectId: "chat-app-3f0da",
    storageBucket: "chat-app-3f0da.appspot.com",
    messagingSenderId: "106846780619",
    appId: "1:106846780619:web:7f1076762d733499bcef4e"
})

//We will make a reference to the "auth" and "firestore" SDKs as global variables
const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  //The "useAuthState" hook is used to check if a user is logged in.
  //If the user is logged in, it will return an object that has:
  //user ID, email address, and other info.
  //When logged out, the "user" object is null.
  //The ternary operator will then choose to display either 
  //chatroom or signin page based on weather the user is logged in or not.
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>💬 - Message App</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  //This function is called when the button is clicked
  const signInWithGoogle = () => {
    //We instantiate a provider called the "GoogleAuthProvider"
    const provider = new firebase.auth.GoogleAuthProvider();
    //Then we pass it to the "signInWithPopup" method which will
    //trigger a popup window used to sign in
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  //We will check to see if we have a current user, in which case
  //we return a button which triggers the "signOut" method
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  //We will create a reference to the "dummy" element using the "useRef" hook
  const dummy = useRef();

  //We make a reference to the firestore collection that contains messages
  const messagesRef = firestore.collection('messages');
  //We will then make a query for a subset of documents, which we will order
  //by the "createdAt" timestamp and limit it to a maximum of 25
  const query = messagesRef.orderBy('createdAt').limit(25);

  //We can then make this query and listen for updates in real-time with
  //the "useCollectionData" hook. It returns an array of object where each
  //object is the chat message in the database. Any time the data changes
  //react will re-render with the latest data
  const [messages] = useCollectionData(query, { idField: 'id' });

  //We will add a stateful value to our component called "formValue"
  //we can do that with the "useState" hook and have it start with an empty string.
  const [formValue, setFormValue] = useState('');

  //When the user submits the form we can listen to the "onSubmit" event
  //on the form itself. And then we'll trigger an event handler called "sendMessage".
  //We'll define this as an async function in our component that takes 
  //the event as its argument
  const sendMessage = async (e) => {
    //Normally when a form is submitted it will refresh the page.
    //But we can call "preventDefault" to stop that from happening.
    e.preventDefault();

    //From there we'll grab the user id and photo url from the currently
    //logged in user.
    const { uid, photoURL } = auth.currentUser;

    //Now we will write a new document to the database.
    //This takes a JavaScript object as its argument, with the values
    //you want to write to the database.
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    //After our document is created we can reset our form value back 
    //to an empty string.
    setFormValue('');

    //We'll call scrollIntoView whenever the user sends a message.
    //This is done in order to have the latest message always into view.
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  //will loop over each document, and for each message we'll use a dedicated 
  //"ChatMessage" component that has a key prop with the message id and
  //passes the document data as the message prop.
  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type in here!" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  //We will now define the "ChatMessage" child component
  const { text, uid, photoURL } = props.message;

  //To distinguish between sent and received messages we will compare
  //the userId on the firestore document to the currently logged in user.
  //If they're equal we know the current user sent the message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  //We can apply different styling based on weather the message was sent or received
  //then we can show the actual text by accessing it from the "props.message"
  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;