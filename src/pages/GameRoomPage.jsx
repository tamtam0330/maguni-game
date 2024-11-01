import {useEffect, useState} from 'react'
import io from 'socket.io-client';

import { joinSession } from '../../openvidu/app_openvidu.js';
import '../styles/gameroompage.css'
import StatusBar from '../components/layout/StatusBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import useRoomStore from '../components/store/roomStore.js';
import {usePlayerStore}  from '../components/store/playerStore.js';
import IMG from "../../src/assets/images/dish.png"

const GameRoomPage = () => {
const videoSize ={
    width : 640,
    height:480
}  
    //store 상태관리

    //username을 usePlayerStore에서 가져옴
    const username = usePlayerStore(state=>state.username)
    //roomcode를 useRoomStore에서 가져옴
    const roomcode = useRoomStore(state=>state.roomcode)
    //players를 usePlayerStore에서 가져옴
    const players = usePlayerStore(state=>state.players)
    const setPlayers = usePlayerStore(state=>state.setPlayers)

    //게임진행 관련 소켓 상태관리
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [forbiddenWordCount, setForbiddenWordCount] = useState({});

    // 음성인식 관련 상태

    const [isStoppedManually, setIsStoppedManually] = useState(false);

    //플레이어 목록에서 자신을 제외한 목록 생성
    const [currentPlayers, setCurrentPlayers] = useState([]);
    const [myIndex, setMyIndex] = useState(-1);

    // forbiddenWordlist를 players 배열에서 생성하는 로직 추가
    const [forbiddenWordlist, setForbiddenWordlist] = useState([]);


    // const [state, setState] = useState("Initializing...");
// ================================================================================================================
function draw() {
    const videoContainer = document.getElementById("video-container");
    if (!videoContainer) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoSize.width;
    canvas.height = videoSize.height;
    canvas.style.position = "absolute";
    canvas.style.top = videoContainer.offsetTop + "px";
    canvas.style.left = videoContainer.offsetLeft + "px";
    canvas.style.zIndex = "10";
    const ctx = canvas.getContext("2d");
    ctx.font = "12px serif";
    ctx.fillText(players[myIndex].nickname, 10, 50);
    videoContainer.parentNode.insertBefore(canvas, videoContainer.nextSibling);
  }
function getforbiddenword() {
    const videoContainer = document.getElementById("video-container");
    if (!videoContainer) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoSize.width;
    canvas.height = videoSize.height;
    canvas.style.position = "absolute";
    canvas.style.top = videoContainer.offsetTop + "px";
    canvas.style.left = videoContainer.offsetLeft + "px";
    canvas.style.zIndex = "10";
    const ctx = canvas.getContext("2d");
    ctx.font = "40px serif";
    ctx.fillText(players[myIndex].words[0], 400,50);
    videoContainer.parentNode.insertBefore(canvas, videoContainer.nextSibling);
  }

// 비디오에 벌칙 캔버스
function beolchick() {
    // video-container 요소를 찾음
    const videoContainer = document.getElementById("video-container");
    
    // video-container가 없으면 함수 종료
    if (!videoContainer) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoSize.width;
    canvas.height = videoSize.height;
    canvas.style.position = "absolute";
    canvas.style.top = videoContainer.offsetTop + "px";
    canvas.style.left = videoContainer.offsetLeft + "px";
    canvas.style.zIndex = "10";
    
    // 부모 요소에 canvas 추가
    videoContainer.parentNode.insertBefore(canvas, videoContainer.nextSibling);
    
    const img = new Image();
    img.src = IMG; // 이미지 소스 설정
    const WIDTH = 280;
    const HEIGHT = 120;
    let yPosition = -HEIGHT; // 시작 위치는 캔버스 위쪽 바깥
    const targetY = videoSize.height / 2 - HEIGHT / 2; // 목표 위치 (중앙)
    
    const ctx = canvas.getContext("2d");
    
    img.onload = () => {
        // 애니메이션 함수 정의
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
            
            // 현재 위치에 이미지 그리기
            ctx.drawImage(img, WIDTH/2,yPosition-200, WIDTH, HEIGHT); // 수평 중앙 정렬
            
            // 목표 위치까지 이동
            if (yPosition < targetY) {
                yPosition += 5; // 속도 조절 (숫자가 커질수록 빨라짐)
                requestAnimationFrame(animate); // 다음 프레임 요청
            } else {
                // 목표에 도달하면 멈춤
                setTimeout(() => {
                    canvas.remove(); // 2초 후에 캔버스 제거
                }, 1500);
            }
        }
        
        animate(); // 애니메이션 시작
    };
    
}

