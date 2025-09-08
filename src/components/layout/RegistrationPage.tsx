'use client';

// import styles from '../../styles/Form.module.scss';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getNames } from 'country-list';
import TextInput from '../ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import TextArea from '../ui/textarea';
import PictureUploader from '../PictureUpload/PictureUpload';
import Link from 'next/link';
import DateInput from '../ui/date_input';
import CastpointLoader from '../ui/loader';

const NoSSRSelector = dynamic(() => import('../ui/custom_select'), { ssr: false });

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
    first_name: '',
    second_name: '',
    nationality: '',
    phone: '',
    skills: '',
    resume_url: '',
    country: '',
    country_of_birth: '',
    sex: '',
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
    password2: '',
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
    setMessage('');
    if (form.password !== form.password2) {
      setMessage('Passwords do not match');
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
      setMessage('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const isStepValid = () => {
    if (step === 0) {
      return form.first_name && form.second_name && form.country && form.date_of_birth
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

  const stringToNum = (val: string) => {
    const string = val;
    const num = +string;

    return num;
  };

  const checkPassword = () => {
    if (!form.password && !form.password2) { setMessage(""); return; }
    if (form.password.length < 8) setMessage("Password must be at least 8 characters");
    else if (form.password !== form.password2) setMessage("Passwords do not match");
    else setMessage("");
  };

  return (
    <section className="min-h-screen px-6 pt-20 flex flex-col items-center justify-center text-center bg-transparent">
      <h1 className="text-3xl md:text-3xl font-bol text-black uppercase bg-clip-text mb-10">
        Create Your Artist Account
      </h1>

      <div className="w-full md:w-120 p-[2px] rounded-3xl bg-gradient-to-r from-[#AA0254] to-[#F5720D]">
        <form
          onSubmit={handleSubmit}
          className={`w-full bg-white rounded-3xl p-8 shadow-xl overflow-hidden relative`}
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
                  label="First name"
                  name="name"
                  value={form.first_name}
                  onChange={(val) => setForm({ ...form, first_name: val })}
                  placeholder="Your name"
                />

                <TextInput
                  type="text"
                  label="Second name"
                  name="name"
                  value={form.second_name}
                  onChange={(val) => setForm({ ...form, second_name: val })}
                  placeholder="Your second name"
                />

                <DateInput
                  label="Date of Birth"
                  name="date_of_birth"
                  placeholder='YYYY-MM-DD'
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
                  onBlur={checkPassword}
                />

                <TextInput
                  type="password"
                  label="Password"
                  name="password2"
                  value={form.password2}
                  onChange={(val) => setForm({ ...form, password2: trimFunction(val) })}
                  placeholder="Repeat password"
                  onBlur={checkPassword}
                />

                {message && <p className="text-red-600 text-sm">{message}</p>}

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
                  rows={10}
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
                  rows={15}
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
                <p className="text-black text-xl">Almost done &#128553; <br /> Just two steps left</p>
                <p className="text-black text-sm mb-3">Let’s keep in touch — drop your social media links here!</p>
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
                  placeholder="Facebook id here"
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
                <p className="text-black text-xl">Last step &#128519;</p>
                <p className="text-balck text-sm mb-3">
                  Paste your promo video link (from any streaming service) and upload photo of yourself.
                </p>


                <TextInput
                  label="Promo-video"
                  name="video_url"
                  placeholder="Put link here"
                  value={form.video_url}
                  onChange={(val) => setForm({ ...form, video_url: val })}
                />

                <TextInput
                  label="Resume link"
                  name="resume_url"
                  placeholder="Put link here"
                  value={form.resume_url}
                  onChange={(val) => setForm({ ...form, resume_url: val })}
                />

                <div className='border rounded-2xl border-black pb-4 flex flex-col items-center min-h-100'>
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
                </div>

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
                className="w-full py-2 rounded-xl border text-black hover:bg-gray-300 cursor-pointer"
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
      </div>
    </section>
  );
}
