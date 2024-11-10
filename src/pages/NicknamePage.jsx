import { useNavigate } from 'react-router-dom';
import { UsePlayerStore } from '../components/store/playerStore';
import '../styles/nicknamePageInput.css'
import nextButton from '../assets/images/nextButton.png'
import {nicknames} from "../assets/utils/nicknames.js"
import GameLayout from '../components/layout/GameLayout';

const NicknamePage = () => {
    const navigate = useNavigate();
    const username = UsePlayerStore(state=>state.username);
    const setUsername = UsePlayerStore(state=>state.setUsername);
  
    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            console.log("유저네임: "+username);
            navigate('/hostguest');
        }
    };

    const createNickName = (e) => {
        e.preventDefault();
        const randomIndex = Math.floor(Math.random() * nicknames.nicknameList.length);
        const nickname = nicknames.nicknameList[randomIndex];
        setUsername(nickname);
    }

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length <= 10) {
            setUsername(value);
        }
    };
  
    return (
        <GameLayout>
            <form className='nicknameInputContainer' onSubmit={handleSubmit}>
                <input 
                    className='nicknameInput'
                    type="text"
                    value={username||""}
                    onChange={handleInputChange}
                    placeholder="사용자 이름을 입력하세요 (최대 10글자)"
                    maxLength={10}
                />
                <img 
                    src={nextButton} 
                    alt="다음" 
                    onClick={handleSubmit}
                    className='nextButton'
                />
            </form>
            <div className='nicknameRandomBtnContainer'>
                <a 
                    className='nicknameRandomBtn' 
                    onClick={createNickName}
                >
                    랜덤 닉네임 생성하기
                </a>
            </div>
        </GameLayout>
    );
}

export default NicknamePage;



