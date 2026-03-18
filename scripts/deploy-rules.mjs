import admin from "firebase-admin";
import fs from "node:fs";

const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccount.json", "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rules for users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true);
    }
    
    // Rules for welcome-video collection
    match /welcome-video/{videoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Default rule for other collections (e.g. lottery_rounds)
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
`;

async function deployRules() {
  console.log("Deploying Firestore security rules...");
  try {
    const securityRules = admin.securityRules();
    const ruleset = await securityRules.createFirestoreRuleset(rules);
    await securityRules.releaseFirestoreRuleset(ruleset, "cloud.firestore");
    console.log("Firestore security rules deployed successfully!");
  } catch (error) {
    console.error("Error deploying rules:", error);
    if (error.message.includes("is not fully enabled")) {
      console.log("Note: You might need to enable the Firestore Security Rules API in the Google Cloud Console.");
    }
  }
}

deployRules().catch(console.error);
