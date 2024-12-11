import { create } from 'zustand';

type AuthStore = {
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isSignInModalOpen: false,
  openSignInModal: () => set({ isSignInModalOpen: true }),
  closeSignInModal: () => set({ isSignInModalOpen: false }),
}));
