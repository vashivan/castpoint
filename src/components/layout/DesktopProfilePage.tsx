'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getNames } from 'country-list';
import { useAuth } from '../../context/AuthContext';
import TextInput from '../../components/ui/input';
import TextArea from '../../components/ui/textarea';
import DateInput from '../../components/ui/date_input';
import PictureUploader from '../../components/PictureUpload/PictureUpload';
import Link from 'next/link';
import { PencilLine, Check, X } from 'lucide-react';
import { User } from '../../utils/Types';

const NoSSRSelector = dynamic(() => import('../../components/ui/custom_select'), { ssr: false });

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

export default function DesktopProfilePage() {
  const router = useRouter();
  const { isLogged, user, updateUser } = useAuth();

  const [editing, setEditing] = useState<Record<SectionKey, boolean>>({
    personal: false,
    contact: false,
    professional: false,
    password: false,
    picture: false,
  });

  const [saving, setSaving] = useState<Record<SectionKey, boolean>>({
    personal: false,
    contact: false,
    professional: false,
    password: false,
    picture: false,
  });

  const initial = useMemo(
    () => ({
      // нові поля
      id: user?.id ?? 0,
      name: user?.name ?? '',
      first_name: user?.first_name ?? '',
      second_name: user?.second_name ?? '',
      date_of_birth: user?.date_of_birth ?? '',
      sex: user?.sex ?? '',
      country: user?.country ?? '',
      phone: user?.phone ?? '',
      // контакт/соц
      email: user?.email ?? '',
      instagram: user?.instagram ?? '',
      facebook: user?.facebook ?? '',
      // професійне
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
      // фото
      pic_url: user?.pic_url ?? '',
      pic_public_id: user?.pic_public_id ?? '',
      // пароль (тільки для зміни)
      password: '',
      password2: '',
    }),
    [user]
  );

  const [form, setForm] = useState<User>(initial);

  if (!isLogged || !user) return null;

  const formatDatePretty = (val?: string) => {
    if (!val) return '';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const toggleSection = (key: SectionKey, on?: boolean) =>
    setEditing((s) => ({ ...s, [key]: typeof on === 'boolean' ? on : !s[key] }));

  const resetSection = (key: SectionKey) => {
    setForm(initial);
    toggleSection(key, false);
  };

  // відправляємо лише змінені поля секції
  const diff = <T extends keyof User>(keys: T[]): Partial<User> => {
    const out: Partial<User> = {};
    keys.forEach((k) => {
      if (form[k] !== initial[k]) {
        out[k] = form[k];
      }
    });
    return out;
  };

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
    // оновлюємо користувача
    const me = await fetch('/api/auth', { credentials: 'include' }).then((r) => r.json());
    updateUser((me as { user: User }).user);
  };

  const saveSection = async (key: SectionKey) => {
    try {
      setSaving((s) => ({ ...s, [key]: true }));

      if (key === 'personal') {
        const payload = diff([
          'first_name',
          'second_name',
          'date_of_birth',
          'sex',
          'country',
        ]);
        if (Object.keys(payload).length) await postUpdate(payload);
      }

      if (key === 'contact') {
        const payload = diff(['phone', 'email', 'instagram', 'facebook']);
        if (Object.keys(payload).length) await postUpdate(payload);
      }

      if (key === 'professional') {
        const payload = diff([
          'role',
          'height',
          'weight',
          'bust',
          'waist',
          'hips',
          'skills',
          'video_url',
          'resume_url',
          'biography',
          'experience',
        ]);
        if (Object.keys(payload).length) await postUpdate(payload);
      }

      if (key === 'password') {
        if (!form.password || form.password.length < 6) throw new Error('Password too short');
        if (form.password !== form.password2) throw new Error('Passwords do not match');
        await postUpdate({ password: form.password });
        setForm((f) => ({ ...f, password: '', password2: '' }));
      }

      if (key === 'picture') {
        const payload = diff(['pic_url', 'pic_public_id']);
        if (Object.keys(payload).length) await postUpdate(payload);
      }

      // після успіху закриваємо секцію
      setEditing((s) => ({ ...s, [key]: false }));
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message || 'Update error');
      } else {
        alert('Update error');
      }
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  const setAvatar = () => {
    const avatars = {
      1: '/default-avatar.png',
      2: '/default-avatar2.png',
      3: '/default-avatar3.png',
      4: '/default-avatar4.png',
      5: '/default-avatar5.png',
      6: '/default-avatar6.png',
      7: '/default-avatar7.png'
    };

    const randomIndex = Math.floor(Math.random() * Object.keys(avatars).length) + 1;
    return avatars[randomIndex as keyof typeof avatars]
  }

  return (
    <section className="block min-h-screen px-10 py-2 pt-20">
      <h1 className="w-full text-center text-4xl md:text-4xl font-bol text-black uppercase bg-clip-text mb-10">
        Profile
      </h1>

      <div className="max-w-6xl mx-auto p-0.5 rounded-3xl">
        <div className="rounded-3xl bg-white shadow-xl p-10">
          <div className="grid grid-cols-12 gap-8">
            {/* Personal (left) */}
            <section className="col-span-12 lg:col-span-8">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-800 font-semibold text-xl items-center content-center text-center">Personal information</h2>
                {!editing.personal ? (
                  <button className="cursor-pointer" onClick={() => toggleSection('personal')}>
                    <PencilLine />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="cursor-pointer" onClick={() => saveSection('personal')}>
                      {saving.personal ? <span>Saving…</span> : <Check />}
                    </button>
                    <button className="cursor-pointer" onClick={() => resetSection('personal')}>
                      <X />
                    </button>
                  </div>
                )}
              </div>

              {!editing.personal ? (
                <div className="flex flex-col lg:grid grid-cols-12 gap-10 gap-y-20 text-black py-10">
                  <div className="col-span-6">
                    <p><b>First name:</b></p>
                    <p>{user.first_name}</p>
                  </div>
                  <div className="col-span-6">
                    <p><b>Second name:</b></p>
                    <p>{user.second_name}</p>
                  </div>
                  <div className="col-span-6">
                    <p><b>Date of birth:</b></p>
                    <p>{formatDatePretty(user.date_of_birth)}</p>
                  </div>
                  <div className="col-span-6">
                    <p><b>Gender:</b></p>
                    <p>{user.sex}</p>
                  </div>
                  <div className="col-span-4">
                    <p><b>Country:</b></p>
                    <p>{user.country}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <TextInput label="First name" value={form.first_name}
                      onChange={(v) => setForm((f) => ({ ...f, first_name: v }))} />
                  </div>
                  <div className="col-span-6">
                    <TextInput label="Second name" value={form.second_name}
                      onChange={(v) => setForm((f) => ({ ...f, second_name: v }))} />
                  </div>
                  <div className="col-span-6">
                    <DateInput label="Date of birth" name="date_of_birth" value={form.date_of_birth}
                      onChange={(v) => setForm((f) => ({ ...f, date_of_birth: v }))} />
                  </div>
                  <div className="col-span-6">
                    <NoSSRSelector label="Sex" placeholder="Your gender"
                      options={[{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }]}
                      onChange={(v) => setForm((f) => ({ ...f, sex: v }))} />
                  </div>
                  <div className="col-span-4">
                    <NoSSRSelector label="Country of birth" options={countries} placeholder="Select"
                      onChange={(v) => setForm((f) => ({ ...f, country_of_birth: v }))} />
                  </div>
                  <div className="col-span-4">
                    <NoSSRSelector label="Nationality" options={countries} placeholder="Select"
                      onChange={(v) => setForm((f) => ({ ...f, nationality: v }))} />
                  </div>
                  <div className="col-span-4">
                    <NoSSRSelector label="Country of residence" options={countries} placeholder="Select"
                      onChange={(v) => setForm((f) => ({ ...f, country: v }))} />
                  </div>
                </div>
              )}
            </section>

            {/* Picture (right) */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-800 font-semibold text-xl">Profile photo</h2>
                {!editing.picture ? (
                  <button className="cursor-pointer" onClick={() => toggleSection('picture')}>
                    <PencilLine />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="cursor-pointer" onClick={() => saveSection('picture')}>
                      {saving.picture ? <span>Saving…</span> : <Check />}
                    </button>
                    <button className="cursor-pointer" onClick={() => resetSection('picture')}>
                      <X />
                    </button>
                  </div>
                )}
              </div>

              {!editing.picture ? (
                <img
                  src={user.pic_url || setAvatar()}
                  alt="Profile"
                  className="w-70 lg:w-full max-h-96 object-cover rounded-xl"
                />
              ) : (
                <div className="rounded-2xl border border-gray-200 p-5 h-full flex flex-col items-center gap-4">
                  <PictureUploader
                    pic_url={form.pic_url}
                    pic_public_id={form.pic_public_id}
                    onChange={({ url, public_id }) =>
                      setForm((f) => ({ ...f, pic_url: url, pic_public_id: public_id }))
                    }
                  />
                </div>
              )}
            </aside>

            {/* Contact */}
            <section className="col-span-12">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-800 font-semibold mb-4 text-xl">Contact information</h2>
                {!editing.contact ? (
                  <button className="cursor-pointer flex items-center" onClick={() => toggleSection('contact')}>
                    <PencilLine />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="cursor-pointer" onClick={() => saveSection('contact')}>
                      {saving.contact ? <span>Saving…</span> : <Check />}
                    </button>
                    <button className="cursor-pointer" onClick={() => resetSection('contact')}>
                      <X />
                    </button>
                  </div>
                )}
              </div>

              {!editing.contact ? (
                <div className="grid grid-cols-12 gap-10 text-black">
                  <div className="col-span-12 lg:col-span-6"><p><b>Phone:</b> {user.phone}</p></div>
                  <div className="col-span-12 lg:col-span-6"><p><b>Email:</b> {user.email}</p></div>
                  <div className="col-span-12 lg:col-span-6">
                    <p><b className='mr-2'>Instagram:</b>
                      <a className="text-pink-700 underline" target="_blank" href={`https://www.instagram.com/${user.instagram}`}>open</a>
                    </p>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <p><b className='mr-2'>Facebook:</b>
                      <a className="text-pink-700 underline" href={`https://www.facebook.com/${user.facebook}`} target="_blank">open</a>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <TextInput label="Phone" value={form.phone}
                      onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                  </div>
                  <div className="col-span-6">
                    <TextInput type="email" label="Email" value={form.email}
                      onChange={(v) => setForm((f) => ({ ...f, email: v.trim() }))} />
                  </div>
                  <div className="col-span-6">
                    <TextInput label="Instagram" value={form.instagram ?? ''}
                      onChange={(v) => setForm((f) => ({ ...f, instagram: v }))} />
                  </div>
                  <div className="col-span-6">
                    <TextInput label="Facebook" value={form.facebook ?? ''}
                      onChange={(v) => setForm((f) => ({ ...f, facebook: v }))} />
                  </div>
                </div>
              )}
            </section>

            {/* Professional — FULL WIDTH */}
            <section className="col-span-12">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-800 font-semibold mb-4 text-xl">Professional information</h2>
                {!editing.professional ? (
                  <button className="cursor-pointer" onClick={() => toggleSection('professional')}>
                    <PencilLine />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="cursor-pointer" onClick={() => saveSection('professional')}>
                      {saving.professional ? <span>Saving…</span> : <Check />}
                    </button>
                    <button className="cursor-pointer" onClick={() => resetSection('professional')}>
                      <X />
                    </button>
                  </div>
                )}
              </div>

              {!editing.professional ? (
                <div className="grid grid-cols-12 gap-10 text-black">
                  <div className="col-span-12"><p><b>Role:</b> {user.role}</p></div>
                  <div className="col-span-4"><p><b>Height:</b> {user.height} cm</p></div>
                  <div className="col-span-4"><p><b>Weight:</b> {user.weight} kg</p></div>
                  <div className="col-span-4"><p><b>Bust:</b> {user.bust} cm</p></div>
                  <div className="col-span-4"><p><b>Waist:</b> {user.waist} cm</p></div>
                  <div className="col-span-4"><p><b>Hips:</b> {user.hips} cm</p></div>
                  <div className="col-span-12"><p><b>Skills:</b> {user.skills}</p></div>
                  <div className="col-span-6">
                    <p><b className='mr-2'>Promo video:</b>{user.video_url ? <a className="text-pink-700 underline" href={user.video_url} target="_blank">open</a> : '—'}</p>
                  </div>
                  <div className="col-span-6">
                    <p><b className='mr-2'>Resume:</b>{user.resume_url ? <a className="text-pink-700 underline" href={user.resume_url} target="_blank">open</a> : '—'}</p>
                  </div>
                  <div className="col-span-12">
                    <p className="font-semibold">Biography</p>
                    <p className="whitespace-pre-line">{user.biography}</p>
                  </div>
                  <div className="col-span-12">
                    <p className="font-semibold">Experience</p>
                    <p className="whitespace-pre-line">{user.experience}</p>
                  </div>

                  {/* {videoId && (
                    <div className="col-span-12">
                      <div className="aspect-video w-full mt-2">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          className="w-full h-full rounded-xl border-2 border-white/20"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          title="User Video"
                        />
                      </div>
                    </div>
                  )} */}
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12">
                    <NoSSRSelector label="Role" placeholder="Choose your role" options={roles}
                      onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
                  </div>
                  <div className="col-span-4">
                    <TextInput label="Height (cm)" value={form.height}
                      onChange={(v) => setForm((f) => ({ ...f, height: v }))} />
                  </div>
                  <div className="col-span-4">
                    <TextInput label="Weight (kg)" value={String(form.weight ?? '')}
                      onChange={(v) => setForm((f) => ({ ...f, weight: v }))} />
                  </div>
                  <div className="col-span-4">
                    <TextInput label="Bust (cm)" value={String(form.bust ?? '')}
                      onChange={(v) => setForm((f) => ({ ...f, bust: v }))} />
                  </div>
                  <div className="col-span-4">
                    <TextInput label="Waist (cm)" value={String(form.waist?? '')}
                      onChange={(v) => setForm((f) => ({ ...f, waist: v }))} />
                  </div>
                  <div className="col-span-4">
                    <TextInput label="Hips (cm)" value={String(form.hips ?? '')}
                      onChange={(v) => setForm((f) => ({ ...f, hips: v }))} />
                  </div>
                  <div className="col-span-12">
                    <TextInput label="Skills (comma separated)" value={form.skills ?? ''}
                      onChange={(v) => setForm((f) => ({ ...f, skills: v }))} />
                  </div>
                  <div className="col-span-6">
                    <TextInput label="Promo video link" value={form.video_url}
                      onChange={(v) => setForm((f) => ({ ...f, video_url: v }))} />
                  </div>
                  <div className="col-span-6">
                    <TextInput label="Resume (pdf/link)" value={form.resume_url ?? ''}
                      onChange={(v) => setForm((f) => ({ ...f, resume_url: v }))} />
                  </div>
                  <div className="col-span-12">
                    <TextArea label="Biography" rows={6} value={form.biography}
                      onChange={(v) => setForm((f) => ({ ...f, biography: v }))} />
                  </div>
                  <div className="col-span-12">
                    <TextArea label="Experience" rows={6} value={form.experience}
                      onChange={(v) => setForm((f) => ({ ...f, experience: v }))} />
                  </div>
                </div>
              )}
            </section>

            {/* Password — full width */}
            <section className="col-span-12">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-800 font-semibold mb-4 text-xl">Change password</h2>
                {!editing.password ? (
                  <button className="cursor-pointer" onClick={() => toggleSection('password')}>
                    <PencilLine />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="cursor-pointer" onClick={() => saveSection('password')}>
                      {saving.password ? <span>Saving…</span> : <Check />}
                    </button>
                    <button className="cursor-pointer" onClick={() => resetSection('password')}>
                      <X />
                    </button>
                  </div>
                )}
              </div>

              {!editing.password ? (
                <p className="text-black">Set a new password for your account.</p>
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-6">
                    <TextInput type="password" label="New password" value={form.password}
                      onChange={(v) => setForm((f) => ({ ...f, password: v }))} placeholder="••••••••" />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <TextInput type="password" label="Repeat password" value={form.password2}
                      onChange={(v) => setForm((f) => ({ ...f, password2: v }))} placeholder="••••••••" />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* terms (посилання) + back */}
          <div className="mt-10 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              By updating your profile you agree to the{' '}
              <Link href="/agreement" target="_blank" className="font-semibold text-pink-800 underline">
                terms and conditions
              </Link>
              .
            </span>
            <button
              className="px-6 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-[#AA0254] to-[#F5720D] hover:opacity-90"
              onClick={() => router.back()}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
