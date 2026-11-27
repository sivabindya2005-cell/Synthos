import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export const steps = [
  {
    stage: 'review',
    role: 'physician',
    field: 'decision',
    next: 'acknowledge',
    action: 'Approve and send to nursing',
  },
  {
    stage: 'acknowledge',
    role: 'nurse',
    field: 'followup',
    next: 'teachback',
    action: 'Acknowledge and share with patient',
  },
  {
    stage: 'teachback',
    role: 'patient',
    field: 'understanding',
    next: 'answered',
    action: 'Send my understanding or question',
  },
  {
    stage: 'answered',
    role: 'physician',
    field: 'response',
    next: 'complete',
    action: 'Reply and close follow-up',
  },
] as const;
export type Role = 'pharmacist' | 'physician' | 'nurse' | 'patient';
export type Handoff = {
  id: string;
  title: string;
  plan: string;
  stage: string;
  members: string[];
  pharmacist: string;
  physician: string;
  nurse: string;
  patient: string;
  decision?: string;
  followup?: string;
  understanding?: string;
  response?: string;
};
export function subscribeHandoffs(
  uid: string,
  receive: (list: Handoff[]) => void,
  fail: () => void,
) {
  return onSnapshot(
    query(
      collection(db, 'careHandoffs'),
      where('members', 'array-contains', uid),
    ),
    (snap) =>
      receive(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Handoff)),
    fail,
  );
}
export async function createHandoff(item: Handoff) {
  const { id, ...fields } = item;
  await setDoc(doc(db, 'careHandoffs', id), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}
export function advanceHandoff(item: Handoff, uid: string, text: string) {
  const step = steps.find((s) => s.stage === item.stage);
  if (!step || item[step.role] !== uid)
    throw Error('This step belongs to another participant.');
  if (!text.trim() || text.length > 2000)
    throw Error('Enter a response between 1 and 2000 characters.');
  const members =
    step.stage === 'review'
      ? [...item.members, item.nurse]
      : step.stage === 'acknowledge'
        ? [...item.members, item.patient]
        : item.members;
  return { stage: step.next, [step.field]: text.trim(), members };
}
export function submitStep(item: Handoff, uid: string, text: string) {
  return updateDoc(doc(db, 'careHandoffs', item.id), {
    ...advanceHandoff(item, uid, text),
    updatedAt: serverTimestamp(),
  });
}
