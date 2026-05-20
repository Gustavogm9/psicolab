/**
 * Engine de cálculo do COPSOQ II — Versão Média (76 itens, Likert 1-5)
 *
 * Referência: Copenhagen Psychosocial Questionnaire II
 * Pontuação direta em todos os itens, EXCETO itens de ordem 42 e 45 (invertidos: 6 − resposta).
 * Resultado por subescala (média aritmética). Nenhum escore total.
 * Classificação semáforo por tercis fixos (≤2,33 / 2,34–3,66 / ≥3,67).
 */

// ─────────────────────────────────────────────
// Configuração COMPLETA do instrumento
// ─────────────────────────────────────────────

export const COPSOQ_MEDIO_CONFIG = {
    dominios: [
        {
            nome: "Exigências Laborais",
            subescalas: [
                { nome: "Exigências Quantitativas", itens: [1, 2, 3], tipo: "risco" as const },
                { nome: "Ritmo de Trabalho", itens: [4], tipo: "risco" as const },
                { nome: "Exigências Cognitivas", itens: [5, 6, 7], tipo: "risco" as const },
                { nome: "Exigências Emocionais", itens: [8], tipo: "risco" as const },
            ],
        },
        {
            nome: "Organização do Trabalho e Conteúdo",
            subescalas: [
                { nome: "Influência no Trabalho", itens: [9, 10, 11, 12], tipo: "protetivo" as const },
                { nome: "Possibilidades de Desenvolvimento", itens: [13, 14, 15], tipo: "protetivo" as const },
            ],
        },
        {
            nome: "Relações Sociais e Liderança",
            subescalas: [
                { nome: "Previsibilidade", itens: [16, 17], tipo: "protetivo" as const },
                { nome: "Transparência do Papel Laboral", itens: [18, 19, 20], tipo: "protetivo" as const },
                { nome: "Recompensas / Reconhecimento", itens: [21, 22, 23], tipo: "protetivo" as const },
                { nome: "Conflitos de Papéis Laborais", itens: [24, 25, 26], tipo: "risco" as const },
                { nome: "Apoio Social de Colegas", itens: [27, 28, 29], tipo: "protetivo" as const },
                { nome: "Apoio Social de Superiores", itens: [30, 31, 32], tipo: "protetivo" as const },
                { nome: "Comunidade Social no Trabalho", itens: [33, 34, 35], tipo: "protetivo" as const },
                { nome: "Qualidade da Liderança", itens: [36, 37, 38, 39], tipo: "protetivo" as const },
            ],
        },
        {
            nome: "Valores no Local de Trabalho",
            subescalas: [
                { nome: "Confiança Horizontal", itens: [40, 41, 42], tipo: "risco" as const },
                { nome: "Confiança Vertical", itens: [43, 44, 45], tipo: "protetivo" as const },
                { nome: "Justiça e Respeito", itens: [46, 47, 48], tipo: "protetivo" as const },
                { nome: "Auto-eficácia", itens: [49, 50], tipo: "protetivo" as const },
            ],
        },
        {
            nome: "Interface Trabalho–Indivíduo",
            subescalas: [
                { nome: "Significado do Trabalho", itens: [51, 52, 53], tipo: "protetivo" as const },
                { nome: "Compromisso c/ Local de Trabalho", itens: [54, 55], tipo: "protetivo" as const },
                { nome: "Satisfação Laboral", itens: [56, 57, 58, 59], tipo: "protetivo" as const },
                { nome: "Insegurança Laboral", itens: [60], tipo: "risco" as const },
            ],
        },
        {
            nome: "Saúde e Bem-Estar",
            subescalas: [
                { nome: "Saúde Geral", itens: [61], tipo: "risco" as const },
                { nome: "Conflito Trabalho–Família", itens: [62, 63, 64], tipo: "risco" as const },
                { nome: "Problemas em Dormir", itens: [65, 66], tipo: "risco" as const },
                { nome: "Burnout", itens: [67, 68], tipo: "risco" as const },
                { nome: "Stress", itens: [69, 70], tipo: "risco" as const },
                { nome: "Sintomas Depressivos", itens: [71, 72], tipo: "risco" as const },
            ],
        },
        {
            nome: "Comportamentos Ofensivos",
            subescalas: [
                { nome: "Comportamentos Ofensivos", itens: [73, 74, 75, 76], tipo: "risco" as const },
            ],
        },
    ],
    /** Itens com pontuação INVERTIDA: pontuação = 6 − resposta_bruta */
    itensInvertidos: [42, 45] as number[],
    /** Cortes fixos de tercis na nova escala 0-100 */
    corteInferior: 33.33,
    corteSuperior: 66.67,
} as const;

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export type Semaforo = "verde" | "amarelo" | "vermelho";
export type TipoSubescala = "risco" | "protetivo";

