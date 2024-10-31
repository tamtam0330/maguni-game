
const MainSingleVideo = () => {
  return (
    <div id="session" style={{ display: 'block' }}> {/* 디버깅을 위해 display를 block으로 설정 */}
                <div id="session-header">
                    <h1 id="session-title"></h1>
                    <input
                        className="btn btn-large btn-danger"
                        type="button"
                        id="buttonLeaveSession"
                        onMouseUp={leaveSession}
                        value="Leave session"
                    />
                </div>
                <div id="main-video" className="col-md-6">
                    <p></p>
                    <video autoPlay playsInline></video>
                </div>
                <div id="video-container" className="col-md-6"></div>
            </div>
  )
}

export default MainSingleVideo
