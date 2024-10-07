import PropTypes from 'prop-types';

const Container = ({ children, padding, bradius='16px', margin, corFundo='rgba(29, 33, 38, 0.4)', centralizarHorizontal='center', direcao }) => {
  if (!children) {
    return null; // Evita renderização se não houver 'children'
  }

  return (
    <div style={{
      color: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: centralizarHorizontal,
      flexDirection: direcao,
      margin: margin, // Usa a prop de margin aqui
      padding: padding, // Usa a prop de padding aqui
      borderRadius: bradius,
      border: '1px solid rgb(29, 33, 38)',
      backgroundColor: corFundo,
      boxShadow: 'rgba(48, 56, 64, 0.1) 0px 1px 0px inset, rgb(9, 11, 11) 0px -1px 0px inset, rgb(9, 11, 11) 0px 1px 2px 0px',
    }}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  padding: PropTypes.string, // Adiciona validação para a prop de padding
  bradius: PropTypes.string,
  margin: PropTypes.string,
  corFundo: PropTypes.string,
};

export default Container;
