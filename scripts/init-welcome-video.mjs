import admin from "firebase-admin";
import fs from "node:fs";

const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccount.json", "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function initCollection() {
  console.log("Initializing 'welcome-video' collection...");
  const docRef = await db.collection("welcome-video").add({
    title: "Initial Welcome Video",
    imageId: "",
    mediaType: "video",
    status: "draft",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("Created dummy document with ID:", docRef.id);
}

initCollection().catch(console.error);
