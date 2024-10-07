import { TextField } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

const TextFieldPadrao = React.forwardRef(({ largura="100%", label, error, helperText, InputLabelProps, ...props }, ref) => {
  return (
    <TextField
      autoFocus
      variant="outlined"
      label={label}
      inputRef={ref}
      error={error}
      helperText={helperText}
      InputProps={{
        style: { color: '#f0f0f0' },
      }}
      InputLabelProps={{ 
        style: { color: 'hsl(215, 15%, 75%)' },
        ...InputLabelProps,
      }}
      inputProps={{
        maxLength: props.maxLength,
      }}
      sx={{
        width: largura,
        margin: '7px 0 7px 0',
        borderRadius: '30px',
        backgroundColor: 'rgba(29, 33, 38, 0.4)',
        '& input': { color: '#f0f0f0' },
        '& .MuiOutlinedInput-root': {
          borderRadius: '30px',
          '& fieldset': { borderColor: 'rgb(29, 33, 38)' },
          '&:hover fieldset': { borderColor: '#983146' },
          '&.Mui-focused fieldset': { borderColor: 'rgba(226, 29, 72, 1)' },
        },
      }}
      {...props}
    />
  );
});

TextFieldPadrao.displayName = 'TextFieldPadrao';

TextFieldPadrao.propTypes = {
  label: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  largura: PropTypes.string,
  InputLabelProps: PropTypes.object,
  maxLength: PropTypes.number,
};

export default TextFieldPadrao;
