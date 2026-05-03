/* ============================================================
   PEMBE FLOUR MILLERS — firebase.js
   This file connects the website to Firebase database
   and loads stock levels for all products
   ============================================================ */

/* Import Firebase from CDN — works without npm */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ---- YOUR FIREBASE CONFIG ---- */
const firebaseConfig = {
  apiKey: "AIzaSyCyfhj8WIf1V9syxpLCEpgbW1jQBFQ3RVE",
  authDomain: "pembe-flour-millers.firebaseapp.com",
  projectId: "pembe-flour-millers",
  storageBucket: "pembe-flour-millers.firebasestorage.app",
  messagingSenderId: "776266354891",
  appId: "1:776266354891:web:a6ba0359c42331a0370b4e"
};

/* ---- INITIALIZE FIREBASE ---- */
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ---- LOAD STOCK FROM FIREBASE ---- */
/* This function fetches all product stock levels
   from Firestore and returns them as an object like:
   { "Pembe Premium Wheat Flour": 100, "Pembe Maize Flour": 150 } */
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

/* ---- UPDATE STOCK IN FIREBASE ---- */
/* Called when admin changes a stock number */
async function updateStock(docId, newStock) {
  try {
    await updateDoc(doc(db, 'products', docId), {
      stock: newStock
    });
    return true;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
}

export { db, loadStock, updateStock };