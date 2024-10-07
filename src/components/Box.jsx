import {Box} from '@mui/material';
import PropTypes from 'prop-types';

export default function BoxComponent({children, ...props}) {
    return (
        <Box {...props}>
        {children}
        </Box>
    );
}

BoxComponent.propTypes = {
  children: PropTypes.node,
}
