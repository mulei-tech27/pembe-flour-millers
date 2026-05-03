/* ============================================================
   PEMBE FLOUR MILLERS — firebase.js
   Handles database AND authentication
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ---- FIREBASE CONFIG ---- */
const firebaseConfig = {
  apiKey: "AIzaSyCyfhj8WIf1V9syxpLCEpgbW1jQBFQ3RVE",
  authDomain: "pembe-flour-millers.firebaseapp.com",
  projectId: "pembe-flour-millers",
  storageBucket: "pembe-flour-millers.firebasestorage.app",
  messagingSenderId: "776266354891",
  appId: "1:776266354891:web:a6ba0359c42331a0370b4e"
};

/* ---- INITIALIZE ---- */
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

/* ---- STOCK FUNCTIONS ---- */
async function loadStock() {
  const stock = {};
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    snapshot.forEach(function(docSnap) {
      const data = docSnap.data();
      stock[data.name] = {
        stock:         data.stock,
        lowStockLimit: data.lowStockLimit,
        docId:         docSnap.id
      };
    });
  } catch (error) {
    console.error('Error loading stock:', error);
  }
  return stock;
}

async function updateStock(docId, newStock) {
  try {
    await updateDoc(doc(db, 'products', docId), { stock: newStock });
    return true;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
}

/* ---- AUTH FUNCTIONS ---- */

/* Register a new customer */
async function registerUser(email, password, fullName, phone) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    /* Save extra customer info to Firestore */
    await setDoc(doc(db, 'customers', user.uid), {
      fullName:     fullName,
      email:        email,
      phone:        phone,
      memberStatus: 'regular',
      points:       0,
      joinedDate:   new Date().toISOString(),
      pembeFamily:  false
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/* Login existing customer */
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/* Logout */
async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/* Get customer profile from Firestore */
async function getCustomerProfile(uid) {
  try {
    const docSnap = await getDoc(doc(db, 'customers', uid));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: 'Profile not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/* Apply for Pembe Family membership */
async function applyPembeFamily(uid) {
  try {
    await updateDoc(doc(db, 'customers', uid), {
      pembeFamily:      true,
      memberStatus:     'pembe-family',
      memberSince:      new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export {
  db, auth,
  loadStock, updateStock,
  registerUser, loginUser, logoutUser,
  getCustomerProfile, applyPembeFamily,
  onAuthStateChanged
};