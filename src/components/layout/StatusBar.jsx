import Timer from '../common/FullTimerClock'
import ProfileCard from '../common/ProfileCard'
import SessionBar from '../common/SessionBar'
import '../../styles/statusBar.css'
import teamLogo from '../../assets/images/teamLogoImage.png'

const StatusBar = () => {
  return (
    <div className="status-bar">
        <img className="teamLogo" src={teamLogo}></img>
        {/* remainingTime은 세션별로 남은시간 입력*/}
        <SessionBar className="sessionBar" remainingTime = "120"/>
        {/* nickname은 유저 닉네임, playerNumber는 player번호, imageUrl는 프로필 이미지*/}
        <ProfileCard className="profileCard"/>
        <Timer className="timer"/>
    </div>
  )
}

export default StatusBar
