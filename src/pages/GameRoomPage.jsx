import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import '../styles/gameroompage.css'

// 레이아웃 import
import StatusBar from '../components/layout/StatusBar.jsx';
import Input from '../components/common/Input.jsx';
import Footer from '../components/layout/Footer.jsx';
import PlayerWordCard from '../components/common/PlayerWordCard.jsx';
// 모달 import
import ForbiddenWordlistModal from '../components/modals/ForbiddenWordlistModal.jsx';
import SettingForbiddenWordModal from '../components/modals/goongYeForbiddenwordModal.jsx';
import GoongYeAnouncingEndModal from '../components/modals/goongYeAnouncingEndModal.jsx';
import GoongYeAnouncingGameEndModal from '../components/modals/GoongYeAnouncingGameEndModal.jsx';

// 스토어 import
import useRoomStore from '../components/store/roomStore.js';
import { UsePlayerStore } from '../components/store/playerStore.js';
import { useModalStore } from '../components/store/modalStore.js';

// 오픈비두 관련 import
import { joinSession } from '../../openvidu/app_openvidu.js';
import html2canvas from "html2canvas";
import Goon from "../assets/images/goongYeImage.webp";

import StartSound from '../assets/bgm/game_start.wav'; 


// 다른 모달에서 사용하는 이미지들도 import

import { Context } from '../../IntroMusicContainer';
import { useContext } from 'react';

