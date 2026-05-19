import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { getUserFriendlyError } from '@/lib/error-messages';

interface DadosRelatorio {
  titulo: string;
  tipo: 'diagnostico' | 'avaliacao';
  periodo?: string;
  cliente?: string;
  totalRespostas: number;
  taxaResposta?: number;
  scoreMedio?: number;
  categorias?: Array<{
    nome: string;
    score: number;
    status: string;
  }>;
  questoes?: Array<{
    pergunta: string;
    resposta: string | number;
  }>;
}

export const useExportRelatorioPDF = () => {
  const gerarRelatorioPDF = async (dados: DadosRelatorio) => {
    try {
      const doc = new jsPDF();
      let yPosition = 20;

      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246); // blue-600
      doc.text('Relatório de ' + (dados.tipo === 'diagnostico' ? 'Captação de Leads' : 'Avaliação Interna'), 14, yPosition);
      
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(dados.titulo, 14, yPosition);
      
      yPosition += 8;
      if (dados.cliente) {
        doc.text(`Cliente: ${dados.cliente}`, 14, yPosition);
        yPosition += 6;
      }
      if (dados.periodo) {
        doc.text(`Período: ${dados.periodo}`, 14, yPosition);
        yPosition += 6;
      }
      doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, yPosition);
      
      yPosition += 15;

      // KPIs em cards
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(14, yPosition, 60, 25, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Total de Respostas', 20, yPosition + 8);
      doc.setFontSize(20);
      doc.text(String(dados.totalRespostas), 20, yPosition + 20);

      if (dados.taxaResposta !== undefined) {
        doc.setFillColor(34, 197, 94); // green-600
        doc.roundedRect(80, yPosition, 60, 25, 3, 3, 'F');
        doc.setFontSize(10);
        doc.text('Taxa de Resposta', 86, yPosition + 8);
        doc.setFontSize(20);
        doc.text(`${Math.round(dados.taxaResposta)}%`, 86, yPosition + 20);
      }

      if (dados.scoreMedio !== undefined) {
        doc.setFillColor(168, 85, 247); // purple-600
        doc.roundedRect(146, yPosition, 50, 25, 3, 3, 'F');
        doc.setFontSize(10);
        doc.text('Score Médio', 152, yPosition + 8);
        doc.setFontSize(20);
        doc.text(String(Math.round(dados.scoreMedio)), 152, yPosition + 20);
      }

      yPosition += 35;

      // Tabela de categorias
      if (dados.categorias && dados.categorias.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Análise por Categoria', 14, yPosition);
        yPosition += 5;

        autoTable(doc, {
          startY: yPosition,
          head: [['Categoria', 'Score', 'Status']],
          body: dados.categorias.map(c => [
            c.nome,
            String(c.score),
            c.status
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }

      // Tabela de questões
      if (dados.questoes && dados.questoes.length > 0 && yPosition < 250) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Detalhamento das Respostas', 14, yPosition);
        yPosition += 5;

        autoTable(doc, {
          startY: yPosition,
          head: [['Questão', 'Resposta']],
          body: dados.questoes.map(q => [
            q.pergunta,
            String(q.resposta)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [168, 85, 247] },
        });
      }

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount} - Gerado por PsiColab`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`relatorio-${dados.tipo}-${Date.now()}.pdf`);
      toast.success('Relatório PDF gerado com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast.error(getUserFriendlyError(error, { action: 'exportar', entity: 'questionário' }));
      return false;
    }
  };

  return { gerarRelatorioPDF };
};
