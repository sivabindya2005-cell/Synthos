import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { deleteApp } from 'firebase/app';
import { terminate } from 'firebase/firestore';

// Exercise the same Firebase adapter as the UI against a demo project on loopback.
const temp = await mkdtemp(resolve('node_modules/.synthos-firebase-test-'));
try {
  const output = await build({
    entryPoints: ['src/firebase.ts'], bundle: true, platform: 'node', format: 'esm',
    packages: 'external', write: false,
    define: { 'import.meta.env.DEV': 'true', 'import.meta.env.VITE_FIREBASE_EMULATORS': '"true"' }
  });
  const modulePath = resolve(temp, 'adapter.mjs');
  await writeFile(modulePath, output.outputFiles[0].contents);
  const adapter = await import(pathToFileURL(modulePath).href);
  const { auth, db } = adapter;
  try {
    assert.equal(auth.app.options.projectId, 'demo-synthos');
    const id = crypto.randomUUID();
    async function login(subject = id) {
      const email = subject + '@example.invalid';
      const credential = GoogleAuthProvider.credential(JSON.stringify({ sub: subject, email, email_verified: true }));
      return (await signInWithCredential(auth, credential)).user;
    }
    const first = await login();
    assert.equal(first.providerData[0].providerId, 'google.com');
    await adapter.ensureUserProfile(first);
    const record = { anonymousCaseId: 'TEST-CASE', demographicDecade: 'Synthetic', biologicalSex: 'unspecified',
      inputs: { selectedDrug: 'Example', doseMg: 0 }, outputs: { safetyCeilingExceeded: false } };
    const caseId = await adapter.saveSimulationCase(first.uid, record);
    assert.equal((await adapter.getUserSavedCases(first.uid))[0].id, caseId);
    await adapter.signOutUser();
    assert.equal(auth.currentUser, null);
    await assert.rejects(adapter.getUserSavedCases(first.uid), { code: 'permission-denied' });
    const second = await login(crypto.randomUUID());
    await adapter.ensureUserProfile(second);
    assert.deepEqual(await adapter.getUserSavedCases(second.uid), []);
    await adapter.signOutUser();
    const again = await login();
    assert.equal(again.uid, first.uid);
    assert.equal((await adapter.getUserSavedCases(again.uid))[0].anonymousCaseId, 'TEST-CASE');
    assert.equal((await adapter.getUserProfile(again.uid)).savedCaseCount, 1);
    await adapter.deleteSimulationCase(caseId, again.uid);
    assert.equal((await adapter.getUserSavedCases(again.uid)).length, 0);
    assert.equal((await adapter.getUserProfile(again.uid)).savedCaseCount, 0);
    await adapter.signOutUser();
    console.log('Passed Google-provider emulator sign-in, profile creation, saved-case round trip, delete and sign-out.');
  } finally {
    await terminate(db);
    await deleteApp(auth.app);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
