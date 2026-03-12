import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  mode: string;
}

interface ToolRecommendation {
  name: string;
  url: string;
  reason: string;
  icon?: string;
  alternatives?: string[];
}

interface PromptStore {
  user: User | null;
  token: string | null;
  mode: "student" | "marketing";
  currentPrompt: string;
  isStreaming: boolean;
  output: string;
  recommendedTool: ToolRecommendation | null;
  clarifyingQuestions: string[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setMode: (mode: "marketing" | "student") => void;
  setCurrentPrompt: (prompt: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setOutput: (output: string) => void;
  appendOutput: (chunk: string) => void;
  setRecommendedTool: (tool: ToolRecommendation | null) => void;
  setClarifyingQuestions: (questions: string[]) => void;
  logout: () => void;
}

export const useStore = create<PromptStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      mode: "student",
      currentPrompt: "",
      isStreaming: false,
      output: "",
      recommendedTool: null,
      clarifyingQuestions: [],
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setMode: (mode) => set({ mode }),
      setCurrentPrompt: (currentPrompt) => set({ currentPrompt }),
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      setOutput: (output) => set({ output }),
      appendOutput: (chunk) => set((state) => ({ output: state.output + chunk })),
      setRecommendedTool: (recommendedTool) => set({ recommendedTool }),
      setClarifyingQuestions: (clarifyingQuestions) => set({ clarifyingQuestions }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "promptpilot-store",
      partialize: (state) => ({ user: state.user, token: state.token, mode: state.mode }),
    }
  )
);
