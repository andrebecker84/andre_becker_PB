import { FaExclamationTriangle } from 'react-icons/fa';
import CardExercicio from '../components/CardExercicio';
import '../css/Home.css';

const PaginaNaoEncontrada = () => {
  return (
    <div className="conteudo-centralizado">
        <CardExercicio bshadow='0 0 200px rgba(152, 49, 70, 0.3)' bCima='rgba(223, 70, 97, 1) solid 6px' sx={{ padding: '20px' }}>
          <h1 style={{ marginBottom: '20px' }}><span style={{ color: 'rgba(223, 70, 97, 1)' }}>404</span> Oops! Página não encontrada.</h1>
          <FaExclamationTriangle 
            style={{
              fontSize: '80px',
              color: 'rgba(223, 70, 97, 1)',
              marginBottom: '20px'
            }}
          />
          <p style={{ marginBottom: '20px' }}>Desculpe, mas a página que você está procurando não existe.</p>
        </CardExercicio>
    </div>
  );
};

export default PaginaNaoEncontrada;