// ================================================================================================================
    useEffect(() => {
        // players 배열의 각 플레이어에 대해 금칙어 리스트 생성
        const newForbiddenWordlist = players.map((player, index) => ({
            username: index.toString(), // players 배열의 인덱스를 문자열로 변환
            forbiddenWord: player.words[0] // 각 플레이어의 첫 번째 금칙어 사용
        }));
        setForbiddenWordlist(newForbiddenWordlist);
    }, [players]); // players가 변경될 때마다 실행

    function connectToRoom() {
        const _socket = io('http://13.124.180.166:3002', {
          autoConnect: false,
          query: {
            username,
            roomcode,
          }
        });
        _socket.connect();
        setSocket(_socket);
        setIsConnected(true);
    
        // 참가자 목록 업데이트
        _socket.on('players', (users) => {
          setPlayers(users);
        });
    
        // 금칙어 사용 카운트 업데이트
        _socket.on('update forbidden word count', (countlist) => {
          console.log(countlist);
          setForbiddenWordCount(countlist);
        });
      }
    
      function disconnectFromRoom() {
        socket?.disconnect();
        setIsConnected(false);
        setPlayers([]);
        setForbiddenWordCount({});
      }
    
      const handleForbiddenWordUsed = (occurrences) => {
        socket.emit('forbidden word used', username, occurrences);
      };



    //금칙어 목록에서 자신의 금칙어를 제외한 목록 생성
    useEffect(() => {
        // playerlist에서 자신의 인덱스 찾기
        const myIdx = players.findIndex(player => player.nickname === username);
        setMyIndex(myIdx);

        // 자신을 제외한 플레이어 목록 생성
        if (myIdx !== -1) {
            const filteredPlayers = players.filter((_, index) => index !== myIdx);
            setCurrentPlayers(filteredPlayers);
        }
    }, [players, username]);

    //gamesocket 연결 및 음성인식 관련 코드
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
    
        recognition.lang = 'ko-KR';
        recognition.continuous = true;
        recognition.interimResults = true;
    
        recognition.onstart = () => {
          console.log('녹음이 시작되었습니다.');
          document.getElementById('startButton').disabled = true;
          document.getElementById('stopButton').disabled = false;
        };
    
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
    
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
    
            if (result.isFinal) {
              finalTranscript += transcript + ' ';
              // 금칙어 카운트 수정
              const myPlayerIndex = players.findIndex(player => player.nickname === username);
              const word = forbiddenWordlist.find(word => word.username === myPlayerIndex.toString())?.forbiddenWord;
              
              console.log('현재 사용자:', username);
              console.log('찾은 금칙어:', word);
              console.log('현재 발화:', transcript);
              
              if (word) {
                  const occurrences = (transcript.match(new RegExp(word, 'g')) || []).length;
                  console.log('금칙어 발생 횟수:', occurrences);
                  if (occurrences > 0) {
                      handleForbiddenWordUsed(occurrences);
                  }
              }
            } else {
              interimTranscript += transcript + ' ';
            }
          }
    
          const transcriptElement = document.getElementById('subtitles');
          if (transcriptElement) {
            transcriptElement.innerText = finalTranscript + interimTranscript;
          }
        };
    
        recognition.onend = () => {
          console.log('녹음이 종료되었습니다.');
          if (!isStoppedManually) {
            console.log('자동으로 음성 인식 재시작');
            recognition.start();
          }
        };
    
        recognition.onerror = (event) => {
          console.error('음성 인식 오류:', event.error);
          if (event.error !== 'no-speech') {
            recognition.stop();
            recognition.start();
          }
        };
    
        // 버튼 이벤트 설정
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
    
        const handleStart = () => {
          console.log("시작");
          setIsStoppedManually(false);
          recognition.start();
        };
    
        const handleStop = () => {
          setIsStoppedManually(true);
          recognition.stop();
          setForbiddenWordCount(0);
          const countElement = document.getElementById('count');
          if (countElement) {
            countElement.innerText = `"아니" 카운트: 0`;
          }
          startButton.disabled = false;
          stopButton.disabled = true;
        };
    
        startButton?.addEventListener('click', handleStart);
        stopButton?.addEventListener('click', handleStop);
    
        // Clean up
        return () => {
          recognition.stop();
          startButton?.removeEventListener('click', handleStart);
          stopButton?.removeEventListener('click', handleStop);
        };
      }, [forbiddenWordCount, isStoppedManually, isConnected]);