export interface SubescalaCopsoq {
    nome: string;
    media: number;
    semaforo: Semaforo;
    tipo: TipoSubescala;
    /** Número de respondentes com ao menos uma resposta válida nos itens da subescala */
    nRespondentes: number;
}

export interface DominioCopsoq {
    nome: string;
    subescalas: SubescalaCopsoq[];
    /** "vermelho" se houver qualquer subescala vermelha; "amarelo" se houver amarela; senão "verde" */
    semaforo_dominante: Semaforo;
}

export interface ResultadoCopsoq {
    dominios: DominioCopsoq[];
    totalRespondentes: number;
    /** Nomes das subescalas classificadas em vermelho */
    subescalasEmAlerta: string[];
    /** Score global do instrumento (média simples de todas as subescalas, opcional) */
    scoreGeral: number;
    /** As 5 subescalas com as piores pontuações relativas de risco */
    top5Criticas: SubescalaCopsoq[];
}

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

/**
 * Converte o valor bruto (1-5) em pontuação corrigida (0-100 p/ escala COPSOQ padrão).
 * Itens invertidos: pontuação = 6 − valor antes de converter.
 */
function pontuar(valor: number, ordemItem: number): number {
    let raw = valor;
    if (COPSOQ_MEDIO_CONFIG.itensInvertidos.includes(ordemItem)) {
        raw = 6 - valor;
    }
    return (raw - 1) * 25;
}

/**
 * Classifica a média de acordo com os tercis fixos COPSOQ.
 * O sentido (risco vs protetivo) determina qual polo é "vermelho".
 */
function classificar(media: number, tipo: TipoSubescala): Semaforo {
    const { corteInferior, corteSuperior } = COPSOQ_MEDIO_CONFIG;

    if (tipo === "risco") {
        // Para fatores de RISCO: alto = pior → vermelho
        if (media >= corteSuperior) return "vermelho";
        if (media > corteInferior) return "amarelo";
        return "verde";
    } else {
        // Para fatores PROTETIVOS: baixo = pior → vermelho
        if (media <= corteInferior) return "vermelho";
        if (media < corteSuperior) return "amarelo";
        return "verde";
    }
}

/** Determina o semáforo dominante do domínio: prioridade vermelho > amarelo > verde */
function semaforoDominante(subescalas: SubescalaCopsoq[]): Semaforo {
    if (subescalas.some((s) => s.semaforo === "vermelho")) return "vermelho";
    if (subescalas.some((s) => s.semaforo === "amarelo")) return "amarelo";
    return "verde";
}

// ─────────────────────────────────────────────
// Função principal de cálculo
// ─────────────────────────────────────────────

/**
 * Calcula o relatório COPSOQ II a partir das respostas brutas e do mapeamento de questões.
 *
 * @param todasRespostas - Array de objetos participante, cada um com campo `respostas`:
 *   `Array<{ questao_id: string; resposta: number | string }>`
 * @param questoes - Array de questões da avaliação, cada uma com `id` e `ordem` (1-76)
 * @returns ResultadoCopsoq com médias, semáforos e alertas por subescala
 */
