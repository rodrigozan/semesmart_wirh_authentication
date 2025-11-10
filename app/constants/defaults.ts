import { UserData } from "../types";

export const defaultUserData: UserData = {
  goals: [],
  transactions: [],
  members: [],
  cards: [],
  challenges: [],
  hasSeenOnboarding: false,
  familyProfile: {
    name: "Minha Família",
    createdAt: new Date().toISOString(),
  },
};
