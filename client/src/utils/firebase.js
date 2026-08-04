import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAC7_xiC3rWxX4HOaPT81PyVeO-dPCLTCE",
  authDomain: "interviewiq-f3c32.firebaseapp.com",
  projectId: "interviewiq-f3c32",
  storageBucket: "interviewiq-f3c32.firebasestorage.app",
  messagingSenderId: "102787741097",
  appId: "1:102787741097:web:d10186bf27e369838d00b8"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {
  auth,
  provider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
};