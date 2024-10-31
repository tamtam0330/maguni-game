//전반적인 진행 상태 정보

// 방 정보 (roomId, 참가자 목록, 호스트 여부)
// 현재의 게임 단계 (홈화면, 대기실, 금칙어 설정 단계, 게임 진행 중, 피버타임, 결과화면)
// 타이머 상태(남은 시간)
// 게임 진행 시간 

// 게임 진행 관련 상태

//현재 금칙어 설정 대상자
//미션 정보
//채팅 메시지
//피버타임 상태
//게임 결과 데이터

// 플레이어 관련 상태

// 현재 플레이어 정보
// 각 플레이어 정보(닉네임, ID, 순서)
// 플레이어별 금칙어 목록
// 플레이어별 필터 상태
// 마이크 on, off 상태
// 보상 카드 보유 현황


import {create} from 'zustand';

export const Globalstore = create((set) => ({
    //전반적인 진행 상태 정보

    // 방 정보 (roomId, 참가자 목록, 호스트 여부)
    // 현재의 게임 단계 (홈화면, 대기실, 금칙어 설정 단계, 게임 진행 중, 피버타임, 결과화면)
    // 타이머 상태(남은 시간)
    // 게임 진행 시간 
    roomId: '',//is host 인경우, 아닌 경우에 따라서 다르게 
    curPlayerId:0,//host인 경우, 방만들기 하면 정해지고 서버에 아이디/방번호 보내기, 
    curPlayerNickname:'',//desktop2에서 설정
    gameStage: 'setting',//'waiting'|'playing'|'fever'|'breaktime'...페이지 이동시마다 달라짐

    setroomId:(val) =>set(()=>(val)),
    setCurPlayerId:(val) =>set(()=>(val)),
    setPlayerNickname: (val) =>set(()=>(val)),


    // 플레이어 관련 상태

    // 현재 플레이어 정보
    // 각 플레이어 정보(닉네임, ID, 순서)
    // 플레이어별 금칙어 목록
    // 플레이어별 필터 상태
    // 마이크 on, off 상태
    // 보상 카드 보유 현황
    currentPlayer:'',//desktop 6에서 버튼 클릭시, 브라우저에 저장
    isHost: false,//desktop 7에서 '방 만들기' 버튼 누를 때
    forbiddenWords:[null],
    mymission:[null],

    roomList : [],
    addPlayer:(val) => set((prev) =>({
        playerList: [...prev.playerList, {playerNum: (prev.playerList.length)+1, nickname:val}]
    }))

    // deletePlayer:(val) ;


    // 게임 진행 관련 상태

    //현재 금칙어 설정 대상자
    //미션 정보
    //채팅 메시지
    //피버타임 상태
    //게임 결과 데이터
}));

// // store.js
// import { create } from 'zustand'

// export const useChatStore = create((set, get) => ({
//   // 초기 상태
//   localUser: null,
//   room: null,
//   peers: new Map(),

//   // 로컬 스트림 설정
//   setLocalStream: (stream) => {
//     set((state) => ({
//       localUser: {
//         ...state.localUser,
//         stream,
//         isAudioEnabled: true,
//         isVideoEnabled: true
//       }
//     }));
//   },

//   // 오디오 토글
//   toggleAudio: () => {
//     const { localUser } = get();
//     if (!localUser?.stream) return;

//     localUser.stream.getAudioTracks().forEach(track => {
//       track.enabled = !track.enabled;
//     });

//     set((state) => ({
//       localUser: {
//         ...state.localUser,
//         isAudioEnabled: !state.localUser.isAudioEnabled
//       }
//     }));
//   },

//   // 비디오 토글
//   toggleVideo: () => {
//     const { localUser } = get();
//     if (!localUser?.stream) return;

//     localUser.stream.getVideoTracks().forEach(track => {
//       track.enabled = !track.enabled;
//     });

//     set((state) => ({
//       localUser: {
//         ...state.localUser,
//         isVideoEnabled: !state.localUser.isVideoEnabled
//       }
//     }));
//   },

//   // 참가자 추가
//   addParticipant: (user) => {
//     set((state) => ({
//       room: {
//         ...state.room,
//         participants: [...state.room.participants, user]
//       }
//     }));
//   },

//   // 참가자 제거
//   removeParticipant: (userId) => {
//     set((state) => ({
//       room: {
//         ...state.room,
//         participants: state.room.participants.filter(p => p.id !== userId)
//       }
//     }));
//   },

//   // 참가자 미디어 상태 업데이트
//   updateParticipantMedia: (userId, updates) => {
//     set((state) => ({
//       room: {
//         ...state.room,
//         participants: state.room.participants.map(p => 
//           p.id === userId ? { ...p, ...updates } : p
//         )
//       }
//     }));
//   },
  
//   // WebRTC 연결 관리
//   createPeerConnection: (userId) => {
//     const { peers } = get();
    
//     const peerConnection = new RTCPeerConnection({
//       iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' }
//       ]
//     });
    
//     peers.set(userId, peerConnection);
//     return peerConnection;
//   },
  
//   removePeerConnection: (userId) => {
//     const { peers } = get();
//     const peer = peers.get(userId);
    
//     if (peer) {
//       peer.close();
//       peers.delete(userId);
//     }
//   }
// }));

