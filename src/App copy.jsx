import { useState, useEffect, useRef } from 'react'
import './App.css'

//
import { io } from "socket.io-client";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  const [username, setUsername] = useState('');

  const [roomcode, setroomcode] = useState('');

  const [role, setRole] = useState(null); // 역할 (host 또는 participant)

  const [socket, setSocket] = useState(null);

  const [forbiddenWord, setForbiddenWord] = useState('');

  const [forbiddenWords, setForbiddenWords] = useState([]);

  const [generatedCode, setGeneratedCode] = useState(''); // 호스트용 코드 표시

  function connectToChatServer() {
    console.log('connectToChatServer');
    const _socket = io('http://192.168.0.186:3000', {
      autoConnect: false,
      query: {
        username: username,
        role: role,
        roomnumber: role === 'host' ? generatedCode : roomcode,
      }
    });
    _socket.connect();
    setSocket(_socket);
  }

  function disconnectToChatServer() {
    console.log('disconnectToChatServer');
    socket?.disconnect();
  }

  function onConnected() {
    console.log('프론트 - onConnected');
    setIsConnected(true);
  }

  function onDisconnected() {
    console.log('프론트 - onDisconnected');
    setIsConnected(false);
  }

  function forbiddenWordRecieved(word) {
    setForbiddenWord(word);
  }

  function updateforbiddenWordList(list) {
    setForbiddenWords(list);
  }

  useEffect(() => {   //소켓 별 이벤트 리스너
    console.log('useEffect called!');
    socket?.on('connect', onConnected); //서버랑 연결이 되면
    socket?.on('disconnect', onDisconnected); //서버로부터 연결이 끊어지면
    socket?.on('forbidden word', forbiddenWordRecieved); //금칙어 지정
    socket?.on('forbidden word list', updateforbiddenWordList);

    return () => {
      console.log('useEffect clean up function called!');
      socket?.off('connect', onConnected);
      socket?.off('disconnect', onDisconnected);
    };
  }, [socket]);


  // 6자리 랜덤 코드 생성 함수
  function generateRoomCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    setGeneratedCode(code);
    return code;
  }



  return (
    <>

      <div className='Navbar'>
        <h1>유저: {username}</h1>
        <h1>방: {role === 'host' ? generatedCode : roomcode}</h1>
        <h3>접속상태: {isConnected ? "접속중" : "미접속"}</h3>
        <div className="Card">
          {/* 접속 상태에 따라 입력 필드와 버튼 표시 */}
          {isConnected ? (
            <>
              <button onClick={disconnectToChatServer}>접속종료</button>
            </>
          ) : (
            <>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="사용자 이름을 입력하세요"
              />
              {role === 'host' ? (
                <>
                  <input
                    value={generatedCode || generateRoomCode()}
                    readOnly
                    placeholder="방 코드 (자동 생성됨)"
                  />
                  <button onClick={connectToChatServer}>접속하기</button>
                </>
              ) : role === 'participant' ? (
                <>
                  <input
                    value={roomcode}
                    onChange={(e) => setroomcode(e.target.value.toUpperCase())}
                    placeholder="방 코드를 입력하세요"
                  />
                  <button onClick={connectToChatServer}>접속하기</button>
                </>
              ) : (
                <>
                  <button onClick={() => setRole('host')}>호스트로 접속</button>
                  <button onClick={() => setRole('participant')}>참가자로 접속</button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="split-container">
        <div className="left-section">
          <li className='welcome-message'>금칙어 게임에 오신것을 환영합니다!</li>
        </div>
        <div className="right-section">
          <div>
            <div className="container mt-4">
              <h3>금칙어 목록</h3>
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">유저</th>
                    <th scope="col">금칙어</th>
                  </tr>
                </thead>
                <tbody>
                  {forbiddenWords.map((word, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{word.username}</td>
                      <td>{word.forbiddenword}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
