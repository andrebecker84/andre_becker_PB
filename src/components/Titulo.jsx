import PropTypes from 'prop-types';

const Titulo = ({ texto, children }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px',
      margin: '20px 0',
      borderRadius: '20px',
      border: '1px solid rgb(29, 33, 38)',
      backgroundColor: 'rgba(29, 33, 38, 0.4)',
      backdropFilter: 'blur(13px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7), 0 0 200px rgba(152, 49, 70, 0.3)',
    }}>
      <h2 style={{ fontSize: '18px'}} >{texto}</h2>
      {children}
    </div>
  );
};

Titulo.propTypes = {
  texto: PropTypes.string,
  children: PropTypes.node,
};

export default Titulo;
