import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';

export default function GridComponent({ children, ...props }) {
    return (
        <Grid {...props}>{children}</Grid>
    );
}

GridComponent.propTypes = {
    children: PropTypes.node,
};
