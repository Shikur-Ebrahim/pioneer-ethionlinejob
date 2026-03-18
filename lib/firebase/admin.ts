import * as admin from "firebase-admin";

export function getFirebaseAdminApp() {
  if (!admin.apps.length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      // Try local serviceAccount.json as a last resort (for local dev)
      try {
        const serviceAccount = require("../../serviceAccount.json");
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${projectId || serviceAccount.project_id}.firebaseio.com`,
        });
        return admin.app();
      } catch (e) {
        console.error("Firebase Admin could not be initialized: Missing environment variables.");
        return null;
      }
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
    } catch (e) {
      console.error("Firebase Admin initialization error:", e);
      return null;
    }
  }

  return admin.app();
}
