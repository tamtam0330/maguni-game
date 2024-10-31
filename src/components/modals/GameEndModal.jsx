import { useEffect } from 'react';
import useGameStageStore from '../store/gameStage';
import { scriptData } from '../../assets/gameScripts';

const GameEndModal = () => {
    const { setModalOpen } = useGameStageStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            setModalOpen(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>게임 종료</h2>
                <div className="goongye-message">
                    {scriptData.gameEnd[0]}
                </div>
                <div className="result-message">
                    {scriptData.forbiddenWordReveal[0]}
                </div>
                <div className="timer">
                    <div className="progress-bar" />
                </div>
            </div>
        </div>
    );
};

export default GameEndModal; 