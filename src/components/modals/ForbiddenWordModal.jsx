import { useEffect } from 'react';
import useGameStageStore from '../store/gameStage';
import { scriptData } from '../../assets/gameScripts';
import { usePlayerStore } from '../store/players';

const ForbiddenWordModal = () => {
    const { setModalOpen, setStage } = useGameStageStore();
    const username = usePlayerStore(state => state.username);
    const players = usePlayerStore(state => state.players);

    useEffect(() => {
        const timer = setTimeout(() => {
            setModalOpen(false);
            setStage('freeTalking');
        }, 8000);

        return () => clearTimeout(timer);
    }, []);

    const currentPlayer = players.find(player => player.nickname === username);
    const forbiddenWord = currentPlayer?.words[0] || '금칙어 없음';

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>금칙어 확인</h2>
                <div className="goongye-message">
                    {scriptData.forbiddenWordSelection[0].text}
                </div>
                <div className="forbidden-word-box">
                    <h3>당신의 금칙어</h3>
                    <div className="word">{forbiddenWord}</div>
                </div>
                <div className="timer">
                    <div className="progress-bar" />
                </div>
            </div>
        </div>
    );
};

export default ForbiddenWordModal; 