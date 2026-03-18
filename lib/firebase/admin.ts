import * as admin from "firebase-admin";

export function getFirebaseAdminApp() {
  if (!admin.apps.length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      console.error("Firebase Admin could not be initialized: Missing environment variables.");
      return null;
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
