import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const Botao = ({ texto, onClick, estadoAtivo, cor, corTexto, startIcon, children, type='button', hoverCor, largura }) => {
  return (
    <Button
      onClick={onClick}
      type={type}
      variant="contained"
      startIcon={startIcon}
      sx={{
        margin: '5px',
        padding: '10px 30px',
        width: largura || 'auto',
        border: '1px solid rgb(29, 33, 38)',
        transitionProperty: 'all',
        transitionDuration: '150ms',
        borderRadius: '30px',
        backgroundColor: estadoAtivo ? 'rgba(226, 29, 72, 0.4)' : cor || 'rgba(29, 33, 38, 0.4)',
        color: estadoAtivo ? 'rgba(255, 255, 255, 1)' : corTexto || 'rgba(232, 231, 233, .8)',
        fontWeight: estadoAtivo ? 'bold' : 'normal',
        boxShadow: 'rgba(48, 56, 64, 0.1) 0px 1px 0px inset, rgb(9, 11, 11) 0px -1px 0px inset, rgb(9, 11, 11) 0px 1px 2px 0px',
        '&:hover': {
          backgroundColor: hoverCor || 'rgba(226, 29, 72, 1)',
          boxShadow: 'none',
        },
        whiteSpace: 'nowrap', // Impede a quebra de texto
      }}
    >
      {texto}
      {children}
    </Button>
  );
};

Botao.propTypes = {
  texto: PropTypes.string,
  onClick: PropTypes.func,
  estadoAtivo: PropTypes.bool,
  cor: PropTypes.string,
  corTexto: PropTypes.string,
  children: PropTypes.node,
  type: PropTypes.string,
  hoverCor: PropTypes.string,
  largura: PropTypes.string,
  startIcon: PropTypes.node,
};

export default Botao;
