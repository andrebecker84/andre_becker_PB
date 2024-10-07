import { useState, useEffect } from 'react';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../configs/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import CircularLoading from '../../components/CircularLoading';
import Titulo from '../../components/Titulo';
import Botao from '../../components/Botao';
import SearchBar from '../../components/Search';
import CheckboxPadrao from '../../components/CheckboxPadrao';
import CadastroFornecedores from './CadastroFornecedores';
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

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import PlaceIcon from '@mui/icons-material/Place';
import TungstenIcon from '@mui/icons-material/Tungsten';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import Alert from '@mui/material/Alert';

const ListaFornecedores = () => {
  const { logado, admin } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tipoDialogo, setTipoDialogo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [checkedFornecedores, setCheckedFornecedores] = useState({});

  const carregarFornecedores = async () => {
    setLoading(true);
    try {
      const fornecedoresSnapshot = await getDocs(collection(firestore, 'fornecedores'));
      const listaFornecedores = fornecedoresSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFornecedores(listaFornecedores);
      // Inicializa o estado de checkboxes
      const initialCheckedState = {};
      listaFornecedores.forEach(fornecedor => {
        initialCheckedState[fornecedor.id] = false;
      });
      setCheckedFornecedores(initialCheckedState);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      setAlertMessage('Erro ao carregar fornecedores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarListaFornecedores = () => {
    carregarFornecedores();
  };

  useEffect(() => {
    carregarFornecedores();
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
      setAlertMessage('Você não tem permissão para adicionar ou editar fornecedores.');
    } else {
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFornecedorSelecionado(null);
    setTipoDialogo(null);
  };

  const handleOpenEditDialog = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setTipoDialogo('cadastroEdicao'); // Define o tipo como edição
    setOpenDialog(true);
  };

  const handleOpenConfirmDialog = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setTipoDialogo('exclusao'); // Define o tipo como exclusão
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setFornecedorSelecionado(null);
    setTipoDialogo(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'fornecedores', id));
      setFornecedores(fornecedores.filter(fornecedor => fornecedor.id !== id));
      setAlertMessage('Fornecedor removido com sucesso.');
    } catch (error) {
      console.error('Erro ao remover fornecedor:', error);
      setAlertMessage('Erro ao remover fornecedor.');
    } finally {
      handleCloseConfirmDialog();
    }
  };

  const handleSearchChange = (evento) => {
    setTermoBusca(evento.target.value); // Atualiza o termo de busca
  };
  // Filtrando a lista de fornecedores com base no termo de busca
  const fornecedoresFiltrados = fornecedores.filter(fornecedor => 
    fornecedor.nome && fornecedor.nome.toLowerCase().startsWith(termoBusca.toLowerCase())
  );

  const handleCheckboxChange = (id) => {
    setCheckedFornecedores((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (event) => {
    const newChecked = event.target.checked;
    const updatedCheckedFornecedores = Object.keys(checkedFornecedores).reduce((acc, fornecedorId) => {
      acc[fornecedorId] = newChecked; 
      return acc;
    }, {});
    setCheckedFornecedores(updatedCheckedFornecedores);
  };

  const allChecked = Object.values(checkedFornecedores).every(Boolean);
  const isIndeterminate = Object.values(checkedFornecedores).some(Boolean) && !allChecked;

  if (loading) {
    return <CircularLoading />;
  }

  return (
    <>
      <Titulo>
          <div>
            <h2 style={{ fontSize: '18px' }} >Lista de Fornecedores</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SearchBar onChange={handleSearchChange} value={termoBusca} />
            <Botao 
              largura="fullWidth"
              type="button" 
              startIcon={<AddCircleIcon />} 
              texto="Novo Fornecedor" 
              onClick={handleOpenDialog}
              corTexto='#f0f0f0' 
              cor='rgb(0, 60, 160)' 
              hoverCor='rgb(0, 100, 255)' 
            />
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
                  <LocalShippingIcon /> Nome
                </div>
              </TableCell>
              <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <FingerprintIcon /> CNPJ
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
                  <PlaceIcon /> Cidade
                </div>
              </TableCell>
              {admin && (
                <>
                  <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                      <TungstenIcon /> Ações
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {fornecedoresFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((fornecedor) => (
              <TableRow key={fornecedor.id}>
                <TableCell sx={{ borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <CheckboxPadrao
                    checked={checkedFornecedores[fornecedor.id] || false}
                    onChange={() => handleCheckboxChange(fornecedor.id)} 
                  />
                </TableCell>
                <TableCell sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  {fornecedor.nome}
                </TableCell>
                <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  {fornecedor.cnpj}
                </TableCell>
                <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  {fornecedor.email}
                </TableCell>
                <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  {fornecedor.telefone}
                </TableCell>
                <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  {fornecedor.cidade}
                </TableCell>
                {admin && (
                  <>
                    <TableCell align="center" sx={{ borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    <IconButton
                      disabled={!admin}
                      onClick={() => handleOpenEditDialog(fornecedor)}
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
                      onClick={() => handleOpenConfirmDialog(fornecedor)}
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
        count={fornecedoresFiltrados.length}
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
    </Card>
      {/* Diálogo para Cadastro/edição de Fornecedor */}
      <DialogPadrao
        open={openDialog || openConfirmDialog}
        onClose={openConfirmDialog ? handleCloseConfirmDialog : handleCloseDialog}
        title={tipoDialogo === 'exclusao' ? 'Confirmar Exclusão de Fornecedor' : 'Cadastrar ou Editar Fornecedor'}
        content={
          tipoDialogo === 'exclusao' ? (
            <div>
              <p>Tem certeza que deseja excluir o fornecedor {fornecedorSelecionado?.nome}?</p>
            </div>
          ) : (
            <CadastroFornecedores fornecedorSelecionado={fornecedorSelecionado} atualizarLista={atualizarListaFornecedores} />
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
            onClick: () => handleDelete(fornecedorSelecionado.id),
          },
        ].filter(Boolean)} // Remover undefined caso o tipo de diálogo não seja exclusão
      />
    </>
  );
};

export default ListaFornecedores;
