import { initializeApp, getApps } from "firebase/app";
import { getFirestore} from 'firebase/firestore';
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyClGpH32TCwS6SBUI5OtN_7ICRtWg-VYvc",
  authDomain: "apps-dd08e.firebaseapp.com",
  projectId: "apps-dd08e",
  storageBucket: "apps-dd08e.appspot.com",
  messagingSenderId: "359000432743",
  appId: "1:359000432743:web:d8fd2f36552ef6008f34c2"
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
if (getApps().length === 1) {
  console.log("Firebase inicializado correctamente.");
}

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };