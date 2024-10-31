//그외에 추가해서 구현할 점

//호스트가 게임 시작하기 누르면, 타이머 시작됨
//다만 모달 뜨는 순간만 타이머 멈춤

import { useEffect, useState } from "react";
import useStoreTime from "../store/gameInfoStore";
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

const getSeconds = (time) => {
    const seconds = Number(time % 60);
    if(seconds < 10) {
        return "0" + String(seconds);
    } else {
        return String(seconds);
    }
}

const Timer = ({ isModalOpen }) => {
    const time = useStoreTime((state) => state.time);
    const decrementTime = useStoreTime((state) => state.decrementTime);

    useEffect(() => {
        if (time === 0) {
            console.log("타이머 종료 이벤트 호출");
            return;
        }

        const timer = setInterval(() => {
            if (!isModalOpen) {
                decrementTime();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [time, isModalOpen, decrementTime]);

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