// useGameStageStore.js
import { create } from 'zustand'
// 게임 진행 중 사용될 대사(스크립트) 데이터 import
import {scriptData} from '../../assets/gameScripts';
// import { duration } from 'html2canvas/dist/types/css/property-descriptors/duration';

const useGameStageStore = create((set, get) => ({

    // 각 단계의 기본 시간 (초 단위)와 궁예의 대사를 정의
    stages: {
      // 1. 게임 시작 단계: 참가자들이 입장하고 게임 규칙을 안내
      gameStart: {
          duration: 10,  // 10초 동안 진행
          // gameStart 대사 목록에서 무작위로 하나를 선택
          script: scriptData.gameStart[Math.floor(Math.random() * scriptData.gameStart.length)].text
      },

      // 2. 금칙어 선정 단계: 각 플레이어의 금칙어가 정해짐
      forbiddenWordSelection: { 
          duration: 20,  // 20초 동안 진행
          // forbiddenWordSelection 대사 목록에서 무작위로 하나를 선택
          script: scriptData.forbiddenWordSelection[Math.floor(Math.random() * scriptData.forbiddenWordSelection.length)].text
      },

      // 3. 자유 대화 단계: 메인 게임 진행
      freeTalking: { 
          duration: 120,  // 120초(2분) 동안 진행
          // freeTalkStartAnnouncement 대사 목록에서 무작위로 하나를 선택
          script: scriptData.freeTalkStartAnnouncement[Math.floor(Math.random() * scriptData.freeTalkStartAnnouncement.length)].text
      },

      // 4. 피버타임 단계: 점수가 2배가 되는 마지막 단계
      feverTime: { 
          duration: 60,  // 60초(1분) 동안 진행
          // feverTime 대사 목록에서 무작위로 하나를 선택
          script: scriptData.feverTime[Math.floor(Math.random() * scriptData.feverTime.length)].text
      }
  },
  
  // 모달 상태 추가
  isModalOpen: false,
  isPaused: false,  // 타이머 일시정지 상태

  // 현재 게임 상태 관리
  currentStage: 'gameStart',  // 초기 단계를 'gameStart'로 설정
  sessionTime: 20,  // 현재 단계의 남은 시간 (초기값: 20초)
  currentScript: scriptData.gameStart[Math.floor(Math.random() * scriptData.gameStart.length)].text,  // 현재 표시할 궁예의 대사

  // 모달 상태 제어 함수
  setModalOpen: (isOpen) => set((state) => ({
      isModalOpen: isOpen,
      isPaused: isOpen  // 모달이 열리면 자동으로 일시정지
  })),

  // 타이머 일시정지 제어 함수
  setPaused: (isPaused) => set({ isPaused }),

  // 타이머 감소 함수 수정
  decrementTime: () => set((state) => {
      // 일시정지 상태면 시간을 감소시키지 않음
      if (state.isPaused || state.isModalOpen) {
          return state;
      }
      return {
          sessionTime: Math.max(state.sessionTime - 1, 0)
      };
  }),

  // 게임 단계를 변경하는 함수
  // @param {string} stage - 변경할 게임 단계 ('gameStart', 'forbiddenWordSelection', 'freeTalking', 'feverTime')
  setStage: (stage) => set((state) => ({
      currentStage: stage,  // 새로운 단계로 변경
      sessionTime: state.stages[stage].duration,  // 해당 단계의 제한 시간으로 초기화
      currentScript: state.stages[stage].script  // 해당 단계의 궁예 대사로 변경
  })),



  // 현재 단계가 끝나면 자동으로 다음 단계로 넘어가는 함수
  goToNextStage: () => set((state) => {
      // 현재 단계에 따라 다음 단계를 결정
      const nextStage = state.currentStage === 'forbiddenWordSelection'
          ? 'freeTalking'  // 금칙어 선정 단계가 끝나면 자유 대화 단계로
          : state.currentStage === 'freeTalking'
          ? 'feverTime'  // 자유 대화 단계가 끝나면 피버타임 단계로
          : null;  // 그 외의 경우 다음 단계 없음

      // 다음 단계가 존재하는 경우에만 상태 업데이트
      if (nextStage) {
          return {
              currentStage: nextStage,  // 다음 단계로 변경
              sessionTime: state.stages[nextStage].duration,  // 새로운 단계의 시간으로 초기화
              currentScript: state.stages[nextStage].script  // 새로운 단계의 대사로 변경
          };
      }
      return state;  // 다음 단계가 없으면 현재 상태 유지
  })
}))

export default useGameStageStore