// Dados mockados centralizados para o sistema
export const mockUsers = {
  consultora: {
    type: "consultora" as const,
    name: "Mariangela Siqueira",
    company: "PsicoWork Consultoria",
    email: "mariangela@psicowork.com.br",
    phone: "(11) 98765-4321",
    crp: "CRP 01/78932",
    specialization: "Psicologia Organizacional e do Trabalho",
    experience: "12+ anos",
    bio: "Psicóloga especializada em saúde mental no trabalho e gestão de riscos psicossociais. Atua há mais de 12 anos desenvolvendo soluções inovadoras para o bem-estar organizacional."
  },
  gestor: {
    type: "gestor" as const,
    name: "Carlos Mendes",
    company: "TechCorp Ltda",
    email: "carlos.mendes@techcorp.com.br",
    phone: "(11) 99876-5432",
    role: "Gerente de Recursos Humanos",
    department: "Recursos Humanos"
  }
};

export const mockClientes = [
  {
    id: "1",
    nome: "TechCorp Ltda",
    tipo: "Tecnologia",
    colaboradores: 250,
    status: "Ativo",
    contratoInicio: "2024-01-15",
    responsavel: "Carlos Mendes",
    email: "carlos.mendes@techcorp.com.br",
    telefone: "(11) 3456-7890",
    endereco: "Av. Paulista, 1000 - São Paulo, SP",
    riscoAtual: 35,
    ultimaAvaliacao: "2024-12-01"
  },
  {
    id: "2",
    nome: "Indústria ABC S.A.",
    tipo: "Industrial",
    colaboradores: 180,
    status: "Ativo",
    contratoInicio: "2024-03-10",
    responsavel: "Maria Santos",
    email: "maria.santos@industriaabc.com.br",
    telefone: "(11) 2345-6789",
    endereco: "Rodovia dos Bandeirantes, Km 50 - Campinas, SP",
    riscoAtual: 42,
    ultimaAvaliacao: "2024-11-28"
  },
  {
    id: "3",
    nome: "Serviços Globais",
    tipo: "Serviços",
    colaboradores: 95,
    status: "Ativo",
    contratoInicio: "2024-06-20",
    responsavel: "João Silva",
    email: "joao.silva@servicosglobais.com.br",
    telefone: "(11) 4567-8901",
    endereco: "Rua Augusta, 2500 - São Paulo, SP",
    riscoAtual: 28,
    ultimaAvaliacao: "2024-12-05"
  },
  {
    id: "4",
    nome: "Consultoria Prime",
    tipo: "Consultoria",
    colaboradores: 45,
    status: "Pendente",
    contratoInicio: "2024-09-01",
    responsavel: "Ana Costa",
    email: "ana.costa@consultoriaprime.com.br",
    telefone: "(11) 5678-9012",
    endereco: "Alameda Santos, 800 - São Paulo, SP",
    riscoAtual: 22,
    ultimaAvaliacao: "2024-11-15"
  }
];

export const mockAvaliacoes = [
  {
    id: "1",
    nome: "Avaliação Anual TechCorp 2024",
    tipo: "organizacional",
    status: "concluida",
    participantesTotal: 250,
    participantesResponderam: 238,
    dataInicio: "2024-11-01",
    dataFim: "2024-11-30",
    progresso: 95,
    cliente: "TechCorp Ltda",
    risco: 35
  },
  {
    id: "2",
    nome: "Diagnóstico Setorial - Produção",
    tipo: "setorial",
    status: "em_andamento",
    participantesTotal: 85,
    participantesResponderam: 62,
    dataInicio: "2024-12-01",
    dataFim: "2024-12-20",
    progresso: 73,
    cliente: "Indústria ABC S.A.",
    risco: 42
  },
  {
    id: "3",
    nome: "Pesquisa de Clima - Q4",
    tipo: "clima",
    status: "em_andamento",
    participantesTotal: 95,
    participantesResponderam: 47,
    dataInicio: "2024-12-05",
    dataFim: "2024-12-15",
    progresso: 49,
    cliente: "Serviços Globais",
    risco: 28
  },
  {
    id: "4",
    nome: "Avaliação de Burnout",
    tipo: "burnout",
    status: "planejada",
    participantesTotal: 45,
    participantesResponderam: 0,
    dataInicio: "2024-12-20",
    dataFim: "2025-01-10",
    progresso: 0,
    cliente: "Consultoria Prime",
    risco: 22
  },
  {
    id: "5",
    nome: "Diagnóstico Completo - Matriz",
    tipo: "organizacional",
    status: "pausada",
    participantesTotal: 320,
    participantesResponderam: 156,
    dataInicio: "2024-10-15",
    dataFim: "2024-11-15",
    progresso: 49,
    cliente: "Grupo Empresarial XYZ",
    risco: 48
  }
];

