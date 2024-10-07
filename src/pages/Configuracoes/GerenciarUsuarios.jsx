import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../configs/firebaseConfig';
import { getAuth } from 'firebase/auth';
import CircularLoading from '../../components/CircularLoading';
import { useAuth } from '../../contexts/AuthContext';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import QrCodeIcon from '@mui/icons-material/QrCode';
import MailIcon from '@mui/icons-material/Mail';
import SecurityIcon from '@mui/icons-material/Security';
import TungstenIcon from '@mui/icons-material/Tungsten';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import DialogPadrao from '../../components/DialogPadrao';
import TextFieldPadrao from '../../components/TextFieldPadrao';
import Titulo from '../../components/Titulo';
import Botao from '../../components/Botao';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import '../../css/Home.css';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logado, admin, loading: loadingAuth } = useAuth();
  const [alertMessage, setAlertMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const auth = getAuth();

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const usuariosSnapshot = await getDocs(collection(firestore, 'usuarios'));
      const listaUsuarios = usuariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(listaUsuarios);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setAlertMessage('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (usuarioId, novoNome) => {
    const usuarioAtual = auth.currentUser;

    if (usuarioAtual) {
      try {
        const usuarioRef = doc(firestore, 'usuarios', usuarioId);
        await updateDoc(usuarioRef, {
          nome: novoNome,
        });

        setAlertMessage('Usuário atualizado com sucesso!');
        carregarUsuarios();
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        setAlertMessage('Erro ao atualizar usuário. Tente novamente.');
      }
    } else {
      setAlertMessage('Nenhum usuário autenticado encontrado.');
    }
  };

  const handleBlock = async (id, isBlocked) => {
    try {
      const usuarioRef = doc(firestore, 'usuarios', id);
      await updateDoc(usuarioRef, { blocked: !isBlocked });

      setAlertMessage(`Usuário ${isBlocked ? 'ativado' : 'bloqueado'} com sucesso!`);
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao bloquear/ativar usuário:', error);
      setAlertMessage('Erro ao bloquear/ativar usuário. Tente novamente.');
    }
  };

  const handleChangeRole = async (id, isAdmin) => {
    try {
      const usuarioRef = doc(firestore, 'usuarios', id);
      await updateDoc(usuarioRef, { role: isAdmin ? 'colaborador' : 'admin' });

      setAlertMessage(`Role alterada para ${isAdmin ? 'colaborador' : 'admin'} com sucesso!`);
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao alterar role do usuário:', error);
      setAlertMessage('Erro ao alterar role do usuário. Tente novamente.');
    }
  };

  useEffect(() => {
    if (logado && admin) {
      carregarUsuarios();
    }
  }, [logado, admin]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEditModal = (usuario) => {
    setUsuarioSelecionado(usuario.id);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setOpenModal(true);
  };

  const actions = [
    {
      label: 'Cancelar',
      color: 'rgba(152, 49, 70, 1)',
      hoverColor: 'rgba(226, 29, 72, 1)',
      onClick: () => setOpenModal(false),
    },
    {
      label: 'Salvar',
      color: 'rgb(0, 60, 160)',
      hoverColor: 'rgb(0, 100, 255)',
      onClick: () => {
        handleEdit(usuarioSelecionado, nome);
        setOpenModal(false);
      },
    },
  ];

  if (loading || loadingAuth) {
    return <CircularLoading margin="20px" />;
  }

  return (
    <>
      <Titulo>
          <div>
            <h2 style={{ fontSize: '18px' }} >Gerenciar Usuários</h2>
          </div>
          <div>
          <Botao type="button" startIcon={<PersonAddIcon />} texto="Criar Colaborador" onClick={() => navigate('/criar-colab')} corTexto='#000' cor='rgba(253, 149, 13, 1)' hoverCor='rgba(253, 204, 13, 1)' />
          <Botao type="button" startIcon={<PersonAddIcon />} texto="Criar Administrador" onClick={() => navigate('/criar-admin')} corTexto='#000' cor='rgba(0, 255, 0, 0.8)' hoverCor='rgba(0, 255, 0, 1)' />
          </div>
      </Titulo>
      <Card
        sx={{
          borderRadius: '30px',
          border: '1px solid rgb(29, 33, 38)',
          backgroundColor: 'rgba(29, 33, 38, 0.4)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7), 0 0 200px rgba(152, 49, 70, 0.3)',
          position: 'relative',
        }}
      >
        {alertMessage && <Alert severity="error">{alertMessage}</Alert>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonIcon /> Nome
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCodeIcon /> UID
                  </div>	
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <MailIcon /> Email
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <SecurityIcon /> Role
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <TungstenIcon /> Ações
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((usuario) => {
                const textoRiscado = usuario.blocked ? { textDecoration: 'line-through', color: 'lightgray' } : {};
                const corRole = usuario.role === 'admin' ? 'hsl(215, 15%, 75%)' : 'hsl(215, 15%, 75%)';
                return (
                  <TableRow key={usuario.id} sx={usuario.blocked ? { backgroundColor: 'rgba(0, 0, 0, 0.2)' } : { backgroundColor: 'rgba(29, 33, 38, 0.2)' }}>
                    <TableCell sx={{ ...textoRiscado, color: usuario.blocked ? 'gray' : corRole, borderBottom: '1px solid rgb(29, 33, 38)' }}>
                      {usuario.nome}
                    </TableCell>
                    <TableCell align="center" sx={{ ...textoRiscado, color: usuario.blocked ? 'gray' : corRole, borderBottom: '1px solid rgb(29, 33, 38)' }}>
                      {usuario.uid}
                    </TableCell>
                    <TableCell align="center" sx={{ ...textoRiscado, color: usuario.blocked ? 'gray' : corRole, borderBottom: '1px solid rgb(29, 33, 38)' }}>
                      {usuario.email}
                    </TableCell>
                    <TableCell align="center" sx={{ ...textoRiscado, color: usuario.blocked ? 'gray' : corRole, borderBottom: '1px solid rgb(29, 33, 38)' }}>
                      {usuario.role}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid rgb(29, 33, 38)' }}>
                      <IconButton onClick={() => handleBlock(usuario.id, usuario.blocked)}>
                        {usuario.blocked ? <ToggleOffIcon sx={{ color: 'red' }} /> : <ToggleOnIcon sx={{ color: 'green' }} />}
                      </IconButton>
                      <IconButton onClick={() => handleOpenEditModal(usuario)}>
                        <EditIcon sx={{ color: 'blue' }} />
                      </IconButton>
                      <IconButton onClick={() => handleChangeRole(usuario.id, usuario.role === 'admin')}>
                        {usuario.role === 'admin' ? (
                          <AdminPanelSettingsIcon sx={{ color: '#00ff00' }} />
                        ) : (
                          <AccountCircleIcon sx={{ color: '#FDCC0D' }} />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={usuarios.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          sx={{
            '& .MuiTablePagination-toolbar': {
              color: 'rgba(180, 49, 70, 1)',
            },
            '& .MuiTablePagination-displayedRows': {
              color: 'rgba(180, 49, 70, 1)',
            },
            '& .MuiSelect-standard.MuiInputBase-input': {
              color: 'rgba(180, 49, 70, 1)', // Cor do texto no select
            },
            '& .MuiTablePagination-selectLabel': {
              color: 'rgba(115, 33, 48, 1)', // Cor do texto no select
            },
            '& .MuiTablePagination-selectIcon': {
              color: 'rgba(115, 33, 48, 1)', // Cor do ícone do select
            },
            '& .MuiTablePagination-actions': {
              color: 'rgba(180, 49, 70, 1)',
            },
            '& .MuiIconButton-root': {
              color: 'rgba(180, 49, 70, 1)', // Cor para os ícones de ações
            },
            '& .MuiIconButton-root.Mui-disabled': {
              color: 'rgba(152, 49, 70, 0.2)', // Cor para os ícones de ações desabilitados
            }
          }}
        />
        <DialogPadrao
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Editar Nome do Usuário"
          content={
            <TextFieldPadrao
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{ margin: '15px 0 15px 0' }}
            />
          }
          actions={actions}
        />
      </Card>
    </>
  );
};

export default GerenciarUsuarios;
