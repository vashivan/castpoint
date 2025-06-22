'use client'

import React, { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Check, Instagram, PencilLine, User, X } from "lucide-react";
import CastpointLoader from "../../components/ui/loader";
import TextInput from "../../components/ui/input";
import TextArea from "../../components/ui/textarea";
import PictureUploader from "../../components/PictureUpload/PictureUpload";

export default function UserProfilePage() {
  const { isLogged, user, updateUser } = useAuth();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [editedData, setEditedData] = useState({
    name: user?.name,
    sex: user?.sex,
    country: user?.country,
    role: user?.role,
    date_of_birth: user?.date_of_birth,
    height: user?.height,
    weight: user?.weight,
    video_url: user?.video_url,
    pic_url: user?.pic_url,
    pic_public_id: user?.pic_public_id,
    biography: user?.biography,
    experience: user?.experience,
    email: user?.email,
    password: 'Enter new password',
    instagram: user?.instagram,
    facebook: user?.facebook,
  });

  if (!isLogged || !user) return null;

  const trimFunction = (val: string) => {
    return val.trim();
  };

  const date = new Date(user.date_of_birth);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const videoIdMatch = user.video_url.match(/[?&]v=([^&]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  const handleCancel = () => {
    setEditingField(null);
    setEditedData({
      name: user?.name,
      sex: user?.sex,
      country: user?.country,
      role: user?.role,
      date_of_birth: user?.date_of_birth,
      height: user?.height,
      weight: user?.weight,
      video_url: user?.video_url,
      pic_url: user?.pic_url,
      pic_public_id: user?.pic_public_id,
      biography: user?.biography,
      experience: user?.experience,
      email: user?.email,
      password: 'Enter new password',
      instagram: user?.instagram,
      facebook: user?.facebook,
    });
  };

  const handleSave = async (field: string) => {
    setIsUpdated(true);

    try {
      const updatedField = { [field]: editedData[field as keyof typeof editedData] };

      const response = await fetch("/api/update_profile_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedField),
      });

      if (!response.ok) {
        setIsUpdated(false);
        const errorData = await response.json();
        throw new Error(errorData.error || "Error during updating data");
      }

      const updatedUserRes = await fetch("/api/auth");
      const updatedUserData = await updatedUserRes.json();
      updateUser(updatedUserData.user);


    } catch (error) {
      console.error("Error", error);
      setIsUpdated(false);
    } finally {
      setIsUpdated(false);
      setEditingField(null);
    }
  };

  return (
    <section className="min-h-screen px-6 py-20 flex flex-col items-center justify-center bg-gradient-to-tr from-purple-500 via-pink-400 to-orange-300 text-white">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-left border border-white/20">
        <div className="flex flex-col items-center md:flex-row md:items-start gap-8 mb-10 px-1">

          {/* Profile picture */}
          <div>
            {editingField === "profile_picture" ? (
              <div className="flex flex-col items-center">
                <PictureUploader
                  pic_url={editedData.pic_url || ''}
                  pic_public_id={editedData.pic_public_id || ''}
                  onChange={({ url, public_id }) => {
                    setEditedData({ ...editedData, pic_url: url, pic_public_id: public_id });
                  }}
                />
                <button
                  className="cursor-pointer mt-3 bg-red-500 rounded-md py-1 px-1"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="cursor-pointer mt-3 bg-green-500 rounded-md py-1 px-1"
                  onClick={() => {
                    handleSave("pic_url");
                    handleSave("pic_public_id")
                  }}
                >
                  Set new profile picture
                </button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={user.pic_url || '/default-avatar.png'}
                  alt="Profile"
                  className="w-100 h-120 object-cover rounded-2xl border-4 border-white/30 shadow-lg"
                />
                <button
                  className="flex items-center absolute bg-pink-200 rounded-3xl py-2 px-2 top-5 left-5 cursor-pointer"
                  onClick={() => setEditingField("profile_picture")}
                >
                  <PencilLine color="black" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-1 text-s">
            {/* Name */}
            <h1 className="text-3xl flex space-x-1.5 font-bold h-10 w-100">
              {editingField === "name" ? (
                <>
                  <TextInput
                    type="text"
                    name="name"
                    value={editedData.name || ''}
                    onChange={(val) => setEditedData({ ...editedData, name: val })}
                  />
                  <button
                    className="cursor-pointer"
                    onClick={() => handleSave("name")}
                  >
                    {isUpdated ? <CastpointLoader /> : <Check color="white" />}
                  </button>
                  <button
                    className="cursor-pointer"
                    onClick={handleCancel}
                  >
                    <X color="white" />
                  </button>
                </>
              ) : (
                <>
                  <span className="mr-3">{user.name}</span>
                  <button
                    className="cursor-pointer"
                    onClick={() => setEditingField("name")}
                  >
                    <PencilLine />
                  </button>
                </>
              )}
            </h1>

            {/* Country */}
            <p className="text-lg text-white/80">{user.role} from {user.country}</p>

            {/* Date of birth */}
            <p className="text-white/60 mb-3">Born: {formattedDate}</p>

            {/* Email */}
            <div className="mb-3">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Email:</h2>
                </div>
                {editingField === "email" ? (
                  <div className="mt-2 space-y-1">
                    <TextInput
                      type="text"
                      value={editedData.email || ''}
                      onChange={(val) =>
                        setEditedData({ ...editedData, email: val })
                      }
                    />
                    <div className="flex space-x-2">
                      <button
                        className="cursor-pointer"
                        onClick={() => handleSave("email")}
                      >
                        {isUpdated ? <CastpointLoader /> : <Check color="white" />}
                      </button>
                      <button className="cursor-pointer" onClick={handleCancel}>
                        <X color="white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex">
                      <span className="mr-1">{user.email}</span>
                      <button
                        className="cursor-pointer"
                        onClick={() => setEditingField("email")}
                      >
                        <PencilLine size={20} className="ml-1.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Password:</h2>
                </div>
                {editingField === "password" ? (
                  <div className="mt-2 space-y-1">
                    <TextInput
                      type="password"
                      value={editedData.password || ''}
                      onChange={(val) =>
                        setEditedData({ ...editedData, password: val })
                      }
                    />
                    <div className="flex space-x-2">
                      <button
                        className="cursor-pointer"
                        onClick={() => handleSave("password")}
                      >
                        {isUpdated ? <CastpointLoader /> : <Check color="white" />}
                      </button>
                      <button className="cursor-pointer" onClick={handleCancel}>
                        <X color="white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line  flex mt-2 text-white/90">
                    Change your password here
                    <button
                      className="cursor-pointer"
                      onClick={() => setEditingField("password")}
                    >
                      <PencilLine size={20} className="ml-1.5" />
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Sex */}
            <div className="mb-3">
              <h2 className="font-semibold mb-1">Sex:</h2>
              <p>{user.sex}</p>
            </div>

            {/* Height & Weight */}
            <div className="mb-3">
              <div className="flex space-x-1 items-center">
                <h2 className="font-semibold mb-1">Height / Weight</h2>
                {editingField !== "height_weight" && (
                  <button
                    className="cursor-pointer"
                    onClick={() => setEditingField("height_weight")}
                  >
                    <PencilLine size={20} />
                  </button>
                )}
              </div>
              {editingField === "height_weight" ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex gap-1 w-100">
                    <TextInput
                      type="text"
                      name="height"
                      value={editedData.height || ''}
                      onChange={(val) =>
                        setEditedData({ ...editedData, height: Number(val) })
                      }
                      placeholder="Height (cm)"
                    />
                    <TextInput
                      type="text"
                      name="weight"
                      value={editedData.weight || ''}
                      onChange={(val) =>
                        setEditedData({ ...editedData, weight: Number(val) })
                      }
                      placeholder="Weight (kg)"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button className="cursor-pointer">
                      {isUpdated ? <CastpointLoader /> : <Check color="white" />}
                    </button>
                    <button
                      className="cursor-pointer"
                      onClick={handleCancel}
                    >
                      <X color="white" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-white/90">{user.height} cm / {user.weight} kg</p>
              )}
            </div>

            {/* Social media */}
            {(user.instagram || user.facebook) && (
              <div className="md:col-span-2">
                <h2 className="font-semibold mb-1">Socials:</h2>
                <div className="flex gap-4">
                  {user.instagram && (
                    <a href={`https://www.instagram.com/${trimFunction(user.instagram)}`} target="_blank" rel="noopener noreferrer" className="text-pink-200 hover:underline flex space-x-1">
                      <Instagram />
                      <p>Instagram</p>
                    </a>
                  )}
                  {user.facebook && (
                    <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Biography */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/90 mt-10">
          <div className="md:col-span-2">
            <div className="flex items-center">
              <h2 className="font-semibold">Biography</h2>
              {editingField !== "biography" && (
                <button
                  className="cursor-pointer"
                  onClick={() => setEditingField("biography")}
                >
                  <PencilLine size={20} className="ml-1.5" />
                </button>
              )}
            </div>
            {editingField === "biography" ? (
              <div className="mt-2 space-y-2">
                <TextArea
                  rows={5}
                  value={editedData.biography || ''}
                  onChange={(val) =>
                    setEditedData({ ...editedData, biography: val })
                  }
                />
                <div className="flex space-x-2">
                  <button
                    className="cursor-pointer"
                    onClick={() => handleSave("biography")}
                  >
                    {isUpdated ? <CastpointLoader /> : <Check color="white" />}
                  </button>
                  <button className="cursor-pointer" onClick={handleCancel}>
                    <X color="white" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-line mt-2 text-white/90">
                {user.biography}
              </p>
            )}
          </div>


          {/* Experience */}
          <div className="md:col-span-2">
            <div className="flex items-center">
              <h2 className="font-semibold">Experience</h2>
              {editingField !== "experience" && (
                <button
                  className="cursor-pointer"
                  onClick={() => setEditingField("experience")}
                >
                  <PencilLine size={20} className="ml-1.5" />
                </button>
              )}
            </div>
            {editingField === "experience" ? (
              <div className="mt-2 space-y-2">
                <TextArea
                  rows={5}
                  value={editedData.experience || ''}
                  onChange={(val) =>
                    setEditedData({ ...editedData, experience: val })
                  }
                />
                <div className="flex space-x-2">
                  <button
                    className="cursor-pointer"
                    onClick={() => handleSave("experience")}
                  >
                    {isUpdated ? <CastpointLoader /> : <Check color="white" />}
                  </button>
                  <button className="cursor-pointer" onClick={handleCancel}>
                    <X color="white" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-line mt-2 text-white/90">
                {user.experience}
              </p>
            )}
          </div>

          {/* Video */}
          {user.video_url && (
            <div className="md:col-span-2 mt-6">
              <h2 className="font-semibold mb-2">Video:</h2>
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full h-full rounded-xl border-2 border-white/20"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="User Video"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section >
  );
}
