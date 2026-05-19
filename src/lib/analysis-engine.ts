import { mockQuestoes, mockQuestionarios } from "./mock-data";

// Tipos para análise
export interface AnalysisResult {
  pontuacaoTotal: number;
  pontuacaoMaxima: number;
  percentual: number;
  nivel: 'baixo' | 'medio' | 'alto' | 'critico';
  categorias: CategoryScore[];
  recomendacoes: string[];
  pontosFracos: string[];
  pontosFortes: string[];
}

export interface CategoryScore {
  categoria: string;
  pontuacao: number;
  pontuacaoMaxima: number;
  percentual: number;
  nivel: 'baixo' | 'medio' | 'alto' | 'critico';
}

export interface QuestionResponse {
  questaoId: string;
  valor: any;
}

// Configurações de análise por categoria
const CATEGORY_WEIGHTS = {
  'lideranca': 0.25,
  'comunicacao': 0.20,
  'clima_organizacional': 0.20,
  'produtividade': 0.15,
  'inovacao': 0.10,
  'satisfacao': 0.10
};

// Thresholds para classificação de níveis
const LEVEL_THRESHOLDS = {
  critico: 0.3,
  baixo: 0.5,
  medio: 0.75,
  alto: 1.0
};

// Recomendações por categoria e nível
const RECOMMENDATIONS = {
  lideranca: {
    critico: [
      "Implementar programa de desenvolvimento de liderança urgente",
      "Realizar coaching executivo para gestores",
      "Estabelecer mentoria entre líderes experientes e novos gestores"
    ],
    baixo: [
      "Investir em treinamento de liderança",
      "Criar programa de feedback 360°",
      "Desenvolver competências de gestão de pessoas"
    ],
    medio: [
      "Aprimorar habilidades de comunicação dos líderes",
      "Implementar reuniões de alinhamento regulares",
      "Fortalecer a cultura de reconhecimento"
    ],
    alto: [
      "Manter práticas de liderança eficazes",
      "Compartilhar boas práticas entre equipes",
      "Continuar desenvolvimento contínuo"
    ]
  },
  comunicacao: {
    critico: [
      "Reestruturar canais de comunicação interna",
      "Implementar ferramentas de comunicação eficazes",
      "Treinar equipes em comunicação assertiva"
    ],
    baixo: [
      "Melhorar fluxo de informações entre departamentos",
      "Criar protocolos de comunicação claros",
      "Investir em ferramentas colaborativas"
    ],
    medio: [
      "Otimizar reuniões e comunicações",
      "Implementar feedback regular",
      "Melhorar comunicação vertical"
    ],
    alto: [
      "Manter excelência em comunicação",
      "Ser referência em comunicação organizacional",
      "Continuar inovando em práticas comunicativas"
    ]
  },
  clima_organizacional: {
    critico: [
      "Realizar diagnóstico completo do clima organizacional",
      "Implementar ações urgentes de melhoria do ambiente",
      "Revisar políticas de recursos humanos"
    ],
    baixo: [
      "Desenvolver programa de bem-estar no trabalho",
      "Melhorar condições físicas do ambiente",
      "Implementar políticas de reconhecimento"
    ],
    medio: [
      "Fortalecer cultura organizacional",
      "Promover integração entre equipes",
      "Implementar pesquisas de satisfação regulares"
    ],
    alto: [
      "Manter ambiente positivo e produtivo",
      "Ser referência em clima organizacional",
      "Compartilhar boas práticas"
    ]
  },
  produtividade: {
    critico: [
      "Revisar processos e eliminar gargalos",
      "Implementar metodologias de melhoria contínua",
      "Investir em automação de processos"
    ],
    baixo: [
      "Otimizar fluxos de trabalho",
      "Treinar equipes em gestão do tempo",
      "Implementar ferramentas de produtividade"
    ],
    medio: [
      "Continuar melhorias incrementais",
      "Implementar métricas de performance",
      "Promover cultura de eficiência"
    ],
    alto: [
      "Manter alta performance",
      "Ser benchmark em produtividade",
      "Inovar em processos produtivos"
    ]
  }
};

/**
 * Calcula o nível baseado no percentual
 */
