import { useEffect } from 'react';
import useGameStageStore from '../store/gameStage';
import { scriptData } from '../../assets/gameScripts';

const FeverTimeModal = () => {
    const { setModalOpen, setStage } = useGameStageStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            setModalOpen(false);
            setStage('gameEnd');
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content fever-time">
                <h2>🔥 피버타임 시작 🔥</h2>
                <div className="goongye-message">
                    {scriptData.feverTime[0]}
                </div>
                <div className="timer">
                    <div className="progress-bar" />
                </div>
            </div>
        </div>
    );
};

export default FeverTimeModal; 