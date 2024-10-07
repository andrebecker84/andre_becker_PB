import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { Link } from 'react-router-dom';

const AuthButton = ({ logado, onLogout }) => {
  if (logado) {
    return (
      <Button
        onClick={onLogout}
        startIcon={<LogoutIcon />}
        sx={{
          borderRadius: '30px',
          padding: '6px 18px',
          color: 'red',
          backgroundColor: 'transparent',
          '&:hover': {
            color: 'darkred',
          },
        }}
      >
        Sair
      </Button>
    );
  }

  return (
    <Button
      component={Link}
      to="/login"
      startIcon={<LoginIcon />}
      sx={{
        borderRadius: '30px',
        padding: '6px 18px',
        color: 'white',
        backgroundColor: 'blue', // Azul para o botão de login
        '&:hover': {
          backgroundColor: 'darkblue', // Escuro ao passar o mouse
        },
      }}
    >
      LOGIN
    </Button>
  );
};

AuthButton.propTypes = {
  logado: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default AuthButton;