export const mockColaboradores = [
  {
    id: "1",
    nome: "Ana Paula Oliveira",
    cargo: "Desenvolvedora Senior",
    departamento: "Tecnologia",
    risco: 25,
    status: "Baixo",
    ultimaAvaliacao: "2024-11-28",
    email: "ana.oliveira@techcorp.com.br",
    dataAdmissao: "2022-03-15"
  },
  {
    id: "2",
    nome: "Bruno Santos Silva",
    cargo: "Gerente de Projetos",
    departamento: "Tecnologia",
    risco: 65,
    status: "Alto",
    ultimaAvaliacao: "2024-11-25",
    email: "bruno.silva@techcorp.com.br",
    dataAdmissao: "2021-08-10"
  },
  {
    id: "3",
    nome: "Carla Ferreira Lima",
    cargo: "Analista de RH",
    departamento: "Recursos Humanos",
    risco: 35,
    status: "Médio",
    ultimaAvaliacao: "2024-11-30",
    email: "carla.lima@techcorp.com.br",
    dataAdmissao: "2023-01-20"
  },
  {
    id: "4",
    nome: "Diego Almeida Costa",
    cargo: "Designer UX/UI",
    departamento: "Produto",
    risco: 20,
    status: "Baixo",
    ultimaAvaliacao: "2024-11-27",
    email: "diego.costa@techcorp.com.br",
    dataAdmissao: "2023-06-05"
  },
  {
    id: "5",
    nome: "Eduarda Rocha Martins",
    cargo: "Coordenadora Financeira",
    departamento: "Financeiro",
    risco: 45,
    status: "Médio",
    ultimaAvaliacao: "2024-11-26",
    email: "eduarda.martins@techcorp.com.br",
    dataAdmissao: "2020-11-12"
  }
];

export const mockDepartamentos = [
  {
    id: "1",
    nome: "Tecnologia",
    responsavel: "Ricardo Mendonça",
    colaboradores: 85,
    risco: 32,
    status: "Médio",
    avaliacoesCompletas: 78,
    avaliacoesPendentes: 7
  },
  {
    id: "2",
    nome: "Recursos Humanos",
    responsavel: "Fernanda Carvalho",
    colaboradores: 25,
    risco: 18,
    status: "Baixo",
    avaliacoesCompletas: 25,
    avaliacoesPendentes: 0
  },
  {
    id: "3",
    nome: "Financeiro",
    responsavel: "Marcos Pereira",
    colaboradores: 30,
    risco: 28,
    status: "Baixo",
    avaliacoesCompletas: 28,
    avaliacoesPendentes: 2
  },
  {
    id: "4",
    nome: "Vendas",
    responsavel: "Luciana Torres",
    colaboradores: 55,
    risco: 48,
    status: "Alto",
    avaliacoesCompletas: 42,
    avaliacoesPendentes: 13
  },
  {
    id: "5",
    nome: "Operações",
    responsavel: "Paulo Henrique",
    colaboradores: 40,
    risco: 35,
    status: "Médio",
    avaliacoesCompletas: 35,
    avaliacoesPendentes: 5
  }
];

