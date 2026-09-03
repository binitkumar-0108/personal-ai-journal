import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { Journal } from "../types/journal";

export async function createJournal(
  userId: string,
  title: string,
  description: string
) {
  const journalsRef = collection(db, "users", userId, "journals");

  const journalRef = await addDoc(journalsRef, {
    title,
    description,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return journalRef.id;
}

export async function getJournals(userId: string): Promise<Journal[]> {
  const journalsRef = collection(db, "users", userId, "journals");

  const snapshot = await getDocs(journalsRef);

  return snapshot.docs.map((journal) => {
    const data = journal.data();

    return {
      id: journal.id,
      title: data.title,
      description: data.description,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    };
  });
}

export async function updateJournal(
  userId: string,
  journalId: string,
  title: string,
  description: string
) {
  const journalRef = doc(
    db,
    "users",
    userId,
    "journals",
    journalId
  );

  await updateDoc(journalRef, {
    title,
    description,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteJournal(
  userId: string,
  journalId: string
) {
  const journalRef = doc(
    db,
    "users",
    userId,
    "journals",
    journalId
  );

  await deleteDoc(journalRef);
}