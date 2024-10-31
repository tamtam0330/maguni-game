import {create} from 'zustand';
import {scriptData} from './gameScripts';
// import { duration } from 'html2canvas/dist/types/css/property-descriptors/duration';

//전체 시간
const useStoreTime = create((set) => ({
    time: 300, // 초기 시간 설정(5분)
    setTime: (newTime) => set({ time: newTime }),
    decrementTime: () => set((state) => ({ time: Math.max(state.time - 1, 0) })),
}));


const useGameStore = create((set) => ({
    // 각 단계의 기본 시간 (초 단위)
    stages: {
        gameStart:{duration:10,script:scriptData.gameStart[Math.floor(Math.random() * scriptData.gameStart.length)].text},
        forbiddenWordSelection: { duration: 20, script: scriptData.forbiddenWordSelection[Math.floor(Math.random() * scriptData.forbiddenWordSelection.length)].text },
        freeTalking: { duration: 120, script: scriptData.freeTalkStartAnnouncement[Math.floor(Math.random() * scriptData.freeTalkStartAnnouncement.length)].text },
        feverTime: { duration: 60, script: scriptData.feverTime[Math.floor(Math.random() * scriptData.feverTime.length)].text }
    },
    
    // 현재 단계 상태
    currentStage: 'gameStart', // 초기 단계
    sessionTime: 20, // 초기 남은 시간 (금칙어 선정 단계의 시간)
    currentScript: scriptData.gameStart[Math.floor(Math.random() * scriptData.gameStart.length)].text, // 초기 대사 스크립트

    // 단계 변경 함수
    setStage: (stage) => set((state) => ({
        currentStage: stage,
        sessionTime: state.stages[stage].duration,
        currentScript: state.stages[stage].script
    })),

    // 타이머 감소 함수
    decrementTime: () => set((state) => ({
        sessionTime: Math.max(state.sessionTime - 1, 0) // 시간 감소 (0 이하로 내려가지 않음)
    })),

    goToNextStage: () => set((state) => {
        const nextStage = state.currentStage === 'forbiddenWordSelection'
            ? 'freeTalking'
            : state.currentStage === 'freeTalking'
            ? 'feverTime'
            : null;

        if (nextStage) {
            return {
                currentStage: nextStage,
                sessionTime: state.stages[nextStage].duration,
                currentScript: state.stages[nextStage].script
            };
        }
        return state;
    })
}));

export default useStoreTime;