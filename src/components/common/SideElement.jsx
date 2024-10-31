import PropTypes from 'prop-types';

const SideElement = (props) => {
  return (
    <>
        <div>{props.title}</div>
        <div>{props.children}</div>
    </>

  )
}

SideElement.propTypes = {
    title : PropTypes.string,
    children : PropTypes.node
}

export default SideElement;