export const mockRelatorios = [
  {
    id: "1",
    tipo: "organizacional",
    titulo: "Relatório Anual de Riscos Psicossociais 2024",
    dataGeracao: "2024-12-01",
    participantes: 238,
    score: 68,
    tendencia: "estavel",
    alertas: 3,
    status: "concluido",
    cliente: "TechCorp Ltda"
  },
  {
    id: "2",
    tipo: "setorial",
    titulo: "Análise Departamental - Vendas",
    dataGeracao: "2024-11-28",
    participantes: 55,
    score: 52,
    tendencia: "declinio",
    alertas: 8,
    status: "concluido",
    cliente: "TechCorp Ltda"
  },
  {
    id: "3",
    tipo: "burnout",
    titulo: "Diagnóstico de Burnout - Q4 2024",
    dataGeracao: "2024-11-25",
    participantes: 180,
    score: 58,
    tendencia: "melhora",
    alertas: 5,
    status: "concluido",
    cliente: "Indústria ABC S.A."
  },
  {
    id: "4",
    tipo: "clima",
    titulo: "Pesquisa de Clima Organizacional",
    dataGeracao: "2024-11-20",
    participantes: 95,
    score: 72,
    tendencia: "melhora",
    alertas: 2,
    status: "concluido",
    cliente: "Serviços Globais"
  },
  {
    id: "5",
    tipo: "individual",
    titulo: "Relatório Individual - Liderança",
    dataGeracao: "2024-11-15",
    participantes: 12,
    score: 45,
    tendencia: "declinio",
    alertas: 4,
    status: "em_analise",
    cliente: "Consultoria Prime"
  }
];

export const mockIntervencoes = [
  {
    id: "1",
    titulo: "Workshop de Gestão de Estresse",
    tipo: "workshop",
    cliente: "TechCorp Ltda",
    status: "agendada",
    data: "2024-12-20",
    participantes: 25,
    duracao: "4 horas",
    local: "Sala de Treinamento - TechCorp",
    responsavel: "Mariangela Siqueira"
  },
  {
    id: "2",
    titulo: "Programa de Prevenção ao Burnout",
    tipo: "programa",
    cliente: "Indústria ABC S.A.",
    status: "em_andamento",
    data: "2024-11-01",
    participantes: 85,
    duracao: "3 meses",
    local: "Online + Presencial",
    responsavel: "Mariangela Siqueira"
  },
  {
    id: "3",
    titulo: "Coaching para Líderes",
    tipo: "coaching",
    cliente: "Serviços Globais",
    status: "concluida",
    data: "2024-10-15",
    participantes: 8,
    duracao: "6 sessões",
    local: "Individual - Online",
    responsavel: "Mariangela Siqueira"
  }
];

export const mockKPIs = {
  gerais: [
    {
      id: "1",
      nome: "Índice de Bem-Estar Geral",
      valor: 68,
      meta: 75,
      status: "atencao",
      tendencia: "estavel",
      participacao: 95
    },
    {
      id: "2", 
      nome: "Taxa de Engajamento",
      valor: 72,
      meta: 80,
      status: "positivo",
      tendencia: "melhora",
      participacao: 92
    },
    {
      id: "3",
      nome: "Risco de Burnout",
      valor: 35,
      meta: 25,
      status: "negativo", 
      tendencia: "declinio",
      participacao: 88
    }
  ],
  financeiros: {
    faturamentoMensal: 45000,
    faturamentoAnual: 480000,
    contasReceber: 25000,
    clientesAtivos: 4,
    ticketMedio: 12000
  }
};

// Funções auxiliares
export const getStatusColor = (status: string) => {
  switch (status) {
    case "concluida":
    case "concluido":
    case "Baixo":
      return "bg-green-100 text-green-800";
    case "em_andamento":
    case "Médio":
      return "bg-yellow-100 text-yellow-800";
    case "pausada":
    case "Alto":
      return "bg-red-100 text-red-800";
    case "planejada":
    case "agendada":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case "organizacional":
      return "🏢";
    case "setorial":
      return "🏭";
    case "clima":
      return "🌡️";
    case "burnout":
      return "🔥";
    case "individual":
      return "👤";
    case "workshop":
      return "🎯";
    case "programa":
      return "📋";
    case "coaching":
      return "🎓";
    default:
      return "📊";
  }
};

export const getTipoLabel = (tipo: string) => {
  const labels: { [key: string]: string } = {
    organizacional: "Organizacional",
    setorial: "Setorial", 
    clima: "Clima",
    burnout: "Burnout",
    individual: "Individual",
    workshop: "Workshop",
    programa: "Programa",
    coaching: "Coaching"
  };
  return labels[tipo] || tipo;
};

