import { Card, CardContent } from '@mui/material';
import PropTypes from 'prop-types';

const CardExercicio = ({ children, bshadow, padding, margem, borda='1px solid rgb(29, 33, 38)', bdradius='12px', bCima, bBaixo, bEsq, bDir, largura='100%' }) => {
  return (
    <Card sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: largura,
      margin: margem,
      padding: padding,
      backgroundColor: 'rgba(29, 33, 38, 0.4)',
      boxShadow: bshadow,
      border: borda,
      borderTop: bCima,
      borderBottom: bBaixo,
      borderLeft: bEsq,
      borderRight: bDir,
      borderRadius: bdradius,
    }}>
      <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {children}
      </CardContent>
    </Card>
  );
};

CardExercicio.propTypes = {
  children: PropTypes.node.isRequired,
  borda: PropTypes.string,
  bdradius: PropTypes.string,
  bEsq: PropTypes.string,
  bDir: PropTypes.string,
  bCima: PropTypes.string,
  bBaixo: PropTypes.string,
  largura: PropTypes.string,
  padding: PropTypes.string,
  margem: PropTypes.string,
  bshadow: PropTypes.string,
};

export default CardExercicio;
