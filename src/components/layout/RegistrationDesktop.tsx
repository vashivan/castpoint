'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getNames } from 'country-list';
import TextInput from '../ui/input';
import TextArea from '../ui/textarea';
import DateInput from '../ui/date_input';
import PictureUploader from '../PictureUpload/PictureUpload';
import Link from 'next/link';

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

export default function RegistrationDesktop() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: '',
    second_name: '',
    date_of_birth: '',
    sex: '',
    country_of_birth: '',
    nationality: '',
    country: '',
    phone: '',
    email: '',
    instagram: '',
    facebook: '',
    role: '',
    height: '',
    weight: '',
    skills: '',
    video_url: '',
    resume_url: '',
    pic_url: '',
    pic_public_id: '',
    password: '',
    password2: '',
    biography: '',
    experience: '',
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (form.password !== form.password2) {
      setMsg('Passwords do not match');
      return;
    }
    setLoading(true);

    const payload = {
      name: `${form.first_name} ${form.second_name}`.trim(),
      first_name: form.first_name,
      second_name: form.second_name,
      sex: form.sex,
      country: form.country,
      country_of_birth: form.country_of_birth,
      nationality: form.nationality,
      phone: form.phone,
      role: form.role,
      date_of_birth: form.date_of_birth,
      height: form.height,
      weight: form.weight,
      skills: form.skills,
      video_url: form.video_url,
      resume_url: form.resume_url,
      pic_url: form.pic_url,
      pic_public_id: form.pic_public_id,
      biography: form.biography,
      experience: form.experience,
      email: form.email,
      password: form.password,
      instagram: form.instagram,
      facebook: form.facebook,
    };


    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Registration failed');
      router.push('/registration-success');
    } catch (err) {
      console.error(err);
      setMsg('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const checkPassword = () => {
    if (!form.password && !form.password2) { setMsg(""); return; }
    if (form.password.length < 8) setMsg("Password must be at least 8 characters");
    else if (form.password !== form.password2) setMsg("Passwords do not match");
    else setMsg("");
  };

  const canSubmit = msg === "" && !!form.password && !!form.password2;


  return (
    <section className="hidden lg:block min-h-screen px-10 py-25">
      <h1 className="w-full text-center text-4xl md:text-4xl font-bol text-black uppercase bg-clip-text mb-10">
        Create Your Artist Account
      </h1>

      <div className="max-w-6xl mx-auto p-[2px] rounded-3xl bg-gradient-to-r from-[#AA0254] to-[#F5720D]">
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white shadow-xl p-10">
          {/* СПРОЩЕНИЙ ГРІД: 12 колонок без вкладених row-span */}
          <div className="grid grid-cols-12 gap-8">
            {/* LEFT TOP — Personal */}
            <section className="col-span-8">
              <h2 className="text-gray-800 font-semibold">Personal information</h2>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <TextInput
                    label="First name"
                    name="first_name"
                    value={form.first_name}
                    onChange={(v) => setForm({ ...form, first_name: v })}
                    placeholder="Your first name"
                  />
                </div>
                <div className="col-span-6">
                  <TextInput
                    label="Second name"
                    name="second_name"
                    value={form.second_name}
                    onChange={(v) => setForm({ ...form, second_name: v })}
                    placeholder="Your last name"
                  />
                </div>

                <div className="col-span-6">
                  <DateInput
                    label="Date of birth"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={(v) => setForm({ ...form, date_of_birth: v })}
                  />
                </div>
                <div className="col-span-6">
                  <NoSSRSelector
                    label="Sex"
                    placeholder="Choose your gender"
                    options={[
                      { value: 'm', label: 'Male' },
                      { value: 'f', label: 'Female' },
                    ]}
                    onChange={(v) => setForm({ ...form, sex: v })}
                  />
                </div>

                <div className="col-span-4">
                  <NoSSRSelector
                    label="Country of birth"
                    placeholder="Select"
                    options={countries}
                    onChange={(v) => setForm({ ...form, country_of_birth: v })}
                  />
                </div>
                <div className="col-span-4">
                  <NoSSRSelector
                    label="Nationality"
                    placeholder="Select"
                    options={countries}
                    onChange={(v) => setForm({ ...form, nationality: v })}
                  />
                </div>
                <div className="col-span-4">
                  <NoSSRSelector
                    label="Country of residence"
                    placeholder="Select"
                    options={countries}
                    onChange={(v) => setForm({ ...form, country: v })}
                  />
                </div>
              </div>
            </section>

            {/* RIGHT TOP — Фото */}
            <aside className=" h-80 col-span-4">
              <div className="rounded-2xl border border-gray-200 p-5 h-full flex flex-col items-center justify-center gap-4">
                <PictureUploader
                  pic_url={form.pic_url}
                  pic_public_id={form.pic_public_id}
                  onChange={({ url, public_id }) =>
                    setForm({ ...form, pic_url: url, pic_public_id: public_id })
                  }
                />
                <p className="text-sm text-gray-500 text-center">
                  Upload a clear headshot. JPG/PNG, ~2–5 MB.
                </p>
              </div>
            </aside>

            {/* Contact — ліворуч під персональною, поруч ще може стояти фото, якщо воно високе */}
            <section className="col-span-12 xl:col-span-12">
              <h2 className="text-gray-800 font-semibold">Contact information</h2>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <TextInput
                    type="tel"
                    label="Phone number"
                    name="phone"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="+82 ..."
                  />
                </div>
                <div className="col-span-6">
                  <TextInput
                    type="email"
                    label="E-mail"
                    name="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v.trim() })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="col-span-6">
                  <TextInput
                    label="Instagram"
                    name="instagram"
                    value={form.instagram}
                    onChange={(v) => setForm({ ...form, instagram: v })}
                    placeholder="@your_id"
                  />
                </div>
                <div className="col-span-6">
                  <TextInput
                    label="Facebook"
                    name="facebook"
                    value={form.facebook}
                    onChange={(v) => setForm({ ...form, facebook: v })}
                    placeholder="facebook.com/you"
                  />
                </div>
              </div>
            </section>

            {/* >>> FULL WIDTH <<< Professional information */}
            <section className="col-span-12">
              <h2 className="text-gray-800 font-semibold">Professional information</h2>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <NoSSRSelector
                    label="Role"
                    placeholder="Choose your role"
                    options={roles}
                    onChange={(v) => setForm({ ...form, role: v })}
                  />
                </div>
                <div className="col-span-3">
                  <TextInput
                    label="Height (cm)"
                    name="height"
                    value={form.height}
                    onChange={(v) => setForm({ ...form, height: v })}
                    placeholder="e.g. 178"
                  />
                </div>
                <div className="col-span-3">
                  <TextInput
                    label="Weight (kg)"
                    name="weight"
                    value={form.weight}
                    onChange={(v) => setForm({ ...form, weight: v })}
                    placeholder="e.g. 70"
                  />
                </div>

                <div className="col-span-12">
                  <NoSSRSelector
                    label="Additional skills"
                    placeholder="Select or type"
                    options={[
                      { value: 'acro', label: 'Acrobatics' },
                      { value: 'pole', label: 'Pole dance' },
                      { value: 'contortion', label: 'Contortion' },
                      { value: 'acting', label: 'Acting' },
                    ]}
                    onChange={(v) => setForm({ ...form, skills: v })}
                  />
                </div>

                <div className="col-span-6">
                  <TextInput
                    label="Promo video link"
                    name="video_url"
                    value={form.video_url}
                    onChange={(v) => setForm({ ...form, video_url: v })}
                    placeholder="YouTube/Vimeo link"
                  />
                </div>
                <div className="col-span-6">
                  <TextInput
                    label="Resume (pdf/link)"
                    name="resume_url"
                    value={form.resume_url}
                    onChange={(v) => setForm({ ...form, resume_url: v })}
                    placeholder="Link to resume"
                  />
                </div>

                <div className="col-span-12">
                  <TextArea
                    label="Biography"
                    value={form.biography}
                    rows={6}
                    placeholder="Tell us about yourself"
                    onChange={(v) => setForm({ ...form, biography: v })}
                  />
                </div>
                <div className="col-span-12">
                  <TextArea
                    label="Experience"
                    value={form.experience}
                    rows={6}
                    placeholder="Short summary of your work experience"
                    onChange={(v) => setForm({ ...form, experience: v })}
                  />
                </div>
              </div>
            </section>

            {/* Password — теж на всю ширину, щоб не було “дірки” справа після full-width секції */}
            <section className="col-span-12">
              <h2 className="text-gray-800 font-semibold">Create your password</h2>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6">
                  <TextInput
                    type="password"
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={(v) => setForm({ ...form, password: v.trim() })}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    onBlur={checkPassword}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <TextInput
                    type="password"
                    label="Repeat password"
                    name="password2"
                    value={form.password2}
                    onChange={(v) => setForm({ ...form, password2: v.trim() })}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    onBlur={checkPassword}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* terms + submit */}
          <div className="mt-10 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" required className="accent-pink-600 w-4 h-4" />
              I agree to the{' '}
              <Link href="/agreement" target="_blank" className="font-semibold text-pink-800 underline">
                terms and conditions
              </Link>
            </label>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="px-6 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-[#AA0254] to-[#F5720D] hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </div>

          {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
        </form>
      </div>
    </section>
  );
}