// Dados mock para perfis públicos dos psicólogos
export const mockPerfisPublicos = [
  {
    id: "1",
    consultorId: "consultora",
    slug: "mariangela-siqueira",
    ativo: true,
    
    // Informações básicas
    nome: "Mariangela Siqueira",
    titulo: "Psicóloga Organizacional e do Trabalho",
    crp: "CRP 01/78932",
    foto: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20psychologist%20woman%20portrait%20business%20attire%20friendly%20smile%20office%20background&image_size=portrait_4_3",
    biografia: "Psicóloga especializada em saúde mental no trabalho e gestão de riscos psicossociais. Atua há mais de 12 anos desenvolvendo soluções inovadoras para o bem-estar organizacional, com foco em prevenção ao burnout e melhoria do clima organizacional.",
    
    // Contato
    telefone: "(11) 98765-4321",
    email: "mariangela@psicowork.com.br",
    whatsapp: "5511987654321",
    endereco: "Av. Paulista, 1500 - Conjunto 1205, São Paulo - SP",
    
    // Redes sociais
    instagram: "@mariangelapsico",
    linkedin: "mariangela-siqueira-psicologa",
    facebook: "mariangelasiqueirapsico",
    
    // Configurações
    tema: "profissional",
    corPrimaria: "#2563eb",
    corSecundaria: "#1e40af",
    
    // SEO
    metaTitle: "Mariangela Siqueira - Psicóloga Organizacional | Saúde Mental no Trabalho",
    metaDescription: "Psicóloga especializada em saúde mental no trabalho. Mais de 12 anos de experiência em prevenção ao burnout e bem-estar organizacional.",
    
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-12-01T15:30:00Z"
  },
  {
    id: "2",
    consultorId: "consultor2",
    slug: "dr-ricardo-santos",
    ativo: true,
    
    nome: "Dr. Ricardo Santos",
    titulo: "Psicólogo Clínico e Organizacional",
    crp: "CRP 01/65432",
    foto: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20psychologist%20portrait%20suit%20confident%20smile%20modern%20office&image_size=portrait_4_3",
    biografia: "Psicólogo com dupla formação em Psicologia Clínica e Organizacional. Especialista em terapia cognitivo-comportamental e avaliação de riscos psicossociais em ambientes corporativos.",
    
    telefone: "(11) 99123-4567",
    email: "ricardo@psicologiaintegrativa.com.br",
    whatsapp: "5511991234567",
    endereco: "Rua Augusta, 2000 - Sala 812, São Paulo - SP",
    
    instagram: "@drricardosantos",
    linkedin: "ricardo-santos-psicologo",
    
    tema: "moderno",
    corPrimaria: "#059669",
    corSecundaria: "#047857",
    
    metaTitle: "Dr. Ricardo Santos - Psicólogo Clínico e Organizacional | Terapia e Consultoria",
    metaDescription: "Psicólogo especializado em terapia cognitivo-comportamental e consultoria organizacional. Atendimento presencial e online.",
    
    createdAt: "2024-02-20T14:00:00Z",
    updatedAt: "2024-11-28T09:15:00Z"
  }
];

export const mockServicos = [
  {
    id: "1",
    perfilId: "1",
    nome: "Avaliação de Riscos Psicossociais",
    descricao: "Diagnóstico completo dos fatores de risco psicossocial na organização, incluindo análise de clima, estresse e burnout.",
    preco: 2500,
    duracao: 240, // 4 horas
    modalidade: "presencial" as const,
    ativo: true
  },
  {
    id: "2",
    perfilId: "1",
    nome: "Workshop de Prevenção ao Burnout",
    descricao: "Treinamento prático para equipes sobre identificação, prevenção e manejo do burnout no ambiente de trabalho.",
    preco: 1800,
    duracao: 180, // 3 horas
    modalidade: "hibrido" as const,
    ativo: true
  },
  {
    id: "3",
    perfilId: "1",
    nome: "Consultoria em Saúde Mental Organizacional",
    descricao: "Desenvolvimento de políticas e programas de saúde mental personalizados para sua organização.",
    preco: 5000,
    duracao: 480, // 8 horas
    modalidade: "presencial" as const,
    ativo: true
  },
  {
    id: "4",
    perfilId: "2",
    nome: "Terapia Individual Online",
    descricao: "Sessões de terapia cognitivo-comportamental via videoconferência, com foco em ansiedade, depressão e estresse.",
    preco: 180,
    duracao: 50,
    modalidade: "online" as const,
    ativo: true
  },
  {
    id: "5",
    perfilId: "2",
    nome: "Avaliação Psicológica Organizacional",
    descricao: "Avaliação psicológica para processos seletivos e desenvolvimento de carreira.",
    preco: 350,
    duracao: 120,
    modalidade: "presencial" as const,
    ativo: true
  }
];

