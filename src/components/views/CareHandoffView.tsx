import React, { useEffect, useState } from 'react';
import { useClinicianAuth } from '../../context/AuthContext';
import {
  advanceHandoff,
  createHandoff,
  steps,
  submitStep,
  subscribeHandoffs,
  type Handoff,
  type Role,
} from '../../careHandoff';

const roles: Role[] = ['pharmacist', 'physician', 'nurse', 'patient'];
const names: Record<Role, string> = {
  pharmacist: 'Pharmacist',
  physician: 'Physician',
  nurse: 'Nurse',
  patient: 'Patient',
};
const example: Handoff = {
  id: 'sample',
  title: 'Preparing for the clinic visit',
  plan: 'Please bring the discharge letter to the visit. Tell the team if any part of the letter is unclear.',
  stage: 'review',
  ...{
    pharmacist: 'pharmacist',
    physician: 'physician',
    nurse: 'nurse',
    patient: 'patient',
  },
  members: ['pharmacist', 'physician'],
};

export function CareHandoffView() {
  const { currentUser, openAuthModal } = useClinicianAuth();
  const [practice, setPractice] = useState(true),
    [role, setRole] = useState<Role>('physician');
  const [examples, setExamples] = useState<Handoff[]>([example]),
    [cases, setCases] = useState<Handoff[]>([]);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [staff, setStaff] = useState(false);
  const uid = practice ? role : currentUser?.uid;
  useEffect(() => {
    if (practice || !currentUser) return;
    let active = true;
    currentUser
      .getIdTokenResult()
      .then((t) => {
        if (active) setStaff(t.claims.careRole === 'pharmacist');
      })
      .catch(() => {
        if (active) setError('Could not verify your clinical role.');
      });
    const unsubscribe = subscribeHandoffs(currentUser.uid, setCases, () =>
      setError(
        'Unable to load assignments. Check your connection and the deployed database rules.',
      ),
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [practice, currentUser]);
  async function submit(e: React.FormEvent<HTMLFormElement>, item?: Handoff) {
    e.preventDefault();
    if (busy || !uid) return;
    const form = e.currentTarget,
      data = new FormData(form),
      value = (k: string) => String(data.get(k) || '').trim();
    setBusy(true);
    setError('');
    try {
      if (item) {
        const text = value('message');
        if (practice) {
          const patch = advanceHandoff(item, uid, text);
          setExamples((list) =>
            list.map((c) => (c.id === item.id ? { ...c, ...patch } : c)),
          );
        } else await submitStep(item, uid, text);
      } else {
        const physician = practice ? 'physician' : value('physician'),
          nurse = practice ? 'nurse' : value('nurse'),
          patient = practice ? 'patient' : value('patient');
        const members = [uid, physician, nurse, patient];
        if (new Set(members).size !== 4)
          throw Error('Assign four different participants.');
        const next = {
          id: crypto.randomUUID(),
          pharmacist: uid,
          physician,
          nurse,
          patient,
          members: [uid, physician],
          title: value('title'),
          plan: value('plan'),
          stage: 'review',
        };
        if (!next.title || !next.plan)
          throw Error('Enter a case title and instructions.');
        if (practice) setExamples((list) => [next, ...list]);
        else await createHandoff(next);
      }
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to save. Please retry.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="handoff">
      <h1>Care team handoff</h1>
      <p>
        Use fictional cases to practise review, follow-up and patient
        teach-back. For emergencies, contact local emergency services.
      </p>
      <label>
        Workspace
        <select
          value={practice ? 'practice' : 'assigned'}
          disabled={busy}
          onChange={(e) => {
            setPractice(e.target.value === 'practice');
            setCases([]);
            setStaff(false);
            setError('');
          }}
        >
          <option value="practice">Practice with sample roles</option>
          <option value="assigned">My assigned cases</option>
        </select>
      </label>
      {practice ? (
        <label>
          Practise as
          <select
            value={role}
            disabled={busy}
            onChange={(e) => {
              setRole(e.target.value as Role);
              setError('');
            }}
          >
            {roles.map((r) => (
              <option value={r} key={r}>
                {names[r]}
              </option>
            ))}
          </select>
        </label>
      ) : currentUser ? (
        <p>
          Your assignment ID <code>{currentUser.uid}</code>
        </p>
      ) : (
        <button className="start-primary" onClick={() => openAuthModal()}>
          Sign in to see assignments
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      {(practice ? role === 'pharmacist' : !!currentUser && staff) && (
        <form onSubmit={(e) => submit(e)}>
          <h2>Prepare a handoff</h2>
          <label>
            Fictional case title
            <input name="title" maxLength={100} required />
          </label>
          <label>
            Instructions for the patient
            <textarea name="plan" maxLength={2000} required />
          </label>
          {!practice &&
            roles.slice(1).map((r) => (
              <label key={r}>
                {names[r]} assignment ID
                <input name={r} maxLength={128} required />
              </label>
            ))}
          <button className="start-primary" disabled={busy}>
            Send for physician review
          </button>
        </form>
      )}
      {(practice
        ? examples.filter((item) => item.members.includes(role))
        : cases
      ).map((item) => {
        const step = steps.find((s) => s.stage === item.stage);
        return (
          <article key={item.id}>
            <h2>{item.title}</h2>
            <p>
              <strong>
                {step
                  ? 'Next participant · ' + names[step.role]
                  : 'Follow-up complete'}
              </strong>
            </p>
            <p>{item.plan}</p>
            {steps
              .filter((s) => item[s.field])
              .map((s) => (
                <p key={s.field}>
                  <strong>{names[s.role]} · </strong>
                  {item[s.field]}
                </p>
              ))}
            {step && item[step.role] === uid && (
              <form key={step.stage} onSubmit={(e) => submit(e, item)}>
                <label>
                  {step.role === 'patient'
                    ? 'In your own words, what will you do next? What questions do you have?'
                    : step.stage === 'review'
                      ? 'Physician review and instructions'
                      : step.stage === 'answered'
                        ? 'Response to the patient'
                        : 'Follow-up arrangements'}
                  <textarea name="message" required maxLength={2000} />
                </label>
                <button className="start-primary" disabled={busy}>
                  {step.action}
                </button>
              </form>
            )}
          </article>
        );
      })}
      {!practice && currentUser && !cases.length && !error && (
        <p>No assignments to display.</p>
      )}
    </section>
  );
}
