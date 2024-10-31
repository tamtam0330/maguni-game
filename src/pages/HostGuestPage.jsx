import axios from 'axios';
import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import useRoomStore from '../components/store/roomStore';
import { usePlayerStore } from '../components/store/players';
import { io } from "socket.io-client";

const HostGuestPage = () => {
  const navigate = useNavigate();

  //toggle 여부 상태 관리
  const [isToggled, setIsToggled] = useState(false);

  //username을 usePlayerStore에서 가져옴
  const username = usePlayerStore(state=>state.username)

  //roomcode, setRoomcode를 useRoomStore에서 가져옴
  const roomcode = useRoomStore(state=>state.roomcode)
  const setRoomcode = useRoomStore(state=>state.setRoomcode)

  const Gotogameroompage = () => {
    navigate('/gameroom', { state: { roomcode:  role === 'host' ? generatedCode : roomcode, username: username,isHost:role==='host'?true:false }});
  }

  const [isConnected, setIsConnected] = useState(false);


  // const [roomcode, setroomcode] = useState('');

  const [role, setRole] = useState(null); // 역할 (host 또는 participant)

  const [socket, setSocket] = useState(null);

  const [forbiddenWord, setForbiddenWord] = useState('');

  const [forbiddenWords, setForbiddenWords] = useState([]);

  const [generatedCode, setGeneratedCode] = useState(''); // 호스트용 코드 표시

  function connectToChatServer() {
    console.log('connectToChatServer');
    role==='host' ? createRoom() : joinRoom();
    const _socket = io('http://localhost:3000', {
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

  function createRoom() {
    return axios({
        method: "POST",
        url: "http://localhost:3001/room/api/v1",
        data: {
            "roomCode": generatedCode,
            "nickname": username,
        },
    }).then((res)=>{
        console.log(res.data['success'])
    }).catch((err)=>{
        console.log(err)
    })
}

function joinRoom() {
  return axios({
      method: "POST",
      url: "http://localhost:3001/member/participant/game/api/v1",
      data: {
          "roomCode": roomcode,
          "nickname": username,
      },
  }).then((res)=>{
      console.log(res.data['success'])
  }).catch((err)=>{
      console.log(err)
  })
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
    setRoomcode(code);
    return code;
  }

  //접속하기 누르면, toggle상태 바뀌고, chatserver에 커넥트 되게 함 
  function connectBtnHandler() {
    connectToChatServer();
    setIsToggled(true);
  }

  function disconnectBtnHandler() {
    disconnectToChatServer();
    window.location.reload();
  }
  
  ///////////////////////////////////////////////////////

  return (
    <>
      {!isToggled ? (
        <div className='beforeToggleContainer'>
          <h1>유저: {username}</h1>
          <h1>방: {role === 'host' ? generatedCode : roomcode}</h1>
          <h3>접속상태: {isConnected ? "접속중" : "미접속"}</h3>
          <div className="Card">
            {isConnected ? (
              <>
                <button onClick={disconnectBtnHandler}>접속종료</button>
              </>
            ) : (
              <>
                {role === 'host' ? (
                  <>
                    <input
                      value={generatedCode || generateRoomCode()}
                      readOnly
                      placeholder="방 코드 (자동 생성됨)"
                    />
                    <button onClick={connectBtnHandler}>접속하기</button>
                  </>
                ) : role === 'participant' ? (
                  <>
                    <input
                      value={roomcode}
                      onChange={(e) => setRoomcode(e.target.value.toUpperCase())}
                      placeholder="방 코드를 입력하세요"
                    />
                    <button onClick={connectBtnHandler}>접속하기</button>
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
      ) : (
        <div className="afterToggleContainer">
          <div className="connectedUserList">
            <div>
              <div className="container mt-4">
                <h3>접속자 목록</h3>
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">유저</th>
                      {/* <th scope="col"></th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {forbiddenWords.map((word, index) => (
                      <tr key={index}>
                        <th scope="row">{index + 1}</th>
                        <td>{word.username}</td>
                        {/* <td>{word.forbiddenword}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="startGameSection">
            <button onClick={Gotogameroompage}>게임 시작하기</button>
          </div>
        </div>
      )}
    </>
 );
};


export default HostGuestPage
