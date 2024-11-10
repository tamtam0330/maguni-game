import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import saveAs from "file-saver";
// 프레임들
import BasicFrame from "../assets/images/photo_frame/frame1.png";
import GoongYeFrame from "../assets/images/photo_frame/frame2.png";
import YeomjuFrame from "../assets/images/photo_frame/frame3.png";
// import image_prac from "../assets/images/profile_images/one.png";
import axios from "axios";
import { useLocation } from "react-router-dom";
import '../styles/fourcut.css'
import CommonButton from "../components/CommonButton";
import {useNavigate} from 'react-router-dom';
import WallImage from '../assets/images/endPage_bgImage.webp';


const FourCut = () => {
    const navigate = useNavigate();
    const divRef = useRef(null);
    const [showModal, setShowModal] = useState(true); // 초기에 모달 표시
    const [selectedFrame, setSelectedFrame] = useState(null);
    // const [imageList, setImageList] = useState([image_prac, image_prac, image_prac, image_prac]);
    const [imageList, setImageList] = useState([]);
    const location = useLocation();
    const roomCode = location.state.roomCode;

    // 프레임 옵션
    const frameOptions = [
        { id: 'frame1', image: BasicFrame, name: '기본 프레임' },
        { id: 'frame2', image: GoongYeFrame, name: '궁예 프레임' },
        { id: 'frame3', image: YeomjuFrame, name: '염주 안대 프레임' }
    ];

    // 서버에서 이미지 가져오기
    const fetchImages = async () => {
        try {
            const response = await axios.get(`https://maguni-game-92g6.onrender.com/upload/api/v1/${roomCode}`);
            setImageList(response.data);
        } catch (error) {
            console.error("이미지 로딩 실패:", error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // 이미지 다운로드
    const handleDownload = async () => {
        if (!divRef.current) return;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
            date.getHours()
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
            2,
            "0"
        )}:${String(date.getSeconds()).padStart(2, "0")}`;

        try {
            const canvas = await html2canvas(divRef.current, {     
                scale: 2,
                useCORS: true, 
            });
            canvas.toBlob((blob) => {
                if (blob) {
                    saveAs(blob, `${formattedDate}.png`);
                }
            });
        } catch (error) {
            console.error("이미지 변환 실패:", error);
        }
    };  



    function quitGame() {
        navigate('/');
        window.location.reload();
    }

    return (
        <div className="wallImage" style={{backgroundImage: `url(${WallImage})`}}>
            {/* 프레임 선택 모달 */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>프레임을 선택해주세요</h2>
                        <div className="frame-options">
                            {frameOptions.map((frame) => (
                                <div
                                    key={frame.id}
                                    className="frame-option"
                                    onClick={() => {
                                        setSelectedFrame(frame.id);
                                        setShowModal(false);
                                    }}
                                >
                                    <img src={frame.image} alt={frame.name} />
                                    <p>{frame.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 메인 콘텐츠 */}
            {!showModal && (
                <>
                    <div className="frame-container-wrapper">
                        <div
                            ref={divRef}
                            className="frame-container"
                            style={{
                                backgroundColor: "white",
                                width: "1200px",
                                height: "600px",
                                position: "relative",
                                margin: 0
                            }}
                        >
                            {/* 선택된 프레임 표시 */}
                            <img
                                src={frameOptions.find(f => f.id === selectedFrame)?.image}
                                alt="프레임"
                                className="frame-image"
                            />

                            {/* 이미지 그리드 */}
                            <div className="image-grid">
                                {imageList.slice(0, 4).map((image, index) => (
                                    <div
                                        key={index}
                                        className="image-container"
                                        style={{
                                            position: "absolute",
                                            ////이미지 컨테이너/////
                                            width: "428px",
                                            height: "256px",
                                            //////////////////////
                                            ...getImagePosition(index, selectedFrame)
                                        }}
                                    >
                                        <img
                                            src={`https://maguni-game-92g6.onrender.com/photos/${image}`}
                                            // src={image}
                                            alt={`사진 ${index + 1}`}
                                            style={{
                                                width: "428px",
                                                height: "256px",
                                                objectFit: "cover"
                                            }}
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="button-container">
                        <button 
                            className="changeFrameBtn" 
                            onClick={() => setShowModal(true)}
                        >
                            프레임 변경
                        </button>
                        <button 
                            className="downloadBtn" 
                            onClick={handleDownload}
                        >
                            이미지 다운로드
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// 이미지 위치 계산 함수
const getImagePosition = (index, frameType) => {
    const positions = {
        frame1: [
            { top: "30px", left: "60px" },
            { top: "30px", right: "265px" },
            { bottom: "30px", left: "265px" },
            { bottom: "30px", right: "60px" }
        ],
        frame2: [
            { top: "30px", left: "60px" },
            { top: "30px", right: "265px" },
            { bottom: "30px", left: "265px" },
            { bottom: "30px", right: "60px" }
        ],
        frame3: [
            { top: "30px", left: "60px" },
            { top: "30px", right: "265px" },
            { bottom: "30px", left: "265px" },
            { bottom: "30px", right: "60px" }
        ]
    };

    return positions[frameType]?.[index] || positions.frame1[index];
};

export default FourCut;