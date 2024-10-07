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

const CadastroContatos = ({ contatoSelecionado, atualizarLista }) => {
  const { usuarioLogado } = useAuth();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [CIDDialog, setCIDDialog] = useState(false); // Novo estado para confirmação de geração de CID
  const [fornecedores, setFornecedores] = useState([]);
  const [contatoExistente, setContatoExistente] = useState(null);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);
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
    if (contatoSelecionado) { 
      reset(contatoSelecionado); 
      setCargoSelecionado({ strCategory: contatoSelecionado.cargo });
      setFornecedorSelecionado({ strCategory: contatoSelecionado.fornecedor });
    }
  }, [contatoSelecionado, reset]);

  const verificarContatoExistente = async (nome) => {
    const contatosRef = collection(firestore, 'contatos');
    const q = query(contatosRef, where('nome', '==', nome));
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
      const contatoExistenteId = await verificarContatoExistente(dados.nome);
      if (contatoExistenteId && !contatoSelecionado) {
        setContatoExistente(contatoExistenteId);
        setConfirmDialog(true);
        setLoading(false);
        return;
      }

      if (contatoSelecionado) {
        setCIDDialog(true); // Perguntar sobre gerar novo CID
        return;
      }

      await criarContato(dados);
    } catch (error) {
      console.error('Erro ao cadastrar ou editar contato:', error);
      alert('Erro ao cadastrar ou editar contato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const criarContato = async (dados) => {
    const contatoRef = doc(firestore, 'contatos', uuidv4());
    
    if (!cargoSelecionado || !fornecedorSelecionado) {
      alert("Cargo e Fornecedor devem ser selecionados.");
      return;
    }
    
    await setDoc(contatoRef, {
      CID: contatoRef.id,
      cargo: cargoSelecionado.strCategory,
      fornecedor: fornecedorSelecionado.strCategory,
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      descricao: dados.descricao,
      criadoPor: usuarioLogado.nome,
      dataCriacao: new Date(),
    });
    setOpenDialog(true);
    reset();
  };

  const editarContato = async (contatoId, dados) => {
    const contatoRef = doc(firestore, 'contatos', contatoId);
    
    await setDoc(contatoRef, {
      CID: contatoId,
      cargo: cargoSelecionado.strCategory,
      fornecedor: fornecedorSelecionado.strCategory,
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      descricao: dados.descricao,
      criadoPor: usuarioLogado.nome,
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
              label="CID"
              value={contatoSelecionado ? contatoSelecionado.CID : uuidv4()} // Exibe o CID do contato selecionado ou um novo CID
              readOnly// Campo desabilitado para não permitir edição
            />
          </Grid>

          <Grid item xs={12}>
            <SelectCategoriaDropDown
              label="Cargo"
              categorias={[
                { idCategory: '1', strCategory: 'Diretor' },
                { idCategory: '2', strCategory: 'Gerente' },
                { idCategory: '3', strCategory: 'Financeiro' },
                { idCategory: '4', strCategory: 'Comprador' },
                { idCategory: '5', strCategory: 'Especialista em Negociação' },
                { idCategory: '6', strCategory: 'Administrativo' },
                { idCategory: '7', strCategory: 'Serviços' },
              ]}
              categoriaSelecionada={cargoSelecionado}
              handleChange={setCargoSelecionado}
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
              label="Nome"
              {...register('nome', { required: 'Nome é obrigatório', pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/ })}
              error={!!errors.nome}
              helperText={errors.nome?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={8}>
            <TextFieldPadrao
              label="E-mail"
              {...register('email', { required: 'E-mail é obrigatório', pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i })}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextFieldPadrao
              label="Telefone"
              {...register('telefone', { required: 'Telefone é obrigatório', pattern: /^\d{10,11}$/, maxLength: 11 })}
              placeholder="(99) 9999-9999"
              error={!!errors.telefone}
              helperText={errors.telefone?.message}
              maxLength={11}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextFieldPadrao
              label="Descrição do contato"
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
                  setCargoSelecionado(null);
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
        content={<p>Contato cadastrado com sucesso!</p>}
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
        content={<p>Já existe um contato cadastrado com esse NOME. Deseja editar o registro existente?</p>}
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
              await editarContato(contatoExistente, getValues());
              setConfirmDialog(false);
            },
          },
        ]}
      />

      <DialogPadrao
        open={CIDDialog}
        onClose={() => setCIDDialog(false)}
        title="Novo CID"
        content={<p>Deseja gerar um novo CID para este contato?</p>}
        actions={[
          {
            label: 'Não',
            color: 'rgba(255, 0, 0, 0.7)',
            hoverColor: 'rgba(255, 0, 0, 1)',
            onClick: async () => {
              await editarContato(contatoSelecionado.CID, getValues());
              setCIDDialog(false);
            },
          },
          {
            label: 'Sim',
            color: 'rgba(0, 255, 0, 0.7)',
            hoverColor: 'rgba(0, 255, 0, 1)',
            onClick: async () => {
              const novoCID = uuidv4();
              await editarContato(novoCID, getValues());
              setCIDDialog(false);
            },
          },
        ]}
      />
    </>
  );
};

CadastroContatos.propTypes = {
  contatoSelecionado: PropTypes.shape({
    CID: PropTypes.string,
    nome: PropTypes.string,
    descricao: PropTypes.string,
    cargo: PropTypes.string,
    fornecedor: PropTypes.string,
  }),
  atualizarLista: PropTypes.func,
};

export default CadastroContatos;
