import { leaveSession } from '../../../openvidu/app_openvidu';
import PropTypes from 'prop-types'; 
import Input from '../common/Input'
import '../../styles/footer.css'
import soundOnIcon from '../../assets/images/soundOnIcon.png';
import soundOffIcon from '../../assets/images/SoundOffIcon.png';
import treasureCardsIcon from '../../assets/images/treasureCardsIcon.png';

const Footer = ({username, roomcode}) => {
  return (
    <div className="footer">
        <div className="footer-tip">
          <div className="footer-icons-container">
            <img className="footer-icon" src={soundOnIcon}></img>
            <img className="footer-icon" src={soundOffIcon}></img>
            <img className="footer-icon" src={treasureCardsIcon}></img>
          </div>
        </div >
        {/* click시 발생할 로직 추가해야 */}
        <div className="footer-btn">
          {/*여기에 onclick으로 leaveSession하면서 방 나가기 해야될듯*/}
          <input className="btn btn-large btn-danger"
                            type="button"
                            id="buttonLeaveSession"
                            onClick={() => leaveSession()}
                            value="게임 종료" />
        </div>
        <div className="footer-input">
          <Input username={username} roomcode={roomcode}></Input>
        </div>
    </div>
  )
}

// PropTypes 정의 추가
Footer.propTypes = {
  username: PropTypes.string.isRequired,
  roomcode: PropTypes.string.isRequired
};


export default Footer
