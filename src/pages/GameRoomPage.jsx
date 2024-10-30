import { useEffect, useRef, useState } from "react";
import { joinSession, leaveSession } from '../../openvidu/app_openvidu.js';
import { useLocation } from 'react-router-dom';
import { calculateFilterPosition } from "../../filter/calculate-filter-position.ts";
import { loadDetectionModel } from "../../filter/load-detection-model.js";

const videoSize = {
    width: 640,
    height: 480,
};


const GameRoomPage = () => {
    const location = useLocation();
    const username = location.state?.username;
    const roomcode = location.state?.roomcode;
    console.log(username, roomcode);

    const canvasRef = useRef(null);
    const initialLoadedRef = useRef(false);
    const [status, setStatus] = useState("Initializing...");

    const estimateFacesLoop = (model, image, ctx) => {
        const videoElement = document.getElementById('myVideo');
    
        if (!videoElement) {
            console.log("취소됨");
            return;
        }
    
        model.estimateFaces(videoElement).then((face) => {
            ctx.clearRect(0, 0, videoSize.width, videoSize.height);
    
            if (face[0]) {
                const { x, y, width, height, angle } = calculateFilterPosition(face[0].keypoints);
    
                ctx.save(); // 현재 캔버스 상태 저장
                ctx.translate(x + width / 2, y + height / 2); // 필터의 중심으로 이동
                ctx.rotate(angle); // 얼굴 각도에 맞춰 회전
                ctx.drawImage(image, -width / 2, -height / 2, width, height); // 중심을 기준으로 이미지 그리기
                ctx.restore(); // 원래 캔버스 상태로 복원
            }
            requestAnimationFrame(() => estimateFacesLoop(model, image, ctx));
        });
    };

    const startFiltering = () => {
        const canvasContext = canvasRef.current?.getContext("2d");
        if (!canvasContext || initialLoadedRef.current) return;

        initialLoadedRef.current = true;

        const image = new Image();
        image.src = "sunglasses.png";

        setStatus("Load Model...");

        loadDetectionModel().then((model) => {
            setStatus("Model Loaded");
            requestAnimationFrame(() =>
                estimateFacesLoop(model, image, canvasContext),
            );
        });
    };

    return (
        <>
            <nav className="navbar navbar-default">
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand nav-icon"
                            href="https://github.com/OpenVidu/openvidu-tutorials/tree/master/openvidu-js"
                            title="GitHub Repository" target="_blank">
                            <i className="fa fa-github" aria-hidden="true"></i>
                        </a>
                        <a className="navbar-brand nav-icon"
                            href="http://www.docs.openvidu.io/en/stable/tutorials/openvidu-js/"
                            title="Documentation" target="_blank">
                            <i className="fa fa-book" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </nav>

            <div id="main-container" className="container">
                <div id="join">
                    <div id="join-dialog" className="jumbotron vertical-center">
                        <h1>Join a video session</h1>
                        <form className="form-group" onSubmit={(e) => {
                            e.preventDefault();
                            joinSession();
                        }}>
                            <p>
                                <label>Participant</label>
                                <input className="form-control" type="text" id="userName" required defaultValue={username} />
                            </p>
                            <p>
                                <label>Session</label>
                                <input className="form-control" type="text" id="sessionId" required defaultValue={roomcode} />
                            </p>
                            <p className="text-center">
                                <input className="btn btn-lg btn-success" type="submit" name="commit" value="Join!" />
                            </p>
                        </form>
                    </div>
                </div>

                <div id="session" style={{ display: 'none' }}>
                    <div id="session-header">
                        <h1 id="session-title"></h1>
                        <input className="btn btn-large btn-danger"
                            type="button"
                            id="buttonLeaveSession"
                            onClick={() => leaveSession()}
                            value="Leave session" />
                    </div>
                    <div id="main-video" className="col-md-6">
                        <p></p><div className="webcam-container" style={{ position: 'relative', height: videoSize.height, width: videoSize.width }}>
                            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                                <video id = "myVideo" autoPlay playsInline width={videoSize.width} height={videoSize.height}></video>

                            </div>
                            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                                <canvas ref={canvasRef} width={videoSize.width} height={videoSize.height} className="filter-canvas"></canvas>

                            </div>
                        </div>
                        <p className="status">{status}</p>

                        <div style={{ margin: '10px' }}>
                            <button onClick={startFiltering}>필터 시작</button>
                            <button id="startButton">게임 시작</button>
                            <button id="stopButton" disabled>게임 종료</button>
                            <div id="count">금칙어(아니) 카운트: 0</div>
                        </div>
                    </div>
                    <div id="video-container" className="col-md-6"></div>
                    <div id="subtitles" style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        background: 'rgba(0, 0, 0, 0.7)',
                        padding: '10px',
                        borderRadius: '5px',
                        fontSize: '18px',
                        zIndex: 1000
                    }}>
                        자막
                    </div>
                </div>
            </div>

            <footer className="footer">
                <div className="container">
                    <div className="text-muted">OpenVidu © 2022</div>
                </div>
            </footer>
        </>
    );
};

export default GameRoomPage;
