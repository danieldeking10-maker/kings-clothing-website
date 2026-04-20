# Kings Clothing Website

A static storefront and agent portal prototype for Kings Clothing Brand.

## What’s included

- `index.html`: Dynamic catalog page powered by `products.json`.
- `product.html`: Product detail page that loads the selected item from JSON.
- `agent.html`: Agent dashboard mockup with referral and upload workflow.
- `checkout.html`: 50/50 payment split checkout flow.
- `products.json`: Catalog data source for the store.
- `server.js`: Simple Node.js backend serving the static site and product API.

## Local development

1. Install Node dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open `http://localhost:3000`

## Backend / Deployment options

- Use the built-in `server.js` for a minimal Node backend.
- Deploy to Vercel or Render by connecting the repository; the `package.json` entry point is `server.js`.
- Use Netlify or GitHub Pages as a static host if you only need client-side rendering, since `products.json` is also served as a static asset.

## Firebase Firestore integration

The backend is wired to Firebase Firestore when Firebase credentials are provided.

1. Create a Firestore database and a `products` collection.
2. Add documents whose IDs match product IDs and fields matching `products.json`.
3. Add a local `.env` file with one of these configurations:

   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

   or

   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
   ```

4. Keep the service account key private and do not commit it to source control.

When Firestore is configured, the server will serve `/api/products` dynamically from Firestore. If Firestore is unavailable or not configured, the server falls back to `products.json`.

### Importing products to Firestore

Once Firestore is enabled, run:

```bash
npm run import-products
```

This script reads `products.json` and writes each product document into the Firestore `products` collection using the product `id` as the document key.

If you prefer manual import, ensure each document field matches the keys in `products.json`.

## Using the catalog data

- `products.json` is the single source of truth for product metadata, pricing, and image references.
- The front-end fetches the catalog dynamically, so new products can be added without editing HTML.

## Notes

- If you open the pages locally via `file://`, the product catalog will still fall back to static sample data.
- For a real e-commerce workflow, connect the JSON source to a headless CMS or product database.