export const mockDepoimentos = [
  {
    id: "1",
    perfilId: "1",
    nomeCliente: "Carlos M.",
    texto: "Excelente profissional! O workshop de prevenção ao burnout transformou nossa equipe. Mariangela tem uma didática excepcional e conhecimento profundo.",
    avaliacao: 5,
    aprovado: true,
    createdAt: "2024-11-15T10:30:00Z"
  },
  {
    id: "2",
    perfilId: "1",
    nomeCliente: "Ana P.",
    texto: "A avaliação de riscos psicossociais foi fundamental para identificarmos pontos de melhoria em nossa organização. Relatório muito detalhado e acionável.",
    avaliacao: 5,
    aprovado: true,
    createdAt: "2024-10-28T14:20:00Z"
  },
  {
    id: "3",
    perfilId: "1",
    nomeCliente: "Roberto S.",
    texto: "Profissional extremamente competente e atualizada. Suas orientações foram essenciais para melhorarmos o clima organizacional.",
    avaliacao: 4,
    aprovado: true,
    createdAt: "2024-09-10T16:45:00Z"
  },
  {
    id: "4",
    perfilId: "2",
    nomeCliente: "Maria L.",
    texto: "Dr. Ricardo é um excelente terapeuta. Suas sessões online são muito eficazes e ele demonstra grande empatia e profissionalismo.",
    avaliacao: 5,
    aprovado: true,
    createdAt: "2024-11-20T11:15:00Z"
  },
  {
    id: "5",
    perfilId: "2",
    nomeCliente: "João F.",
    texto: "A avaliação psicológica foi conduzida de forma muito profissional. Dr. Ricardo soube deixar o ambiente confortável e acolhedor.",
    avaliacao: 4,
    aprovado: true,
    createdAt: "2024-10-05T09:30:00Z"
  }
];

// Função para buscar perfil por slug
export const getPerfilBySlug = (slug: string) => {
  return mockPerfisPublicos.find(perfil => perfil.slug === slug);
};

// Função para buscar serviços por perfil
export const getServicosByPerfilId = (perfilId: string) => {
  return mockServicos.filter(servico => servico.perfilId === perfilId && servico.ativo);
};

// Função para buscar depoimentos por perfil
export const getDepoimentosByPerfilId = (perfilId: string) => {
  return mockDepoimentos.filter(depoimento => depoimento.perfilId === perfilId && depoimento.aprovado);
};

// ===== SISTEMA DE DIAGNÓSTICOS =====

// Tipos de questões
export type TipoQuestao = 'multipla_escolha' | 'escala_likert' | 'texto_livre' | 'sim_nao' | 'numerica';

// Questionários de diagnóstico
export const mockQuestionarios = [
  {
    id: "1",
    titulo: "Diagnóstico de Bem-Estar Organizacional",
    descricao: "Avaliação completa do nível de bem-estar e satisfação dos colaboradores",
    categoria: "bem-estar",
    consultorId: "consultora",
    ativo: true,
    publico: true,
    slug: "bem-estar-organizacional",
    tempoEstimado: 15, // minutos
    totalQuestoes: 25,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-12-01T15:30:00Z",
    configuracoes: {
      permitirAnonimo: true,
      coletarEmail: true,
      coletarTelefone: false,
      mostrarProgresso: true,
      embaralharQuestoes: false
    }
  },
  {
    id: "2",
    titulo: "Avaliação de Risco de Burnout",
    descricao: "Identificação precoce de sinais de esgotamento profissional",
    categoria: "burnout",
    consultorId: "consultora",
    ativo: true,
    publico: true,
    slug: "risco-burnout",
    tempoEstimado: 10,
    totalQuestoes: 18,
    createdAt: "2024-10-15T14:20:00Z",
    updatedAt: "2024-11-28T09:45:00Z",
    configuracoes: {
      permitirAnonimo: false,
      coletarEmail: true,
      coletarTelefone: true,
      mostrarProgresso: true,
      embaralharQuestoes: true
    }
  },
  {
    id: "3",
    titulo: "Clima Organizacional Express",
    descricao: "Diagnóstico rápido do clima e cultura organizacional",
    categoria: "clima",
    consultorId: "consultora",
    ativo: true,
    publico: false,
    slug: "clima-organizacional",
    tempoEstimado: 8,
    totalQuestoes: 12,
    createdAt: "2024-12-05T11:15:00Z",
    updatedAt: "2024-12-05T11:15:00Z",
    configuracoes: {
      permitirAnonimo: true,
      coletarEmail: false,
      coletarTelefone: false,
      mostrarProgresso: false,
      embaralharQuestoes: false
    }
  }
];

