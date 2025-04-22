const firebaseConfig = {
  apiKey: "AIzaSyBuT_w-LYazd9NGgqElTt6X6286vWz7L78",
  authDomain: "flirtya.firebaseapp.com",
  projectId: "flirtya",
  storageBucket: "flirtya.firebasestorage.app",
  messagingSenderId: "546757161051",
  appId: "1:546757161051:web:d6a4108eb3ba931113cf7e",
  measurementId: "G-LWJ3ZSXGJ8"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const firebaseAuth = firebase.auth();
const firebaseStorage = firebase.storage();

const firebaseCreate = (auth, email, password) => auth.createUserWithEmailAndPassword(email, password);
const firebaseSignOut = (auth) => auth.signOut();