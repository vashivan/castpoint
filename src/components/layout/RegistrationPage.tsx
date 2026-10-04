"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getNames } from "country-list";

import TextInput from "../ui/input";
import TextArea from "../ui/textarea";
import DateInput from "../ui/date_input";
import PictureUploader from "../PictureUpload/PictureUpload";
import AuthShell from "../auth/AuthShell";
import { Button } from "../ds/Button";
import { normalizeFacebook, normalizeInstagram } from "@/lib/socials";
import { cn } from "@/lib/utils";

const NoSSRSelector = dynamic(() => import("../ui/custom_select"), { ssr: false });

const countries = getNames().map((country) => ({ label: country, value: country }));

const roles = [
  { value: "dancer", label: "Dancer" },
  { value: "circus", label: "Circus Artist" },
  { value: "singer", label: "Singer" },
  { value: "actor", label: "Actor" },
  { value: "musician", label: "Musician" },
  { value: "acrobat", label: "Acrobat" },
  { value: "stunt", label: "Stunt Performer" },
  { value: "model", label: "Model" },
  { value: "magician", label: "Magician" },
  { value: "aerialist", label: "Aerialist" },
  { value: "drag", label: "Drag Performer" },
  { value: "choreographer", label: "Choreographer" },
  { value: "host", label: "Host / MC" },
  { value: "dj", label: "DJ" },
  { value: "crew", label: "Tech Crew / Stagehand" },
  { value: "puppeteer", label: "Puppeteer" },
  { value: "fire", label: "Fire Performer" },
  { value: "clown", label: "Clown" },
  { value: "comedian", label: "Comedian" },
  { value: "other", label: "Other" },
];

const STEPS = ["Basics", "Biography", "Experience", "Socials", "Photo & video"];

