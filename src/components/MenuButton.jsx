import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const MenuButton = ({ onClick, to, children, fontSize='12px', padding='6px 12px', startIcon, endIcon, label, margem, cor='#f0f0f0', hoverCor='rgba(226, 29, 72, 1)', hoverFundoCor='rgba(115, 33, 48, 0.2)' }) => {
  return (
    <Button
      onClick={onClick}
      component={Link}
      to={to}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        minWidth: 0,
        fontSize: fontSize,
        textTransform: 'capitalize',
        letterSpacing: '0.5px',
        padding: padding,
        margin: margem,
        borderRadius: '30px',
        color: cor,
        '&:hover': {
          color: hoverCor,
          backgroundColor: hoverFundoCor,
        },
      }}
    >
      {children} {/* Isso vai garantir que o ícone seja renderizado */}
      {label}
    </Button>
  );
};

MenuButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  to: PropTypes.string,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  label: PropTypes.string,
  margem: PropTypes.string,
  cor: PropTypes.string,
  hoverCor: PropTypes.string,
  hoverFundoCor: PropTypes.string,
  fontSize: PropTypes.string,
  padding: PropTypes.string,
};

export default MenuButton;
