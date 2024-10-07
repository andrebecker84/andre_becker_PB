import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
import PropTypes from 'prop-types';

const CadastroFornecedores = ({ fornecedorSelecionado, atualizarLista }) => {
  const { usuarioLogado } = useAuth();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [cnpjExistente, setCnpjExistente] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm();

  useEffect(() => {
    if (fornecedorSelecionado) {
      reset(fornecedorSelecionado); // Preencher os campos do formulário com os dados do fornecedor
    }
  }, [fornecedorSelecionado, reset]);

  const verificarCnpjExistente = async (cnpj) => {
    const fornecedorRef = doc(firestore, 'fornecedores', cnpj);
    const fornecedorDoc = await getDoc(fornecedorRef);
    return fornecedorDoc.exists(); // Retorna true se o CNPJ já existe
  };

  const onSubmit = async (dados) => {
    if (!usuarioLogado) {  // Verifique se `usuarioLogado` está definido
      alert("Usuário não autenticado. Faça login para continuar.");
      return;
    }
    
    setLoading(true);
    try {
      const cnpjJaExistente = await verificarCnpjExistente(dados.cnpj);
      if (cnpjJaExistente) {
        setCnpjExistente(dados.cnpj);
        setConfirmDialog(true); // Abre o diálogo de confirmação
        setLoading(false);
        return; // Para o fluxo atual
      }

      // Se não existir, cria o fornecedor
      await criarFornecedor(dados);
    } catch (error) {
      console.error('Erro ao cadastrar fornecedor:', error);
      alert('Erro ao cadastrar fornecedor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const criarFornecedor = async (dados) => {
    const fornecedorRef = doc(firestore, 'fornecedores', dados.cnpj);
    await setDoc(fornecedorRef, {
      nome: dados.nome,
      cnpj: dados.cnpj,
      email: dados.email,
      telefone: dados.telefone,
      cep: dados.cep,
      cidade: dados.cidade,
      estado: dados.estado,
      logradouro: dados.logradouro,
      numero: dados.numero,
      complemento: dados.complemento,
      bairro: dados.bairro,
      criadoPor: usuarioLogado.email,
      dataCriacao: new Date(),
      token: uuidv4(),
    });
    setOpenDialog(true);
    reset(); // Limpa os campos do formulário
  };
  
  const confirmarEdicao = async () => {
    const dados = getValues(); // Obtem os dados atuais do formulário
    const fornecedorRef = doc(firestore, 'fornecedores', cnpjExistente);
    await setDoc(fornecedorRef, {
      nome: dados.nome,
      cnpj: dados.cnpj,
      email: dados.email,
      telefone: dados.telefone,
      cep: dados.cep,
      cidade: dados.cidade,
      estado: dados.estado,
      logradouro: dados.logradouro,
      numero: dados.numero,
      complemento: dados.complemento,
      bairro: dados.bairro,
      criadoPor: usuarioLogado.email, // Manter o criador atual
      dataCriacao: new Date(), // Atualiza a data de edição
      token: uuidv4(),
    });
    setOpenDialog(true);
    reset(); // Limpa os campos do formulário
    atualizarLista();
    setConfirmDialog(false); // Fecha o diálogo de confirmação ////////////////////////////////////////////////
    setCnpjExistente(null); // Limpa a variável do CNPJ        ////////////////////////////////////////////////
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cepLimpo.length !== 8) {
      alert('CEP inválido. Certifique-se de que o CEP tenha 8 dígitos.');
      return;
    }
    
    setCepLoading(true); // Começa o loading do CEP
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (data && !data.erro) {
        setValue('cidade', data.localidade);
        setValue('estado', data.uf);
        setValue('logradouro', data.logradouro);
        setValue('bairro', data.bairro);
      } else {
        alert('CEP não encontrado. Verifique o CEP e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente mais tarde.');
    } finally {
      setCepLoading(false); // Para o loading do CEP
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={1}>
          <Grid item xs={8}>
            <TextFieldPadrao
              label="Nome"
              {...register('nome', { required: 'Nome é obrigatório', pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/ })}
              error={!!errors.nome}
              helperText={errors.nome?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextFieldPadrao
              label="CNPJ"
              {...register('cnpj', { required: 'CNPJ é obrigatório', pattern: /^\d{14}$/, maxLength: 14 })}
              placeholder="99.999.999/9999-99"
              error={!!errors.cnpj}
              helperText={errors.cnpj?.message}
              maxLength={14}
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

          <Grid item xs={4}>
            <TextFieldPadrao
              label="CEP"
              {...register('cep', { 
                  required: 'CEP é obrigatório',
                  pattern: /^\d{8}$/,
                  maxLength: 8,
                },
              )}
              onBlur={(e) => {
                if (!errors.cep && e.target.value) { // Verifica se não há erros e se o campo não está vazio
                  buscarCep(e.target.value);
                }
              }}
              placeholder="99999-999"
              error={!!errors.cep}
              helperText={errors.cep?.message}
              maxLength={8}
              InputProps={{
                endAdornment: cepLoading ? <CircularLoading size={20} /> : null, // Exibe loading se necessário
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextFieldPadrao
              label="Cidade"
              {...register('cidade', { required: 'Cidade é obrigatória', pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/ })}
              error={!!errors.cidade}
              helperText={errors.cidade?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={2}>
            <TextFieldPadrao
              label="Estado"
              {...register('estado', { required: 'Estado é obrigatório', pattern: /^[A-Za-z]{2}$/ })}
              error={!!errors.estado}
              helperText={errors.estado?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={9}>
            <TextFieldPadrao
              label="Logradouro"
              {...register('logradouro', { required: 'Logradouro é obrigatório' })}
              error={!!errors.logradouro}
              helperText={errors.logradouro?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextFieldPadrao
              label="Número"
              {...register('numero', { required: 'Número é obrigatório', pattern: /^\d+$/ })}
              error={!!errors.numero}
              helperText={errors.numero?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextFieldPadrao
              label="Bairro"
              {...register('bairro', { required: 'Bairro é obrigatório', pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/ })}
              error={!!errors.bairro}
              helperText={errors.bairro?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextFieldPadrao
              label="Complemento"
              {...register('complemento')}
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
        content={<p>Fornecedor cadastrado com sucesso!</p>}
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
        content={<p>Já existe um fornecedor cadastrado com esse CNPJ. Deseja editar o registro existente?</p>}
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
              await confirmarEdicao(); // Chama a função para editar
              setConfirmDialog(false); // Fecha o diálogo de confirmação
            },
          },
        ]}
      />
    </>
  );
};

CadastroFornecedores.propTypes = {
  atualizarLista: PropTypes.func,
  fornecedorSelecionado: PropTypes.object,
};

export default CadastroFornecedores;
