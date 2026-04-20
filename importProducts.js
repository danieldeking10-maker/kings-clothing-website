const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

dotenv.config();

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return require(serviceAccountPath);
  }

  throw new Error('Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH.');
}

function loadProductsJson() {
  const productsPath = path.join(__dirname, 'products.json');
  const fileContents = fs.readFileSync(productsPath, 'utf8');
  return JSON.parse(fileContents);
}

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not set in .env');
  }

  const serviceAccount = loadServiceAccount();

  initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });

  const db = getFirestore();
  const products = loadProductsJson();
  const collectionRef = db.collection('products');

  console.log(`Importing ${products.length} products into Firestore project '${projectId}'...`);

  for (const product of products) {
    const docId = String(product.id);
    const docRef = collectionRef.doc(docId);

    await docRef.set(product, { merge: false });
    console.log(`  - Imported product ${docId}: ${product.name}`);
  }

  console.log('Import complete.');
}

main().catch((error) => {
  console.error('Import failed:', error.message);
  process.exit(1);
});
