import { useEffect } from 'react';
import useGameStageStore from '../store/gameStage';
import { scriptData } from '../../assets/gameScripts';

const FreeTalkingModal = () => {
    const { setModalOpen, setStage } = useGameStageStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            setModalOpen(false);
            setStage('feverTime');
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>자유 대화 시작</h2>
                <div className="goongye-message">
                    {scriptData.freeTalkStartAnnouncement[
                        Math.floor(Math.random() * scriptData.freeTalkStartAnnouncement.length)
                    ]}
                </div>
                <div className="timer">
                    <div className="progress-bar" />
                </div>
            </div>
        </div>
    );
};

export default FreeTalkingModal; 