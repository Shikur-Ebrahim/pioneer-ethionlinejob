import * as admin from "firebase-admin";

export function getFirebaseAdminApp() {
  if (!admin.apps.length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      // If we are in development and have a local service account, we can still use it
      // but we use a dynamic import/require to avoid breaking production builds
      try {
        const serviceAccount = require("../../serviceAccount.json");
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${projectId || serviceAccount.project_id}.firebaseio.com`,
        });
        return admin.app();
      } catch (e) {
        throw new Error(
          "Firebase admin initialization failed: Missing environment variables (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID) and no serviceAccount.json found."
        );
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL: `https://${projectId}.firebaseio.com`,
    });
  }

  return admin.app();
}
