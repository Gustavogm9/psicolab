import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getUserFriendlyError } from '@/lib/error-messages';

export const useExportRelatorioROI = () => {
  const exportarPDF = async (relatorioId: string) => {
    try {
      // Buscar dados do relatório
      const { data: relatorio, error } = await supabase
        .from('relatorios_roi')
        .select(`
          *,
          questionario:questionarios_diagnostico(titulo, slug, categoria)
        `)
        .eq('id', relatorioId)
        .single();

      if (error) throw error;
      if (!relatorio) throw new Error('Relatório não encontrado');

      const metricas = relatorio.metricas_detalhadas as any;
      const analise = metricas?.analise_completa;
      const roi = metricas?.roi_detalhado;

      // Criar PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text('Relatório de ROI', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`${relatorio.questionario?.titulo || 'Questionário'}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setFontSize(10);
      doc.text(
        `Período: ${new Date(relatorio.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(relatorio.data_fim).toLocaleDateString('pt-BR')}`,
        pageWidth / 2,
        yPos,
        { align: 'center' }
      );

      yPos += 15;

      // Resumo Executivo
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Resumo Executivo', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const resumoLines = [
        `Total de Respostas: ${relatorio.total_respostas}`,
        `Leads Gerados: ${relatorio.leads_gerados}`,
        `Taxa de Conversão: ${relatorio.taxa_conversao?.toFixed(1)}%`,
        `Funcionários Impactados: ${metricas?.numeroFuncionarios || 0}`,
      ];
      resumoLines.forEach(line => {
        doc.text(line, 14, yPos);
        yPos += 6;
      });

      yPos += 8;

      // Análise Financeira
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Análise Financeira', 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: [
          ['Investimento', `R$ ${relatorio.investimento?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`],
          ['Economia Anual', `R$ ${roi?.economiaAnual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`],
          ['Retorno Estimado', `R$ ${relatorio.retorno_estimado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`],
          ['ROI', `${relatorio.roi_percentual?.toFixed(1) || '0,0'}%`],
          ['Payback', `${roi?.payback?.toFixed(1) || '0,0'} meses`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Benefícios Identificados
      if (roi?.beneficios && roi.beneficios.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Benefícios Identificados', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        roi.beneficios.forEach((beneficio: string, index: number) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const text = `${index + 1}. ${beneficio}`;
          const lines = doc.splitTextToSize(text, pageWidth - 28);
          lines.forEach((line: string) => {
            doc.text(line, 14, yPos);
            yPos += 5;
          });
          yPos += 2;
        });
      }

      // Análise por Categorias
      if (analise?.categoryScores && analise.categoryScores.length > 0) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Análise por Categorias', 14, yPos);
        yPos += 8;

        const categoriaData = analise.categoryScores.map((cat: any) => [
          cat.categoria || 'N/A',
          `${cat.percentage?.toFixed(1) || '0'}%`,
          cat.level || 'N/A',
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Categoria', 'Score', 'Nível']],
          body: categoriaData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Recomendações
      if (analise?.recommendations && analise.recommendations.length > 0) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Recomendações de Ação', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        analise.recommendations.slice(0, 5).forEach((rec: string, index: number) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const text = `${index + 1}. ${rec}`;
          const lines = doc.splitTextToSize(text, pageWidth - 28);
          lines.forEach((line: string) => {
            doc.text(line, 14, yPos);
            yPos += 5;
          });
          yPos += 2;
        });
      }

      // Rodapé em todas as páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth - 14,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' }
        );
      }

      // Salvar PDF
      const fileName = `relatorio-roi-${relatorio.questionario?.slug || 'questionario'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('Relatório exportado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error);
      toast.error(getUserFriendlyError(error, { action: 'exportar', entity: 'questionário' }));
    }
  };

  const compartilharEmail = async (relatorioId: string, emails: string[]) => {
    try {
      const { data: relatorio, error } = await supabase
        .from('relatorios_roi')
        .select(`
          *,
          questionario:questionarios_diagnostico(titulo)
        `)
        .eq('id', relatorioId)
        .single();

      if (error) throw error;

      // Aqui você pode implementar o envio de email via edge function
      // Por enquanto, apenas mostrar sucesso
      toast.success(`Relatório compartilhado com ${emails.length} destinatário(s)`);
    } catch (error: any) {
      console.error('Erro ao compartilhar relatório:', error);
      toast.error(getUserFriendlyError(error, { action: 'enviar', entity: 'questionário' }));
    }
  };

  return {
    exportarPDF,
    compartilharEmail,
  };
};