function calculateLevel(percentage: number): 'baixo' | 'medio' | 'alto' | 'critico' {
  if (percentage <= LEVEL_THRESHOLDS.critico) return 'critico';
  if (percentage <= LEVEL_THRESHOLDS.baixo) return 'baixo';
  if (percentage <= LEVEL_THRESHOLDS.medio) return 'medio';
  return 'alto';
}

/**
 * Normaliza valores de resposta para uma escala de 0-1
 */
function normalizeResponse(questao: any, valor: any): number {
  switch (questao.tipo) {
    case 'likert':
      // Escala Likert (1-5) -> (0-1)
      return (valor - 1) / 4;
    
    case 'sim_nao':
      // Sim/Não -> 1/0
      return valor === 'sim' ? 1 : 0;
    
    case 'multipla_escolha':
      // Busca o peso da opção selecionada
      const opcao = questao.opcoes?.find((opt: any) => opt.valor === valor);
      return opcao?.peso || 0;
    
    case 'texto_simples':
    case 'texto_longo':
      // Para texto, considera se foi respondido (1) ou não (0)
      return valor && valor.trim().length > 0 ? 1 : 0;
    
    default:
      return 0;
  }
}

/**
 * Calcula pontuação por categoria
 */
function calculateCategoryScores(questionarioId: string, respostas: QuestionResponse[]): CategoryScore[] {
  const questoes = mockQuestoes.filter(q => q.questionarioId === questionarioId);
  const categorias = new Map<string, { total: number; max: number; count: number }>();
  
  // Agrupa questões por categoria
  questoes.forEach(questao => {
    const resposta = respostas.find(r => r.questaoId === questao.id);
    if (!resposta) return;
    
    const categoria = questao.categoria || 'geral';
    const pontuacao = normalizeResponse(questao, resposta.valor);
    const peso = questao.peso || 1;
    
    if (!categorias.has(categoria)) {
      categorias.set(categoria, { total: 0, max: 0, count: 0 });
    }
    
    const cat = categorias.get(categoria)!;
    cat.total += pontuacao * peso;
    cat.max += peso;
    cat.count += 1;
  });
  
  // Converte para array de CategoryScore
  return Array.from(categorias.entries()).map(([categoria, data]) => {
    const percentual = data.max > 0 ? data.total / data.max : 0;
    return {
      categoria,
      pontuacao: data.total,
      pontuacaoMaxima: data.max,
      percentual,
      nivel: calculateLevel(percentual)
    };
  });
}

/**
 * Gera recomendações baseadas nas pontuações por categoria
 */
function generateRecommendations(categoryScores: CategoryScore[]): string[] {
  const recomendacoes: string[] = [];
  
  categoryScores.forEach(category => {
    const categoryKey = category.categoria as keyof typeof RECOMMENDATIONS;
    const levelRecommendations = RECOMMENDATIONS[categoryKey]?.[category.nivel];
    
    if (levelRecommendations) {
      recomendacoes.push(...levelRecommendations.slice(0, 2)); // Máximo 2 por categoria
    }
  });
  
  return recomendacoes;
}

/**
 * Identifica pontos fracos (categorias com menor pontuação)
 */
function identifyWeakPoints(categoryScores: CategoryScore[]): string[] {
  return categoryScores
    .filter(cat => cat.nivel === 'critico' || cat.nivel === 'baixo')
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, 3)
    .map(cat => `${cat.categoria}: ${Math.round(cat.percentual * 100)}% de aproveitamento`);
}

/**
 * Identifica pontos fortes (categorias com maior pontuação)
 */
function identifyStrengths(categoryScores: CategoryScore[]): string[] {
  return categoryScores
    .filter(cat => cat.nivel === 'alto' || cat.nivel === 'medio')
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, 3)
    .map(cat => `${cat.categoria}: ${Math.round(cat.percentual * 100)}% de aproveitamento`);
}

/**
 * Função principal de análise
 */
