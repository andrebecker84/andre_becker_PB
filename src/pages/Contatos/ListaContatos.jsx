import { useState, useEffect } from 'react';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../configs/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import CircularLoading from '../../components/CircularLoading';
import Titulo from '../../components/Titulo';
import Botao from '../../components/Botao';
import SearchBar from '../../components/Search';
import CheckboxPadrao from '../../components/CheckboxPadrao';
import CadastroContatos from './CadastroContatos';
import DialogPadrao from '../../components/DialogPadrao';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedIcon from '@mui/icons-material/Verified';
import TungstenIcon from '@mui/icons-material/Tungsten';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import Alert from '@mui/material/Alert';

const ListaContatos = () => {
  const { logado, admin } = useAuth();
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tipoDialogo, setTipoDialogo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [checkedContatos, setCheckedContatos] = useState({});

  const carregarContatos = async () => {
    setLoading(true);
    try {
      const contatosSnapshot = await getDocs(collection(firestore, 'contatos'));
      const listaContatos = contatosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContatos(listaContatos);
      
      const initialCheckedState = {};
      listaContatos.forEach(contato => {
        initialCheckedState[contato.id] = false;
      });
      setCheckedContatos(initialCheckedState);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      setAlertMessage('Erro ao carregar contatos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarListaContatos = () => {
    carregarContatos();
  };

  useEffect(() => {
    carregarContatos();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    if (!loading && (!logado || !admin)) {
      setAlertMessage('Você não tem permissão para adicionar ou editar contatos.');
    } else {
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setContatoSelecionado(null);
    setTipoDialogo(null);
  };

  const handleOpenEditDialog = (contato) => {
    setContatoSelecionado(contato);
    setTipoDialogo('cadastroEdicao'); // Define o tipo como edição
    setOpenDialog(true);
  };

  const handleOpenConfirmDialog = (contato) => {
    setContatoSelecionado(contato);
    setTipoDialogo('exclusao'); // Define o tipo como exclusão
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setContatoSelecionado(null);
    setTipoDialogo(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'contatos', id));
      setContatos(contatos.filter(contato => contato.id !== id));
      setAlertMessage('Contato removido com sucesso.');
    } catch (error) {
      console.error('Erro ao remover contato:', error);
      setAlertMessage('Erro ao remover contato.');
    } finally {
      handleCloseConfirmDialog();
    }
  };

  const handleSearchChange = (evento) => {
    setTermoBusca(evento.target.value);
  };

  const contatosFiltrados = contatos.filter(contato =>
    contato.nome && contato.nome.toLowerCase().startsWith(termoBusca.toLowerCase())
  );

  const handleCheckboxChange = (id) => {
    setCheckedContatos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (event) => {
    const newChecked = event.target.checked;
    const updatedCheckedContatos = Object.keys(checkedContatos).reduce((acc, contatoId) => {
      acc[contatoId] = newChecked; 
      return acc;
    }, {});
    setCheckedContatos(updatedCheckedContatos);
  };

  const allChecked = Object.values(checkedContatos).every(Boolean);
  const isIndeterminate = Object.values(checkedContatos).some(Boolean) && !allChecked;

  if (loading) {
    return <CircularLoading />;
  }

  return (
    <>
      <Titulo>
        <div>
          <h2 style={{ fontSize: '18px' }}>Lista de Contatos</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SearchBar onChange={handleSearchChange} value={termoBusca} />
          {admin && (
            <Botao
              largura="fullWidth"
              type="button"
              startIcon={<AddCircleIcon />}
              texto="Novo Contato"
              onClick={handleOpenDialog}
              corTexto='#f0f0f0'
              cor='rgb(0, 60, 160)' // Cor do botão
              hoverCor='rgb(0, 100, 255)' // Hover do botão
            />
          )}
        </div>
      </Titulo>
      <Card
        sx={{
          borderRadius: '30px',
          border: '1px solid rgb(29, 33, 38)',
          backgroundColor: 'rgba(29, 33, 38, 0.4)', // Cor de fundo
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7), 0 0 200px rgba(152, 49, 70, 0.3)',
          position: 'relative',
        }}
      >
        {alertMessage && <Alert severity="error">{alertMessage}</Alert>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
              <TableCell sx={{ borderBottom: '1px solid rgb(29, 33, 38)' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckboxPadrao
                      checked={allChecked}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAll}
                    />
                </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCodeIcon /> CID
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonIcon /> Nome
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <MailIcon /> E-mail
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <PhoneIcon /> Telefone
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <BadgeIcon /> Cargo
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <LocalShippingIcon /> Fornecedor
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <DescriptionIcon /> Descrição
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <VerifiedIcon /> Criado Por
                  </div>
                </TableCell>
                {admin && (
                  <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                      <TungstenIcon /> Ações
                    </div>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {contatosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((contato) => (
                <TableRow key={contato.id}>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    <CheckboxPadrao
                      checked={checkedContatos[contato.id] || false}
                      onChange={() => handleCheckboxChange(contato.id)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {contato.CID}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {contato.nome}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {contato.email}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {contato.telefone}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {contato.cargo}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {contato.fornecedor}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {contato.descricao}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {contato.criadoPor}
                  </TableCell>
                  {admin && (
                    <>
                      <TableCell align="center" sx={{ borderBottom: '1px solid rgb(29, 33, 38)' }}>
                        <IconButton
                          disabled={!admin}
                          onClick={() => handleOpenEditDialog(contato)}
                          aria-label="edit"
                          sx={{
                            color: admin ? 'blue' : 'lightgray',
                            opacity: admin ? 1 : 0.5,
                          }}
                        >
                          <EditIcon sx={{ color: 'blue' }} />
                        </IconButton>

                        <IconButton
                          disabled={!admin}
                          onClick={() => handleOpenConfirmDialog(contato)}
                          aria-label="delete"
                          sx={{
                            color: admin ? 'red' : 'lightgray',
                            opacity: admin ? 1 : 0.5,
                          }}
                        >
                          <DeleteIcon sx={{ color: 'red' }} />
                        </IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={contatosFiltrados.length}
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
              color: 'rgba(180, 49, 70, 1)',
            },
            '& .MuiTablePagination-selectLabel': {
              color: 'rgba(115, 33, 48, 1)',
            },
            '& .MuiTablePagination-selectIcon': {
              color: 'rgba(115, 33, 48, 1)',
            },
            '& .MuiTablePagination-actions': {
              color: 'rgba(180, 49, 70, 1)',
            },
            '& .MuiIconButton-root': {
              color: 'rgba(180, 49, 70, 1)',
            },
            '& .MuiIconButton-root.Mui-disabled': {
              color: 'rgba(152, 49, 70, 0.2)',
            }
          }}
        />
      </Card>
    {/* Diálogo para Cadastro/edição de contato */}
    <DialogPadrao
        open={openDialog || openConfirmDialog}
        onClose={openConfirmDialog ? handleCloseConfirmDialog : handleCloseDialog}
        title={tipoDialogo === 'exclusao' ? 'Confirmar Exclusão de Contato' : 'Cadastrar ou Editar Contato'}
        content={
          tipoDialogo === 'exclusao' ? (
            <div>
              <p>Tem certeza que deseja excluir o contato {contatoSelecionado?.nome}?</p>
            </div>
          ) : (
            <CadastroContatos contatoSelecionado={contatoSelecionado} atualizarLista={atualizarListaContatos} />
          )
        }
        actions={[
          {
            label: 'Fechar/Cancelar',
            startIcon: <CancelIcon />,
            onClick: openConfirmDialog ? handleCloseConfirmDialog : handleCloseDialog
          },
          tipoDialogo === 'exclusao' && {
            color: 'rgba(152, 49, 70, 1)',
            hoverColor: 'rgba(226, 29, 72, 1)',
            label: 'Excluir',
            startIcon: <DeleteIcon />,
            onClick: () => handleDelete(contatoSelecionado.id),
          },
        ].filter(Boolean)}
      />
    </>
  );
};

export default ListaContatos;
