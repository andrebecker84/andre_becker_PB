import { useState, useEffect } from 'react';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../configs/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import CircularLoading from '../../components/CircularLoading';
import Titulo from '../../components/Titulo';
import Botao from '../../components/Botao';
import SearchBar from '../../components/Search';
import CheckboxPadrao from '../../components/CheckboxPadrao';
import CadastroCompras from './CadastroCompras';
import CadastroCotacoes from './CadastroCotacoes';
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
import TodayIcon from '@mui/icons-material/Today';
import InventoryIcon from '@mui/icons-material/Inventory';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
// import LocalShippingIcon from '@mui/icons-material/LocalShipping'; ////////////// no futuro quando incluir os fornecedores...
import TungstenIcon from '@mui/icons-material/Tungsten';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CancelIcon from '@mui/icons-material/Cancel';
import SortIcon from '@mui/icons-material/Sort';
import Alert from '@mui/material/Alert';

const ListaRequisicoes = () => {
  const { logado, admin } = useAuth();
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tipoDialogo, setTipoDialogo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [checkedRequisicoes, setCheckedRequisicoes] = useState({});

  // Estado para controle de ordenação
  const [ordem, setOrdem] = useState({ campo: '', direcao: 'asc' });

  // Função de ordenação
  const ordenarRequisicoes = (campo) => {
    const direcao = ordem.campo === campo && ordem.direcao === 'asc' ? 'desc' : 'asc';
    const listaOrdenada = [...requisicoes].sort((a, b) => {
      const valorA = a[campo] ? new Date(a[campo].seconds * 1000).getTime() : 0;
      const valorB = b[campo] ? new Date(b[campo].seconds * 1000).getTime() : 0;
      return direcao === 'asc' ? valorA - valorB : valorB - valorA;
    });
  
    setRequisicoes(listaOrdenada);
    setOrdem({ campo, direcao });
  };
  

  // Formatação dos valores
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const carregarRequisicoes = async () => {
    setLoading(true);
    try {
      const requisicoesSnapshot = await getDocs(collection(firestore, 'requisicoes'));
      const listaRequisicoes = requisicoesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRequisicoes(listaRequisicoes);
      
      const initialCheckedState = {};
      listaRequisicoes.forEach(requisicao => {
        initialCheckedState[requisicao.id] = false;
      });
      setCheckedRequisicoes(initialCheckedState);
    } catch (error) {
      console.error('Erro ao carregar Requisições de Compras:', error);
      setAlertMessage('Erro ao carregar Requisições de Compras. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarListaRequisicoes = () => {
    carregarRequisicoes();
  };

  const AcoesCotacao = ({ cotacoes, onOpenCotacao, onExcluirCotacao }) => (
    <div>
      <Botao
        startIcon={<EditIcon />}
        onClick={() => onOpenCotacao(cotacoes.CotaID)} // Abre a cotação
        texto="Editar"
      />
      <Botao
        startIcon={<DeleteIcon />}
        onClick={() => onExcluirCotacao(cotacoes.CotaID)} // Exclui a cotação
        texto="Excluir"
      />
    </div>
  );

  const abrirCotacao = (cotacoes) => {
    // Lógica para abrir a cotação selecionada
    setCotacaoSelecionada(cotacoes); // Atualiza o estado com a cotação selecionada
    setOpenDialog(true); // Abre o modal ou exibe a página de cotação
  };

  useEffect(() => {
    carregarRequisicoes();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (tipoCadastro) => {
    if (!logado) {
      setAlertMessage('Você não tem permissão para realizar esta ação.');
    } else if (tipoCadastro === 'cotacao' && !admin) {
      setAlertMessage('Apenas administradores podem criar uma nova cotação.');
    } else {
      setTipoDialogo(tipoCadastro);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRequisicaoSelecionada(null);
    setTipoDialogo(null);
  };

  const handleOpenEditDialog = (requisicao) => {
    setRequisicaoSelecionada(requisicao);
    setTipoDialogo('cadastroEdicao'); // Define o tipo como edição
    setOpenDialog(true);
  };

  const handleOpenConfirmDialog = (requisicao) => {
    setRequisicaoSelecionada(requisicao);
    setTipoDialogo('exclusao'); // Define o tipo como exclusão
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setRequisicaoSelecionada(null);
    setTipoDialogo(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'requisicoes', id));
      setRequisicoes(requisicoes.filter(requisicao => requisicao.id !== id));
      setAlertMessage('Requisição de Compra removida com sucesso.');
    } catch (error) {
      console.error('Erro ao remover requisição de compra:', error);
      setAlertMessage('Erro ao remover requisição de compra.');
    } finally {
      handleCloseConfirmDialog();
    }
  };

  const handleSearchChange = (evento) => {
    setTermoBusca(evento.target.value);
  };

  const requisicoesFiltradas = requisicoes.filter(requisicao =>
    requisicao.produto && requisicao.produto.toLowerCase().startsWith(termoBusca.toLowerCase())
  );

  const handleCheckboxChange = (id) => {
    setCheckedRequisicoes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (event) => {
    const newChecked = event.target.checked;
    const updatedCheckedRequisicoes = Object.keys(checkedRequisicoes).reduce((acc, requisicaoId) => {
      acc[requisicaoId] = newChecked; 
      return acc;
    }, {});
    setCheckedRequisicoes(updatedCheckedRequisicoes);
  };

  const allChecked = Object.values(checkedRequisicoes).every(Boolean);
  const isIndeterminate = Object.values(checkedRequisicoes).some(Boolean) && !allChecked;

  if (loading) {
    return <CircularLoading />;
  }

  return (
    <>
      <Titulo>
        <div>
          <h2 style={{ fontSize: '18px' }}>Requisições de Compras</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SearchBar onChange={handleSearchChange} value={termoBusca} />
          {logado && (
            <Botao
              largura="fullWidth"
              type="button"
              startIcon={<AddCircleIcon />}
              texto="Nova Requisição"
              onClick={() => handleOpenDialog('requisicao')}
              corTexto='#f0f0f0'
              cor='rgb(0, 60, 160)' // Cor do botão
              hoverCor='rgb(0, 100, 255)' // Hover do botão
            />
          )}
          {admin && (
            <Botao
              largura="fullWidth"
              type="button"
              startIcon={<AddCircleIcon />}
              texto="Nova Cotação"
              onClick={() => handleOpenDialog('cotacao')}
              corTexto='#f0f0f0'
              cor='rgb(200, 73, 13)' // Cor do botão
              hoverCor='rgb(255, 73, 13)' // Hover do botão
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
                    <QrCodeIcon /> RID
                  </div>
                </TableCell>
                <TableCell onClick={() => ordenarRequisicoes('dataRequisicao')} style={{ cursor: 'pointer', color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <TodayIcon /> Requisição <SortIcon sx={{ color: 'hsl(215, 15%, 75%)', marginLeft: '4px' }} />
                  </div>
                </TableCell>
                <TableCell onClick={() => ordenarRequisicoes('dataEdicaoReq')} style={{ cursor: 'pointer', color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <TodayIcon /> Edição <SortIcon sx={{ color: 'hsl(215, 15%, 75%)', marginLeft: '4px' }} />
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <InventoryIcon /> Produto
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <ProductionQuantityLimitsIcon /> Quantidade
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <AttachMoneyIcon /> Valor Unitário
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <PointOfSaleIcon /> Total
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonIcon /> Solicitante
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <CommentIcon /> Notas
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <PriorityHighIcon /> Prioridade
                  </div>
                </TableCell>
                <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <QueryStatsIcon /> Cotação
                  </div>
                </TableCell>
                {logado && (
                  <TableCell sx={{ color: 'rgba(180, 49, 70, 1)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                      <TungstenIcon /> Ações
                    </div>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {requisicoesFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((requisicao) => (
                <TableRow key={requisicao.id}>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    <CheckboxPadrao
                      checked={checkedRequisicoes[requisicao.id] || false}
                      onChange={() => handleCheckboxChange(requisicao.id)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {requisicao.RID}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {new Date(requisicao.dataRequisicao.seconds * 1000).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {requisicao.dataEdicaoReq ? new Date(requisicao.dataEdicaoReq.seconds * 1000).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {requisicao.produto}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {requisicao.quantidade}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {formatarValor(requisicao.valorUnitario)}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {formatarValor(requisicao.valorTotal)}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {requisicao.solicitante}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    {requisicao.notas}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    <span style={{
                      fontWeight: 'bold',
                      letterSpacing: '2px',
                      color: requisicao.prioridade === 'Alta' ? '#ff0000' :
                            requisicao.prioridade === 'Normal' ? '#FDCC0D' :
                            requisicao.prioridade === 'Baixa' ? '#00ff00' : 
                            'inherit' // caso o valor não corresponda a nenhum
                    }}>
                      {requisicao.prioridade}
                    </span>
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'hsl(215, 15%, 75%)', borderBottom: '1px solid rgb(29, 33, 38)' }}>
                    <span style={{
                      fontWeight: 'bold',
                      letterSpacing: '2px',
                      color: requisicao.statusCotacao === 'Aberta' ? '#ff0000' :
                      requisicao.statusCotacao === 'Em cotação...' ? '#FDCC0D' :
                      requisicao.statusCotacao === 'Cotado' ? '#00ff00' : 
                            'inherit' // caso o valor não corresponda a nenhum
                    }}>
                      {requisicao.statusCotacao}
                    </span>
                  </TableCell>
                  {logado && (
                    <>
                      <TableCell align="center" sx={{ borderBottom: '1px solid rgb(29, 33, 38)' }}>
                        <IconButton
                          disabled={!logado}
                          onClick={() => handleOpenEditDialog(requisicao)}
                          aria-label="edit"
                          sx={{
                            color: logado ? 'blue' : 'lightgray',
                            opacity: logado ? 1 : 0.5,
                          }}
                        >
                          <EditIcon sx={{ color: 'blue' }} />
                        </IconButton>

                        <IconButton
                          disabled={!logado}
                          onClick={() => handleOpenConfirmDialog(requisicao)}
                          aria-label="delete"
                          sx={{
                            color: logado ? 'red' : 'lightgray',
                            opacity: logado ? 1 : 0.5,
                          }}
                        >
                          <DeleteIcon sx={{ color: 'red' }} />
                        </IconButton>

                        <IconButton
                          disabled={!admin}
                          onClick={() => handleOpenConfirmDialog(<CadastroCotacoes />)}
                          aria-label="excluir cotacao"
                          sx={{
                            color: admin ? 'red' : 'lightgray',
                            opacity: admin ? 1 : 0.5,
                          }}
                        >
                          <ShowChartIcon sx={{ color: 'red' }} />
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
          count={requisicoesFiltradas.length}
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
      {/* Diálogo para Cadastro/Edição de Requisições de Compras ou Cotação */}
      <DialogPadrao
          open={openDialog || openConfirmDialog}
          onClose={openConfirmDialog ? handleCloseConfirmDialog : handleCloseDialog}
          title={
              tipoDialogo === 'exclusao'
                  ? 'Confirmar Exclusão de Requisição de Compra'
                  : tipoDialogo === 'cotacao'
                  ? 'Cadastrar ou Editar Cotação'
                  : 'Cadastrar ou Editar Requisição de Compra'
          }
          content={
              tipoDialogo === 'exclusao' ? (
                  <div>
                      <p>Tem certeza que deseja excluir a requisição de compra {requisicaoSelecionada?.produto}?</p>
                  </div>
              ) : tipoDialogo === 'cotacao' ? (
                  <CadastroCotacoes requisicaoSelecionada={requisicaoSelecionada} atualizarLista={atualizarListaRequisicoes} />
              ) : (
                  <CadastroCompras requisicaoSelecionada={requisicaoSelecionada} atualizarLista={atualizarListaRequisicoes} />
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
                  onClick: () => handleDelete(requisicaoSelecionada.id),
              },
          ].filter(Boolean)}
      />
    </>
  );
};

export default ListaRequisicoes;