export function calcularCopsoq(
    todasRespostas: Array<{ respostas?: any | null }>,
    questoes: Array<{ id: string; ordem: number }>
): ResultadoCopsoq {
    // Mapa de questao_id → ordem (número do item 1-76)
    const ordemPorId = new Map<string, number>(
        questoes.map((q) => [q.id, q.ordem])
    );

    // Normalizar respostas de cada participante para Array<{ questao_id: string; resposta: number | string }>
    const respostasNormalizadas = todasRespostas.map(p => {
        const raw = p.respostas;
        let norm: Array<{ questao_id: string; resposta: number | string }> = [];

        if (Array.isArray(raw)) {
            norm = raw.map((r: any) => ({
                questao_id: r.questao_id || r.id,
                resposta: r.resposta ?? r.value,
            })).filter(r => r.questao_id !== undefined && r.resposta !== undefined && r.resposta !== null && r.resposta !== '');
        } else if (typeof raw === 'object' && raw !== null) {
            norm = Object.entries(raw).map(([key, val]) => ({
                questao_id: key,
                resposta: val as string | number,
            })).filter(r => r.resposta !== undefined && r.resposta !== null && r.resposta !== '');
        }

        return {
            ...p,
            respostas: norm,
        };
    });

    // Total de respondentes com ao menos 1 resposta válida
    const totalRespondentes = respostasNormalizadas.filter(
        (p) => p.respostas && p.respostas.length > 0
    ).length;

    // ── Para cada subescala, acumular pontuações por respondente ──────────────
    // Estrutura: ordemItem → [pontuacoes dos respondentes]
    const pontuacoesPorItem = new Map<number, number[]>();

    for (const participante of respostasNormalizadas) {
        if (!participante.respostas || participante.respostas.length === 0) continue;

        let index = 0;
        for (const r of participante.respostas) {
            let ordem = ordemPorId.get(r.questao_id);
            
            // Fallback cirúrgico: se a avaliação foi editada e as questões recriadas (novos UUIDs),
            // os IDs antigos ficam órfãos. Como o COPSOQ exige resposta sequencial (obrigatória),
            // a ordem de inserção no JSON array preserva a ordem real da questão (1 a 76).
            if (ordem === undefined) {
                ordem = index + 1;
            }

            index++;

            const valor = Number(r.resposta);
            if (isNaN(valor) || valor < 1 || valor > 5) continue; // resposta inválida

            const pontuacao = pontuar(valor, ordem);

            if (!pontuacoesPorItem.has(ordem)) {
                pontuacoesPorItem.set(ordem, []);
            }
            pontuacoesPorItem.get(ordem)!.push(pontuacao);
        }
    }

    // ── Calcular médias e semáforos por subescala/domínio ────────────────────
    const subescalasEmAlerta: string[] = [];

    const dominios: DominioCopsoq[] = COPSOQ_MEDIO_CONFIG.dominios.map((domConfig) => {
        const subescalas: SubescalaCopsoq[] = domConfig.subescalas.map((subConfig) => {
            // Médias por respondente: média dos itens da subescala para cada pessoa
            // (abordagem: pooling — todos os pontos de todos os respondentes nos itens)
            let soma = 0;
            let nPontos = 0;
            const respondentesComDados = new Set<number>();

            for (const ordemItem of subConfig.itens) {
                const pts = pontuacoesPorItem.get(ordemItem);
                if (!pts) continue;

                for (let i = 0; i < pts.length; i++) {
                    soma += pts[i];
                    nPontos++;
                    respondentesComDados.add(i);
                }
            }

            const media = nPontos > 0 ? parseFloat((soma / nPontos).toFixed(2)) : 0;
            const semaforo = nPontos > 0 ? classificar(media, subConfig.tipo) : "amarelo";
            const nRespondentes = respondentesComDados.size;

            if (semaforo === "vermelho") {
                subescalasEmAlerta.push(subConfig.nome);
            }

            return {
                nome: subConfig.nome,
                media,
                semaforo,
                tipo: subConfig.tipo,
                nRespondentes,
            };
        });

        return {
            nome: domConfig.nome,
            subescalas,
            semaforo_dominante: semaforoDominante(subescalas),
        };
    });

    // Calcular Top 5 críticas e Score Geral (Índice de Risco Global)
    const todasSubescalas = dominios.flatMap(d => d.subescalas);

    // O Score Geral é um "Índice de Risco". Para escalas de Risco (alto = ruim), usamos o valor direto.
    // Para escalas Protetivas (alto = bom), o "risco" é 100 - media.
    const scoreGeral = todasSubescalas.length > 0
        ? parseFloat((todasSubescalas.reduce((acc, sub) => {
            const riscoDaSubescala = sub.tipo === "risco" ? sub.media : (100 - sub.media);
            return acc + riscoDaSubescala;
        }, 0) / todasSubescalas.length).toFixed(1))
        : 0;

    // Para classificar severidade: 
    // Tipo Risco -> valor alto é ruim (usa o próprio valor base 0 a 100)
    // Tipo Protetivo -> valor baixo é ruim (usa 100 - media para inverter e ranquear)
    const top5Criticas = [...todasSubescalas].sort((a, b) => {
        const severidadeA = a.tipo === "risco" ? a.media : (100 - a.media);
        const severidadeB = b.tipo === "risco" ? b.media : (100 - b.media);
        return severidadeB - severidadeA;
    }).slice(0, 5);

    return {
        dominios,
        totalRespondentes,
        subescalasEmAlerta,
        scoreGeral,
        top5Criticas,
    };
}

// ─────────────────────────────────────────────
// Hook React (wrapper conveniente)
// ─────────────────────────────────────────────

/**
 * Hook que expõe a função `calcularCopsoq`.
 * Use diretamente quando já tiver `todasRespostas` e `questoes` disponíveis.
 *
 * @example
 * const { calcular } = useCopsoqRelatorio();
 * const resultado = calcular(todasRespostas, questoes);
 */
export function useCopsoqRelatorio() {
    return { calcular: calcularCopsoq };
}
