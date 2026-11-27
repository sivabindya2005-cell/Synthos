import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { deleteApp } from 'firebase/app';
import { doc, getDoc, setDoc, serverTimestamp, terminate } from 'firebase/firestore';

// Exercise the same Firebase adapter as the UI against a demo project on loopback.
const temp = await mkdtemp(resolve('node_modules/.synthos-firebase-test-'));
try {
  const output = await build({
    stdin: { contents: "export * from './src/firebase'; export * from './src/utils/twinSnapshot'; export * from './src/careHandoff';", resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm',
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
    const inputs = { selectedDrug:'metformin', age:65, scr:1.2, weightKg:70, heightCm:170,
      potassium:4, cypGenotype:'example', doseMg:250, intervalHours:12 };
    const savedIds = [];
    for (const [doseMg, expectedBreach] of [[250,false],[1000,true]]) {
      const run = adapter.evaluateTwin({...inputs,doseMg},'Male');
      const snapshot = adapter.snapshotOf(run,'Synthetic round-trip test');
      const key = await adapter.saveSimulationCase(again.uid,snapshot);
      savedIds.push(key);
      const stored = (await adapter.getUserSavedCases(again.uid)).find(s=>s.id===key);
      assert.deepEqual(stored.outputs,run.outputs);
      assert.equal(stored.outputs.safetyCeilingExceeded,expectedBreach);
      assert.equal(stored.outputs.predictedPeakCss,run.pk.peakSteadyStateCss);
      assert.deepEqual(JSON.parse(adapter.exportSavedRun(stored)).outputs,stored.outputs);
      assert.deepEqual(adapter.evaluateTwin(stored.inputs,stored.biologicalSex).outputs,run.outputs);
    }
    assert.throws(()=>adapter.evaluateTwin({...inputs,selectedDrug:'unmodelled'},'Male'),/No pharmacokinetic model/);
    const ids = {};
    const subjects = {};
    for (const role of ['pharmacist','physician','nurse','patient']) {
      subjects[role]=crypto.randomUUID();
      const account=await login(subjects[role]);
      ids[role]=account.uid;
      if(role!=='patient'){
        // Set the role through the Auth emulator's administrative API, bound to loopback.
        const res=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update',{
          method:'POST',headers:{authorization:'Bearer owner','content-type':'application/json'},
          body:JSON.stringify({localId:account.uid,customAttributes:JSON.stringify({careRole:role})})
        });
        assert.equal(res.status,200,await res.text());
      }
    }
    const handoff={...ids,id:crypto.randomUUID(),title:'Fictional care review',plan:'Bring the discharge letter.',
      stage:'review',members:[ids.pharmacist,ids.physician]};
    await login(subjects.pharmacist);
    await adapter.createHandoff(handoff);
    const ref=doc(db,'careHandoffs',handoff.id);
    await login(subjects.patient);
    await assert.rejects(getDoc(ref), {code:'permission-denied'});
    let item=handoff;
    for(const step of adapter.steps){
      await login(subjects[step.role]);
      const message='Synthetic '+step.field;
      await adapter.submitStep(item,ids[step.role],message);
      item={...(await getDoc(ref)).data(),id:ref.id};
      assert.equal(item.stage,step.next);
      assert.equal(item[step.field],message);
    }
    await login(id);
    const audit=await adapter.getUserAuditLogs(first.uid);
    assert.ok(audit.length);
    // Resume cleanup after the durable request has already been written.
    await setDoc(doc(db,'deletionRequests',first.uid),{startedAt:serverTimestamp()});
    await adapter.deleteUserAccountAndData(first.uid);
    assert.equal(auth.currentUser,null);
    // Inspect only this fixture via the local emulator's administrative interface.
    const dbName='ai-studio-synthos-2abc6e46-56c3-4437-a415-89461a1945e0';
    const base='http://127.0.0.1:8080/v1/projects/demo-synthos/databases/'+dbName+'/documents/';
    const status=async path=>(await fetch(base+path,{headers:{authorization:'Bearer owner'}})).status;
    for(const key of savedIds) assert.equal(await status('cases/'+key),404);
    assert.equal(await status('users/'+first.uid),404);
    assert.equal(await status('auditLogs/'+audit[0].id),200);
    assert.equal(await status('careHandoffs/'+handoff.id),200);
    const newAccount=await login(id);
    assert.notEqual(newAccount.uid,first.uid);
    assert.deepEqual(await adapter.getUserSavedCases(newAccount.uid),[]);
    await adapter.signOutUser();
    console.log('Passed account isolation, two snapshot round trips, recorded export, assigned four-role handoff, and resumed account deletion.');  } finally {
    await terminate(db);
    await deleteApp(auth.app);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