// ================================================================================================================
    return (
        <>
            <StatusBar/>
            <div id="main-container" className="container">
                <div id="join">
                    <div id="join-dialog" className="jumbotron vertical-center">
                        <h1>Join a video session</h1>
                        <form className="form-group" onSubmit={(e) => {
                            e.preventDefault();  // 기본 제출 동작 방지
                            joinSession();
                        }}>
                            <p>
                                <label>Participant</label>
                                <input className="form-control" type="text" id="userName" required defaultValue={username} />
                            </p>
                            <p>
                                <label>Session</label>
                                <input className="form-control" type="text" id="sessionId" required defaultValue={roomcode} />
                            </p>
                            <p className="text-center">
                                <input className="btn btn-lg btn-success" type="submit" name="commit" value="Join!" />
                            </p>
                        </form>
                    </div>
                </div>

                <div id="session" style={{ display: 'none' }}>
                    <div id="session-header">
                        <h1 id="session-title"></h1>
                    </div>
                    <div id="session-body">
                        <div className="main-content">
                            <div id="main-video" className="col-md-6">
                                <p></p><div className="webcam-container" style={{ position: 'relative', height: videoSize.height, width: videoSize.width }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                                        <video id = "myVideo" autoPlay playsInline width={videoSize.width} height={videoSize.height}></video>

                                    </div>
                                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                                        {/* <canvas ref={canvasRef} width={videoSize.width} height={videoSize.height} className="filter-canvas"></canvas> */}

                                    </div>
                                </div>
                                <div className="App">
                                    <h1>방 접속 페이지</h1>
                                        <>
                                            <button onClick={connectToRoom}>게임시작하기</button>
                                            <button onClick={disconnectFromRoom}>방 나가기</button>
                                            <h2>참가자 목록:</h2>
                                            <ul>
                                                {players.map((player, index) => (
                                                    <li key={player.nickname}>
                                                        {player.nickname} - {forbiddenWordlist.find(word => word.username === index.toString())?.forbiddenWord || '금칙어 없음'}
                                                        - 금칙어 카운트: {forbiddenWordCount[player.nickname] || 0}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button id="startButton">음성인식 시작</button>
                                            <button id="stopButton" disabled>음석 인식 종료</button>
                                            <button id="beolchick" onClick={beolchick}>벌칙</button>
                                            <button id="draw" onClick={draw}>이름</button>
                                            <button id="getforbiddenword" onClick={getforbiddenword}>금칙어</button>
                                            {/* <div id="count">금칙어(아니) 카운트: {forbiddenWordCount[username] || 0}</div> */}
                                            <div
                                                id="subtitles"
                                                style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                color: 'white',
                                                background: 'rgba(0, 0, 0, 0.7)',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                fontSize: '18px',
                                                zIndex: 1000,
                                                }}
                                            >
                                                자막
                                            </div>
                                        </>
                                </div>
                            </div>
                            <div id="video-container" className="col-md-6">
                            </div>
                        </div>
                        
                        <div className="gameroom-sidebar">
                            <div className="sidebar_wordlist">
                                <div className="sidebar_index">금칙어 목록</div>
                                <div className="sidebar_content">
                                    <table className="user-wordlist-table">
                                        <tbody>
                                            {currentPlayers.map((player, index) => (
                                                <tr key={index}>
                                                    <td>{player.nickname}</td>
                                                    <td>{player.words[0]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="sidebar_mymission">
                                <div className="sidebar_index">나의 미션</div>
                                <div className="sidebar_content">
                                    <table className="user-wordlist-table">
                                        <tbody>
                                            <tr>
                                                <td>미션 내용</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="sidebar_goongye">
                                <div className="sidebar_index">진행자</div>
                                <div className="sidebar_content">
                                    <table className="user-wordlist-table">
                                        <tbody>
                                            <tr>
                                                <td>진행자 정보</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer username={username} roomcode={roomcode}/>
        </>
    );
};

export default GameRoomPage;