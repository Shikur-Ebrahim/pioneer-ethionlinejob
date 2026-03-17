import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import admin from "firebase-admin";

function usage() {
  console.log(`
Usage:
  node scripts/firebase-admin.mjs create-admin --email <email> --password <password>
  node scripts/firebase-admin.mjs set-admin <email>
  node scripts/firebase-admin.mjs unset-admin <email>

Notes:
  - Requires ./serviceAccount.json in project root
  - Sets custom claim: { admin: true }
  - Also upserts Firestore: users/{uid} with { role: "admin" }
`);
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function initAdmin() {
  const serviceAccountPath = path.join(process.cwd(), "serviceAccount.json");
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Missing serviceAccount.json at ${serviceAccountPath}. Put your Firebase service account key in the project root.`
    );
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

async function getUserByEmail(email) {
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (e) {
    if (e?.code === "auth/user-not-found") return null;
    throw e;
  }
}

async function createAdmin(email, password) {
  const existing = await getUserByEmail(email);
  const user =
    existing ??
    (await admin.auth().createUser({
      email,
      password,
      emailVerified: true,
    }));

  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`OK: admin claim set for ${email} (uid=${user.uid})`);
}

async function setAdmin(email, isAdmin) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error(`User not found: ${email}`);

  const existingClaims = user.customClaims ?? {};
  const nextClaims = { ...existingClaims, admin: isAdmin };
  if (!isAdmin) delete nextClaims.admin;

  await admin.auth().setCustomUserClaims(user.uid, nextClaims);
  await admin
    .firestore()
    .collection("users")
    .doc(user.uid)
    .set(
      {
        uid: user.uid,
        email: user.email ?? email,
        role: isAdmin ? "admin" : "user",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  console.log(
    `OK: admin claim ${isAdmin ? "set" : "removed"} for ${email} (uid=${
      user.uid
    })`
  );
}

async function main() {
  const cmd = process.argv[2];
  if (!cmd || cmd === "-h" || cmd === "--help") {
    usage();
    process.exit(0);
  }

  const email = getArg("--email") ?? process.argv[3] ?? null;
  const password = getArg("--password");

  initAdmin();

  if (!email) throw new Error("Missing email");

  if (cmd === "create-admin") {
    if (!password) throw new Error("Missing --password");
    await createAdmin(email, password);
    return;
  }

  if (cmd === "set-admin") {
    await setAdmin(email, true);
    return;
  }

  if (cmd === "unset-admin") {
    await setAdmin(email, false);
    return;
  }

  usage();
  process.exit(1);
}

main().catch((e) => {
  console.error("ERROR:", e?.message ?? e);
  process.exit(1);
});

