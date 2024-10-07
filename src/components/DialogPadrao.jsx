import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Slide } from '@mui/material';
import Botao from './Botao';
import PropTypes from 'prop-types';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogPadrao = ({ open, onClose, title, content, actions }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      PaperProps={{
        sx: {
          border: '1px solid rgb(29, 33, 38)',
          backgroundColor: 'rgba(15, 18, 20, 0.85)',
          padding: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(13px)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7), 0 0 500px rgba(255, 255, 255, 0.2)',
          borderRadius: '50px', // Ajuste o raio da borda se necessário
          color: '#f0f0f0', // Cor do texto do Diálogo
        },
      }}
    >
        <DialogTitle sx={{ padding: '10px 0', margin: '0', color: 'rgba(226, 29, 72, 1)'}}>
          {title}
        </DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions sx={{ padding: '0', margin: '0'}}>
          {actions.map((action, index) => (
            <Botao
              key={index}
              cor={action.color}
              hoverCor={action.hoverColor}
              onClick={action.onClick}
              startIcon={action.startIcon}
              style={action.style}
            >
              {action.label}
            </Botao>
          ))}
        </DialogActions>
    </Dialog>
  );
};

DialogPadrao.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  content: PropTypes.node,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      hoverColor: PropTypes.string,
      onClick: PropTypes.func,
      label: PropTypes.string,
    })
  ),
};

export default DialogPadrao;
