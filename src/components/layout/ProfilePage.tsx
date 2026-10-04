'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getNames } from 'country-list';

import { useAuth } from '../../context/AuthContext';
import TextInput from '../ui/input';
import TextArea from '../ui/textarea';
import DateInput from '../ui/date_input';
import PictureUploader from '../PictureUpload/PictureUpload';
import { Button } from '../ds/Button';
import { User } from '../../utils/Types';

const NoSSRSelector = dynamic(() => import('../ui/custom_select'), { ssr: false });

const countries = getNames().map((c) => ({ label: c, value: c }));

const roles = [
  { value: 'dancer', label: 'Dancer' },
  { value: 'circus', label: 'Circus Artist' },
  { value: 'singer', label: 'Singer' },
  { value: 'actor', label: 'Actor' },
  { value: 'musician', label: 'Musician' },
  { value: 'acrobat', label: 'Acrobat' },
  { value: 'stunt', label: 'Stunt Performer' },
  { value: 'model', label: 'Model' },
  { value: 'magician', label: 'Magician' },
  { value: 'aerialist', label: 'Aerialist' },
  { value: 'drag', label: 'Drag Performer' },
  { value: 'choreographer', label: 'Choreographer' },
  { value: 'host', label: 'Host / MC' },
  { value: 'dj', label: 'DJ' },
  { value: 'crew', label: 'Tech Crew / Stagehand' },
  { value: 'puppeteer', label: 'Puppeteer' },
  { value: 'fire', label: 'Fire Performer' },
  { value: 'clown', label: 'Clown' },
  { value: 'comedian', label: 'Comedian' },
  { value: 'other', label: 'Other' },
];

type SectionKey = 'personal' | 'contact' | 'professional' | 'password' | 'picture';
type ProfileForm = User & { country_of_birth?: string; nationality?: string };

const SECTION_FIELDS: Record<Exclude<SectionKey, 'password'>, (keyof ProfileForm)[]> = {
  personal: ['first_name', 'second_name', 'date_of_birth', 'sex', 'country', 'country_of_birth', 'nationality'],
  contact: ['phone', 'email', 'instagram', 'facebook'],
  professional: ['role', 'height', 'weight', 'bust', 'waist', 'hips', 'skills', 'video_url', 'resume_url', 'biography', 'experience'],
  picture: ['pic_url', 'pic_public_id'],
};

