"use client";

import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYdmkyt9i5w8oiV7Lr0WbbveuwMp2AAps",
  authDomain: "packagemaker-image.firebaseapp.com",
  projectId: "packagemaker-image",
  storageBucket: "packagemaker-image.firebasestorage.app",
  messagingSenderId: "492030504571",
  appId: "1:492030504571:web:1b14f571c658cc4cdafcde",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL };
