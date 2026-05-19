interface QuestaoResposta {
  questao_id: string;
  pergunta: string;
  peso: number;
  categoria: string;
  tipo: string;
  valor_resposta: any;
}

interface ScoreCategoria {
  categoria: string;
  score: number;
  maxScore: number;
  percentual: number;
  nivel: 'critico' | 'baixo' | 'medio' | 'alto';
}

interface ResultadoAnalise {
  scoreTotal: number;
  scoreTotalPossivel: number;
  percentualGeral: number;
  nivelGeral: 'critico' | 'baixo' | 'medio' | 'alto';
  scoresPorCategoria: ScoreCategoria[];
  areasCriticas: string[];
  areasFortes: string[];
  recomendacoes: string[];
}

const NIVEL_THRESHOLDS = {
  critico: 30,
  baixo: 50,
  medio: 70,
  alto: 100,
};

const RECOMENDACOES_POR_CATEGORIA: Record<string, Record<string, string[]>> = {
  "Carga de Trabalho": {
    critico: [
      "Revisar imediatamente a distribuição de tarefas",
      "Implementar sistema de priorização de demandas",
      "Considerar contratações ou redistribuição de equipe"
    ],
    baixo: [
      "Mapear gargalos e processos ineficientes",
      "Implementar ferramentas de gestão de tempo",
      "Revisar prazos e expectativas"
    ],
    medio: [
      "Manter monitoramento regular da carga",
      "Otimizar processos onde possível"
    ],
    alto: [
      "Carga de trabalho bem balanceada",
      "Manter práticas atuais"
    ]
  },
  "Esgotamento": {
    critico: [
      "Ação urgente necessária - risco de burnout",
      "Implementar pausas obrigatórias e descanso",
      "Oferecer suporte psicológico imediato"
    ],
    baixo: [
      "Implementar programas de bem-estar",
      "Revisar políticas de horário de trabalho",
      "Criar espaços de descompressão"
    ],
    medio: [
      "Monitorar sinais de esgotamento",
      "Incentivar uso de férias e folgas"
    ],
    alto: [
      "Equilíbrio saudável mantido",
      "Continuar práticas de bem-estar"
    ]
  },
  "Work-life Balance": {
    critico: [
      "Revisar políticas de trabalho remoto/flexível",
      "Estabelecer limites claros de horário",
      "Avaliar demandas fora do horário"
    ],
    baixo: [
      "Implementar horários flexíveis",
      "Respeitar tempo pessoal dos colaboradores",
      "Revisar expectativas de disponibilidade"
    ],
    medio: [
      "Manter políticas de flexibilidade",
      "Incentivar desconexão após expediente"
    ],
    alto: [
      "Bom equilíbrio vida-trabalho",
      "Manter práticas atuais"
    ]
  },
  "Relações Interpessoais": {
    critico: [
      "Mediação de conflitos urgente",
      "Implementar treinamento em comunicação",
      "Revisar dinâmica de equipe"
    ],
    baixo: [
      "Facilitar dinâmicas de integração",
      "Criar espaços de diálogo",
      "Treinar lideranças em gestão de pessoas"
    ],
    medio: [
      "Manter ações de integração",
      "Monitorar clima de equipe"
    ],
    alto: [
      "Relacionamentos saudáveis",
      "Fortalecer cultura colaborativa"
    ]
  },
  "Liderança": {
    critico: [
      "Capacitação urgente de lideranças",
      "Revisar práticas de gestão",
      "Implementar feedback 360°"
    ],
    baixo: [
      "Treinamento em liderança",
      "Criar canal de feedback sobre gestão",
      "Mentoria para líderes"
    ],
    medio: [
      "Continuar desenvolvimento de líderes",
      "Manter canais de feedback"
    ],
    alto: [
      "Liderança efetiva",
      "Compartilhar boas práticas"
    ]
  },
  "Reconhecimento": {
    critico: [
      "Implementar sistema de reconhecimento imediato",
      "Revisar políticas de valorização",
      "Criar programa de recompensas"
    ],
    baixo: [
      "Estabelecer rituais de reconhecimento",
      "Treinar gestores em feedback positivo",
      "Celebrar conquistas"
    ],
    medio: [
      "Manter práticas de reconhecimento",
      "Diversificar formas de valorização"
    ],
    alto: [
      "Cultura de reconhecimento estabelecida",
      "Manter e expandir práticas"
    ]
  }
};

