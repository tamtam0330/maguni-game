import { useEffect } from 'react';
import useGameStageStore from '../store/gameStage';
import { scriptData } from '../../assets/gameScripts';
import '../../styles/modals.css';

const GameStartModal = () => {
    const { setModalOpen, setStage } = useGameStageStore();

    useEffect(() => {
        // 8초 후에 자동으로 모달 닫고 다음 단계로
        const timer = setTimeout(() => {
            setModalOpen(false);
            setStage('forbiddenWordSelection');
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>게임 시작</h2>
                <div className="goongye-message">
                    {scriptData.gameStart[0]}
                </div>
                <div className="timer">
                    <div className="progress-bar" />
                </div>
            </div>
        </div>
    );
};

export default GameStartModal; 