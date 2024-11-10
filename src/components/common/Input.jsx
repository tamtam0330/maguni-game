import { useState, useEffect } from 'react';
import '../../styles/input.css';
import axios from 'axios';
import PropTypes from 'prop-types'; 
import { UsePlayerStore } from '../store/playerStore';

function Input({ username, roomcode, showInput }) {
  const [inputValue, setInputValue] = useState('');
  const [getCode, setGetCode] = useState('');
  const [gamers, setGamers] = useState([]);
  const [playerlist, setPlayerlist] = useState([]);
  const [index, setIndex] = useState(-1);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const insertWord = () => {
    setInputValue('');
    return axios({
      method: 'POST',
      url: 'https://maguni-game-92g6.onrender.com/member/api/v1/word',
      data: {
        roomCode: roomcode,
        nickname: index !== 0 ? playerlist[index - 1] : playerlist[playerlist.length - 1],
        word: inputValue,
      },
    })
      .then((res) => {
        return getWords();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getWords = () => {
    return axios({
      method: 'GET',
      url: `https://maguni-game-92g6.onrender.com/member/api/v1/word/${roomcode}/${username}`,
    })
      .then((res) => {
        setGetCode(res.data[0][0]);
        return getPlayersInfo();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getPlayersInfo = () => {
    return axios({
      method: 'GET',
      url: `https://maguni-game-92g6.onrender.com/member/api/v1/word/${roomcode}`,
    })
      .then((res) => {
        setGamers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getPlayersInfo();
  }, []);

  useEffect(() => {
    setPlayerlist(gamers.map((gamer) => gamer.nickname));
    const currentIndex = gamers.findIndex((gamer) => gamer.nickname === username);
    setIndex(currentIndex);
  }, [gamers, username]);


const handleSubmit = (e) => {
    e.preventDefault(); // 폼 기본 동작 방지
    if (inputValue.trim()) { // 입력값이 있을 때만 전송
        insertWord();
    }
};

return (
    <>
        <p>{index !=0? playerlist[index-1]: playerlist[playerlist.length-1]} 마구니의 금칙어를 입력하거라!</p>
        <form onSubmit={handleSubmit} className={`input-group ${showInput ? 'blinking-border' : ''}`} style={{ margin: '10px 0' }}>
            <input 
                type="text"
                className="form-control"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="메시지를 입력하세요"
            />
            <button 
                type="submit"
                className="sendBtn btn btn-primary"
            >
                완료
            </button>
        </form>
    </>
);
}

Input.propTypes = {
  username: PropTypes.string.isRequired,
  roomcode: PropTypes.string.isRequired,
  showInput: PropTypes.bool.isRequired, // Make showInput required
};

export default Input;