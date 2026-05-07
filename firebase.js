/* ============================================================
   PEMBE FLOUR MILLERS — firebase.js
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, getDocs,
  doc, updateDoc, setDoc, getDoc, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
async function registerUser(email, password, fullName, phone) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, email, password
    );
    const user = userCredential.user;

    /* Save to localStorage — dashboard will save to Firestore */
    localStorage.setItem('pending_profile', JSON.stringify({
      fullName: fullName,
      phone:    phone,
      email:    email,
      uid:      user.uid
    }));

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, email, password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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

async function applyPembeFamily(uid) {
  try {
    await updateDoc(doc(db, 'customers', uid), {
      pembeFamily:  true,
      memberStatus: 'pembe-family',
      memberSince:  new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/* ---- POINTS FUNCTIONS ---- */

/* Calculate points from order total
   1 point for every KSh 10 spent
   Pembe Family members get 2x points */
function calculatePoints(orderTotal, isPembeFamily) {
  const basePoints = Math.floor(orderTotal / 10);
  return isPembeFamily ? basePoints * 2 : basePoints;
}

/* Add points to a customer after an order */
async function addPoints(uid, orderTotal, isPembeFamily) {
  try {
    const pointsEarned = calculatePoints(orderTotal, isPembeFamily);

    /* Get current points */
    const docSnap = await getDoc(doc(db, 'customers', uid));
    if (!docSnap.exists()) return { success: false };

    const currentPoints = docSnap.data().points || 0;
    const newPoints     = currentPoints + pointsEarned;
    const fullName      = docSnap.data().fullName || 'Member';

    /* Update customer points */
    await updateDoc(doc(db, 'customers', uid), {
      points: newPoints
    });

    /* Update leaderboard */
    await setDoc(doc(db, 'leaderboard', uid), {
      fullName:  fullName,
      points:    newPoints,
      updatedAt: new Date().toISOString()
    });

    return { success: true, pointsEarned, newTotal: newPoints };
  } catch (error) {
    console.error('Error adding points:', error);
    return { success: false, error: error.message };
  }
}

/* Load top 10 customers for leaderboard */
async function loadLeaderboard() {
  try {
    const q        = query(
      collection(db, 'leaderboard'),
      orderBy('points', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    const leaders  = [];
    snapshot.forEach(function(docSnap) {
      leaders.push({ id: docSnap.id, ...docSnap.data() });
    });
    return { success: true, data: leaders };
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return { success: false, error: error.message };
  }
}

export {
  db, auth,
  loadStock, updateStock,
  registerUser, loginUser, logoutUser,
  getCustomerProfile, applyPembeFamily,
  addPoints, loadLeaderboard,
  calculatePoints,
  onAuthStateChanged
};