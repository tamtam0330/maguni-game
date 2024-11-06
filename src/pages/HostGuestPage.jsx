import axios from 'axios';
import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import useRoomStore from '../components/store/roomStore';
import { usePlayerStore } from '../components/store/playerStore';
import { io } from "socket.io-client";
import detectModelStore from '../components/store/faceDetectModel';
import { loadDetectionModel } from '../../filter/load-detection-model';

import '../styles/HostGuestPage.css'
import '../styles/beforeGameRoom.css'
import Profile from '../components/common/Profile';
import CommonButton from '../components/CommonButton';

const HostGuestPage = () => {
    const navigate = useNavigate();

    const setDetectModel = detectModelStore(state=>state.setDetectModel);

    //toggle 여부 상태 관리
    const [isToggled, setIsToggled] = useState(false);

    //username을 usePlayerStore에서 가져옴
    const username = usePlayerStore(state=>state.username)

    //roomcode, setRoomcode를 useRoomStore에서 가져옴
    const roomcode = useRoomStore(state=>state.roomcode)
    const setRoomcode = useRoomStore(state=>state.setRoomcode)

    const [isConnected, setIsConnected] = useState(false);

    const [role, setRole] = useState(null); // 역할 (host 또는 participant)

    const [socket, setSocket] = useState(null);

    const [userList, setUserList] = useState([]);

    const [generatedCode, setGeneratedCode] = useState(''); // 호스트용 코드 표시

    const Gotogameroompage = () => {
        navigate('/gameroom', { state: { roomcode:  role === 'host' ? generatedCode : roomcode, username: username,isHost:role==='host'?true:false }});
    }


    function connectToChatServer() {
        console.log('connectToChatServer');
        role==='host' ? createRoom() : joinRoom();
        const _socket = io('https://maguni-game-websocket1.onrender.com', {
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
            url: "https://main.maguni-game.com/room/api/v1",
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
            url: "https://main.maguni-game.com/member/participant/game/api/v1",
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

    function updateUserList(list) {
        setUserList(list);
    }

    useEffect(() => {   //소켓 별 이벤트 리스너
        console.log('useEffect called!');
        socket?.on('connect', onConnected); //서버랑 연결이 되면
        socket?.on('disconnect', onDisconnected); //서버로부터 연결이 끊어지면
        socket?.on('send user list', updateUserList);

        return () => {
        console.log('useEffect clean up function called!');
        socket?.off('connect', onConnected);
        socket?.off('disconnect', onDisconnected);
        };
    }, [socket]);


    // 역할이 변경될 때 코드를 생성하도록 수정
    useEffect(() => {
        if (role === 'host') {
        const code = generateRoomCode();
        setGeneratedCode(code);
        setRoomcode(code);
        }
    }, [role]);

// ====================================================== detect model load ====================================================== 
    useEffect(()=>{
        loadDetectionModel().then((model) => {
            setDetectModel(model);
        });
    })

  // generateRoomCode 함수 수정
    function generateRoomCode() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let code = '';
        for (let i = 0; i < 6; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
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
    <div className='beforeGameRoomBody'>
      <div className='game-title'>
        <h1>금칙어 게임</h1>
        <h5>Never, say The word</h5>
      </div>
      <div className='game-container'>
      {!isToggled ? (
        <div className='beforeToggleContainer'>
          {/* <h1>유저: {username}</h1> */}
          {/* <h1>방: {role === 'host' ? generatedCode : roomcode}</h1>
          <h3>접속상태: {isConnected ? "접속중" : "미접속"}</h3> */}
          <div className="hostGuestBtnContainer">
            {isConnected ? (
              <>
                <button onClick={disconnectBtnHandler}>접속종료</button>
              </>
            ) : (
              <>
                {role === 'host' ? (
                  <>
                    <Profile
                        role={"HOST"}
                        btnName={"접속하기"}
                        setRole={setRole}
                        withInput={true}
                        generatedCode={generatedCode}
                        generateRoomCode={generateRoomCode}
                        connectBtnHandler={connectBtnHandler}
                    />
                  </>
                ) : role === 'participant' ? (
                  <>
                    <Profile
                        role={"GUEST"}
                        btnName={"코드 입력"}
                        setRole={setRole}
                        withInput={true}
                        connectBtnHandler={connectBtnHandler}
                        roomcode={roomcode}
                        setRoomcode={setRoomcode}
                      />

                  </>
                ) : (
                  <div className='hostGuestProfileContainer'>
                    <div className='hostProfile'>
                      <Profile
                        role={"HOST"}
                        btnName={"방 만들기"}
                        setRole={setRole}
                      />
                    </div>
                    <div className='guestProfile'>
                      <Profile
                        role={"GUEST"}
                        btnName={"코드 입력"}
                        setRole={setRole}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="afterToggleContainer">
          <div className="connectedUserList">
              <Profile role={"HOST"} btnName={""} setRole={setRole}/>
              <div className="container mt-4">
                <div className="table table-bordered table-hover">
                  {userList.map((word, index) => (
                    <div className='player_info_container' key={index}>
                      <div className='player_number'>종{index + 1}품</div>
                      <div className='player_name'>{word.username}</div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
          <div className="startGameSection">
            <CommonButton className="startGameBtn" onClick={Gotogameroompage} text="시작하기"/>
          </div>
        </div>
      )}
      </div>
    </div>
 );
};


export default HostGuestPage