// Questões dos questionários
export const mockQuestoes = [
  // Questionário 1 - Bem-Estar Organizacional
  {
    id: "q1",
    questionarioId: "1",
    ordem: 1,
    titulo: "Como você avalia seu nível geral de satisfação no trabalho?",
    tipo: "escala_likert" as TipoQuestao,
    obrigatoria: true,
    opcoes: [
      { id: "1", texto: "Muito insatisfeito", valor: 1 },
      { id: "2", texto: "Insatisfeito", valor: 2 },
      { id: "3", texto: "Neutro", valor: 3 },
      { id: "4", texto: "Satisfeito", valor: 4 },
      { id: "5", texto: "Muito satisfeito", valor: 5 }
    ],
    categoria: "satisfacao",
    peso: 1.2
  },
  {
    id: "q2",
    questionarioId: "1",
    ordem: 2,
    titulo: "Você se sente reconhecido pelo seu trabalho?",
    tipo: "sim_nao" as TipoQuestao,
    obrigatoria: true,
    opcoes: [
      { id: "sim", texto: "Sim", valor: 1 },
      { id: "nao", texto: "Não", valor: 0 }
    ],
    categoria: "reconhecimento",
    peso: 1.0
  },
  {
    id: "q3",
    questionarioId: "1",
    ordem: 3,
    titulo: "Qual é o principal desafio que você enfrenta no trabalho?",
    tipo: "multipla_escolha" as TipoQuestao,
    obrigatoria: false,
    opcoes: [
      { id: "1", texto: "Sobrecarga de trabalho", valor: 0.2 },
      { id: "2", texto: "Falta de recursos", valor: 0.4 },
      { id: "3", texto: "Comunicação deficiente", valor: 0.6 },
      { id: "4", texto: "Falta de autonomia", valor: 0.8 },
      { id: "5", texto: "Conflitos interpessoais", valor: 1.0 }
    ],
    categoria: "desafios",
    peso: 0.8
  },
  // Questionário 2 - Burnout
  {
    id: "q4",
    questionarioId: "2",
    ordem: 1,
    titulo: "Com que frequência você se sente emocionalmente esgotado pelo trabalho?",
    tipo: "escala_likert" as TipoQuestao,
    obrigatoria: true,
    opcoes: [
      { id: "1", texto: "Nunca", valor: 1 },
      { id: "2", texto: "Raramente", valor: 2 },
      { id: "3", texto: "Às vezes", valor: 3 },
      { id: "4", texto: "Frequentemente", valor: 4 },
      { id: "5", texto: "Sempre", valor: 5 }
    ],
    categoria: "esgotamento",
    peso: 1.5
  },
  {
    id: "q5",
    questionarioId: "2",
    ordem: 2,
    titulo: "Você tem dificuldade para dormir devido a preocupações com o trabalho?",
    tipo: "sim_nao" as TipoQuestao,
    obrigatoria: true,
    opcoes: [
      { id: "sim", texto: "Sim", valor: 1 },
      { id: "nao", texto: "Não", valor: 0 }
    ],
    categoria: "sono",
    peso: 1.1
  }
];

// Respostas dos questionários
export const mockRespostas = [
  {
    id: "r1",
    questionarioId: "1",
    respondente: {
      id: "resp1",
      nome: "João Silva",
      email: "joao.silva@empresa.com",
      telefone: "(11) 99999-1111",
      empresa: "TechCorp Ltda",
      cargo: "Desenvolvedor",
      anonimo: false
    },
    respostas: [
      { questaoId: "q1", opcaoId: "4", valor: 4 },
      { questaoId: "q2", opcaoId: "sim", valor: 1 },
      { questaoId: "q3", opcaoId: "1", valor: 0.2 }
    ],
    scoreTotal: 3.2,
    categoria: "medio",
    dataInicio: "2024-12-01T09:00:00Z",
    dataFim: "2024-12-01T09:12:00Z",
    tempoGasto: 12, // minutos
    status: "concluida"
  },
  {
    id: "r2",
    questionarioId: "2",
    respondente: {
      id: "resp2",
      nome: "Maria Santos",
      email: "maria.santos@empresa.com",
      telefone: "(11) 99999-2222",
      empresa: "Indústria ABC",
      cargo: "Gerente",
      anonimo: false
    },
    respostas: [
      { questaoId: "q4", opcaoId: "4", valor: 4 },
      { questaoId: "q5", opcaoId: "sim", valor: 1 }
    ],
    scoreTotal: 4.2,
    categoria: "alto",
    dataInicio: "2024-12-02T14:30:00Z",
    dataFim: "2024-12-02T14:38:00Z",
    tempoGasto: 8,
    status: "concluida"
  }
];

