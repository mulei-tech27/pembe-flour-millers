/* ============================================================
   PEMBE FLOUR MILLERS — firebase.js
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

async function registerUser(email, password, fullName, phone) {
  try {
    /* Create auth account */
    const userCredential = await createUserWithEmailAndPassword(
      auth, email, password
    );
    const user = userCredential.user;

    /* Store name and phone in localStorage temporarily
       They will be saved to Firestore on first dashboard load */
    localStorage.setItem('pending_profile', JSON.stringify({
      fullName: fullName,
      phone:    phone,
      email:    email,
      uid:      user.uid
    }));

    return { success: true, user };

  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

/* ---- LOGIN ---- */
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

/* ---- LOGOUT ---- */
async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/* ---- GET PROFILE ---- */
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

/* ---- APPLY PEMBE FAMILY ---- */
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

export {
  db, auth,
  loadStock, updateStock,
  registerUser, loginUser, logoutUser,
  getCustomerProfile, applyPembeFamily,
  onAuthStateChanged
};