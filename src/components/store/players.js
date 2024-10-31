import {create} from 'zustand';

// 플레이어 관련 상태

//db에 있는것
//금칙어 목록, 미션, 보물상자

// 현재 플레이어 정보
// 각 플레이어 정보(닉네임, ID, 순서)
// 플레이어별 금칙어 목록
// 플레이어별 필터 상태
// 마이크 on, off 상태
// 인풋상자 활성화 여부

export const usePlayerStore = create((set) => ({
    
    // 현재 플레이어 닉네임값/설정하기
    username:'',
    setUsername: (newUsername) => set({ username: newUsername }),

    //플레이어 리스트
    //플레이어 리스트 예시 형식
    players: [],
    setPlayers: (newPlayers) => set({ players: newPlayers }),

    

}))