function normalizarResposta(questao: QuestaoResposta): number {
  const { tipo, valor_resposta } = questao;

  switch (tipo) {
    case 'escala':
      // Escala 1-5 normalizada para 0-1
      return (valor_resposta - 1) / 4;
    
    case 'sim_nao':
      // Sim = 1, Não = 0
      return valor_resposta === 'sim' ? 1 : 0;
    
    case 'multipla_escolha':
      // Assumir que as opções estão ordenadas do pior para o melhor
      // Para análise mais precisa, seria necessário configurar valor para cada opção
      return 0.5; // Valor neutro por padrão
    
    case 'texto_livre':
      // Texto livre não pode ser normalizado automaticamente
      return 0.5; // Valor neutro
    
    default:
      return 0.5;
  }
}

function calcularNivel(percentual: number): 'critico' | 'baixo' | 'medio' | 'alto' {
  if (percentual < NIVEL_THRESHOLDS.critico) return 'critico';
  if (percentual < NIVEL_THRESHOLDS.baixo) return 'baixo';
  if (percentual < NIVEL_THRESHOLDS.medio) return 'medio';
  return 'alto';
}

function calcularScoresPorCategoria(respostas: QuestaoResposta[]): ScoreCategoria[] {
  const categorias = new Map<string, { score: number; maxScore: number }>();

  respostas.forEach(resposta => {
    const valorNormalizado = normalizarResposta(resposta);
    const scoreQuestao = valorNormalizado * resposta.peso;
    const maxScoreQuestao = resposta.peso;

    const atual = categorias.get(resposta.categoria) || { score: 0, maxScore: 0 };
    categorias.set(resposta.categoria, {
      score: atual.score + scoreQuestao,
      maxScore: atual.maxScore + maxScoreQuestao,
    });
  });

  return Array.from(categorias.entries()).map(([categoria, { score, maxScore }]) => {
    const percentual = (score / maxScore) * 100;
    return {
      categoria,
      score,
      maxScore,
      percentual,
      nivel: calcularNivel(percentual),
    };
  });
}

function gerarRecomendacoes(scoresPorCategoria: ScoreCategoria[]): string[] {
  const recomendacoes: string[] = [];

  scoresPorCategoria
    .filter(s => s.nivel === 'critico' || s.nivel === 'baixo')
    .sort((a, b) => a.percentual - b.percentual)
    .forEach(score => {
      const recsCategoria = RECOMENDACOES_POR_CATEGORIA[score.categoria]?.[score.nivel];
      if (recsCategoria) {
        recomendacoes.push(...recsCategoria);
      }
    });

  if (recomendacoes.length === 0) {
    recomendacoes.push("Continue mantendo as boas práticas atuais");
    recomendacoes.push("Monitore regularmente o clima organizacional");
  }

  return recomendacoes.slice(0, 5); // Limitar a 5 recomendações principais
}

export function analisarAvaliacao(respostas: QuestaoResposta[]): ResultadoAnalise {
  const scoresPorCategoria = calcularScoresPorCategoria(respostas);
  
  const scoreTotal = scoresPorCategoria.reduce((acc, s) => acc + s.score, 0);
  const scoreTotalPossivel = scoresPorCategoria.reduce((acc, s) => acc + s.maxScore, 0);
  const percentualGeral = (scoreTotal / scoreTotalPossivel) * 100;

  const areasCriticas = scoresPorCategoria
    .filter(s => s.nivel === 'critico' || s.nivel === 'baixo')
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, 3)
    .map(s => s.categoria);

  const areasFortes = scoresPorCategoria
    .filter(s => s.nivel === 'alto')
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, 3)
    .map(s => s.categoria);

  const recomendacoes = gerarRecomendacoes(scoresPorCategoria);

  return {
    scoreTotal,
    scoreTotalPossivel,
    percentualGeral,
    nivelGeral: calcularNivel(percentualGeral),
    scoresPorCategoria,
    areasCriticas,
    areasFortes,
    recomendacoes,
  };
}

export type { ResultadoAnalise, ScoreCategoria, QuestaoResposta };
