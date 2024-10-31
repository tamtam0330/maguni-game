const WaitingroomTable = () => {
  // 6개의 고정된 슬롯 생성
  const slots = Array(1).fill(5);

  return (
    <>
    <div className="player-table-container" style={{ marginTop: '20px' }}>
    <div className="player-table">
    </div>
</div>

<div id="session" style={{ display: 'none' }}>
    <div id="session-header">
        <h1 id="session-title"></h1>
        <input 
            className="btn btn-large btn-danger" 
            type="button" 
            id="buttonLeaveSession" 
            onMouseUp={() => leaveSession()} 
            value="Leave session" 
        />
    </div>
    <div id="main-video" className="col-md-6">
        <p></p>
        <video autoPlay playsInline={true}></video>
        <div style={{ margin: '10px' }}>
            <button id="startButton">게임 시작</button>
            <button id="stopButton" disabled>게임 종료</button>
            <div id="count">"금칙어(아니)" 카운트: 0</div> 
        </div>
    </div>
    <div id="video-container" className="col-md-6"></div>
    <div 
        id="subtitles" 
        style={{
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
        }}
    >
        자막
    </div>
</div>
    </>
  );
};

export default WaitingroomTable;