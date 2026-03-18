import * as admin from "firebase-admin";

export function getFirebaseAdminApp() {
  if (!admin.apps.length) {
    let credential;
    try {
      // First try to load from a local service account file if it exists
      credential = admin.credential.cert(require("../../serviceAccount.json"));
    } catch (e) {
      // Fallback to environment variables if the file isn't present
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      if (!clientEmail || !privateKey || !projectId) {
        throw new Error(
          "Firebase admin initialization failed: Missing serviceAccount.json or environment variables (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID)"
        );
      }

      credential = admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      });
    }

    admin.initializeApp({
      credential,
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`, // Fixed typo
    });
  }

  return admin.app();
}
