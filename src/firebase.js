import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
    apiKey: "AIzaSyA3ZbitBAeoL9h0HP-aKlNaphu772uoU4s",
    authDomain: "slack-clone-49a96.firebaseapp.com",
    projectId: "slack-clone-49a96",
    storageBucket: "slack-clone-49a96.appspot.com",
    messagingSenderId: "881120600006",
    appId: "1:881120600006:web:97474bc7a78797118a9cc7",
    measurementId: "G-FGZ7MCG2EY"
};

firebase.initializeApp(firebaseConfig);

export default firebase;