/** Five-step artist sign-up wizard (same on mobile and desktop). */
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    first_name: "",
    second_name: "",
    nationality: "",
    phone: "",
    skills: "",
    resume_url: "",
    country: "",
    country_of_birth: "",
    sex: "",
    role: "",
    date_of_birth: "",
    height: "",
    weight: "",
    bust: "",
    waist: "",
    hips: "",
    video_url: "",
    pic_url: "",
    pic_public_id: "",
    biography: "",
    experience: "",
    email: "",
    password: "",
    password2: "",
    instagram: "",
    facebook: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string) => setForm((p) => ({ ...p, [key]: val }));
  const onlyDigits = (key: keyof typeof form) => (val: string) => set(key)(val.replace(/[^\d]/g, ""));
  const trimmed = (key: keyof typeof form) => (val: string) => set(key)(val.trim());

  const isStepValid = () => {
    const has = (v: string) => v.trim().length > 0;
    if (step === 0) {
      return (
        ["first_name", "second_name", "country", "date_of_birth", "sex", "height", "weight", "bust", "waist", "hips", "role", "email", "password"] as const
      ).every((k) => has(form[k])) && form.password.length >= 8 && form.password === form.password2;
    }
    if (step === 3) return Boolean(form.instagram || form.facebook);
    if (step === 4) return Boolean(form.video_url && form.pic_url);
    return true;
  };

  const checkPassword = () => {
    if (!form.password && !form.password2) return setMessage("");
    if (form.password.length < 8) setMessage("Password must be at least 8 characters");
    else if (form.password2 && form.password !== form.password2) setMessage("Passwords do not match");
    else setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return;
    setMessage("");

    if (form.password !== form.password2) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    const { password2: _p2, ...rest } = form;
    const payload = {
      ...rest,
      name: `${form.first_name} ${form.second_name}`.trim(),
      instagram: normalizeInstagram(form.instagram),
      facebook: normalizeFacebook(form.facebook),
    };

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");
      router.push("/registration-success");
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      tone="pink"
      kicker="Free artist profile"
      title={<>Create<br />your<br />profile.</>}
      aside={
        <span className="text-ink">
          One profile for every application: photos, showreel, measurements and experience, in the format casting
          directors ask for. Already have one? <Link href="/login" className="font-bold underline">Sign in</Link>.
        </span>
      }
      wide
    >
      {/* Step indicator */}
      <ol className="grid grid-cols-5 gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s}>
            <div className={cn("h-1.5", i <= step ? "bg-ink" : "bg-ink/15")} />
            <p className={cn("label mt-2 hidden sm:block", i === step ? "text-ink" : "text-ink/40")}>{s}</p>
          </li>
        ))}
      </ol>
      <p className="label mt-6 text-ink/60">Step {step + 1} of {STEPS.length}</p>
      <p className="font-display mt-2 text-[clamp(28px,3.4vw,44px)]">{STEPS[step]}</p>

      <form onSubmit={handleSubmit} className="mt-8">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div><TextInput label="First name" name="first_name" value={form.first_name} onChange={set("first_name")} placeholder="Your name" /></div>
            <div><TextInput label="Second name" name="second_name" value={form.second_name} onChange={set("second_name")} placeholder="Your second name" /></div>
            <div><DateInput label="Date of birth" name="date_of_birth" value={form.date_of_birth} onChange={set("date_of_birth")} /></div>
            <div><TextInput type="email" label="Email" name="email" autoComplete="email" value={form.email} onChange={trimmed("email")} placeholder="you@example.com" /></div>
            <div><TextInput type="password" label="Password" name="password" autoComplete="new-password" value={form.password} onChange={trimmed("password")} placeholder="At least 8 characters" onBlur={checkPassword} /></div>
            <div><TextInput type="password" label="Repeat password" name="password2" autoComplete="new-password" value={form.password2} onChange={trimmed("password2")} placeholder="Repeat password" onBlur={checkPassword} /></div>
            <NoSSRSelector label="Sex" placeholder="Choose" options={[{ value: "m", label: "Male" }, { value: "f", label: "Female" }]} onChange={set("sex")} />
            <NoSSRSelector label="Country" placeholder="Where are you from" options={countries} onChange={set("country")} />
            <div className="sm:col-span-2"><NoSSRSelector label="Role" placeholder="Choose your role" options={roles} onChange={set("role")} /></div>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2 sm:grid-cols-5">
              {(["height", "weight", "bust", "waist", "hips"] as const).map((k) => (
                <div key={k}>
                  <TextInput type="number" label={k} name={k} value={form[k]} onChange={onlyDigits(k)} placeholder={k === "weight" ? "kg" : "cm"} />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <TextArea
              label="Biography"
              value={form.biography}
              rows={10}
              placeholder="Do not be shy, use every opportunity to tell about you."
              text="It's time to get to know you better. Your favourite projects, the hobbies you love, what drives you every day. Go beyond the basics."
              onChange={set("biography")}
            />
            <p className="label mt-3 text-ink/50">You can skip this step and add it later</p>
          </>
        )}

        {step === 2 && (
          <>
            <TextArea
              label="Experience"
              rows={12}
              placeholder="e.g. Cirque du Soleil (2019–2022), Royal Caribbean (2017–2019)"
              value={form.experience}
              text="A short summary of your work experience. A couple of sentences give a clear picture of your skills and background."
              onChange={set("experience")}
            />
            <p className="label mt-3 text-ink/50">You can skip this step and add it later</p>
          </>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <p className="text-[15px] text-ink/70">Almost done. Drop at least one social link so employers can see your work.</p>
            <div>
              <TextInput
                label="Instagram"
                name="instagram"
                placeholder="@nickname or profile link"
                value={form.instagram}
                onChange={set("instagram")}
                onBlur={() => {
                  const normalized = normalizeInstagram(form.instagram);
                  if (form.instagram.trim() && !normalized) return setMessage("Instagram: please paste your profile (@username or profile link)");
                  setMessage("");
                  set("instagram")(normalized);
                }}
              />
              {!!form.instagram && <p className="mt-2 text-xs text-ink/60">Saved as: <span className="font-semibold">{form.instagram}</span></p>}
            </div>
            <div>
              <TextInput
                label="Facebook"
                name="facebook"
                placeholder="Facebook profile link"
                value={form.facebook}
                onChange={set("facebook")}
                onBlur={() => {
                  const normalized = normalizeFacebook(form.facebook);
                  if (form.facebook.trim() && !normalized) return setMessage("Facebook: please paste your profile link or username");
                  setMessage("");
                  set("facebook")(normalized);
                }}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <p className="text-[15px] text-ink/70">Last step. Paste your promo video link (any streaming service) and upload a photo of yourself.</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><TextInput label="Promo video" name="video_url" placeholder="https://…" value={form.video_url} onChange={set("video_url")} /></div>
              <div><TextInput label="Resume link (optional)" name="resume_url" placeholder="https://…" value={form.resume_url} onChange={set("resume_url")} /></div>
            </div>
            <div className="border-[1.5px] border-ink bg-panel p-6">
              <PictureUploader
                pic_url={form.pic_url}
                pic_public_id={form.pic_public_id}
                onChange={({ url, public_id }) => setForm((p) => ({ ...p, pic_url: url, pic_public_id: public_id }))}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-[14px]">
              <input type="checkbox" id="agreement" className="h-4 w-4 accent-ink" required />
              <span>
                I agree to the{" "}
                <Link href="/agreement" target="_blank" className="font-bold underline">terms and conditions</Link>
              </span>
            </label>
          </div>
        )}

        {message && <p className="mt-6 border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">{message}</p>}

        <div className="mt-10 flex gap-4">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)} className="flex-1 justify-center">
              ← Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!isStepValid()} arrow className="flex-[2]">
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={!isStepValid() || loading} arrow={!loading} className="flex-[2]">
              {loading ? "Creating…" : "Create profile"}
            </Button>
          )}
        </div>
      </form>
    </AuthShell>
  );
}
