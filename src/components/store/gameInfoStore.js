
// Zustand 상태 관리 라이브러리 import
import {create} from 'zustand';


// 게임의 전체 시간을 관리하는 store
const useStoreTime = create((set) => ({
    // 게임 전체 진행 시간을 5분(300초)으로 설정
    time: 300,
    
    // 전체 시간을 새로운 값으로 설정하는 함수
    // @param {number} newTime - 설정할 새로운 시간 값
    setTime: (newTime) => set({ time: newTime }),
    
    // 매 초마다 전체 시간을 감소시키는 함수
    // 시간이 0 이하로 내려가지 않도록 Math.max 사용
    decrementTime: () => set((state) => ({ time: Math.max(state.time - 1, 0) })),
}));



// 전체 시간 관리 store를 외부에서 사용할 수 있도록 export
export default useStoreTime;
