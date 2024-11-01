import { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import './App.css';

function GameSocket() {
  const [username, setUsername] = useState('');
  const [roomcode, setRoomCode] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setplayers] = useState([]);
  const [forbiddenWordCount, setForbiddenWordCount] = useState({});

  // 음성인식 관련 상태
  const [isStoppedManually, setIsStoppedManually] = useState(false);

  const forbiddenWordlist = [
    { username: '1', forbiddenWord: '야' },
    { username: '2', forbiddenWord: '안녕' },
    { username: '3', forbiddenWord: '뭐' },
    { username: '4', forbiddenWord: '팀장' },
  ];

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
    _socket.on('participant list', (users) => {
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
          const word = forbiddenWordlist.find(word => word.username === username)?.forbiddenWord;
          console.log(word)
          const occurrences = (transcript.match(new RegExp(word, 'g')) || []).length;
          console.log(occurrences)
          handleForbiddenWordUsed(occurrences);
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
  }, [forbiddenWordCount, isStoppedManually, isConnected]);

  return (
    <div className="App">
      <h1>방 접속 페이지</h1>
      {isConnected ? (
        <>
          <button onClick={disconnectFromRoom}>방 나가기</button>
          <h2>참가자 목록:</h2>
          <ul>
            {players.map(user => (
              // user !== username && ( // 자신이 아닌 경우에만 표시
                <li key={user}>
                  {user} - {forbiddenWordlist.find(word => word.username === user)?.forbiddenWord || '금칙어 없음'}
                  - 금칙어 카운트: {forbiddenWordCount[user] || 0}
                </li>
              // )
            ))}
          </ul>

          <button id="startButton">게임 시작</button>
          <button id="stopButton" disabled>게임 종료</button>
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
      ) : (
        <>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="사용자 이름"
          />
          <input
            value={roomcode}
            onChange={e => setRoomCode(e.target.value)}
            placeholder="방 코드"
          />
          <button onClick={connectToRoom}>방에 접속하기</button>
        </>
      )}
    </div>
  );
}

export default GameSocket;
