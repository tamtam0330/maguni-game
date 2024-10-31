import PropTypes from 'prop-types';
import '../../styles/profileCard.css'; 
import Button from '../../components/common/Button.jsx'

function ProfileCard({ nickname, playerNumber, imageUrl }) {
 return (
   <div className="profile-card">
     <div className="profile-info">
       {/* 프로필 이미지 */}
       <div className="profile-image-container">
         {imageUrl ? (
           <img 
             src={imageUrl} 
             alt="프로필" 
             className="profile-image"
           />
         ) : (
           <div className="profile-image-placeholder" />
         )}
       </div>
       
       {/* 텍스트 정보 */}
       <div className="profile-text">
         <span className="profile-nickname">{nickname}</span>
         <span className="profile-number">player {playerNumber}</span>
       </div>
     </div>

     {/* 메뉴 버튼 */}
     <Button className="menu-button">⋮</Button>
   </div>
 );
}

ProfileCard.propTypes = {
   nickname: PropTypes.string.isRequired,
   playerNumber: PropTypes.number.isRequired,
   imageUrl: PropTypes.string
};

export default ProfileCard;