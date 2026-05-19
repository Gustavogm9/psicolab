import { z } from 'zod';

// Schema para validação de questões
export const questaoSchema = z.object({
  id: z.string(),
  pergunta: z.string()
    .trim()
    .min(10, { message: "A pergunta deve ter pelo menos 10 caracteres" })
    .max(500, { message: "A pergunta deve ter no máximo 500 caracteres" }),
  tipo: z.enum(["multipla_escolha", "escala", "texto_livre", "sim_nao"]),
  opcoes: z.array(z.string().trim().min(1)).optional(),
  obrigatoria: z.boolean(),
  categoria: z.string()
    .trim()
    .min(2, { message: "A categoria deve ter pelo menos 2 caracteres" })
    .max(50, { message: "A categoria deve ter no máximo 50 caracteres" })
});

// Schema para configurações da avaliação
export const configuracoesSchema = z.object({
  tempoLimite: z.number().positive().max(180).optional(),
  anonima: z.boolean(),
  permitirEdicao: z.boolean(),
  enviarLembrete: z.boolean()
});

// Schema principal da avaliação
export const avaliacaoSchema = z.object({
  id: z.string(),
  nome: z.string()
    .trim()
    .min(5, { message: "O nome deve ter pelo menos 5 caracteres" })
    .max(100, { message: "O nome deve ter no máximo 100 caracteres" }),
  descricao: z.string()
    .trim()
    .min(10, { message: "A descrição deve ter pelo menos 10 caracteres" })
    .max(1000, { message: "A descrição deve ter no máximo 1000 caracteres" }),
  tipo: z.string()
    .min(1, { message: "Selecione um tipo de avaliação" }),
  status: z.enum(["rascunho", "ativa", "pausada", "finalizada"]),
  dataInicio: z.string()
    .min(1, { message: "Data de início é obrigatória" })
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, { message: "A data de início não pode ser anterior a hoje" }),
  dataFim: z.string()
    .min(1, { message: "Data de fim é obrigatória" }),
  participantes: z.number().nonnegative(),
  questoes: z.array(questaoSchema)
    .min(1, { message: "A avaliação deve ter pelo menos 1 questão" })
    .max(50, { message: "A avaliação pode ter no máximo 50 questões" }),
  configuracoes: configuracoesSchema
}).refine((data) => {
  const inicio = new Date(data.dataInicio);
  const fim = new Date(data.dataFim);
  return fim > inicio;
}, {
  message: "A data de fim deve ser posterior à data de início",
  path: ["dataFim"]
}).refine((data) => {
  // Validar questões de múltipla escolha
  const questoesMultipla = data.questoes.filter(q => q.tipo === "multipla_escolha");
  return questoesMultipla.every(q => q.opcoes && q.opcoes.length >= 2);
}, {
  message: "Questões de múltipla escolha devem ter pelo menos 2 opções",
  path: ["questoes"]
});

export type AvaliacaoFormData = z.infer<typeof avaliacaoSchema>;
export type QuestaoFormData = z.infer<typeof questaoSchema>;
export type ConfiguracoesFormData = z.infer<typeof configuracoesSchema>;