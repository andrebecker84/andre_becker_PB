import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../configs/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import TextFieldPadrao from '../../components/TextFieldPadrao';
import Botao from '../../components/Botao';
import CircularLoading from '../../components/CircularLoading';
import DialogPadrao from '../../components/DialogPadrao';
import { Box, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { v4 as uuidv4 } from 'uuid';
import SelectCategoriaDropDown from '../../components/SelectCategoriaDropDown';
import PropTypes from 'prop-types';

const CadastroProdutos = ({ produtoSelecionado, atualizarLista }) => {
  const { usuarioLogado } = useAuth();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [pidDialog, setPidDialog] = useState(false); // Novo estado para confirmação de geração de PID
  const [fornecedores, setFornecedores] = useState([]);
  const [produtoExistente, setProdutoExistente] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm();

  useEffect(() => {
    const fetchFornecedores = async () => {
      setLoading(true);
      const fornecedoresRef = collection(firestore, 'fornecedores');
      const snapshot = await getDocs(fornecedoresRef);
      const fornecedoresList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFornecedores(fornecedoresList);
      setLoading(false);
    };

    fetchFornecedores();
    return () => setLoading(false);
  }, []);

  useEffect(() => {
    if (produtoSelecionado) { 
      reset(produtoSelecionado); 
      setCategoriaSelecionada({ strCategory: produtoSelecionado.categoria });
      setFornecedorSelecionado({ strCategory: produtoSelecionado.fornecedor });
    }
  }, [produtoSelecionado, reset]);

  const verificarProdutoExistente = async (nome) => {
    const produtosRef = collection(firestore, 'produtos');
    const q = query(produtosRef, where('nome', '==', nome));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].id;
  };

  const onSubmit = async (dados) => {
    if (!usuarioLogado) {
      alert("Usuário não autenticado. Faça login para continuar.");
      return;
    }

    setLoading(true);
    try {
      const produtoExistenteId = await verificarProdutoExistente(dados.nome);
      if (produtoExistenteId && !produtoSelecionado) {
        setProdutoExistente(produtoExistenteId);
        setConfirmDialog(true);
        setLoading(false);
        return;
      }

      if (produtoSelecionado) {
        setPidDialog(true); // Perguntar sobre gerar novo PID
        return;
      }

      await criarProduto(dados);
    } catch (error) {
      console.error('Erro ao cadastrar ou editar produto:', error);
      alert('Erro ao cadastrar ou editar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const criarProduto = async (dados) => {
    const produtoRef = doc(firestore, 'produtos', uuidv4());
    
    if (!categoriaSelecionada || !fornecedorSelecionado) {
      alert("Categoria e Fornecedor devem ser selecionados.");
      return;
    }
    
    await setDoc(produtoRef, {
      PID: produtoRef.id,
      categoria: categoriaSelecionada.strCategory,
      fornecedor: fornecedorSelecionado.strCategory,
      nome: dados.nome,
      descricao: dados.descricao,
      criadoPor: usuarioLogado.email,
      dataCriacao: new Date(),
    });
    setOpenDialog(true);
    reset();
    // atualizarLista();
  };

  const editarProduto = async (produtoId, dados) => {
    const produtoRef = doc(firestore, 'produtos', produtoId);
    
    await setDoc(produtoRef, {
      PID: produtoId,
      categoria: categoriaSelecionada.strCategory,
      fornecedor: fornecedorSelecionado.strCategory,
      nome: dados.nome,
      descricao: dados.descricao,
      criadoPor: usuarioLogado.email,
      dataCriacao: new Date(),
    });
    setOpenDialog(true);
    reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextFieldPadrao
              label="PID"
              value={produtoSelecionado ? produtoSelecionado.PID : uuidv4()} // Exibe o PID do produto selecionado ou um novo PID
              readOnly// Campo desabilitado para não permitir edição
            />
          </Grid>

          <Grid item xs={12}>
            <SelectCategoriaDropDown
              label="Categoria"
              categorias={[
                { idCategory: '1', strCategory: 'Limpeza' },
                { idCategory: '2', strCategory: 'Escritório' },
                { idCategory: '3', strCategory: 'Móveis' },
                { idCategory: '4', strCategory: 'Equipamentos' },
                { idCategory: '5', strCategory: 'Utensílios' },
                { idCategory: '6', strCategory: 'Diversos' },
              ]}
              categoriaSelecionada={categoriaSelecionada}
              handleChange={setCategoriaSelecionada}
            />
          </Grid>

          <Grid item xs={12}>
            <SelectCategoriaDropDown
              label="Fornecedor"
              categorias={fornecedores.map(fornecedor => ({
                idCategory: fornecedor.id,
                strCategory: fornecedor.nome,
              }))}
              categoriaSelecionada={fornecedorSelecionado}
              handleChange={setFornecedorSelecionado}
            />
          </Grid>

          <Grid item xs={12}>
            <TextFieldPadrao
              label="Nome do Produto"
              {...register('nome', { required: 'Nome do produto é obrigatório' })}
              error={!!errors.nome}
              helperText={errors.nome?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextFieldPadrao
              label="Descrição do Produto"
              {...register('descricao')}
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
                  setCategoriaSelecionada(null);
                  setFornecedorSelecionado(null);
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
        content={<p>Produto cadastrado com sucesso!</p>}
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
        content={<p>Já existe um produto cadastrado com esse NOME. Deseja editar o registro existente?</p>}
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
              await editarProduto(produtoExistente, getValues());
              setConfirmDialog(false);
            },
          },
        ]}
      />

      <DialogPadrao
        open={pidDialog}
        onClose={() => setPidDialog(false)}
        title="Novo PID"
        content={<p>Deseja gerar um novo PID para este produto?</p>}
        actions={[
          {
            label: 'Não',
            color: 'rgba(255, 0, 0, 0.7)',
            hoverColor: 'rgba(255, 0, 0, 1)',
            onClick: async () => {
              await editarProduto(produtoSelecionado.PID, getValues());
              setPidDialog(false);
            },
          },
          {
            label: 'Sim',
            color: 'rgba(0, 255, 0, 0.7)',
            hoverColor: 'rgba(0, 255, 0, 1)',
            onClick: async () => {
              const novoPid = uuidv4();
              await editarProduto(novoPid, getValues());
              setPidDialog(false);
            },
          },
        ]}
      />
    </>
  );
};

CadastroProdutos.propTypes = {
  produtoSelecionado: PropTypes.shape({
    PID: PropTypes.string,
    categoria: PropTypes.string,
    fornecedor: PropTypes.string,
    nome: PropTypes.string,
    descricao: PropTypes.string,
    criadoPor: PropTypes.string,
    dataCriacao: PropTypes.object,
  }),
  atualizarLista: PropTypes.func.isRequired,
};

export default CadastroProdutos;
