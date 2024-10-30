import { useEffect, useRef } from 'react';
import { joinSession, leaveSession } from '../../openvidu/app_openvidu.js';
import { useLocation } from 'react-router-dom';
import { startFaceDetection } from '../apis/FaceDetection.js'; // FaceDetection.js의 경로로 변경

const GameRoomPage = () => {
    const location = useLocation();
    const username = location.state?.username;
    const roomcode = location.state?.roomcode;

    // 비디오 및 캔버스 참조
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        // 얼굴 인식 시작
        if (videoRef.current) {
            console.log("Face Detection Test");
            startFaceDetection(videoRef.current, canvasRef.current, '/img/sunglasses.png');
        }
    }, []);

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
                        <p></p>
                        <video ref={videoRef} autoPlay playsInline></video> {/* 비디오 요소에 ref 추가 */}
                        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas> {/* 캔버스 요소 추가 */}
                        <div style={{ margin: '10px' }}>
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
