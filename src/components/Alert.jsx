import Alert from '@mui/material/Alert';
import PropTypes from 'prop-types';

export default function AlertComponent({children, ...props}) {
  return <Alert {...props}>{children}</Alert>;
}

AlertComponent.propTypes = {
  children: PropTypes.node,
};