// CRM - Leads gerados pelos questionários
export const mockLeads = [
  {
    id: "lead1",
    nome: "João Silva",
    email: "joao.silva@empresa.com",
    telefone: "(11) 99999-1111",
    empresa: "TechCorp Ltda",
    cargo: "Desenvolvedor",
    origem: "questionario",
    questionarioId: "1",
    respostaId: "r1",
    score: 3.2,
    categoria: "medio",
    status: "novo",
    prioridade: "media",
    valorPotencial: 25000,
    dataContato: "2024-12-01T09:12:00Z",
    ultimaInteracao: "Primeiro contato via questionário",
    historico: [
      {
        tipo: "Captura",
        descricao: "Lead capturado via questionário de bem-estar",
        data: "2024-12-01T09:12:00Z"
      }
    ],
    tags: ["bem-estar", "satisfacao"],
    observacoes: "Colaborador com nível médio de satisfação, potencial para melhoria",
    dataCaptura: "2024-12-01T09:12:00Z",
    ultimoContato: null,
    proximoFollowUp: "2024-12-08T10:00:00Z",
    consultorId: "consultora"
  },
  {
    id: "lead2",
    nome: "Maria Santos",
    email: "maria.santos@empresa.com",
    telefone: "(11) 99999-2222",
    empresa: "Indústria ABC",
    cargo: "Gerente",
    origem: "questionario",
    questionarioId: "2",
    respostaId: "r2",
    score: 4.2,
    categoria: "alto",
    status: "qualificado",
    prioridade: "alta",
    valorPotencial: 85000,
    dataContato: "2024-12-02T14:38:00Z",
    ultimaInteracao: "Contato telefônico realizado",
    historico: [
      {
        tipo: "Captura",
        descricao: "Lead capturado via questionário de burnout",
        data: "2024-12-02T14:38:00Z"
      },
      {
        tipo: "Contato",
        descricao: "Primeira ligação - interesse confirmado",
        data: "2024-12-03T16:20:00Z"
      }
    ],
    tags: ["burnout", "risco-alto"],
    observacoes: "Risco alto de burnout, necessita intervenção urgente",
    dataCaptura: "2024-12-02T14:38:00Z",
    ultimoContato: "2024-12-03T16:20:00Z",
    proximoFollowUp: "2024-12-10T09:00:00Z",
    consultorId: "consultora"
  },
  {
    id: "lead3",
    nome: "Carlos Mendes",
    email: "carlos.mendes@startup.com",
    telefone: "(11) 99999-3333",
    empresa: "Startup Inovadora",
    cargo: "CEO",
    origem: "indicacao",
    questionarioId: "1",
    respostaId: null,
    score: null,
    categoria: "pendente",
    status: "novo",
    prioridade: "alta",
    valorPotencial: 150000,
    dataContato: "2024-12-05T11:45:00Z",
    ultimaInteracao: "Indicação recebida",
    historico: [
      {
        tipo: "Indicação",
        descricao: "Indicado por cliente atual - interesse em diagnóstico organizacional",
        data: "2024-12-05T11:45:00Z"
      }
    ],
    tags: ["ceo", "startup"],
    observacoes: "CEO interessado em diagnóstico organizacional para sua startup",
    dataCaptura: "2024-12-05T11:45:00Z",
    ultimoContato: null,
    proximoFollowUp: "2024-12-07T14:00:00Z",
    consultorId: "consultora"
  }
];