const GameRoomPage = () => {
    const navigate = useNavigate();
    //username, roomcode를 가져옴
    const username = UsePlayerStore(state => state.username)
    const roomcode = useRoomStore(state => state.roomcode)
    const playerNumber = UsePlayerStore(state => state.userIndex) + 1;
    const userRole = UsePlayerStore(state => state.userRole)

    const { setIsPlay } = useContext(Context);

    // console.log(playerNumber);

    //게임진행 소켓 상태관리
    const [socket, setSocket] = useState(null);
    const [participantList, setParticipantList] = useState([]); //유저네임 리스트
    const [forbiddenWordCount, setForbiddenWordCount] = useState({}); //유저별 금칙어 사용횟수
    //DB에서 가져온 유저별 금칙어 리스트
    const [forbiddenWordlist, setForbiddenWordlist] = useState([]);
    // 음성인식 관련 상태
    const [isStoppedManually, setIsStoppedManually] = useState(false); //수동 종료
    //소켓에서 받아온 금칙어 횟수 리스트
    const [finalCountList, setFinalCountList] = useState([]);
    //모달 관련 상태
    const { modals, setModal } = useModalStore();
    //사이드바에 금칙어 보이는 여부
    const [isWordsShown, setIsWordsShown] = useState(false);

    const [timer, setTimer] = useState(20); // 타이머 상태
    // 금칙어 설정 후 말하는 시간
    const startTime = 120
    const [gameActive, setGameActive] = useState(false); // 게임 활성화 상태

    const hasJoinedSession = useRef(false);

    //이미지 프리로딩 상태
    const [imagesPreloaded, setImagesPreloaded] = useState(false);

    // Input 컴포넌트 표시 여부 상태
    const [showInput, setShowInput] = useState(false);

    // 사진용 div
    const divRef = useRef(null);

    const handlePenalty = () => {
        // Emit an event that the filter should display for 2 seconds
        console.log('penalty');
        const event = new CustomEvent('startPenaltyFilter');
        window.dispatchEvent(event);
    };

    function quitGame() {
        navigate('/');
        window.location.reload();
    }




    // ========================== 금칙어 설정 완료 ================
    // DB에서 유저별 금칙어 리스트 가져오기 => forbiddenWordlist
    const getPlayersInfo = () => {
        return axios({
            method: "GET",
            url: `https://maguni-game-92g6.onrender.com/member/api/v1/word/${roomcode}`,
        }).then((res) => {
            setForbiddenWordlist(res.data)
        }).catch((err) => {
            console.log(err)
        })
    };

    // 금칙어 설정 후 게임 시작하게 하는 함수
    function startGame() {
        // 게임 시작 요청
        socket.emit('start game', roomcode, startTime);
        setGameActive(true);
        setTimer(startTime); // 타이머 초기화
        document.getElementById('startButton').click();
    }
    //===========================금칙어 안내 모달 창 띄우기===========================
    const forbiddenwordAnouncement = async () => {
        try {
            // 먼저 플레이어 리스트 가져오기
            await getPlayersInfo();
            // 데이터를 가져온 후 모달 창 띄우기
            setModal('FW', true);
            setShowInput(false);

            // Promise를 사용하여 타이머 완료를 기다림
            await new Promise(resolve => {
                setTimeout(() => {
                    setModal('FW', false);
                    resolve(); // 타이머 완료 후 Promise 해결
                }, 5000);
            });

            // 모달이 완전히 닫힌 후에 사이드바에 금칙어 표시
            setIsWordsShown(true);

            // 금칙어 안내가 끝난 후 1초 뒤에 자동으로 게임 시작
            setTimeout(() => {
                document.getElementById('startgame').click();
                //startGame();
            }, 1000);

        } catch (error) {
            console.error('금칙어 안내 모달 창 띄우기 오류:', error);
        }
    };

    //===========================금칙어 설정하기---> 5초 안내 후 20초 설정단계 ===========================
    const startSettingForbiddenWord = () => {
        socket.emit('start setting word', roomcode);
    };

    const testPenalty = () => {
        handlePenalty();
    }

    // ====================================================== 게임 소켓 서버 API ====================================================== 
    function connectToRoom() {

        const _socket = io('https://maguni-game-websocket2.onrender.com', {
            autoConnect: false,
            query: {
                username,
                roomcode,
            }
        });
        _socket.connect();
        setSocket(_socket);

        //update 유저 리스트 
        _socket.on('participant list', (users) => {
            setParticipantList(users);
        });

        //update 금칙어 count list
        _socket.on('update forbidden word count', (countlist) => {
            setForbiddenWordCount(countlist);
        });

        // 타이머 업데이트
        _socket.on('timer update', (time) => {
            setTimer(time);
        });
        // 게임 종료 처리
        _socket.on('game ended', (finalCounts) => {
            setGameActive(false);
            setModal('goongYeAnnouncingResult', true);
            setFinalCountList(finalCounts);
            document.getElementById('stopButton').click();
        });

        _socket.on('setting word ended', () => {
            
            forbiddenwordAnouncement();
        });

        // 금칙어 설정 안내 모달 열기
        _socket.on('open instruction modal', async () => {
            setModal('SettingForbiddenWordModal', true);
            setShowInput(true);
            // 오디오 파일 재생
            const audio = new Audio(StartSound);
            audio.play();

            // 타이머 초기화 (모달이 열릴 때)
            setTimer(20);

            // 모달이 닫히기를 기다림
            await new Promise(resolve => setTimeout(resolve, 12000));
            setModal('SettingForbiddenWordModal', false);
        });

        _socket.on('hit user', (user) => {
            if (user !== username) {
                return;
            }
            handlePenalty();
        });

        _socket.on('take a picture', (user) => {
            if (user == username) {
                console.log("사진찍힘")
                sendImage()
            }
        })

    }

    const handleForbiddenWordUsedCount = (occurrences) => {
        console.log("금칙어 사용- count", occurrences);
        socket.emit('forbidden word used count', username, occurrences);
    };

    const handleForbiddenWordUsedHit = () => {
        console.log("금칙어 사용 - hit");
        socket.emit('forbidden word used hit', username);
    };

    useEffect(() => {
        // 타이머 기능
        if (gameActive && timer > 0) {
            const countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(countdown);
        } else if (timer === 0) {
            socket.emit('end game', roomcode); // 타이머가 끝나면 게임 종료 요청
        }
    }, [gameActive, timer]);


    // ====================================================== take photos ====================================================== 
    const sendImage = () => {
        const date = new Date();
        const nowtime = `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}-${String(date.getSeconds()).padStart(2, "0")}`;
        if (divRef.current) {
            html2canvas(divRef.current).then(canvas => {
                const imageData = canvas.toDataURL("image/png");
                // 서버에 이미지 데이터 전송
                axios.post("https://maguni-game-92g6.onrender.com/upload/api/v1",
                    {
                        image: imageData,
                        filename: `${roomcode}_${nowtime}.png`
                    }
                ).then(response => {
                    console.log("Image saved on server:", response.data);
                })
                    .catch(error => {
                        console.error("Error saving image:", error);
                    });
            });
        }
    };

    // ====================================================== detect model load ====================================================== 
    useEffect(() => {
        if (!hasJoinedSession.current) {
            joinSession(roomcode, username);
            connectToRoom();
            hasJoinedSession.current = true;
        }
    }, [])


    // ====================================================== 음성인식 ====================================================== 
    useEffect(() => {
        let recognition = null;

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = 'ko-KR';
            recognition.continuous = true;
            recognition.interimResults = true;

            const handleStart = () => {
                setIsStoppedManually(false);
                recognition.start();
            };

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
                    const word = forbiddenWordlist.find(e => e.nickname === username)?.words;

                    if (result.isFinal) {
                        finalTranscript += transcript + ' ';
                        // 금칙어 카운트 수정

                        if (word) {
                            const occurrences = (transcript.match(new RegExp(word, 'g')) || []).length;
                            if (occurrences > 0) {
                                handleForbiddenWordUsedCount(occurrences);
                            }
                        }
                    } else {
                        interimTranscript += transcript + ' ';

                        if (word) {
                            const occurrences = (transcript.match(new RegExp(word, 'g')) || []).length;
                            if (occurrences > 0) {
                                handleForbiddenWordUsedHit();
                            }
                        }
                    }
                }

                const transcriptElement = document.getElementById('subtitles');
                if (transcriptElement) {
                    transcriptElement.innerText = finalTranscript + interimTranscript;
                }
            };

            const handleStop = () => {
                setIsStoppedManually(true);
                // startButton.disabled = false;
                // stopButton.disabled = true;
                recognition.stop();
            };

            recognition.onend = () => {
                console.log('녹음이 종료되었습니다.');
                if (!isStoppedManually) {
                    console.log('자동으로 음성 인식 재시작');
                    recognition.start();
                }
            };

            // 버튼
            const startButton = document.getElementById('startButton');
            const stopButton = document.getElementById('stopButton');
            startButton?.addEventListener('click', handleStart);
            stopButton?.addEventListener('click', handleStop);

            recognition.onerror = (event) => {
                console.error('음성 인식 오류:', event.error);
                if (event.error !== 'no-speech') {
                    recognition.stop();
                    recognition.start();
                }
            };

            // Clean up 함수 수정
            return () => {
                if (recognition) {
                    recognition.stop();
                    recognition.onend = null;
                    recognition.onresult = null;
                    recognition.onerror = null;
                    recognition.onstart = null;
                }

                const startButton = document.getElementById('startButton');
                const stopButton = document.getElementById('stopButton');
                if (startButton) startButton.removeEventListener('click', handleStart);
                if (stopButton) stopButton.removeEventListener('click', handleStop);
            };
        } catch (error) {
            console.error('음성 인식 초기화 오류:', error);
        }
    }, [forbiddenWordlist, isStoppedManually, username, socket]);


    // ====================================================== return ====================================================== 
    return (
        <>
            <StatusBar username={username} sessionTime={timer} playerNumber={playerNumber} />
            <div id="main-container" className="container">
                {/* ---------- 대기실 2 ----------*/}
                <div id="join">
                </div>
                {/* ---------- Join - 게임 ----------*/}
                <div id="session" style={{ display: 'none' }}>
                    <div id="session-body">
                        <div className="main-content">
                            <div className="test_button_container">
                                <>
                                    <button id="penaltyTestButton" onClick={testPenalty} style={{ display: 'none' }}>벌칙 테스트</button>
                                    <button id="startButton" style={{ display: 'none' }}>음성인식시작</button>
                                    <button id="stopButton" style={{ display: 'none' }} disabled>음성 인식 종료</button>
                                    <button id="startgame" onClick={startGame} style={{ display: 'none' }} disabled={gameActive}>게임 시작</button>
                                    <div className="time-remained">
                                        남은 시간: {timer}초
                                    </div>
                                    {/* <div id="subtitles">자막</div> */}
                                </>
                            </div>
                            <div id="video-container" className="col-md-6" ref={divRef}>
                            </div>
                        </div>
                        <div className="gameroom-sidebar">
                            <div>
                                {userRole === "host" ? (
                                    <button className="commonButton settingWordsButton" onClick={startSettingForbiddenWord}>금칙어 설정하기</button>
                                ) : (
                                    <button className="guestWaitingBtn" disabled>호스트가 게임을 시작하기를 기다리세요</button>
                                )}
                            </div>
                            <div className="sidebar_wordlist">
                                <div className="sidebar_index">금칙어 목록</div>
                                <div className="sidebar_content">
                                    <div className="player-cards-container">
                                        {isWordsShown && participantList
                                            .filter(user => user !== username)
                                            .map((user, index) => {
                                                // 원래 플레이어의 인덱스 찾기
                                                const originalPlayerIndex = participantList.findIndex(p => p === user);
                                                return (
                                                    <PlayerWordCard
                                                        key={user}
                                                        user={user}
                                                        words={forbiddenWordlist.find(e => e.nickname === user)?.words}
                                                        count={forbiddenWordCount[user]}
                                                        playerIndex={originalPlayerIndex}
                                                    />
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                            <div className="sidebar_mymission ">
                                <div className="sidebar_index">나의 미션</div>
                                <div className="sidebar_content">
                                    <div className="footer-input">
                                        <Input
                                            username={username}
                                            roomcode={roomcode}
                                            participantList={participantList}
                                            setParticipantList={setParticipantList}
                                            showInput={showInput}
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="sidebar-btn">
                                <input
                                    className="btn btn-large btn-danger"
                                    type="button"
                                    id="buttonLeaveSession"
                                    onClick={quitGame}
                                    value="나가기"
                                />
                            </div>

                            {/* <div className="sidebar_goongye">
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
                            </div> */}
                        </div>
                    </div>
                </div>
                {modals.FW && (
                    <ForbiddenWordlistModal
                        participantList={participantList}
                        forbiddenWordlist={forbiddenWordlist}
                        onClose={() => setModal('FW', false)}
                    />)}
                {modals.SettingForbiddenWordModal && (
                    <SettingForbiddenWordModal
                        onClose={() => setModal('SettingForbiddenWordModal', false)}
                    />
                )}
                {modals.goongYeAnouncingEnd && (
                    <GoongYeAnouncingEndModal onClose={() => {
                        setModal('goongYeAnnouncingEnd', false);
                        setShowInput(false); // 모달 종료 시 Input 숨기기
                    }} />
                )}
                {modals.goongYeAnnouncingResult && (
                    <GoongYeAnouncingGameEndModal
                        finalCounts={finalCountList}
                        onClose={() => {
                            setModal('goongYeAnnouncingResult', false);
                            setTimeout(() => {
                                setIsPlay(false);
                                navigate('/end', {
                                    state: {
                                        result: finalCountList,
                                        words: forbiddenWordlist,
                                        roomCode: roomcode,
                                        username: username
                                    }
                                });
                                window.location.reload();
                            }, 3000);
                        }}
                    />
                )}
            </div>
        </>
    );
}

export default GameRoomPage