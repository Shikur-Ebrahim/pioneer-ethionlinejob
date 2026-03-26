import { NextResponse } from "next/server";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const taskId = params.taskId;
    const adminApp = getFirebaseAdminApp();
    if (!adminApp) {
      console.error("GET /api/tasks/[taskId]: Firebase admin app not initialized");
      return NextResponse.json({ error: "Firebase not initialized" }, { status: 500 });
    }

    const db = getFirestore(adminApp);
    console.log("GET /api/tasks/[taskId]: Fetching task:", taskId);
    const doc = await db.collection("tasks").doc(taskId).get();

    if (!doc.exists) {
      console.warn("GET /api/tasks/[taskId]: Task not found:", taskId);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const taskData = doc.data();
    const task = {
      id: doc.id,
      ...taskData,
      createdAt: taskData?.createdAt?.toDate?.()?.toISOString() || null,
    };

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[taskId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