export function analyzeQuestionnaire(
  questionarioId: string, 
  respostas: QuestionResponse[]
): AnalysisResult {
  const questoes = mockQuestoes.filter(q => q.questionarioId === questionarioId);
  
  // Calcula pontuação total
  let pontuacaoTotal = 0;
  let pontuacaoMaxima = 0;
  
  questoes.forEach(questao => {
    const resposta = respostas.find(r => r.questaoId === questao.id);
    if (resposta) {
      const pontuacao = normalizeResponse(questao, resposta.valor);
      const peso = questao.peso || 1;
      
      pontuacaoTotal += pontuacao * peso;
      pontuacaoMaxima += peso;
    } else {
      pontuacaoMaxima += questao.peso || 1;
    }
  });
  
  const percentual = pontuacaoMaxima > 0 ? pontuacaoTotal / pontuacaoMaxima : 0;
  const nivel = calculateLevel(percentual);
  
  // Calcula pontuações por categoria
  const categorias = calculateCategoryScores(questionarioId, respostas);
  
  // Gera insights
  const recomendacoes = generateRecommendations(categorias);
  const pontosFracos = identifyWeakPoints(categorias);
  const pontosFortes = identifyStrengths(categorias);
  
  return {
    pontuacaoTotal,
    pontuacaoMaxima,
    percentual,
    nivel,
    categorias,
    recomendacoes,
    pontosFracos,
    pontosFortes
  };
}

/**
 * Calcula ROI estimado baseado na análise
 */
export function calculateROI(analysisResult: AnalysisResult, numeroFuncionarios: number = 50): {
  investimentoEstimado: number;
  economiaAnual: number;
  payback: number;
  beneficios: string[];
} {
  const { percentual, nivel, categorias } = analysisResult;
  
  // Cálculos base por funcionário
  const salarioMedioMensal = 5000;
  const custoPorFuncionario = salarioMedioMensal * 12;
  
  // Estimativa de perda de produtividade baseada no nível
  const perdaProdutividade = {
    critico: 0.30,
    baixo: 0.20,
    medio: 0.10,
    alto: 0.05
  }[nivel];
  
  // Cálculo do investimento necessário
  const investimentoPorFuncionario = {
    critico: 3000,
    baixo: 2000,
    medio: 1000,
    alto: 500
  }[nivel];
  
  const investimentoEstimado = investimentoPorFuncionario * numeroFuncionarios;
  
  // Cálculo da economia anual
  const perdaAnual = custoPorFuncionario * numeroFuncionarios * perdaProdutividade;
  const melhoriaEsperada = 0.7; // 70% de melhoria esperada
  const economiaAnual = perdaAnual * melhoriaEsperada;
  
  // Payback em meses
  const payback = investimentoEstimado / (economiaAnual / 12);
  
  // Benefícios específicos
  const beneficios = [
    `Redução de ${Math.round(perdaProdutividade * 100)}% na perda de produtividade`,
    `Melhoria de ${Math.round(melhoriaEsperada * 100)}% nos indicadores organizacionais`,
    `ROI de ${Math.round((economiaAnual / investimentoEstimado) * 100)}% no primeiro ano`,
    "Redução do turnover e custos de recrutamento",
    "Melhoria do clima organizacional e satisfação",
    "Aumento da competitividade no mercado"
  ];
  
  return {
    investimentoEstimado,
    economiaAnual,
    payback,
    beneficios
  };
}

/**
 * Gera relatório completo de análise
 */
export function generateAnalysisReport(
  questionarioId: string,
  respostas: QuestionResponse[],
  dadosPessoais: {
    nome: string;
    email: string;
    empresa?: string;
    cargo?: string;
    numeroFuncionarios?: number;
  }
) {
  const analysis = analyzeQuestionnaire(questionarioId, respostas);
  const roi = calculateROI(analysis, dadosPessoais.numeroFuncionarios);
  const questionario = mockQuestionarios.find(q => q.id === questionarioId);
  
  return {
    questionario,
    dadosPessoais,
    analysis,
    roi,
    dataGeracao: new Date().toISOString(),
    resumoExecutivo: {
      pontuacaoGeral: `${Math.round(analysis.percentual * 100)}%`,
      nivel: analysis.nivel,
      principaisDesafios: analysis.pontosFracos.slice(0, 3),
      principaisForças: analysis.pontosFortes.slice(0, 3),
      investimentoRecomendado: roi.investimentoEstimado,
      retornoEsperado: roi.economiaAnual,
      tempoPayback: `${Math.round(roi.payback)} meses`
    }
  };
}