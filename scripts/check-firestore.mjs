import admin from "firebase-admin";
import fs from "node:fs";

const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccount.json", "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkCollections() {
  console.log("Listing all collections...");
  const collections = await db.listCollections();
  console.log("Collections found:", collections.map(c => c.id));

  for (const collection of collections) {
    if (collection.id.includes("welcome")) {
      console.log(`Checking collection '${collection.id}'...`);
      const snapshot = await db.collection(collection.id).limit(1).get();
      if (!snapshot.empty) {
        console.log(`Found data in '${collection.id}':`, snapshot.docs[0].data());
      } else {
        console.log(`Collection '${collection.id}' is empty.`);
      }
    }
  }
}

checkCollections().catch(console.error);
