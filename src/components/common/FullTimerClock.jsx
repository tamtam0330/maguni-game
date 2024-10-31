import { useEffect } from "react";
import useStoreTime from "../store/gameInfoStore";
import useGameStageStore from "../store/gameStage";
import '../../styles/fulltimeclock.css'

const timerStyles = {
    container: {
        height:'48px',
        border: '2px solid black',
        background: 'white',
        padding: '10px 30px',
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#0066FF',
        display: 'inline-block',
        textShadow: '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black'
    }
};

const Timer = () => {
    const time = useStoreTime((state) => state.time);
    const decrementTime = useStoreTime((state) => state.decrementTime);
    
    // 게임 스테이지 스토어에서 모달/일시정지 상태 가져오기
    const isModalOpen = useGameStageStore((state) => state.isModalOpen);
    const isPaused = useGameStageStore((state) => state.isPaused);

    useEffect(() => {
        if (time === 0) {
            console.log("타이머 종료 이벤트 호출");
            return;
        }

        const timer = setInterval(() => {
            // 모달이 열려있거나 일시정지 상태가 아닐 때만 시간 감소
            if (!isModalOpen && !isPaused) {
                decrementTime();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [time, isModalOpen, isPaused, decrementTime]);

    const getSeconds = (time) => String(time % 60).padStart(2, '0');

    return (
        <div className="timer-container" style={timerStyles.container}>
            <div className="timer-box">
                <span className="timer-number">{parseInt(time / 60)}</span>
                <span className="timer-colon">:</span>
                <span className="timer-number">{getSeconds(time)}</span>
            </div>
        </div>
    );
};

export default Timer;