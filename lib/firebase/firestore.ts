import { getFirestore, collection, getDocs, doc, query, orderBy, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from "./client";

export const db = getFirestore(firebaseApp);

export const getAllWelcomeVideos = async () => {
    try {
        const q = query(collection(db, "welcome-video"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error: any) {
        console.error("Error fetching welcome videos:", error);
        // Throw the error so the component can handle it
        throw error;
    }
};

export const addWelcomeVideo = async (video: any) => {
    return await addDoc(collection(db, "welcome-video"), {
        ...video,
        createdAt: new Date(),
    });
};

export const updateWelcomeVideo = async (id: string, video: any) => {
    const docRef = doc(db, "welcome-video", id);
    return await updateDoc(docRef, video);
};

// Generic for reference if needed
export const getAllLotteryRounds = async () => {
    const snapshot = await getDocs(collection(db, "lottery_rounds"));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};
