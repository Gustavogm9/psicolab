/**
 * Utilitários para detecção e configuração de DNS para domínios customizados
 */

export interface TipoDominio {
  tipo: 'raiz' | 'subdominio';
  dominio: string;
  dominioRaiz?: string;
  subdominio?: string;
}

export interface InstrucaoDNS {
  tipo: 'A' | 'TXT';
  nome: string;
  valor: string;
  descricao: string;
}

const LOVABLE_IP = '185.158.133.1';

/**
 * Detecta se o domínio é raiz (example.com) ou subdomínio (psi.example.com)
 */
export function detectarTipoDominio(dominio: string): TipoDominio {
  // Remove www. se existir para análise
  const dominioLimpo = dominio.replace(/^www\./, '');
  
  // Contar pontos para determinar se é subdomínio
  const partes = dominioLimpo.split('.');
  
  // Domínios raiz têm 2 partes (example.com) ou 3 para .com.br (example.com.br)
  const ehDominioRaizComBr = partes.length === 3 && partes[2] === 'br';
  const ehDominioRaizSimples = partes.length === 2;
  
  if (ehDominioRaizSimples || ehDominioRaizComBr) {
    return {
      tipo: 'raiz',
      dominio: dominioLimpo,
    };
  }
  
  // É um subdomínio
  const subdominio = partes[0];
  const dominioRaiz = partes.slice(1).join('.');
  
  return {
    tipo: 'subdominio',
    dominio: dominioLimpo,
    dominioRaiz,
    subdominio,
  };
}

/**
 * Gera as instruções DNS apropriadas baseado no tipo de domínio
 */
export function gerarInstrucoesDNS(
  dominio: string,
  tokenVerificacao: string
): InstrucaoDNS[] {
  const info = detectarTipoDominio(dominio);
  const instrucoes: InstrucaoDNS[] = [];
  
  if (info.tipo === 'raiz') {
    // Domínio raiz: precisa de @ e www
    instrucoes.push({
      tipo: 'A',
      nome: '@',
      valor: LOVABLE_IP,
      descricao: 'Registro A para o domínio raiz',
    });
    
    instrucoes.push({
      tipo: 'A',
      nome: 'www',
      valor: LOVABLE_IP,
      descricao: 'Registro A para www (subdomínio)',
    });
  } else {
    // Subdomínio: precisa apenas do subdomínio específico
    instrucoes.push({
      tipo: 'A',
      nome: info.subdominio!,
      valor: LOVABLE_IP,
      descricao: `Registro A para o subdomínio "${info.subdominio}"`,
    });
  }
  
  // TXT é opcional, mas acelera aprovação
  instrucoes.push({
    tipo: 'TXT',
    nome: '_psicolab',
    valor: `psicolab_verify=${tokenVerificacao}`,
    descricao: 'Registro TXT para verificação de propriedade (opcional - acelera aprovação)',
  });
  
  return instrucoes;
}

/**
 * Retorna mensagem específica sobre onde configurar o DNS
 */
export function getMensagemConfiguracao(dominio: string): string {
  const info = detectarTipoDominio(dominio);
  
  if (info.tipo === 'subdominio') {
    return `Configure estes registros no painel DNS do domínio raiz "${info.dominioRaiz}". O registro A deve usar o nome "${info.subdominio}", não "@".`;
  }
  
  return 'Configure estes registros no painel DNS do seu provedor de domínio.';
}
