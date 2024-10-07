import { Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Container from './Container';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext'; // Para acessar o usuário logado

const AdminColab = ({ admin }) => {
  const { usuarioLogado } = useAuth(); // Pega o e-mail do usuário logado
  
  return (
    <Container padding='4px' bradius='30px'> 
      <Typography 
        variant="body1" 
        color={admin ? '#00ff00' : '#FDCC0D'} 
        style={{ textAlign: 'center', display: 'flex', alignItems: 'center', margin: '0 8px', fontSize: '12px', letterSpacing: '1px' }}
      >
        {/* Exibição do e-mail do usuário antes do ícone */}
        {usuarioLogado && (
          <span style={{ marginRight: '8px', fontSize: '12px', letterSpacing: '1px',  color: 'grey' }}>
            {usuarioLogado.email}
          </span>
        )}
        
        {/* Ícone correspondente ao tipo de usuário */}
        {admin ? (
          <AdminPanelSettingsIcon style={{ marginRight: '2px', fontSize: '16px' }} />
        ) : (
          <AccountCircleIcon style={{ marginRight: '2px', fontSize: '16px' }} />
        )}
        {admin ? 'Admin' : 'Colab'}
      </Typography>
    </Container>
  );
};

AdminColab.propTypes = {
  admin: PropTypes.bool.isRequired,
};

export default AdminColab;
