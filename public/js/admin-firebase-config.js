import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E",
  authDomain: "nelly-delivery.firebaseapp.com",
  projectId: "nelly-delivery",
  storageBucket: "nelly-delivery.firebasestorage.app",
  messagingSenderId: "5451083162",
  appId: "1:5451083162:web:06b03a76f50b74b60bde23",
  databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const rtdb = getDatabase(app);
