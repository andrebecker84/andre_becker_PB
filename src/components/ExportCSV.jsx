import { saveAs } from 'file-saver'; // Biblioteca para salvar arquivos no navegador
import Papa from 'papaparse'; // Biblioteca para converter dados em CSV

const ExportCSV = ({ historicoCotacoes, filename }) => {
  const exportarCSV = () => {
    // Converte os dados das cotações em CSV usando o PapaParse
    const csv = Papa.unparse(historicoCotacoes.map(cotacao => ({
      'Nome do Usuário': cotacao.responsavel,
      'Produto': cotacao.requisicao,
      'Preço Cotação 1': cotacao.precoCota1,
      'Preço Cotação 2': cotacao.precoCota2,
      'Preço Cotação 3': cotacao.precoCota3,
      'Data da Cotação': cotacao.dataCotacao,
      'Número da Cotação': cotacao.numeroCotacao,
      'Finalizado': cotacao.finalizado,
    })));

    // Cria um blob do arquivo CSV para ser baixado
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename); // Usa o nome do arquivo passado por props
  };

  return exportarCSV; // Retorne a função diretamente
};

export default ExportCSV;
