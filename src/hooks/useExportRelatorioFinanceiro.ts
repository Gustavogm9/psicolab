import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

interface DadosRelatorioFinanceiro {
  periodo: string;
  dataInicio?: string;
  dataFim?: string;
  metricas: {
    receita_total: number;
    receita_pendente: number;
    receita_atrasada: number;
    total_faturas: number;
    faturas_pagas: number;
    faturas_pendentes: number;
    faturas_atrasadas: number;
    ticket_medio: number;
    taxa_inadimplencia: number;
  };
  faturas: Array<{
    numero_fatura: string;
    cliente: { nome: string };
    valor: number;
    data_vencimento: string;
    data_pagamento?: string;
    status: string;
    descricao: string;
  }>;
}

export const useExportRelatorioFinanceiro = () => {
  const exportarExcel = (dados: DadosRelatorioFinanceiro) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Aba 1: Resumo Executivo
      const resumoData = [
        ['RELATÓRIO FINANCEIRO'],
        [''],
        ['Período', dados.periodo],
        ...(dados.dataInicio && dados.dataFim ? [['Data Início', dados.dataInicio], ['Data Fim', dados.dataFim]] : []),
        ['Data de Geração', new Date().toLocaleDateString('pt-BR')],
        [''],
        ['MÉTRICAS PRINCIPAIS'],
        [''],
        ['Receita Total', `R$ ${dados.metricas.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Receita Pendente', `R$ ${dados.metricas.receita_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Receita Atrasada', `R$ ${dados.metricas.receita_atrasada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        [''],
        ['Total de Faturas', dados.metricas.total_faturas],
        ['Faturas Pagas', dados.metricas.faturas_pagas],
        ['Faturas Pendentes', dados.metricas.faturas_pendentes],
        ['Faturas Atrasadas', dados.metricas.faturas_atrasadas],
        [''],
        ['Ticket Médio', `R$ ${dados.metricas.ticket_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Taxa de Inadimplência', `${dados.metricas.taxa_inadimplencia.toFixed(1)}%`],
      ];
      const resumo = XLSX.utils.aoa_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(workbook, resumo, 'Resumo');

      // Aba 2: Faturas Detalhadas
      const faturasFormatadas = dados.faturas.map(f => ({
        'Número': f.numero_fatura,
        'Cliente': f.cliente.nome,
        'Descrição': f.descricao,
        'Valor': f.valor,
        'Vencimento': new Date(f.data_vencimento).toLocaleDateString('pt-BR'),
        'Pagamento': f.data_pagamento ? new Date(f.data_pagamento).toLocaleDateString('pt-BR') : '-',
        'Status': f.status.toUpperCase(),
      }));
      const faturasSheet = XLSX.utils.json_to_sheet(faturasFormatadas);
      XLSX.utils.book_append_sheet(workbook, faturasSheet, 'Faturas');

      XLSX.writeFile(workbook, `relatorio-financeiro-${Date.now()}.xlsx`);
      toast.success('Relatório Excel exportado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar relatório. Tente novamente.');
      return false;
    }
  };

  const exportarPDF = (dados: DadosRelatorioFinanceiro) => {
    try {
      const doc = new jsPDF();
      let yPosition = 20;

      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246);
      doc.text('Relatório Financeiro', 14, yPosition);
      
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Período: ${dados.periodo}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, yPosition);
      
      yPosition += 15;

      // Métricas em cards
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(14, yPosition, 60, 25, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Receita Total', 20, yPosition + 8);
      doc.setFontSize(16);
      doc.text(`R$ ${dados.metricas.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 20, yPosition + 20);

      doc.setFillColor(234, 179, 8);
      doc.roundedRect(80, yPosition, 60, 25, 3, 3, 'F');
      doc.setFontSize(10);
      doc.text('Pendente', 86, yPosition + 8);
      doc.setFontSize(16);
      doc.text(`R$ ${dados.metricas.receita_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 86, yPosition + 20);

      doc.setFillColor(239, 68, 68);
      doc.roundedRect(146, yPosition, 50, 25, 3, 3, 'F');
      doc.setFontSize(10);
      doc.text('Atrasada', 152, yPosition + 8);
      doc.setFontSize(16);
      doc.text(`R$ ${dados.metricas.receita_atrasada.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 152, yPosition + 20);

      yPosition += 35;

      // Tabela de faturas
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Faturas do Período', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Número', 'Cliente', 'Valor', 'Vencimento', 'Status']],
        body: dados.faturas.slice(0, 20).map(f => [
          f.numero_fatura,
          f.cliente.nome,
          `R$ ${f.valor.toFixed(2)}`,
          new Date(f.data_vencimento).toLocaleDateString('pt-BR'),
          f.status.toUpperCase()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`relatorio-financeiro-${Date.now()}.pdf`);
      toast.success('Relatório PDF exportado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório. Tente novamente.');
      return false;
    }
  };

  return { exportarExcel, exportarPDF };
};
