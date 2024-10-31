import React, { useState, useEffect } from "react";
import MainSingleVideo from '../common/MainSingleVideo'
import MissionCard from '../common/MissionCard'
import SideElement from '../common/SideElement'
import UserBannedWords from '../common/UserBannedWords'
import useStoreTime from "../store/gameInfoStore";
import useScriptStore from "../store/gameScripts";
import useGameStore from "../store/gameInfoStore";

import goongYeImage from '../../assets/images/goongYeImage.png'
import GoongYeCmtSec from '../goongYeCmtSec'

import "../../styles/Main.css"

// 모달 컴포넌트 예시
const Modal = ({ isOpen, onClose, children }) => {

    if (!isOpen) return null;

    // 모달 바깥을 클릭하면 닫히게 처리
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

const Main = () => {
    const { currentStage, sessionTime, currentScript, goToNextStage, decrementTime } = useGameStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const time = useStoreTime((state) => state.time);
    const [showModal, setShowModal] = useState(false);

    const getScriptByStage = useScriptStore((state) => state.getScriptByStage); // 대사 스크립트 함수 가져오기
    const gameStartScript = getScriptByStage("gameStart"); // gameStart 대사 가져오기
    const forbiddenWordSelection = getScriptByStage("forbiddenWordSelection"); // forbiddenWordSelection 배열 가져오기
    const gameEndScript = getScriptByStage("gameEnd");

    // step "1"에 해당하는 대사 찾기
    const step1Script = forbiddenWordSelection.find(item => item.step === "1").text;

    useEffect(() => {
        if (time === 0) {
            setShowModal(true); // time이 0일 때 모달을 표시
        }
    }, [time]);

    // 페이지가 로드되면 모달을 자동으로 열도록 설정
    useEffect(() => {
        setIsModalOpen(true);
    }, []);

    // 금칙어 데이터
    const bannedWordsData = {
        woogi: ["개꿀따리"],
        naPPayeom: ["뭐요"],
        taemtaem: ["마라여"]
    }
    //내 미션
    const myMisson = "naPPayeom이 머리만지게 하기"

    // 모달 닫기 함수
    const closeModal = () => {
        setIsModalOpen(false);
    };

  return (
    <>
            {/* 모달이 열렸을 때만 표시 */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
            <img className="goongYeImage" src={goongYeImage} alt="goongYe"/>
                <h2>{gameEndScript}</h2>
            </Modal>

            {/* 모달이 열렸을 때만 표시 */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <img className="goongYeImage" src={goongYeImage} alt="goongYe"/>
                <h2>{gameStartScript[0]}</h2>
            </Modal>

            {/* 모달이 열렸을 때 흐리게 보이는 배경 처리 */}
            <div className={`main ${isModalOpen ? "blur-background" : ""}`}>
                <div className="Main-videos">
                    <MainSingleVideo />
                </div>
                <div className="Main-sideSection">
                    {/* 금칙어 목록 */}
                    <SideElement title="금칙어 목록">
                        <UserBannedWords number="1" nickname="woogi" bannedWords={bannedWordsData.woogi} />
                        <UserBannedWords number="2" nickname="naPPayeom" bannedWords={bannedWordsData.naPPayeom} />
                        <UserBannedWords number="3" nickname="taemtaem" bannedWords={bannedWordsData.taemtaem} />
                    </SideElement>
                    {/* 나의 목록 */}
                    <SideElement title="나의 미션">
                        <MissionCard missonContent={myMisson} />
                    </SideElement>
                    {/* 진행자 */}
                    <SideElement className="goongYeSection">
                        <>
                            <img className="goongYeImage" src={goongYeImage} alt="goongYe"/>
                            {/* 진행자 스크립트로 gameStart의 첫 번째 대사 출력 */}
                            <GoongYeCmtSec text = {step1Script}/>
                        </>
                    </SideElement>
                </div>
            </div>
        </>
  )
}

export default Main