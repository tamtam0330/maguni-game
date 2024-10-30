import { useEffect, useRef, useState } from "react";
import { joinSession, leaveSession, sendFilterSignal } from '../../openvidu/app_openvidu.js';
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
    const videoid = "local-video-undefined"

    const initialLoadedRef = useRef(false);
    const [status, setStatus] = useState("Initializing...");

    const estimateFacesLoop = (model, image, ctx, videoid) => {
        console.log(videoid);
        const videoElement = document.getElementById(`${videoid}`);
        console.log(videoElement);
        console.log("1");
        
        
        if (!videoElement) {
            console.log("취소됨")
            return;

        }

        model.estimateFaces(videoElement).then((face) => {
            ctx.clearRect(0, 0, videoSize.width, videoSize.height);
            if (face[0]) {
                const { x, y, width, height } = calculateFilterPosition(face[0].keypoints);
                ctx.drawImage(image, x, y, width, height);
            }
            requestAnimationFrame(() => estimateFacesLoop(model, image, ctx));
        });
    };

    const startFiltering = (username) => {
        const canvasElement = document.getElementById("canvas-" + username);
        const canvasContext = canvasElement.getContext("2d");
        console.log("asdkfjlasfjasl: "+ canvasElement);
        if (!canvasContext || initialLoadedRef.current) return;

        initialLoadedRef.current = true;

        const image = new Image();
        image.src = "sunglasses.png";

        setStatus("Load Model...");

        loadDetectionModel().then((model) => {
            setStatus("Model Loaded");
            requestAnimationFrame(() =>
                estimateFacesLoop(model, image, canvasContext, videoid),
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
                        <button onClick={() => {startFiltering(username);}}>필터 시작</button>
                        <p className="status">{status}</p>
                    </div>

                    <div id="video-container" className="col-md-6"></div>
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