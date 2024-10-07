import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function TypographyCompponent({ children, ...props }) {
    return (
        <Typography {...props}>
            {children}
        </Typography>
    );
}

TypographyCompponent.propTypes = {
    children: PropTypes.node,
};
