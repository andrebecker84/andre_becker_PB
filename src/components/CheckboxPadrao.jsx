import { Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

// Estilos do checkbox
const BpIcon = styled('span')({
  borderRadius: 6,
  width: 20,
  height: 20,
  boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  backgroundColor: 'rgba(29, 33, 38, 0.4)',
  backgroundImage: 'linear-gradient(180deg, hsla(0, 0%, 100%, .4), hsla(0, 0%, 100%, 0.2))',
  'input:hover ~ &': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background: 'rgba(46, 52, 64, 0.8)',
  },
});

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: 'rgba(226, 29, 72, 0.5)',
  backgroundImage: 'linear-gradient(180deg, hsla(0, 0%, 100%, 0.1), hsla(0, 0%, 100%, 0.2))',
  '&::before': {
    display: 'block',
    width: 20,
    height: 20,
    backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
  'input:hover ~ &': {
    backgroundColor: 'rgba(226, 29, 72, 1)',
  },
});

const BpIndeterminateIcon = styled(BpIcon)({
  backgroundColor: 'rgba(255, 204, 0, 0.8)', // Cor do estado indeterminado (amarelo claro, por exemplo)
  backgroundImage: 'none', // Retira o ícone de marcação
  '&::before': {
    display: 'block',
    width: 16,
    height: 4,
    backgroundColor: '#fff', // Adiciona uma barra horizontal branca no meio
    content: '""',
    position: 'relative',
    top: '8px',
    left: '2px',
  },
  'input:hover ~ &': {
    backgroundColor: 'rgba(255, 204, 0, 1)',
  },
});

// Componente Checkbox Padrao com indeterminate
const CheckboxPadrao = ({ checked, onChange, disabled, indeterminate }) => {
  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      indeterminate={indeterminate}
      icon={indeterminate ? <BpIndeterminateIcon /> : <BpIcon />}
      checkedIcon={<BpCheckedIcon />}
      indeterminateIcon={<BpIndeterminateIcon />} // Ícone do indeterminate
      inputProps={{ 'aria-label': 'checkbox-padrao' }}
      sx={{
        margin: '0',
        padding: '15px',
        '&:hover': {
          bgcolor: 'transparent',
        },
        '&:disabled': {
          color: 'rgba(206, 217, 224, 0.6)',
        },
      }}
    />
  );
};

CheckboxPadrao.propTypes = {
  checked: PropTypes.bool, // Valor do checkbox (true/false)
  onChange: PropTypes.func, // Função para atualizar o estado
  disabled: PropTypes.bool, // Desativar o checkbox se necessário
  indeterminate: PropTypes.bool, // Controle do estado indeterminate (true/false)
};

export default CheckboxPadrao;
