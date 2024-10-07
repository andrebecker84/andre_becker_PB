import { Modal, Box, Card, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';

const CustomModal = ({ open, onClose, title, children }) => {
  return (
    <Modal
      open={open}
      onClose={onClose} // Isso deve fechar o modal quando o backdrop é clicado
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'rgba(0, 0, 0, 0.7)', // Fundo escuro e opaco
        }}
      >
        <Card
          sx={{
            minWidth: 275,
            margin: '0',
            padding: '5px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7), 0 0 200px rgba(255, 255, 255, 0.3)',
            borderRadius: '40px',
            border: '1px solid rgb(29, 33, 38)',
            backgroundColor: 'rgba(15, 18, 20, 1)',
            color: '#f0f0f0',
            position: 'relative',
          }}
        >
          {/* Titlebar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgb(29, 33, 38)' }}>
            <h2 id="modal-title" style={{ flex: 1, textAlign: 'center', fontSize: '18px', color: '#f0f0f0', padding: '5px', marginBottom: '5px' }}>{title}</h2>
            <IconButton
              onClick={onClose} // Chamando onClose ao clicar no botão
              sx={{
                position: 'absolute',
                top: 4,
                right: 10,
                color: 'rgba(226, 29, 72, 1)',
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
          {/* Content */}
          <div style={{ padding: '30px' }}>{children}</div>
        </Card>
      </Box>
    </Modal>
  );
};

CustomModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default CustomModal;
