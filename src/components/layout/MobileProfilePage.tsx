'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getNames } from 'country-list';
import { useAuth } from '../../context/AuthContext';
import TextInput from '../../components/ui/input';
import TextArea from '../../components/ui/textarea';
import DateInput from '../../components/ui/date_input';
import PictureUploader from '../../components/PictureUpload/PictureUpload';
import { User } from '../../utils/Types';
import { Section } from './ProfileSectionMobile';

type SelectorOption = { value: string; label: string };
type SectionKey = 'personal' | 'contact' | 'professional' | 'password' | 'picture';

const NoSSRSelector = dynamic(() => import('../../components/ui/custom_select'), { ssr: false });

const countries = getNames().map<SelectorOption>((c) => ({ label: c, value: c }));

const roles: SelectorOption[] = [
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

type FormState = {
  first_name: string;
  second_name: string;
  date_of_birth: string | null;
  sex: string;
  country_of_birth: string;
  nationality: string;
  country: string;
  phone: string;

  email: string;
  instagram: string;
  facebook: string;

  role: string;
  height: string; // як текст у формі (зручно для input)
  weight: string;
  skills: string;
  video_url: string;
  resume_url: string;
  biography: string;
  experience: string;

  pic_url: string;
  pic_public_id: string;

  password: string;
  password2: string;
};

type ApiError = { error?: string };
type AuthResponse = { user: Partial<User> };

function assignKey<T, K extends keyof T>(obj: Partial<Pick<T, K>>, key: K, value: T[K]) {
  (obj as Record<K, T[K]>)[key] = value;
}
function diff<T, K extends keyof T>(current: T, baseline: T, keys: readonly K[]) {
  const result: Partial<Pick<T, K>> = {};
  for (const k of keys) {
    if (!Object.is(current[k], baseline[k])) assignKey(result, k, current[k]);
  }
  return result;
}

const formatDatePretty = (val?: string) => {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function UserProfileMobile() {
  const { isLogged, user, updateUser } = useAuth();

  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    personal: false,
    picture: false,
    contact: false,
    professional: false,
    password: false,
  });
  const [saving, setSaving] = useState<Record<SectionKey, boolean>>({
    personal: false,
    contact: false,
    professional: false,
    password: false,
    picture: false,
  });

  const handleToggle = useCallback((id: SectionKey) => {
    setOpen((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  const randomAvatar = useMemo(() => {
    const avatars = [
      '/default-avatar.png',
      '/default-avatar2.png',
      '/default-avatar3.png',
      '/default-avatar4.png',
      '/default-avatar5.png',
      '/default-avatar6.png',
      '/default-avatar7.png',
    ] as const;
    const idx = Math.floor(Math.random() * avatars.length);
    return avatars[idx];
  }, []);

  const avatarSrc = user?.pic_url && user.pic_url.trim() ? user.pic_url : randomAvatar;


  const initial = useMemo<FormState>(() => ({
    first_name: user?.first_name ?? '',
    second_name: user?.second_name ?? '',
    date_of_birth: user?.date_of_birth ?? null,
    sex: user?.sex ?? '',
    country_of_birth: user?.country_of_birth ?? '',
    nationality: user?.nationality ?? '',
    country: user?.country ?? '',
    phone: user?.phone ?? '',

    email: user?.email ?? '',
    instagram: user?.instagram ?? '',
    facebook: user?.facebook ?? '',

    role: user?.role ?? '',
    height: String(user?.height ?? ''),
    weight: String(user?.weight ?? ''),
    skills: user?.skills ?? '',
    video_url: user?.video_url ?? '',
    resume_url: user?.resume_url ?? '',
    biography: user?.biography ?? '',
    experience: user?.experience ?? '',

    pic_url: user?.pic_url ?? '',
    pic_public_id: user?.pic_public_id ?? '',

    password: '',
    password2: '',
  }), [user]);

  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  if (!isLogged || !user) return null;

  const postUpdate = async (payload: Partial<FormState> | { password: string }) => {
    const res = await fetch('/api/update_profile_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as ApiError;
      throw new Error(err?.error || 'Update failed');
    }
    const me = (await fetch('/api/auth', { credentials: 'include' }).then(r => r.json())) as AuthResponse;
    updateUser(me.user);
  };

  const resetSection = (key: SectionKey) => {
    setForm(initial);
    setOpen((s) => ({ ...s, [key]: false }));
  };

  const saveSection = async (key: SectionKey) => {
    try {
      setSaving((s) => ({ ...s, [key]: true }));

      if (key === 'personal') {
        const payload = diff(form, initial, [
          'first_name',
          'second_name',
          'date_of_birth',
          'sex',
          'country_of_birth',
          'nationality',
          'country',
        ] as const);
        if (Object.keys(payload).length) await postUpdate(payload);
      }

      if (key === 'picture') {
        const payload = diff(form, initial, ['pic_url', 'pic_public_id'] as const);
        if (Object.keys(payload).length) await postUpdate(payload);
      }

      if (key === 'contact') {
        const payload = diff(form, initial, ['phone', 'email', 'instagram', 'facebook'] as const);
        if (Object.keys(payload).length) await postUpdate(payload);
      }

      if (key === 'professional') {
        const payload = diff(form, initial, [
          'role',
          'height',
          'weight',
          'skills',
          'video_url',
          'resume_url',
          'biography',
          'experience',
        ] as const);
        if (Object.keys(payload).length) await postUpdate(payload);
      }

      if (key === 'password') {
        if (!form.password || form.password.length < 6) throw new Error('Password too short');
        if (form.password !== form.password2) throw new Error('Passwords do not match');
        await postUpdate({ password: form.password });
        setForm((f) => ({ ...f, password: '', password2: '' }));
      }

      setOpen((s) => ({ ...s, [key]: false }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update error';
      alert(msg);
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  return (
    <section className="lg:hidden px-4 py-6 pt-20">
      {/* Header */}
      <h1 className="w-full text-center text-3xl text-black uppercase bg-clip-text mb-10">
        Profile
      </h1>

      {/* Avatar + name */}
      <div className="flex flex-col items-center mb-6">
        {/* <Image
          width={300}
          height={320}
          src={user.pic_url || setAvatar()}
          alt="Profile"
          className="w-28 h-28 rounded-2xl object-cover mb-3"
        /> */}
        <div className="text-center">
          <p className="text-2xl font-semibold">{user.first_name} {user.second_name}</p>
          <p className="text-m text-gray-600">{user.role} from {user.nationality}</p>
        </div>
      </div>

      {/* Picture */}
      <Section
        id="picture"
        title="Profile photo"
        open={open.picture}
        saving={saving.picture}
        onToggle={handleToggle}
        onSave={saveSection}
        onCancel={resetSection}
        readView={
          <img 
            src={`${avatarSrc}`}
            alt="Profile" 
            className="w-full max-h-96 object-cover rounded-xl"
          />
        }
      >
        <PictureUploader
          pic_url={form.pic_url}
          pic_public_id={form.pic_public_id}
          onChange={({ url, public_id }) => setForm((f) => ({ ...f, pic_url: url, pic_public_id: public_id }))}
        />
      </Section>


      {/* Personal */}
      <Section
        id="personal"
        title="Personal information"
        open={open.personal}
        saving={saving.personal}
        onToggle={handleToggle}
        onSave={saveSection}
        onCancel={resetSection}
        readView={
          <>
            <p><b>First name:</b> {user.first_name || '—'}</p>
            <p><b>Second name:</b> {user.second_name || '—'}</p>
            <p><b>Date of birth:</b> {formatDatePretty(user.date_of_birth) || '—'}</p>
            <p><b>Gender:</b> {user.sex || '—'}</p>
            <p><b>Country of birth:</b> {user.country_of_birth || '—'}</p>
            <p><b>Nationality:</b> {user.nationality || '—'}</p>
            <p><b>Country:</b> {user.country || '—'}</p>
          </>
        }
      >
        <TextInput label="First name" value={form.first_name} onChange={(v) => setForm((f) => ({ ...f, first_name: v }))} />
        <TextInput label="Second name" value={form.second_name} onChange={(v) => setForm((f) => ({ ...f, second_name: v }))} />
        <DateInput
          label="Date of birth"
          name="date_of_birth"
          value={form.date_of_birth ?? ''}
          onChange={(v) => setForm((f) => ({ ...f, date_of_birth: v }))}
        />
        <NoSSRSelector
          label="Sex"
          placeholder="Your gender"
          options={[{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }]}
          onChange={(v: string) => setForm((f) => ({ ...f, sex: v }))}
        />
        <NoSSRSelector label="Country of birth" placeholder="Select" options={countries}
          onChange={(v: string) => setForm((f) => ({ ...f, country_of_birth: v }))} />
        <NoSSRSelector label="Nationality" placeholder="Select" options={countries}
          onChange={(v: string) => setForm((f) => ({ ...f, nationality: v }))} />
        <NoSSRSelector label="Country of residence" placeholder="Select" options={countries}
          onChange={(v: string) => setForm((f) => ({ ...f, country: v }))} />
      </Section>

      {/* Contact */}
      <Section
        id="contact"
        title="Contact information"
        open={open.contact}
        saving={saving.contact}
        onToggle={handleToggle}
        onSave={saveSection}
        onCancel={resetSection}
        readView={
          <>
            <p><b>Phone:</b> {user.phone || '—'}</p>
            <p><b>Email:</b> {user.email || '—'}</p>
            <p><b>Instagram:</b> <a className="text-pink-700 underline" target="_blank" href={`https://www.instagram.com/${user.instagram}`}>open</a></p>
            <p><b>Facebook:</b> <a className="text-pink-700 underline" href={`https://www.facebook.com/${user.facebook}`} target="_blank">open</a></p>
          </>
        }
      >
        <TextInput label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
        <TextInput type="email" label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v.trim() }))} />
        <TextInput label="Instagram" value={form.instagram} onChange={(v) => setForm((f) => ({ ...f, instagram: v }))} />
        <TextInput label="Facebook" value={form.facebook} onChange={(v) => setForm((f) => ({ ...f, facebook: v }))} />
      </Section>

      {/* Professional */}
      <Section
        id="professional"
        title="Professional information"
        open={open.professional}
        saving={saving.professional}
        onToggle={handleToggle}
        onSave={saveSection}
        onCancel={resetSection}
        readView={
          <>
            <p><b>Role:</b> {user.role || '—'}</p>
            <p><b>Height:</b> {user.height ? `${user.height} cm` : '—'}</p>
            <p><b>Weight:</b> {user.weight ? `${user.weight} kg` : '—'}</p>
            <p><b>Skills:</b> {user.skills || '—'}</p>
            <p><b>Promo video:</b> {user.video_url ? <a className="text-pink-700 underline" href={user.video_url} target="_blank">open</a> : '—'}</p>
            <p><b>Resume:</b> {user.resume_url ? <a className="text-pink-700 underline" href={user.resume_url} target="_blank">open</a> : '—'}</p>
            <div>
              <p className="font-semibold">Biography</p>
              <p className="whitespace-pre-wrap">{user.biography || '—'}</p>
            </div>
            <div>
              <p className="font-semibold">Experience</p>
              <p className="whitespace-pre-wrap">{user.experience || '—'}</p>
            </div>
          </>
        }
      >
        <NoSSRSelector label="Role" placeholder="Choose your role" options={roles}
          onChange={(v: string) => setForm((f) => ({ ...f, role: v }))} />
        <TextInput type="number" label="Height (cm)" value={form.height} onChange={(v) => setForm((f) => ({ ...f, height: v }))} />
        <TextInput type="number" label="Weight (kg)" value={form.weight} onChange={(v) => setForm((f) => ({ ...f, weight: v }))} />
        <TextInput label="Skills (comma separated)" value={form.skills} onChange={(v) => setForm((f) => ({ ...f, skills: v }))} />
        <TextInput label="Promo video link" value={form.video_url} onChange={(v) => setForm((f) => ({ ...f, video_url: v }))} />
        <TextInput label="Resume (pdf/link)" value={form.resume_url} onChange={(v) => setForm((f) => ({ ...f, resume_url: v }))} />
        <TextArea label="Biography" rows={5} value={form.biography} onChange={(v) => setForm((f) => ({ ...f, biography: v }))} />
        <TextArea label="Experience" rows={5} value={form.experience} onChange={(v) => setForm((f) => ({ ...f, experience: v }))} />
      </Section>

      {/* Password */}
      <Section
        id="password"
        title="Change password"
        open={open.password}
        saving={saving.password}
        onToggle={handleToggle}
        onSave={saveSection}
        onCancel={resetSection}
        readView={<p className="text-gray-700">Set a new password for your account.</p>}
      >
        <TextInput type="password" label="New password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} placeholder="••••••••" />
        <TextInput type="password" label="Repeat password" value={form.password2} onChange={(v) => setForm((f) => ({ ...f, password2: v }))} placeholder="••••••••" />
      </Section>
    </section>
  );
}