function formatDatePretty(val?: string) {
  if (!val) return '—';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Facts({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-8 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="border-b border-ink py-3">
          <dt className="label text-ink/60">{k}</dt>
          <dd className="mt-1 whitespace-pre-line break-words text-[16px]">{v || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({
  title,
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  title: string;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-[1.5px] border-ink bg-paper p-6 shadow-hard sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-4">
        <h2 className="font-display text-[clamp(22px,2.4vw,32px)]">{title}</h2>
        {!editing ? (
          <button onClick={onEdit} className="label border-[1.5px] border-ink px-3 py-2 hover:bg-lime cursor-pointer">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onCancel} className="label border-[1.5px] border-ink px-3 py-2 hover:bg-stone cursor-pointer">Cancel</button>
            <button onClick={onSave} disabled={saving} className="label border-[1.5px] border-ink bg-ink px-3 py-2 text-paper hover:bg-panel-2 disabled:opacity-50 cursor-pointer">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Artist profile: view and edit each section in place (one layout for all screen sizes). */
export default function ProfilePage() {
  const router = useRouter();
  const { isLogged, isLoading, user, updateUser } = useAuth();

  const initial = useMemo<ProfileForm>(
    () => ({
      id: user?.id ?? 0,
      name: user?.name ?? '',
      first_name: user?.first_name ?? '',
      second_name: user?.second_name ?? '',
      date_of_birth: user?.date_of_birth ?? '',
      sex: user?.sex ?? '',
      country: user?.country ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
      instagram: user?.instagram ?? '',
      facebook: user?.facebook ?? '',
      role: user?.role ?? '',
      height: user?.height ?? '',
      weight: user?.weight ?? '',
      bust: user?.bust ?? '',
      waist: user?.waist ?? '',
      hips: user?.hips ?? '',
      skills: user?.skills ?? '',
      video_url: user?.video_url ?? '',
      resume_url: user?.resume_url ?? '',
      biography: user?.biography ?? '',
      experience: user?.experience ?? '',
      pic_url: user?.pic_url ?? '',
      pic_public_id: user?.pic_public_id ?? '',
      password: '',
      password2: '',
    }),
    [user]
  );

  const [form, setForm] = useState<ProfileForm>(initial);
  const [editing, setEditing] = useState<SectionKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Keep the form in sync once the user loads or after a save.
  useEffect(() => setForm(initial), [initial]);

  useEffect(() => {
    if (!isLoading && !isLogged) router.replace('/login');
  }, [isLoading, isLogged, router]);

  if (!isLogged || !user) return null;

  const set = (key: keyof ProfileForm) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const postUpdate = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/update_profile_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string })?.error || 'Update failed');
    }
    const me = await fetch('/api/auth', { credentials: 'include' }).then((r) => r.json());
    updateUser((me as { user: User }).user);
  };

  const save = async (key: SectionKey) => {
    setError('');
    setSaving(true);
    try {
      if (key === 'password') {
        if (!form.password || form.password.length < 8) throw new Error('Password must be at least 8 characters');
        if (form.password !== form.password2) throw new Error('Passwords do not match');
        await postUpdate({ password: form.password });
      } else {
        // Send only the fields of this section that changed.
        const payload: Record<string, unknown> = {};
        SECTION_FIELDS[key].forEach((k) => {
          if (form[k] !== initial[k]) payload[k] = form[k];
        });
        if (Object.keys(payload).length) await postUpdate(payload);
      }
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update error');
    } finally {
      setSaving(false);
    }
  };

  const sectionProps = (key: SectionKey) => ({
    editing: editing === key,
    saving: saving && editing === key,
    onEdit: () => {
      setForm(initial);
      setError('');
      setEditing(key);
    },
    onSave: () => save(key),
    onCancel: () => {
      setForm(initial);
      setEditing(null);
    },
  });

  const fullName = [user.first_name, user.second_name].filter(Boolean).join(' ') || user.name;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-14">
        <p className="label">{['Artist profile', user.role, user.country].filter(Boolean).join(' · ')}</p>
        <h1 className="font-display mt-6 break-words text-[clamp(40px,9vw,140px)] lg:text-[clamp(44px,7.6vw,140px)]">
          <span className="text-outline-ink">{user.first_name || 'Your'}</span>
          <br />
          {user.second_name || 'profile'}.
        </h1>
      </section>

      {error && (
        <div className="mx-auto max-w-7xl px-4">
          <p className="border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">{error}</p>
        </div>
      )}

      <section className="mx-auto grid max-w-7xl items-start gap-10 px-4 pb-24 pt-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)]">
        {/* Photo */}
        <aside className="space-y-8 lg:sticky lg:top-20">
          <div className="border-[1.5px] border-ink bg-paper shadow-hard-pink">
            {editing === 'picture' ? (
              <div className="bg-panel p-6">
                <PictureUploader
                  pic_url={form.pic_url}
                  pic_public_id={form.pic_public_id}
                  onChange={({ url, public_id }) => setForm((f) => ({ ...f, pic_url: url, pic_public_id: public_id }))}
                />
              </div>
            ) : user.pic_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.pic_url} alt={fullName} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="relative aspect-[4/5] bg-panel">
                <p className="label absolute bottom-3 left-4 text-paper/50">[no photo yet]</p>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 p-5">
              <p className="font-display truncate text-[20px]">{fullName}</p>
              {editing === 'picture' ? (
                <div className="flex gap-2">
                  <button onClick={sectionProps('picture').onCancel} className="label border-[1.5px] border-ink px-3 py-2 cursor-pointer">Cancel</button>
                  <button onClick={() => save('picture')} disabled={saving} className="label bg-ink px-3 py-2 text-paper disabled:opacity-50 cursor-pointer">Save</button>
                </div>
              ) : (
                <button onClick={sectionProps('picture').onEdit} className="label border-[1.5px] border-ink px-3 py-2 hover:bg-lime cursor-pointer">Change photo</button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {user.video_url && <Button href={user.video_url} target="_blank" variant="lime" arrow>Promo video</Button>}
            {user.resume_url && <Button href={user.resume_url} target="_blank" variant="secondary" arrow>Resume</Button>}
          </div>
        </aside>

        <div className="space-y-10">
          <Section title="Personal" {...sectionProps('personal')}>
            {editing !== 'personal' ? (
              <Facts
                items={[
                  ['First name', user.first_name],
                  ['Second name', user.second_name],
                  ['Date of birth', formatDatePretty(user.date_of_birth)],
                  ['Gender', user.sex === 'm' ? 'Male' : user.sex === 'f' ? 'Female' : user.sex],
                  ['Country of residence', user.country],
                ]}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <div><TextInput label="First name" value={form.first_name} onChange={set('first_name')} /></div>
                <div><TextInput label="Second name" value={form.second_name} onChange={set('second_name')} /></div>
                <div><DateInput label="Date of birth" name="date_of_birth" value={form.date_of_birth} onChange={set('date_of_birth')} /></div>
                <NoSSRSelector label="Sex" placeholder={user.sex || 'Your gender'} options={[{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }]} onChange={set('sex')} />
                <NoSSRSelector label="Country of residence" options={countries} placeholder={user.country || 'Select'} onChange={set('country')} />
                <NoSSRSelector label="Country of birth" options={countries} placeholder="Select" onChange={set('country_of_birth')} />
                <NoSSRSelector label="Nationality" options={countries} placeholder="Select" onChange={set('nationality')} />
              </div>
            )}
          </Section>

          <Section title="Contact" {...sectionProps('contact')}>
            {editing !== 'contact' ? (
              <Facts
                items={[
                  ['Phone', user.phone],
                  ['Email', user.email],
                  ['Instagram', user.instagram ? <a className="underline" target="_blank" rel="noreferrer" href={`https://www.instagram.com/${user.instagram}`}>@{user.instagram}</a> : null],
                  ['Facebook', user.facebook ? <a className="underline" target="_blank" rel="noreferrer" href={user.facebook.startsWith('http') ? user.facebook : `https://www.facebook.com/${user.facebook}`}>open</a> : null],
                ]}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <div><TextInput label="Phone" value={form.phone} onChange={set('phone')} /></div>
                <div><TextInput type="email" label="Email" value={form.email} onChange={(v) => set('email')(v.trim())} /></div>
                <div><TextInput label="Instagram" value={form.instagram ?? ''} onChange={set('instagram')} /></div>
                <div><TextInput label="Facebook" value={form.facebook ?? ''} onChange={set('facebook')} /></div>
              </div>
            )}
          </Section>

          <Section title="Professional" {...sectionProps('professional')}>
            {editing !== 'professional' ? (
              <>
                <Facts
                  items={[
                    ['Role', roles.find((r) => r.value === user.role)?.label ?? user.role],
                    ['Skills', user.skills],
                  ]}
                />
                <dl className="mt-4 grid grid-cols-5 border-[1.5px] border-ink bg-lime">
                  {(['height', 'weight', 'bust', 'waist', 'hips'] as const).map((k, i) => (
                    <div key={k} className={`px-3 py-3 ${i < 4 ? 'border-r border-ink' : ''}`}>
                      <dt className="label text-[8px]">{k}</dt>
                      <dd className="font-display mt-1 text-[clamp(18px,2vw,28px)]">{user[k] || '–'}</dd>
                    </div>
                  ))}
                </dl>
                <Facts items={[['Biography', user.biography], ['Experience', user.experience]]} />
              </>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2"><NoSSRSelector label="Role" placeholder={user.role || 'Choose your role'} options={roles} onChange={set('role')} /></div>
                <div className="grid grid-cols-3 gap-3 sm:col-span-2 sm:grid-cols-5">
                  {(['height', 'weight', 'bust', 'waist', 'hips'] as const).map((k) => (
                    <div key={k}><TextInput label={`${k} (${k === 'weight' ? 'kg' : 'cm'})`} value={String(form[k] ?? '')} onChange={set(k)} /></div>
                  ))}
                </div>
                <div className="sm:col-span-2"><TextInput label="Skills (comma separated)" value={form.skills ?? ''} onChange={set('skills')} /></div>
                <div><TextInput label="Promo video link" value={form.video_url} onChange={set('video_url')} /></div>
                <div><TextInput label="Resume (pdf/link)" value={form.resume_url ?? ''} onChange={set('resume_url')} /></div>
                <div className="sm:col-span-2"><TextArea label="Biography" rows={6} value={form.biography} onChange={set('biography')} /></div>
                <div className="sm:col-span-2"><TextArea label="Experience" rows={6} value={form.experience} onChange={set('experience')} /></div>
              </div>
            )}
          </Section>

          <Section title="Password" {...sectionProps('password')}>
            {editing !== 'password' ? (
              <p className="text-ink/70">Set a new password for your account.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <div><TextInput type="password" label="New password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" /></div>
                <div><TextInput type="password" label="Repeat password" value={form.password2} onChange={set('password2')} placeholder="Repeat password" /></div>
              </div>
            )}
          </Section>

          <p className="text-[14px] text-ink/70">
            By updating your profile you agree to the{' '}
            <Link href="/agreement" target="_blank" className="font-bold underline">terms and conditions</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
