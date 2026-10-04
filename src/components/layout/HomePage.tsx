"use client";

import CastpointLoader from "../ui/loader";

import { useAuth } from "../../context/AuthContext";
import { useEmployerAuth } from "../../context/EmployerAuthContext";

import React from "react";

import MainLayout from "../../layouts/MainLayout";

import AuthenticatedHome from "./AuthenticatedHome";
import EmployerHome from "../employer/EmployerHome";

import LandingPage from "../home/LandingPage";

export default function HomePage() {
  const {
    user,
    isLogged: isArtistLogged,
    isLoading: isArtistLoading,
  } = useAuth();

  const {
    employer,
    isLogged: isEmployerLogged,
    isLoading: isEmployerLoading,
  } = useEmployerAuth();

  if (isArtistLoading || isEmployerLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-6 px-6 py-20 bg-paper">
          <CastpointLoader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {isArtistLogged && user ? (
        <AuthenticatedHome />
      ) : isEmployerLogged && employer ? (
        <EmployerHome />
      ) : (
        <LandingPage />
      )}
    </MainLayout>
  );
}