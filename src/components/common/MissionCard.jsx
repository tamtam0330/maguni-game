import PropTypes from 'prop-types';

const MissionCard = (prop) => {
  return (
    <div>
        {prop.misson}
    </div>
  )
}

MissionCard.prototypes = {
    misson: PropTypes.string
}


export default MissionCard
