import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

export default function GradientCircularProgress( margin ) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <React.Fragment>
            <svg width={0} height={0}>
              <defs>
                <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(226, 29, 72, 0.2)" />
                  <stop offset="100%" stopColor="rgba(226, 29, 72, 1)" />
                </linearGradient>
              </defs>
            </svg>
            <CircularProgress size="35px" sx={{ 'svg circle': { stroke: 'url(#my_gradient)' }, margin: margin }} />
          </React.Fragment>
    </Box>
  );
}

GradientCircularProgress.propTypes = {
  margin: PropTypes.string,
};

