import PropTypes from 'prop-types';

const UserBannedWords = ({ number, nickname, bannedWords = [] }) => {
    return (
      <div className="bg-green-100 p-2 rounded-md">
        <div className="flex items-center gap-4">
          <span className="text-gray-800 font-medium">
            {number}
          </span>
          <span className="text-gray-800">
            {nickname}
          </span>
          <div className="bg-white px-4 py-2 rounded-md flex-grow">
            <p className="text-gray-700">
              {bannedWords.length > 0 ? bannedWords.join(', ') : ''}
            </p>
          </div>
        </div>
      </div>
    );
  };

UserBannedWords.propTypes = {
  number : PropTypes.number.isRequired,
  nickname: PropTypes.string.isRequired,
  bannedWords : PropTypes.arrayOf(PropTypes.string)
}


export default UserBannedWords;
