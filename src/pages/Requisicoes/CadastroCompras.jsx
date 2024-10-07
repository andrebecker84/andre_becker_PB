import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from '../../configs/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import TextFieldPadrao from '../../components/TextFieldPadrao';
import Botao from '../../components/Botao';
import CircularLoading from '../../components/CircularLoading';
import DialogPadrao from '../../components/DialogPadrao';
import DatePickerPadrao from '../../components/DataPickerPadrao';
import { Box, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { v4 as uuidv4 } from 'uuid';
import SelectCategoriaDropDown from '../../components/SelectCategoriaDropDown';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const CadastroCompras = ({ requisicaoSelecionada, atualizarLista }) => {
  const { usuarioLogado } = useAuth();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [RidDialog, setRidDialog] = useState(false); // Novo estado para confirmação de geração de RID
  const [produtos, setProdutos] = useState([]);
  const [requisicaoExistente, setRequisicaoExistente] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [prioridadeSelecionada, setPrioridadeSelecionada] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset, setValue, getValues, watch } = useForm();

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      const produtosRef = collection(firestore, 'produtos');
      const snapshot = await getDocs(produtosRef);
      const produtosList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProdutos(produtosList);
      setLoading(false);
    };
  
    fetchProdutos();
    return () => setLoading(false);
  }, []);

  useEffect(() => {
    if (requisicaoSelecionada) { 
      reset({
        ...requisicaoSelecionada,
        dataEdicaoReq: dayjs().toDate(), // Garante que data de edição não será nula
      }); 
      setProdutoSelecionado({ strCategory: requisicaoSelecionada.produto });
      setPrioridadeSelecionada({ strCategory: requisicaoSelecionada.prioridade });

      
    } else {
      setProdutoSelecionado(null); // Reseta o produto selecionado se não houver requisição
    }
  }, [requisicaoSelecionada, reset, produtos]);

    // Atualiza o campo 'valorTotal' sempre que 'quantidade' ou 'valorUnitario' mudarem
  useEffect(() => {
    const quantidade = parseFloat(watch('quantidade')) || 0;
    const valorUnitario = parseFloat(watch('valorUnitario')) || 0;
    const total = quantidade * valorUnitario;

    // Usa setValue para atualizar o valor total no formulário
    setValue('valorTotal', total);
  }, [watch('quantidade'), watch('valorUnitario'), requisicaoSelecionada]);

  const verificarRequisicaoExistente = async (produto) => {
    const requisicoesRef = collection(firestore, 'requisicoes');
    const q = query(requisicoesRef, where('produto', '==', produto));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].id;
  };

  const onSubmit = async (dados) => {
    if (!usuarioLogado) {
      alert("Usuário não autenticado. Faça login para continuar.");
      return;
    }

      // Verifica se o produto foi selecionado
    if (!produtoSelecionado || !produtoSelecionado.strCategory) {
      alert("Produto não selecionado.");
      return;
    }

    setLoading(true);
    try {
      const requisicaoExistenteId = await verificarRequisicaoExistente(produtoSelecionado.strCategory);
      if (requisicaoExistenteId && !requisicaoSelecionada) {
        setRequisicaoExistente(requisicaoExistenteId);
        setConfirmDialog(true);
        setLoading(false);
        return;
      }

      if (requisicaoSelecionada) {
        await editarRequisicao(requisicaoSelecionada.RID, {
          ...dados,
          dataEdicaoReq: dayjs().toDate(), // Adicione aqui para garantir a data atual
        });
        setRidDialog(true); // Perguntar sobre gerar novo RID
        return;
      } else {
        await criarRequisicao(dados);
      }
    } catch (error) {
      console.error('Erro ao cadastrar ou editar Requisição de Compra:', error);
      alert('Erro ao cadastrar ou editar Requisição de Compra. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const criarRequisicao = async (dados) => {
    const requisicaoRef = doc(firestore, 'requisicoes', uuidv4());
    
    if (!produtoSelecionado || !prioridadeSelecionada) {
      alert("Produto e Prioridade devem ser selecionados.");
      return;
    }

    const valorTotalFormatado = parseFloat(dados.valorTotal).toFixed(2);
    
    await setDoc(requisicaoRef, {
      RID: requisicaoRef.id,
      produto: produtoSelecionado.strCategory,
      quantidade: parseInt(dados.quantidade),
      valorUnitario: parseFloat(dados.valorUnitario),
      valorTotal: parseFloat(valorTotalFormatado),
      solicitante: usuarioLogado.nome,
      notas: dados.notas,
      prioridade: prioridadeSelecionada.strCategory,
      statusCotacao: 'Aberta',
      dataRequisicao: dayjs().toDate(),
      dataEdicaoReq: null, // Data de edição nula no cadastro
    });
    setOpenDialog(true);
    reset();
  };

  const editarRequisicao = async (requisicaoId, dados) => {
    const requisicaoRef = doc(firestore, 'requisicoes', requisicaoId);
  
    try {
      const valorTotalFormatado = parseFloat(dados.valorTotal).toFixed(2);

      await setDoc(requisicaoRef, { 
        ...dados,
        produto: produtoSelecionado.strCategory,
        quantidade: parseInt(dados.quantidade),
        valorUnitario: parseFloat(dados.valorUnitario),
        valorTotal: parseFloat(valorTotalFormatado),
        solicitante: usuarioLogado.nome,
        prioridade: prioridadeSelecionada.strCategory,
        dataEdicaoReq: dayjs().toDate(), // Sempre define a data de edição
      });
      setOpenDialog(true);
      reset();
      atualizarLista();
    } catch (error) {
      console.error('Erro ao editar a requisição:', error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextFieldPadrao
              label="RID"
              value={requisicaoSelecionada ? requisicaoSelecionada.RID : uuidv4()}
              readOnly// Campo desabilitado para não permitir edição
            />
          </Grid>

          {!requisicaoSelecionada && (
          <Grid item xs={12}>
            <DatePickerPadrao
              label="Data de Requisição"
              value={watch('dataRequisicao') ? dayjs(watch('dataRequisicao')) : dayjs()} // Corrigido para usar o watch corretamente
              disabled={requisicaoSelecionada}
              onChange={(date) => {
                setValue('dataRequisicao', date ? dayjs(date).toDate() : ''); 
              }}
              {...register('dataRequisicao', { 
                required: requisicaoSelecionada ? 'Data de Requisição é obrigatória' : false
              })}
            />
            {errors.dataRequisicao && <p style={{ color: 'red', textAlign: 'center', margin: '10px', fontSize: '12px' }}>{errors.dataRequisicao.message}</p>}
          </Grid>
          )}

          {requisicaoSelecionada && (
          <Grid item xs={12}>
            <DatePickerPadrao
              label="Data de Edição"
              value={watch('dataEdicaoReq') ? dayjs(watch('dataEdicaoReq')) : dayjs()} // Corrigido para usar o watch corretamente
              readOnly
              onChange={(date) => {
                setValue('dataEdicaoReq', date ? dayjs(date).toDate() : ''); 
              }}
              {...register('dataEdicaoReq', { 
                required: requisicaoSelecionada ? 'Data de Edição da Requisição é obrigatória' : false 
              })}
            />
            {errors.dataEdicaoReq && <p style={{ color: 'red', textAlign: 'center', margin: '10px', fontSize: '12px' }}>{errors.dataEdicaoReq.message}</p>}
          </Grid>
          )}

          <Grid item xs={12}>
            <SelectCategoriaDropDown
              label="Produto"
              categorias={produtos.map(produto => ({
                idCategory: produto.id,
                strCategory: produto.nome,
              }))}
              categoriaSelecionada={produtoSelecionado}
              handleChange={setProdutoSelecionado}
            />
          </Grid>

          <Grid item xs={12}>
            <SelectCategoriaDropDown
              label="Prioridade"
              categorias={[
                { idCategory: '1', strCategory: 'Alta' },
                { idCategory: '2', strCategory: 'Normal' },
                { idCategory: '3', strCategory: 'Baixa' },
              ]}
              categoriaSelecionada={prioridadeSelecionada}
              handleChange={setPrioridadeSelecionada}
            />
          </Grid>

          <Grid item xs={2}>
            <TextFieldPadrao
              label="Quantidade"
              {...register('quantidade', { 
                required: 'Quantidade é obrigatória', 
                pattern: { 
                  value: /^[0-9]+$/, 
                  message: 'Apenas números inteiros são permitidos' 
                }
              })}
              error={!!errors.quantidade}
              helperText={errors.quantidade?.message}
              InputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*', // Aceita apenas números
              }}
              maxLength={3}
              InputLabelProps={{ shrink: true }}
              onInput={(event) => {
                // Remove qualquer caractere que não seja um dígito
                event.target.value = event.target.value.replace(/[^0-9]/g, '');
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextFieldPadrao
              label="Valor Unitário"
              {...register('valorUnitario', { 
                required: 'Valor unitário é obrigatório', 
                pattern: { 
                  value: /^[0-9]+(\.[0-9]{1,2})?$/, // Aceita números com até 2 casas decimais
                  message: 'Insira um valor válido com até duas casas decimais' 
                }
              })}
              error={!!errors.valorUnitario}
              helperText={errors.valorUnitario?.message}
              InputProps={{
                inputMode: 'decimal',
                pattern: /^[0-9]+(\.[0-9]{1,2})?$/, // Aceita números com até 2 casas decimais
              }}
              InputLabelProps={{ shrink: true }}
              onInput={(event) => {
                // Remove qualquer caractere que não seja um dígito
                event.target.value = event.target.value.replace(',', '.');
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextFieldPadrao
              label="Total"
              value={`${(watch('quantidade') * watch('valorUnitario')).toFixed(2)}`}
              InputProps={{
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]{0,2}',
                readOnly: true // Campo não editável
              }}
              {...register('valorTotal')} // Registra o valor total no formulário
            />
          </Grid>

          <Grid item xs={12}>
            <TextFieldPadrao
              label="Notas"
              {...register('notas')}
              error={!!errors.descricao}
              helperText={errors.descricao?.message}
              multiline
              rows={4}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Botao
                type="submit"
                startIcon={<SaveIcon />}
                texto="Criar / Salvar"
                cor="rgb(0, 120, 0)"
                hoverCor="rgb(0, 170, 0)"
              />
              <Botao
                startIcon={<BackspaceIcon />}
                texto="Limpar"
                cor="rgb(120, 0, 0)"
                hoverCor="rgb(170, 0, 0)"
                onClick={(e) => {
                  e.preventDefault();
                  reset();
                  setProdutoSelecionado(null);
                  setPrioridadeSelecionada(null);
                }}
              />
            </Box>
          </Grid>
        </Grid>
        
        {loading && <CircularLoading margin="20px 0 0 0" />}
      </form>

      <DialogPadrao
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          atualizarLista();
        }}
        title="Sucesso"
        content={<p>Requisição de Compra cadastrada com sucesso!</p>}
        actions={[{
          label: 'Fechar',
          color: 'rgba(0, 255, 0, 0.7)',
          hoverColor: 'rgba(0, 255, 0, 1)',
          onClick: () => {
            setOpenDialog(false);
            atualizarLista();
          },
        }]}
      />

      <DialogPadrao
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        title="Confirmação"
        content={<p>Já existe uma Requisição de Compra cadastrado com esse Produto. Deseja editar o registro existente?</p>}
        actions={[
          {
            label: 'Cancelar',
            color: 'rgba(255, 0, 0, 0.7)',
            hoverColor: 'rgba(255, 0, 0, 1)',
            onClick: () => setConfirmDialog(false),
          },
          {
            label: 'Editar',
            color: 'rgba(0, 255, 0, 0.7)',
            hoverColor: 'rgba(0, 255, 0, 1)',
            onClick: async () => {
              await editarRequisicao(requisicaoExistente, getValues());
              setConfirmDialog(false);
            },
          },
        ]}
      />

      <DialogPadrao
        open={RidDialog}
        onClose={() => setRidDialog(false)}
        title="Novo RID"
        content={<p>Deseja gerar um novo RID para esta Requisição de Compra?</p>}
        actions={[
          {
            label: 'Não',
            color: 'rgba(255, 0, 0, 0.7)',
            hoverColor: 'rgba(255, 0, 0, 1)',
            onClick: async () => {
              await editarRequisicao(requisicaoSelecionada.RID, getValues());
              setRidDialog(false);
            },
          },
          {
            label: 'Sim',
            color: 'rgba(0, 255, 0, 0.7)',
            hoverColor: 'rgba(0, 255, 0, 1)',
            onClick: async () => {
              const novoRID = uuidv4();
              await editarRequisicao(novoRID, getValues());
              setRidDialog(false);
            },
          },
        ]}
      />
    </>
  );
};

CadastroCompras.propTypes = {
  requisicaoSelecionada: PropTypes.shape({
    RID: PropTypes.string,
    dataRequisicao: PropTypes.object,
    produto: PropTypes.string,
    quantidade: PropTypes.number,
    valorUnitario: PropTypes.number,
    valorTotal: PropTypes.number,
    solicitante: PropTypes.string,
    notas: PropTypes.string,
    prioridade: PropTypes.string,
    statusCotacao: PropTypes.string,
  }),
  atualizarLista: PropTypes.func,
};

export default CadastroCompras;
