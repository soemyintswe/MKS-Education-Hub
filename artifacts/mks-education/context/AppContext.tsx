import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "student" | "agent" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  studentId?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User> = {
  student: {
    id: "s001",
    name: "Aye Mya Thaw",
    email: "aye.mya@student.mks.edu",
    role: "student",
    studentId: "MKS-2024-001",
    phone: "+95 9 123 456 789",
  },
  agent: {
    id: "a001",
    name: "Ko Zin Min",
    email: "ko.zin@agent.mks.edu",
    role: "agent",
    phone: "+95 9 987 654 321",
  },
  admin: {
    id: "ad001",
    name: "U Kyaw Zin",
    email: "u.kyaw@mks.edu",
    role: "admin",
    phone: "+95 9 555 000 111",
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(DEMO_USERS.student);
  const [isLoading] = useState(false);
  const [activeRole, setActiveRoleState] = useState<UserRole>("student");

  const setUser = (u: User | null) => {
    setUserState(u);
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    setUserState(DEMO_USERS[role]);
    AsyncStorage.setItem("activeRole", role);
  };

  return (
    <AppContext.Provider value={{ user, setUser, isLoading, activeRole, setActiveRole }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
