import {useEffect, useState} from 'react'

import { joinSession,subscribers,leaveSession } from '../../openvidu/app_openvidu.js';
import '../styles/gameroompage.css'
import StatusBar from '../components/layout/StatusBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import useRoomStore from '../components/store/roomStore.js';
import {usePlayerStore}  from '../components/store/players.js';

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

    // 음성인식 관련 상태
    const [count, setCount] = useState(0);
    const [isStoppedManually, setIsStoppedManually] = useState(false);

 

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
                    // 금칙어 카운트
                    const word = "아니";
                    const occurrences = (transcript.match(new RegExp(word, 'g')) || []).length;
                    setCount(prev => prev + occurrences);
                    const countElement = document.getElementById('count');
                    if (countElement) {
                        countElement.innerText = `"아니" 카운트: ${count + occurrences}`;
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
            setIsStoppedManually(false);
            recognition.start();
        };

        const handleStop = () => {
            setIsStoppedManually(true);
            recognition.stop();
            setCount(0);
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
    }, [count, isStoppedManually]);

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
                    <div id="main-video" className="col-md-6">
                        <p></p><div className="webcam-container" style={{ position: 'relative', height: videoSize.height, width: videoSize.width }}>
                            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                                <video id = "myVideo" autoPlay playsInline width={videoSize.width} height={videoSize.height}></video>

                            </div>
                            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                                {/* <canvas ref={canvasRef} width={videoSize.width} height={videoSize.height} className="filter-canvas"></canvas> */}

                            </div>
                        </div>
                        <p className="status">{status}</p>

                        <div style={{ margin: '10px' }}>
                            {/* <button onClick={startFiltering}>필터 시작</button> */}
                            <button id="startButton">게임 시작</button>
                            <button id="stopButton" disabled>게임 종료</button>
                            <div id="count">금칙어(아니) 카운트: 0</div>
                        </div>
                    </div>
                    <div id="video-container" className="col-md-6">
                    </div>
                    
                    <div className="gameroom-sidebar">
                        <div className="sidebar_wordlist">
                            <div className="sidebar_index">금칙어 목록</div>
                            <div className="sidebar_content">
                                {players.map((player, index) => (
                                    <div className="user-wordlist" key={index}>
                                    <span>{player.nickname}</span>
                                    <div>{player.words[0]}</div>
                                </div> 
                                ))}
                            </div>
                        </div >
                        <div className="sidebar_mymission">
                            <div className="sidebar_index">나의 미션</div>
                            <div className="sidebar_content">sdf</div>
                        </div>
                        <div className="sidebar_goongye">
                            <div className="sidebar_index">진행자</div>
                            <div className="sidebar_content">sdf</div>
                        </div>
                    </div>
                    <div id="subtitles" style={{
                    }}>
                        자막
                    </div>
                </div>
            </div>
            <Footer username={username} roomcode={roomcode}/>
            <footer className="footer">
            </footer>
        </>
    );
};

export default GameRoomPage;