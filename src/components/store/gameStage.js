// useGameStageStore.js
import { create } from 'zustand'

const useGameStageStore = create((set) => ({
  isSessionActive: false,
  isGameActive: false,
  forbiddenWordCount: 0,
  transcript: '',
  interimTranscript: '',
  setIsSessionActive: (value) => set({ isSessionActive: value }),
  setIsGameActive: (value) => set({ isGameActive: value }),
  setForbiddenWordCount: (count) => set((state) => ({ 
    forbiddenWordCount: state.forbiddenWordCount + count 
  })),  // 여기를 수정
  setTranscript: (value) => set({ transcript: value }),
  setInterimTranscript: (value) => set({ interimTranscript: value }),
  resetGame: () => set({ 
    isGameActive: false,
    forbiddenWordCount: 0,
    transcript: '',
    interimTranscript: ''
  })
}))

export default useGameStageStore