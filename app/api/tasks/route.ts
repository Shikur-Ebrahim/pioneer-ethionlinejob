import { NextResponse } from "next/server";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET() {
  try {
    const adminApp = getFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json([], { status: 200 });
    }

    const db = getFirestore(adminApp);
    const snapshot = await db.collection("tasks").get();

    const tasks = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      }))
      .filter((t: any) => t.status === "active")
      .sort((a: any, b: any) =>
        (b.createdAt ?? "") > (a.createdAt ?? "") ? 1 : -1
      );

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