// Relatórios de ROI
export const mockRelatoriosROI = [
  {
    id: "roi1",
    leadId: "lead1",
    questionarioId: "1",
    titulo: "Relatório de ROI - Bem-Estar Organizacional",
    empresa: "TechCorp Ltda",
    colaborador: "João Silva",
    scoreAtual: 3.2,
    categoria: "medio",
    status: "gerado",
    funcionarios: 250,
    problemas: [
      "Nível médio de satisfação no trabalho",
      "Possível sobrecarga de trabalho",
      "Necessidade de maior reconhecimento"
    ],
    recomendacoes: [
      "Implementar programa de reconhecimento",
      "Revisar distribuição de carga de trabalho",
      "Criar canais de feedback mais efetivos"
    ],
    investimentoEstimado: 15000,
    economiaAnual: 45000,
    economia5Anos: 225000,
    roi: 200, // %
    payback: 4, // meses
    beneficios: [
      "Redução de 30% no turnover",
      "Aumento de 25% na produtividade",
      "Melhoria de 40% no clima organizacional"
    ],
    dataGeracao: "2024-12-01T10:00:00Z",
    consultorId: "consultora"
  },
  {
    id: "roi2",
    leadId: "lead2",
    questionarioId: "2",
    titulo: "Relatório de ROI - Prevenção ao Burnout",
    empresa: "Indústria ABC",
    colaborador: "Maria Santos",
    scoreAtual: 4.2,
    categoria: "alto",
    status: "enviado",
    funcionarios: 180,
    problemas: [
      "Alto risco de burnout",
      "Esgotamento emocional frequente",
      "Problemas de sono relacionados ao trabalho"
    ],
    recomendacoes: [
      "Programa urgente de prevenção ao burnout",
      "Coaching individual para gestão de estresse",
      "Revisão da carga de trabalho e responsabilidades"
    ],
    investimentoEstimado: 25000,
    economiaAnual: 120000,
    economia5Anos: 600000,
    roi: 380,
    payback: 2.5,
    beneficios: [
      "Prevenção de afastamentos por burnout",
      "Redução de 50% nos custos médicos",
      "Aumento de 35% na retenção de talentos"
    ],
    dataGeracao: "2024-12-02T15:00:00Z",
    consultorId: "consultora"
  }
];

// Estatísticas dos questionários
export const mockEstatisticasQuestionarios = {
  "1": {
    totalRespostas: 156,
    taxaConversao: 23.5, // %
    tempoMedioResposta: 12.3, // minutos
    scoremedio: 3.4,
    distribuicaoScores: {
      baixo: 15, // %
      medio: 65,
      alto: 20
    },
    leadsGerados: 37,
    conversaoLeads: 8.1, // %
    ultimaResposta: "2024-12-05T16:30:00Z"
  },
  "2": {
    totalRespostas: 89,
    taxaConversao: 31.2,
    tempoMedioResposta: 8.7,
    scoreMedia: 3.8,
    distribuicaoScores: {
      baixo: 25,
      medio: 45,
      alto: 30
    },
    leadsGerados: 28,
    conversaoLeads: 12.4,
    ultimaResposta: "2024-12-04T11:20:00Z"
  },
  "3": {
    totalRespostas: 42,
    taxaConversao: 18.9,
    tempoMedioResposta: 6.2,
    scoreMedia: 2.9,
    distribuicaoScores: {
      baixo: 35,
      medio: 50,
      alto: 15
    },
    leadsGerados: 8,
    conversaoLeads: 4.7,
    ultimaResposta: "2024-12-05T09:45:00Z"
  }
};

// Funções auxiliares para o sistema de diagnósticos
export const getQuestionarioBySlug = (slug: string) => {
  return mockQuestionarios.find(q => q.slug === slug && q.ativo);
};

export const getQuestoesByQuestionarioId = (questionarioId: string) => {
  return mockQuestoes.filter(q => q.questionarioId === questionarioId).sort((a, b) => a.ordem - b.ordem);
};

export const getRespostasByQuestionarioId = (questionarioId: string) => {
  return mockRespostas.filter(r => r.questionarioId === questionarioId);
};

export const getLeadsByConsultorId = (consultorId: string) => {
  return mockLeads.filter(l => l.consultorId === consultorId);
};

export const getRelatorioROIByLeadId = (leadId: string) => {
  return mockRelatoriosROI.find(r => r.leadId === leadId);
};

export const getEstatisticasQuestionario = (questionarioId: string) => {
  return mockEstatisticasQuestionarios[questionarioId as keyof typeof mockEstatisticasQuestionarios];
};