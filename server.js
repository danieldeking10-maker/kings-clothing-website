const path = require('path');
const fs = require('fs');
const express = require('express');
const dotenv = require('dotenv');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const staticDir = path.join(__dirname);

app.use(express.static(staticDir));

let db = null;
let useFirestore = false;

try {
  let credentials = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    credentials = require(serviceAccountPath);
  }

  if (credentials) {
    initializeApp({
      credential: cert(credentials),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    db = getFirestore();
    useFirestore = true;
    console.log('Firebase Firestore initialized.');
  } else {
    console.log('Firebase credentials not found. Falling back to local products.json.');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error.message);
}

function loadLocalProducts() {
  const productsPath = path.join(__dirname, 'products.json');
  return JSON.parse(fs.readFileSync(productsPath, 'utf8'));
}

async function fetchProducts() {
  if (useFirestore && db) {
    const snapshot = await db.collection('products').get();
    return snapshot.docs.map((doc) => ({ id: Number(doc.id) || doc.id, ...doc.data() }));
  }

  return loadLocalProducts();
}

async function fetchProductById(id) {
  if (useFirestore && db) {
    const docRef = db.collection('products').doc(String(id));
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return { id: Number(doc.id) || doc.id, ...doc.data() };
  }

  const products = loadLocalProducts();
  return products.find((item) => item.id === id) || null;
}

app.get('/api/products', async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    console.error('Unable to load products:', error);
    res.status(500).json({ error: 'Unable to load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await fetchProductById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Unable to load product:', error);
    res.status(500).json({ error: 'Unable to load product' });
  }
});

app.listen(port, () => {
  console.log(`Kings Clothing server running on http://localhost:${port}`);
});
