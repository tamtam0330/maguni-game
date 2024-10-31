import { useState, useEffect } from 'react';
import '../../styles/input.css'
import axios from 'axios';
import PropTypes from 'prop-types'; 
import { usePlayerStore } from '../store/players';


function Input({username, roomcode}) {

//상태관리: inputvlaue, getcode
const [inputValue, setInputValue] = useState('');
const [getCode,setGetCode] = useState('');
const setPlayers = usePlayerStore(state=>state.setPlayers)

useEffect(() => {
  console.log(getCode)
}, [getCode]);

//
const handleInputChange = (e) => {
    setInputValue(e.target.value);
};
//자신의 금칙어를 쓰고나서 "전송버튼"누르면 서버에 그 정보를 보내고, getwords(참가자들의 금칙어)를 가져오는 함수를 호출
const insertWord = ()=>{
    return axios({
        method: "POST",
        url: "http://localhost:3001/member/api/v1/word",
        data: {
            "roomCode": roomcode,
            "nickname": username,
            "word": inputValue
        },
    }).then((res)=>{
        console.log(res.data['success'])
        return getWords();
    }).catch((err)=>{
        console.log(err)
    })
}

//참가자들의 금칙어를 가져오는 함수
const getWords = ()=>{
    return axios({
        method: "GET",
        url: `http://localhost:3001/member/api/v1/word/${roomcode}/${username}`,
    }).then((res)=>{
        // console.log(res.data[0][0])
        setGetCode(res.data[0][0])
        return getPlayersInfo();
        // setGetCode(prevGetCode => […prevGetCode, 'sk']);
    }).catch((err)=>{
        console.log(err)
    })
}

//참가자들의 정보들을 전부 가져오는 함수
const getPlayersInfo = ()=>{
    return axios({
        method: "GET",
        url: `http://localhost:3001/member/api/v1/word/${roomcode}`,
    }).then((res)=>{
        // console.log("players  :", res.data[0].words[0])
        setPlayers(res.data);
    }).catch((err)=>{
        console.log(err)
    })
}

return (
  <div className="input-group" style={{ margin: '10px 0' }}>
      <input 
          type="text"
          className="form-control"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="메시지를 입력하세요"
      />
      <button 
          className="btn btn-primary"
          onClick={insertWord}
          style={{ marginLeft: '5px' }}
      >
          전송
      </button>
  </div>
);
}
// PropTypes 정의 추가
Input.propTypes = {
    username: PropTypes.string.isRequired,
    roomcode: PropTypes.string.isRequired
};



export default Input;