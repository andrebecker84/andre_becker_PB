import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../configs/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import TextFieldPadrao from '../../components/TextFieldPadrao';
import Container from '../../components/Container';
import Botao from '../../components/Botao';
import CircularLoading from '../../components/CircularLoading';
import DialogPadrao from '../../components/DialogPadrao';
import SelectCategoriaDropDown from '../../components/SelectCategoriaDropDown';
import { Box, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BackspaceIcon from '@mui/icons-material/Backspace';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const CadastroCotacoes = ({ cotacaoSelecionada, atualizarLista }) => {
  const { usuarioLogado } = useAuth();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [requisicoes, setRequisicoes] = useState([]);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const [numeroCotacao, setNumeroCotacao] = useState(0);
  const [listaAtualizada, setListaAtualizada] = useState(false);
  const [cotacoes, setCotacoes] = useState([]);

  const formatarValor = (valor) => {
    return `R$ ${valor.toFixed(2).replace(',', '.')}`; // Formata com R$ e substitui o ponto por vírgula
  };

  const exportarCSV = async () => {
    // Verifica se a requisição foi selecionada
    if (!requisicaoSelecionada) {
      alert("Nenhuma requisição selecionada para exportar.");
      return;
    }
  
    try {
      // Consulta as cotações no Firestore
      const cotacoesRef = collection(firestore, 'cotacoes');
      const snapshot = await getDocs(cotacoesRef);
  
      // Filtra as cotações baseadas na requisição selecionada (RID)
      const cotacoesList = snapshot.docs
        .filter(doc => doc.data().RID === requisicaoSelecionada.RID)
        .map(doc => ({
          'Nome do Usuario': doc.data().responsavel || 'N/A',
          'RID Requisicao UUID': doc.data().RID || 'N/A',
          'Produto': doc.data().requisicao || 'N/A',
          'Preco Cotacao 1': doc.data().precoCota1 ? formatarValor(doc.data().precoCota1) : formatarValor(0),
          'Preco Cotacao 2': doc.data().precoCota2 ? formatarValor(doc.data().precoCota2) : formatarValor(0),
          'Preco Cotacao 3': doc.data().precoCota3 ? formatarValor(doc.data().precoCota3) : formatarValor(0),
          'Data da Cotacao': doc.data().dataCotacao ? 
            new Date(doc.data().dataCotacao.seconds * 1000).toLocaleDateString('pt-BR') : 'Data invalida',
          'Finalizado': doc.data().finalizado ? 'SIM' : 'NAO'
        }));
  
      // Verifica se a lista de cotações está vazia
      if (cotacoesList.length === 0) {
        alert("Nenhuma cotação encontrada para essa requisição.");
        return;
      }
  
      // Converte os dados filtrados para CSV
      const csv = Papa.unparse(cotacoesList, {
        quotes: true, // Adiciona aspas em todos os campos para evitar problemas com caracteres especiais
        delimiter: ";", // Usar ponto e vírgula como delimitador no lugar da vírgula (padrão no Brasil)
      });
  
      // Cria o arquivo CSV com codificação adequada (UTF-8)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'cotacoes.csv');
  
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      alert("Ocorreu um erro ao exportar os dados.");
    }
  };

  useEffect(() => {
    const fetchRequisicoes = async () => {
      setLoading(true);
      const requisicoesRef = collection(firestore, 'requisicoes');
      const snapshot = await getDocs(requisicoesRef);
      const requisicoesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequisicoes(requisicoesList);
      setLoading(false);
    };

    fetchRequisicoes();
  }, []);

  useEffect(() => {
    if (requisicaoSelecionada) {
      const { RID } = requisicaoSelecionada;
      const fetchCotacoes = async () => {
        const cotacoesRef = collection(firestore, 'cotacoes');
        const snapshot = await getDocs(cotacoesRef);
        const cotacao = snapshot.docs.find(doc => doc.data().RID === RID);
        
        if (cotacao) {
          const { precoCota1, precoCota2, precoCota3, notasCotacao, finalizado, numeroCotacao } = cotacao.data();
          setValue('precoCota1', precoCota1 || '');
          setValue('precoCota2', precoCota2 || '');
          setValue('precoCota3', precoCota3 || '');
          setValue('notasCotacao', notasCotacao || '');
          setValue('finalizado', finalizado || false);
          // Aqui, adicione o número da cotação
          setValue('numeroCotacao', numeroCotacao || ''); // Verifique se isso está correto
        }
      };

      fetchCotacoes();
    }
  }, [requisicaoSelecionada, setValue]);

  useEffect(() => {
    const fetchCotacoes = async () => {
      const cotacoesRef = collection(firestore, 'cotacoes');
      const snapshot = await getDocs(cotacoesRef);
      const cotacao = snapshot.docs.find(doc => doc.data().RID === requisicaoSelecionada.RID);
      
      if (cotacao) {
        const { numeroCotacao } = cotacao.data();
        setNumeroCotacao(numeroCotacao);
      }
    };
  
    if (requisicaoSelecionada) {
      fetchCotacoes();
    }
  }, [requisicaoSelecionada]);  

  useEffect(() => {
    const atualizarStatusRequisicao = async () => {
      if (requisicaoSelecionada) {
        const { RID } = requisicaoSelecionada;
        const requisicaoRef = doc(firestore, 'requisicoes', RID);
  
        // Verifica e atualiza o status com base no numeroCotacao
        if (numeroCotacao >= 2 && numeroCotacao <= 3) {
          await setDoc(requisicaoRef, { statusCotacao: 'Em cotação...' }, { merge: true });
        } else {
          await setDoc(requisicaoRef, { statusCotacao: 'Aberta' }, { merge: true });
        }
  
        // Atualiza para "Cotado" se finalizado for true
        const cotacoesRef = collection(firestore, 'cotacoes');
        const snapshot = await getDocs(cotacoesRef);
        const cotacao = snapshot.docs.find(doc => doc.data().RID === RID);
  
        if (cotacao && cotacao.data().finalizado) {
          await setDoc(requisicaoRef, { statusCotacao: 'Cotado' }, { merge: true });
        }
      }
    };
  
    atualizarStatusRequisicao();
  }, [numeroCotacao, requisicaoSelecionada]);
  
  const handleSelectRequisicao = (requisicao) => {
    setRequisicaoSelecionada(requisicao);
    setNumeroCotacao(0); // Reset para o valor inicial se necessário

    // Resetando os valores do formulário
    reset({
        precoCota1: '',
        precoCota2: '',
        precoCota3: '',
        notasCotacao: '',
        finalizado: false,
        // Adicione outros campos que você quer resetar
    });
};

  const onSubmit = async (dados) => {
    if (!usuarioLogado) {
        alert("Usuário não autenticado. Faça login para continuar.");
        return;
    }

    if (!requisicaoSelecionada || !requisicaoSelecionada.strCategory.trim()) {
        alert("Requisição não selecionada.");
        return;
    }

    setLoading(true);
    try {
        const { precoCota1, precoCota2, precoCota3 } = dados;

        // Defina o numeroCotacao com base nos preços preenchidos
        let novoNumeroCotacao = 1;
        if (precoCota1) novoNumeroCotacao = 2;
        if (precoCota2) novoNumeroCotacao = 3;

        setNumeroCotacao(novoNumeroCotacao); // Atualize o estado

        let finalizado = !!precoCota3;

        await setDoc(doc(firestore, 'cotacoes', requisicaoSelecionada.RID), {
            RID: requisicaoSelecionada.RID,
            numeroCotacao: novoNumeroCotacao,
            requisicao: requisicaoSelecionada.strCategory,
            responsavel: usuarioLogado.nome,
            precoCota1: parseFloat(precoCota1) || null,
            precoCota2: parseFloat(precoCota2) || null,
            precoCota3: parseFloat(precoCota3) || null,
            notasCotacao: dados.notasCotacao || '',
            finalizado,
            dataCotacao: dayjs().toDate(),
        });

        // Atualize o status da requisição com base no novoNumeroCotacao
        if (finalizado) {
          const requisicaoRef = doc(firestore, 'requisicoes', requisicaoSelecionada.RID);
          await setDoc(requisicaoRef, { statusCotacao: 'Cotado' }, { merge: true });
      } else if (novoNumeroCotacao >= 2) {
          const requisicaoRef = doc(firestore, 'requisicoes', requisicaoSelecionada.RID);
          await setDoc(requisicaoRef, { statusCotacao: 'Em cotação...' }, { merge: true });
      }

        setOpenDialog(true);
        reset();
    } catch (error) {
        console.error('Erro ao cadastrar cotação:', error);
        alert('Erro ao cadastrar cotação. Tente novamente.');
    } finally {
        setLoading(false);
    }
};
  
  // A função isReadOnly continua a mesma
  const isReadOnly = (campo) => {
    const finalizado = watch('finalizado');
  
    if (finalizado) {
      return true;
    }
  
    const precoCota1 = watch('precoCota1');
    const precoCota2 = watch('precoCota2');
    const precoCota3 = watch('precoCota3');
  
    if (campo === 'precoCota1') {
      return precoCota1 !== '' && (precoCota2 !== '' || precoCota3 !== '');
    }
    if (campo === 'precoCota2') {
      return precoCota2 !== '' && precoCota3 !== '';
    }
    if (campo === 'precoCota3') {
      return precoCota3 !== '';
    }
  
    return false;
  };  

  const excluirCotacao = async () => {
    if (requisicaoSelecionada) {
      const { RID } = requisicaoSelecionada;
      const requisicaoRef = doc(firestore, 'requisicoes', RID);
      
      try {
        // Exclui a cotação
        await deleteDoc(doc(firestore, 'cotacoes', RID));
        
        // Atualiza o statusCotacao para "Aberta"
        await setDoc(requisicaoRef, { statusCotacao: 'Aberta' }, { merge: true });
        
        setOpenDialog(true);
        reset();
        atualizarLista();
      } catch (error) {
        console.error('Erro ao excluir cotação:', error);
        alert('Erro ao excluir cotação. Tente novamente.');
      }
    }
  };  

  return (
    <>
      <Container width='auto' margin='0 0 20px' padding='15px 15px' bradius='30px' centralizarHorizontal='space-between'>
        <div>
          <p>{`Cotação nº ${numeroCotacao || 1}`}</p>
        </div>
      </Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextFieldPadrao
              label="RID"
              value={requisicaoSelecionada ? requisicaoSelecionada.RID : ''}
              readOnly
            />
          </Grid>

          <Grid item xs={12}>
            <SelectCategoriaDropDown
              label="Requisição"
              categorias={requisicoes.map((requisicao) => ({
                idCategory: requisicao.id,
                strCategory: requisicao.produto,
                RID: requisicao.RID,
              }))}
              categoriaSelecionada={requisicaoSelecionada}
              handleChange={handleSelectRequisicao}
            />
          </Grid>

          {['precoCota1', 'precoCota2', 'precoCota3'].map((campo, index) => (
            <Grid item xs={4} key={campo}>
              <TextFieldPadrao
                label={`Preço (Cotação ${index + 1})`}
                {...register(campo, {
                  required: index === 0 ? 'Preço Cotação 1 é obrigatório' : false,
                  pattern: {
                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                    message: 'Insira um valor válido com até duas casas decimais',
                  },
                })}
                value={watch(campo) || ''}
                readOnly={isReadOnly(campo)}
                error={!!errors[campo]}
                helperText={errors[campo]?.message}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <TextFieldPadrao
              label="Notas da Cotação"
              {...register('notasCotacao')}
              error={!!errors.notasCotacao}
              helperText={errors.notasCotacao?.message}
              multiline
              rows={4}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="center">
            <Botao
              largura="100%"
              type="submit"
              startIcon={<SaveIcon />}
              texto="Criar / Salvar"
              cor="rgb(0, 120, 0)"
              hoverCor="rgb(0, 170, 0)"
            />
            <Botao
              largura="100%"
              startIcon={<BackspaceIcon />}
              texto="Limpar"
              cor="rgb(120, 0, 0)"
              hoverCor="rgb(170, 0, 0)"
              onClick={(e) => {
                e.preventDefault();
                reset();
                setRequisicaoSelecionada(null);
              }}
            />
            <Botao
              largura="100%"
              startIcon={<DeleteIcon />}
              texto="Excluir"
              cor="rgb(255, 0, 0)"
              hoverCor="rgb(255, 100, 100)"
              onClick={(e) => {
                e.preventDefault();
                excluirCotacao();
              }}
            />
          </Box>
        </Grid>

        {loading && <CircularLoading />}
      </form>

      <Box display="flex" justifyContent="center">
        <Botao
          largura="100%"
          startIcon={<FileDownloadIcon />}
          texto="Exportar CSV"
          cor="rgb(0, 60, 160)"
          hoverCor="rgb(0, 100, 255)"
          onClick={async (e) => {
            e.preventDefault();
            await exportarCSV(); // Chame a função de exportação aqui
          }}
        />
      </Box>

      <DialogPadrao
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          atualizarLista();
        }}
        title="Sucesso"
        content={<p>Cotação cadastrada com sucesso!</p>}
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
    </>
  );
};

export default CadastroCotacoes;
