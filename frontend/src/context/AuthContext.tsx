"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: string;
  githubConnected: boolean;
  bio?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (userData: Partial<UserProfile>) => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  isLoading: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: "usr_1",
  username: "akhilaammulu",
  name: "Akhila Gadipally",
  email: "akhila@example.com",
  avatarUrl: "https://github.com/akhilaammulu.png",
  plan: "Pro",
  githubConnected: true,
  bio: "Full Stack Developer building DevPilot with Java 21, Spring Boot, GraphQL, and Next.js.",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("devpilot-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(DEFAULT_USER);
      }
    } else {
      setUser(DEFAULT_USER);
      localStorage.setItem("devpilot-user", JSON.stringify(DEFAULT_USER));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      ...userData,
    };
    setUser(newUser);
    localStorage.setItem("devpilot-user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("devpilot-user");
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem("devpilot-user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
