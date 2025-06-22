'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getNames } from 'country-list';
import TextInput from '../components/ui/input';
import { AnimatePresence, motion, number } from 'framer-motion';
import TextArea from '../components/ui/textarea';
import PictureUploader from '../components/PictureUpload/PictureUpload';
import Link from 'next/link';
import DateInput from '../components/ui/date_input';
import CastpointLoader from '../components/ui/loader';

const NoSSRSelector = dynamic(() => import('../components/ui/custom_select'), { ssr: false });

const countries = getNames().map((country) => ({
  label: country,
  value: country,
}));

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

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    sex: '',
    country: '',
    role: '',
    date_of_birth: Date(),
    height: '',
    weight: '',
    video_url: '',
    pic_url: '',
    pic_public_id: '',
    biography: '',
    experience: '',
    email: '',
    password: '',
    instagram: '',
    facebook: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(form);
  }, [form])

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const trimFunction = (val: string) => {
    return val.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setLoading(false);
      router.push('/registration-success');
      // setMessage('🎉 Congrats! You are Castpoint member now!');
    } else {
      setLoading(false);
      setMessage(data.error || 'Error. Please try again or contact us.');
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const isStepValid = () => {
    if (step === 0) {
      return form.name && form.country && form.date_of_birth
        && form.sex && form.height && form.weight && form.role
        && form.email && form.password;
    } if (step === 1) {
      return true;
    } if (step === 2) {
      return true;
    } if (step === 3) {
      return form.instagram || form.facebook;
    } if (step === 4) {
      return form.video_url && form.pic_url;
    } else {
      return false;
    }
  };

  // const formatDate = (val: string) => {
  //   const digits = val.replace(/\D/g, '').slice(0, 8);
  //   const parts = [];

  //   if (digits.length > 0) parts.push(digits.slice(0, 2));
  //   if (digits.length > 2) parts.push(digits.slice(2, 4));
  //   if (digits.length > 4) parts.push(digits.slice(4, 8));

  //   return parts.join('.');
  // };

  const stringToNum = (val: string) => {
    const string = val;
    const num = +string;

    return num;
  };

  return (
    <section className="min-h-screen px-6 py-20 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-purple-500 via-pink-400 to-orange-300">
      <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-800 via-purple-400 to-orange-500 text-transparent bg-clip-text mb-10">
        Create Your Artist Account
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl overflow-hidden relative"
      >
        <AnimatePresence mode="wait">

          {/* Basic info */}
          {step === 0 && (
            <motion.div
              key="step-0"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <TextInput
                type="text"
                label="Full name"
                name="name"
                value={form.name}
                onChange={(val) => setForm({ ...form, name: val })}
                placeholder="Your name"
              />

              <DateInput
                label="Date of Birth"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={(val) => setForm({ ...form, date_of_birth: val })}
              />

              <TextInput
                type="email"
                label="Email"
                name="email"
                value={form.email}
                onChange={(val) => setForm({ ...form, email: trimFunction(val) })}
                placeholder="Your email"
              />

              <TextInput
                type="password"
                label="Password"
                name="password"
                value={form.password}
                onChange={(val) => setForm({ ...form, password: trimFunction(val) })}
                placeholder="Password"
              />

              <NoSSRSelector
                label="Sex"
                placeholder="Choose your gender"
                options={[
                  { value: 'm', label: 'Male' },
                  { value: 'f', label: 'Female' },
                ]}
                onChange={(val) => setForm({ ...form, sex: val })}
              />

              <NoSSRSelector
                label="Country"
                placeholder="Where are you from"
                options={countries}
                onChange={(val) => setForm({ ...form, country: val })}
              />

              <NoSSRSelector
                label="Role"
                placeholder="Choose your role"
                options={roles}
                onChange={(val) => setForm({ ...form, role: val })}
              />

              <TextInput
                type="text"
                label="Height"
                name="height"
                value={stringToNum(form.height)}
                onChange={(val) => setForm({ ...form, height: val })}
                placeholder="cm"
              />

              <TextInput
                type="text"
                label="Weight"
                name="weight"
                value={stringToNum(form.weight)}
                onChange={(val) => setForm({ ...form, weight: val })}
                placeholder="kg"
              />

            </motion.div>
          )}

          {/* Biography */}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <TextArea
                label="Biography"
                value={form.biography}
                placeholder="Do not be shy, use all oportunities to tell about you."
                text="🎯 It’s time to get to know you better!
                Tell us a bit more about yourself — not just the basics. Whether it's your favorite projects, hobbies you love, or what drives you every day — we’re all ears. Let’s go beyond the surface and see what makes you you. 💬"
                onChange={(val) => setForm({ ...form, biography: val })}
              />

              <p className="text-white text-sm">
                * you can skip this step and add this info later
              </p>
            </motion.div>
          )}

          {/* Experience */}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <TextArea
                label="Experience"
                placeholder="Share your experience. For example: 'Cirque du Soleil (2019–2022)', 'Royal Caribbean (2017–2019)' etc."
                value={form.experience}
                text="Share a short summary of your work experience. Just a couple of sentences can give us a clear picture of your skills and background."
                onChange={(val) => setForm({ ...form, experience: val })}
              />

              <p className="text-white text-sm">
                * you can skip this step and add this info later
              </p>
            </motion.div>
          )}

          {/* Keep in touch */}
          {step === 3 && (
            <motion.div
              key="step-3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <p className="text-white text-xl">Almost done &#128553; <br /> Just two steps left</p>
              <p className="text-white text-sm mb-3">Let’s keep in touch — drop your social media links here!</p>
              <TextInput
                label="Instagram"
                name="instagram"
                placeholder="Instagram id here"
                value={form.instagram}
                onChange={(val) => setForm({ ...form, instagram: val })}
              />

              <TextInput
                label="Facebook"
                name="facebook"
                placeholder="Facebook link  here"
                value={form.facebook}
                onChange={(val) => setForm({ ...form, facebook: val })}
              />
            </motion.div>
          )}

          {/* Photo/video */}
          {step === 4 && (
            <motion.div
              key="step-4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <p className="text-white text-xl">Last step &#128519;</p>
              <p className="text-white text-sm mb-3">
                Paste your promo video link (from any streaming service) and upload photo of yourself.
              </p>


              <TextInput
                label="Promo-video"
                name="video_url"
                placeholder="Put link here"
                value={form.video_url}
                onChange={(val) => setForm({ ...form, video_url: val })}
              />

              <PictureUploader
                pic_url={form.pic_url}
                pic_public_id={form.pic_public_id}
                onChange={({ url, public_id }) => {
                  setForm({
                    ...form,
                    pic_url: url,
                    pic_public_id: public_id,
                  });
                }}
              />
              <div className="flex items-center gap-2 text-sm mt-4 w-100">
                <input
                  type="checkbox"
                  id="agreement"
                  className="accent-pink-600 w-4 h-4"

                  required
                />
                <label htmlFor="agreement" className="text-gray-700">
                  I agree to the{" "}
                  <Link
                    href="/agreement"
                    target="_blank"
                    className="font-semibold text-pink-800 underline"
                  >
                    terms and conditions
                  </Link>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопки навігації */}
        <div className="flex justify-between gap-4 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="w-full py-2 rounded-xl bg-white/30 text-white hover:bg-white/40 cursor-pointer"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`w-full py-2 text-white font-semibold rounded-xl transition
              ${!isStepValid()
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-90 cursor-pointer'}
            `}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isStepValid()}
              className={`w-full py-2 text-white font-semibold rounded-xl transition
              ${!isStepValid()
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-yellow-300 hover:opacity-90 cursor-pointer'}
              
            `}
            >
              {loading ? (
                <CastpointLoader />
              ) : (
                <p>Finish</p>
              )}
            </button>
          )}
        </div>

        {message && (
          <p className="text-yellow-100 text-sm mt-4">{message}</p>
        )}
      </form>
    </section>
  );
}
