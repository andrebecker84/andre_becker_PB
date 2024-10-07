import { Card, CardContent } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GuestIcon from '@mui/icons-material/PersonOutline'; // Exemplo de ícone para visitante
import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { firestore } from './configs/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './css/Home.css';

import CircularLoading from './components/CircularLoading';
import Container from './components/Container';

const Home = () => {
  const { usuarioLogado, admin, logado } = useAuth();
  const [nomeUsuario, setNomeUsuario] = useState(<CircularLoading />);

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      if (usuarioLogado) {
        try {
          const usuarioRef = doc(firestore, 'usuarios', usuarioLogado.uid);
          const docSnap = await getDoc(usuarioRef);

          if (docSnap.exists()) {
            const dados = docSnap.data();
            setNomeUsuario(dados.nome || 'Nome não encontrado');
          } else {
            console.log('Nenhum documento encontrado!');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };

    buscarDadosUsuario();
  }, [usuarioLogado]);

  return (
    <div className="conteudo-centralizado">
      <Card
        sx={{
          minWidth: 275,
          margin: '20px',
          padding: '20px',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7), 0 0 200px rgba(152, 49, 70, 0.3)',
          borderRadius: '100px',
          border: '1px solid rgb(29, 33, 38)',
          backgroundColor: 'rgba(29, 33, 38, 0.4)',
          color: '#f0f0f0',
        }}
      >
        <CardContent className="conteudo-centralizado">
          <Container padding='10px' bradius='70px'>
            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', margin: '0 8px', fontSize: '14px' }}>
              {logado ? (
                <>
                  {usuarioLogado && (
                    <span style={{ marginRight: '8px', fontSize: '16px', fontWeight: 'bold', color: 'lightgrey' }}>
                      {nomeUsuario}
                    </span>
                  )}
                  {admin ? (
                    <>
                      <AdminPanelSettingsIcon style={{ color: '#00ff00', marginRight: '8px', fontSize: '20px' }} />
                      <span style={{ color: '#00ff00' }}>Administrador</span>
                    </>
                  ) : (
                    <>
                      <AccountCircleIcon style={{ color: '#FDCC0D', marginRight: '8px', fontSize: '20px' }} />
                      <span style={{ color: '#FDCC0D' }}>Colaborador</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <GuestIcon style={{ color: '#FF5722', marginRight: '8px', fontSize: '24px', fontWeight: 'bold' }} />
                  <span style={{ color: '#FF5722', fontSize: '18px', fontWeight: 'bold' }}>Visitante</span>
                </>
              )}
            </div>
          </Container>
          <h1 style={{ marginTop: '30px', marginBottom: '20px' }}>Seja Bem-Vindo!</h1>
          <h2>Sistema de Compras</h2>
          <img src='./public/images/logoACME.png' alt="logomarca ACME" title="logomarca ACME" style={{ width: '400px', marginBottom: '50px' }} />
          <p style={{ fontSize: '12px' }}>
            Todos os direitos reservados © <span>@becker84</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
