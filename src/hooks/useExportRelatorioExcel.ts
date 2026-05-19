import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { getUserFriendlyError } from '@/lib/error-messages';

interface DadosRelatorioExcel {
  titulo: string;
  tipo: 'diagnostico' | 'avaliacao';
  resumo: {
    totalRespostas: number;
    taxaResposta?: number;
    scoreMedio?: number;
    leadsGerados?: number;
    periodo?: string;
  };
  respostas: Array<{
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    dataResposta: string;
    score?: number;
    categoria?: string;
    status: string;
  }>;
  categorias?: Array<{
    nome: string;
    totalQuestoes: number;
    scoreMedio: number;
    melhorScore: number;
    piorScore: number;
  }>;
  questoes?: Array<{
    categoria: string;
    pergunta: string;
    tipo: string;
    respostasPositivas?: number;
    respostasNegativas?: number;
    mediaPontos?: number;
  }>;
}

export const useExportRelatorioExcel = () => {
  const gerarRelatorioExcel = (dados: DadosRelatorioExcel) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Aba 1: Resumo Executivo
      const resumoData = [
        ['RESUMO EXECUTIVO'],
        [''],
        ['Título do Relatório', dados.titulo],
        ['Tipo', dados.tipo === 'diagnostico' ? 'Captação de Leads' : 'Avaliação Interna'],
        ['Data de Geração', new Date().toLocaleDateString('pt-BR')],
        ...(dados.resumo.periodo ? [['Período', dados.resumo.periodo]] : []),
        [''],
        ['MÉTRICAS PRINCIPAIS'],
        [''],
        ['Total de Respostas', dados.resumo.totalRespostas],
        ...(dados.resumo.taxaResposta !== undefined ? [['Taxa de Resposta', `${Math.round(dados.resumo.taxaResposta)}%`]] : []),
        ...(dados.resumo.scoreMedio !== undefined ? [['Score Médio', Math.round(dados.resumo.scoreMedio)]] : []),
        ...(dados.resumo.leadsGerados !== undefined ? [['Leads Gerados', dados.resumo.leadsGerados]] : []),
      ];
      const resumo = XLSX.utils.aoa_to_sheet(resumoData);
      
      // Estilizar título
      resumo['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "3B82F6" } },
        alignment: { horizontal: 'center' }
      };
      
      XLSX.utils.book_append_sheet(workbook, resumo, 'Resumo');

      // Aba 2: Respostas Individuais
      const respostasFormatadas = dados.respostas.map(r => ({
        'Nome': r.nome,
        'Email': r.email,
        'Telefone': r.telefone || '',
        'Data da Resposta': r.dataResposta,
        'Status': r.status,
        ...(r.score !== undefined && { 'Score': r.score }),
        ...(r.categoria && { 'Categoria': r.categoria }),
      }));
      const respostasSheet = XLSX.utils.json_to_sheet(respostasFormatadas);
      XLSX.utils.book_append_sheet(workbook, respostasSheet, 'Respostas Detalhadas');

      // Aba 3: Análise por Categoria (se disponível)
      if (dados.categorias && dados.categorias.length > 0) {
        const categoriasFormatadas = dados.categorias.map(c => ({
          'Categoria': c.nome,
          'Total de Questões': c.totalQuestoes,
          'Score Médio': Math.round(c.scoreMedio),
          'Melhor Score': c.melhorScore,
          'Pior Score': c.piorScore,
        }));
        const categoriasSheet = XLSX.utils.json_to_sheet(categoriasFormatadas);
        XLSX.utils.book_append_sheet(workbook, categoriasSheet, 'Análise por Categoria');
      }

      // Aba 4: Análise por Questão (se disponível)
      if (dados.questoes && dados.questoes.length > 0) {
        const questoesFormatadas = dados.questoes.map(q => ({
          'Categoria': q.categoria,
          'Pergunta': q.pergunta,
          'Tipo': q.tipo,
          ...(q.respostasPositivas !== undefined && { 'Respostas Positivas': q.respostasPositivas }),
          ...(q.respostasNegativas !== undefined && { 'Respostas Negativas': q.respostasNegativas }),
          ...(q.mediaPontos !== undefined && { 'Média de Pontos': Math.round(q.mediaPontos) }),
        }));
        const questoesSheet = XLSX.utils.json_to_sheet(questoesFormatadas);
        XLSX.utils.book_append_sheet(workbook, questoesSheet, 'Análise por Questão');
      }

      XLSX.writeFile(workbook, `relatorio-${dados.tipo}-detalhado-${Date.now()}.xlsx`);
      toast.success('Relatório Excel gerado com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao gerar Excel:', error);
      toast.error(getUserFriendlyError(error, { action: 'exportar', entity: 'questionário' }));
      return false;
    }
  };

  return { gerarRelatorioExcel };
};
