# Prompts para o Antigravity — Correções COPSOQ

São 3 prompts em ordem. Cada um deve ser executado e validado antes de passar pro próximo.

---

## PROMPT 1 — Engine de Cálculo do COPSOQ

```
Crie o arquivo `src/hooks/useCopsoqRelatorio.ts` com a engine de cálculo do COPSOQ II Versão Média.

O COPSOQ é um instrumento psicométrico com lógica própria de correção. As respostas brutas já existem no banco de dados (tabelas `avaliacoes_respostas_publicas` e `avaliacoes_participantes`, campo `respostas` que é um array JSON com `{ questao_id, resposta }`).

A função deve receber o array `todasRespostas` (já existente no hook `useRelatorioAvaliacao`) e um array `questoes` (da avaliação, com campo `ordem` indicando o número da questão 1-76) e retornar o resultado calculado por subescala.

**Regras de pontuação:**
- Todos os 76 itens usam escala Likert 1-5, pontuação direta
- EXCEÇÃO: itens de ordem 42 e 45 são INVERTIDOS → pontuação = 6 − resposta
- O COPSOQ não gera escore total — a análise é feita subescala por subescala
- Para cada subescala: calcular a MÉDIA aritmética dos itens que a compõem (usando as pontuações já corrigidas)

**Classificação semáforo (tercis fixos):**
- Fatores de RISCO: verde = média ≤ 2,33 | amarelo = 2,34–3,66 | vermelho = média ≥ 3,67
- Fatores PROTETIVOS: verde = média ≥ 3,67 | amarelo = 2,34–3,66 | vermelho = média ≤ 2,33

**Mapeamento COMPLETO das subescalas (ordem do item → subescala):**

```typescript
export const COPSOQ_MEDIO_CONFIG = {
  dominios: [
    {
      nome: "Exigências Laborais",
      subescalas: [
        { nome: "Exigências Quantitativas", itens: [1, 2, 3], tipo: "risco" },
        { nome: "Ritmo de Trabalho", itens: [4], tipo: "risco" },
        { nome: "Exigências Cognitivas", itens: [5, 6, 7], tipo: "risco" },
        { nome: "Exigências Emocionais", itens: [8], tipo: "risco" },
      ],
    },
    {
      nome: "Organização do Trabalho e Conteúdo",
      subescalas: [
        { nome: "Influência no Trabalho", itens: [9, 10, 11, 12], tipo: "protetivo" },
        { nome: "Possibilidades de Desenvolvimento", itens: [13, 14, 15], tipo: "protetivo" },
      ],
    },
    {
      nome: "Relações Sociais e Liderança",
      subescalas: [
        { nome: "Previsibilidade", itens: [16, 17], tipo: "protetivo" },
        { nome: "Transparência do Papel Laboral", itens: [18, 19, 20], tipo: "protetivo" },
        { nome: "Recompensas / Reconhecimento", itens: [21, 22, 23], tipo: "protetivo" },
        { nome: "Conflitos de Papéis Laborais", itens: [24, 25, 26], tipo: "risco" },
        { nome: "Apoio Social de Colegas", itens: [27, 28, 29], tipo: "protetivo" },
        { nome: "Apoio Social de Superiores", itens: [30, 31, 32], tipo: "protetivo" },
        { nome: "Comunidade Social no Trabalho", itens: [33, 34, 35], tipo: "protetivo" },
        { nome: "Qualidade da Liderança", itens: [36, 37, 38, 39], tipo: "protetivo" },
      ],
    },
    {
      nome: "Valores no Local de Trabalho",
      subescalas: [
        { nome: "Confiança Horizontal", itens: [40, 41, 42], tipo: "risco" },
        { nome: "Confiança Vertical", itens: [43, 44, 45], tipo: "protetivo" },
        { nome: "Justiça e Respeito", itens: [46, 47, 48], tipo: "protetivo" },
        { nome: "Auto-eficácia", itens: [49, 50], tipo: "protetivo" },
      ],
    },
    {
      nome: "Interface Trabalho–Indivíduo",
      subescalas: [
        { nome: "Significado do Trabalho", itens: [51, 52, 53], tipo: "protetivo" },
        { nome: "Compromisso c/ Local de Trabalho", itens: [54, 55], tipo: "protetivo" },
        { nome: "Satisfação Laboral", itens: [56, 57, 58, 59], tipo: "protetivo" },
        { nome: "Insegurança Laboral", itens: [60], tipo: "risco" },
      ],
    },
    {
      nome: "Saúde e Bem-Estar",
      subescalas: [
        { nome: "Saúde Geral", itens: [61], tipo: "risco" },
        { nome: "Conflito Trabalho–Família", itens: [62, 63, 64], tipo: "risco" },
        { nome: "Problemas em Dormir", itens: [65, 66], tipo: "risco" },
        { nome: "Burnout", itens: [67, 68], tipo: "risco" },
        { nome: "Stress", itens: [69, 70], tipo: "risco" },
        { nome: "Sintomas Depressivos", itens: [71, 72], tipo: "risco" },
      ],
    },
    {
      nome: "Comportamentos Ofensivos",
      subescalas: [
        { nome: "Comportamentos Ofensivos", itens: [73, 74, 75, 76], tipo: "risco" },
      ],
    },
  ],
  itensInvertidos: [42, 45],
  corteInferior: 2.33,
  corteSuperior: 3.67,
};
```

O hook `useCopsoqRelatorio` deve exportar uma função `calcularCopsoq(todasRespostas, questoes)` que retorna:

```typescript
interface ResultadoCopsoq {
  dominios: {
    nome: string;
    subescalas: {
      nome: string;
      media: number;
      semaforo: "verde" | "amarelo" | "vermelho";
      tipo: "risco" | "protetivo";
      nRespondentes: number;
    }[];
    semaforo_dominante: "verde" | "amarelo" | "vermelho";
  }[];
  totalRespondentes: number;
  subescalasEmAlerta: string[]; // nomes das subescalas em vermelho
}
```

Para mapear `questao_id` → número de ordem, use o array `questoes` (campo `questoes.ordem`). A pontuação de cada item é o valor numérico da resposta (1-5), exceto itens de ordem 42 e 45 onde pontuação = 6 − resposta. O `semaforo_dominante` do domínio é "vermelho" se houver qualquer subescala vermelha, "amarelo" se houver amarela, senão "verde".
```

---

## PROMPT 2 — Componente Visual do Relatório COPSOQ

```
Crie o componente `src/components/avaliacoes/RelatorioCopsoq.tsx`.

Este componente recebe `resultado: ResultadoCopsoq` (importado de `@/hooks/useCopsoqRelatorio`) e renderiza o relatório visual do COPSOQ com semáforo por subescala.

**Layout do componente:**

1. **Cabeçalho**: Card com título "Relatório COPSOQ II — Versão Média", total de respondentes, e um badge por quantidade de subescalas em cada cor (ex: "3 em alerta", "12 em atenção", "14 favoráveis").

2. **Para cada domínio**: Card separado com:
   - Título do domínio com badge colorido (`semaforo_dominante`)
   - Tabela ou lista de subescalas com:
     - Nome da subescala
     - Barra de progresso colorida (verde=#22c55e, amarelo=#eab308, vermelho=#ef4444) proporcional à média (escala 1–5)
     - Valor da média formatado com 2 casas decimais (ex: "3,47")
     - Badge de classificação: "🟢 Baixo Risco" / "🟡 Atenção" / "🔴 Alto Risco" para fatores de risco, ou "🟢 Favorável" / "🟡 Moderado" / "🔴 Baixo Recurso" para fatores protetivos

3. **Card de Prioridades**: Lista apenas as `subescalasEmAlerta` com ícone de alerta vermelho e mensagem: "Estas dimensões requerem intervenção prioritária."

4. **Rodapé**: Nota técnica em texto pequeno: "Classificação baseada nos tercis fixos do COPSOQ II (Portugal, 2013). Cortes: ≤2,33 favorável | 2,34–3,66 intermediário | ≥3,67 crítico."

Use componentes shadcn/ui já existentes no projeto (Card, Badge, Progress). Use Tailwind para as cores. Não crie arquivos CSS separados. O componente deve ser responsivo.
```

---

## PROMPT 3 — Integração: campo instrumento + relatório condicional

```
Faça as seguintes alterações para integrar o COPSOQ ao fluxo de avaliações:

**1. Banco de dados — adicionar coluna `instrumento` na tabela `avaliacoes`**
Crie uma migration Supabase adicionando a coluna:
```sql
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS instrumento TEXT DEFAULT NULL;
```
Os valores possíveis são: `'copsoq_medio'`, `'copsoq_curto'`, `'generico'` (ou NULL = genérico).

**2. `src/pages/Avaliacoes/CriarAvaliacao.tsx` — adicionar COPSOQ como tipo de avaliação**
No array `tiposAvaliacao`, adicione:
```typescript
{
  id: "copsoq_medio",
  nome: "COPSOQ II — Riscos Psicossociais",
  descricao: "Instrumento padronizado de avaliação de riscos psicossociais no trabalho (Versão Média, 76 itens)",
  emoji: "🧠",
},
```
Ao criar uma avaliação com `tipo === "copsoq_medio"`, salvar também `instrumento: "copsoq_medio"` no campo da tabela.

**3. `src/pages/Avaliacoes/RelatorioAvaliacao.tsx` — renderização condicional**
Importe os novos artefatos:
```typescript
import { calcularCopsoq } from "@/hooks/useCopsoqRelatorio";
import { RelatorioCopsoq } from "@/components/avaliacoes/RelatorioCopsoq";
```

Após carregar `avaliacaoData` e `relatorioData`, adicione:
```typescript
const isCopsoq = avaliacaoData?.instrumento === "copsoq_medio";
const resultadoCopsoq = isCopsoq && relatorioData?.todasRespostas?.length > 0
  ? calcularCopsoq(relatorioData.todasRespostas, avaliacaoData.questoes)
  : null;
```

Na seção de resultados, substitua o bloco atual de análise por questão por:
```tsx
{isCopsoq && resultadoCopsoq ? (
  <RelatorioCopsoq resultado={resultadoCopsoq} />
) : (
  /* manter aqui o bloco original de análise por questão para avaliações genéricas */
)}
```

O bloco de "Respondentes" (lista de quem respondeu com data) deve ser mantido em ambos os casos, abaixo do relatório.
```

---

---

## PROMPT 4 — Template COPSOQ: questões pré-carregadas e tela de criação adaptada

```
Faça as seguintes alterações para que a consultora não precise digitar as 76 questões do COPSOQ manualmente:

---

### PARTE A — Criar `src/lib/copsoq-questoes.ts`

Crie este arquivo com as 76 questões do COPSOQ II Versão Média hardcoded como constante. Cada questão deve ter os campos `ordem` (1–76), `pergunta`, `tipo: "escala"`, `obrigatoria: true`, `categoria` (nome da subescala), `peso: 1`.

```typescript
export const COPSOQ_MEDIO_QUESTOES = [
  // ── EXIGÊNCIAS LABORAIS ──
  { ordem: 1,  pergunta: "Com que frequência não tem tempo suficiente para completar todas as tarefas do seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Exigências Quantitativas", peso: 1 },
  { ordem: 2,  pergunta: "Com que frequência precisa trabalhar muito rapidamente?", tipo: "escala", obrigatoria: true, categoria: "Exigências Quantitativas", peso: 1 },
  { ordem: 3,  pergunta: "Com que frequência o seu trabalho exige a sua atenção constante?", tipo: "escala", obrigatoria: true, categoria: "Exigências Quantitativas", peso: 1 },
  { ordem: 4,  pergunta: "O seu trabalho exige que trabalhe rapidamente?", tipo: "escala", obrigatoria: true, categoria: "Ritmo de Trabalho", peso: 1 },
  { ordem: 5,  pergunta: "O seu trabalho requer que tome decisões difíceis?", tipo: "escala", obrigatoria: true, categoria: "Exigências Cognitivas", peso: 1 },
  { ordem: 6,  pergunta: "O seu trabalho exige que memorize muitas coisas?", tipo: "escala", obrigatoria: true, categoria: "Exigências Cognitivas", peso: 1 },
  { ordem: 7,  pergunta: "O seu trabalho exige que seja criativo(a)?", tipo: "escala", obrigatoria: true, categoria: "Exigências Cognitivas", peso: 1 },
  { ordem: 8,  pergunta: "O seu trabalho é emocionalmente exigente?", tipo: "escala", obrigatoria: true, categoria: "Exigências Emocionais", peso: 1 },

  // ── ORGANIZAÇÃO DO TRABALHO E CONTEÚDO ──
  { ordem: 9,  pergunta: "Tem influência sobre a quantidade de trabalho que lhe é atribuída?", tipo: "escala", obrigatoria: true, categoria: "Influência no Trabalho", peso: 1 },
  { ordem: 10, pergunta: "Tem influência sobre a forma como desenvolve o seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Influência no Trabalho", peso: 1 },
  { ordem: 11, pergunta: "Tem influência sobre o que faz no trabalho?", tipo: "escala", obrigatoria: true, categoria: "Influência no Trabalho", peso: 1 },
  { ordem: 12, pergunta: "Em que medida pode influenciar a qualidade do seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Influência no Trabalho", peso: 1 },
  { ordem: 13, pergunta: "No seu trabalho pode desenvolver as suas competências profissionais?", tipo: "escala", obrigatoria: true, categoria: "Possibilidades de Desenvolvimento", peso: 1 },
  { ordem: 14, pergunta: "O seu trabalho proporciona-lhe oportunidades de aprendizagem?", tipo: "escala", obrigatoria: true, categoria: "Possibilidades de Desenvolvimento", peso: 1 },
  { ordem: 15, pergunta: "Pode aplicar os seus conhecimentos e competências no seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Possibilidades de Desenvolvimento", peso: 1 },

  // ── RELAÇÕES SOCIAIS E LIDERANÇA ──
  { ordem: 16, pergunta: "No seu trabalho é informado(a) com antecedência sobre decisões importantes, mudanças ou planos futuros?", tipo: "escala", obrigatoria: true, categoria: "Previsibilidade", peso: 1 },
  { ordem: 17, pergunta: "Recebe toda a informação necessária para fazer bem o seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Previsibilidade", peso: 1 },
  { ordem: 18, pergunta: "Sabe exatamente quais são as suas responsabilidades?", tipo: "escala", obrigatoria: true, categoria: "Transparência do Papel Laboral", peso: 1 },
  { ordem: 19, pergunta: "Sabe exatamente o que é esperado de si no trabalho?", tipo: "escala", obrigatoria: true, categoria: "Transparência do Papel Laboral", peso: 1 },
  { ordem: 20, pergunta: "Sabe exatamente quais são os objetivos do seu serviço/departamento/empresa?", tipo: "escala", obrigatoria: true, categoria: "Transparência do Papel Laboral", peso: 1 },
  { ordem: 21, pergunta: "O seu trabalho é reconhecido e apreciado pela gestão/chefia?", tipo: "escala", obrigatoria: true, categoria: "Recompensas / Reconhecimento", peso: 1 },
  { ordem: 22, pergunta: "É tratado(a) de forma justa no seu local de trabalho?", tipo: "escala", obrigatoria: true, categoria: "Recompensas / Reconhecimento", peso: 1 },
  { ordem: 23, pergunta: "É tratado(a) com respeito pelos seus superiores?", tipo: "escala", obrigatoria: true, categoria: "Recompensas / Reconhecimento", peso: 1 },
  { ordem: 24, pergunta: "Existem exigências contraditórias no seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Conflitos de Papéis Laborais", peso: 1 },
  { ordem: 25, pergunta: "Por vezes tem de fazer coisas que deveriam ser feitas de outra maneira?", tipo: "escala", obrigatoria: true, categoria: "Conflitos de Papéis Laborais", peso: 1 },
  { ordem: 26, pergunta: "Realiza tarefas que considera serem desnecessárias?", tipo: "escala", obrigatoria: true, categoria: "Conflitos de Papéis Laborais", peso: 1 },
  { ordem: 27, pergunta: "Os seus colegas estão dispostos a ouvi-lo(a) quando tem um problema relacionado com o trabalho?", tipo: "escala", obrigatoria: true, categoria: "Apoio Social de Colegas", peso: 1 },
  { ordem: 28, pergunta: "Os seus colegas apoiam-no(a)?", tipo: "escala", obrigatoria: true, categoria: "Apoio Social de Colegas", peso: 1 },
  { ordem: 29, pergunta: "Os seus colegas são amigáveis?", tipo: "escala", obrigatoria: true, categoria: "Apoio Social de Colegas", peso: 1 },
  { ordem: 30, pergunta: "O seu superior direto está disposto(a) a ouvi-lo(a) quando tem um problema relacionado com o trabalho?", tipo: "escala", obrigatoria: true, categoria: "Apoio Social de Superiores", peso: 1 },
  { ordem: 31, pergunta: "O seu superior direto apoia-o(a)?", tipo: "escala", obrigatoria: true, categoria: "Apoio Social de Superiores", peso: 1 },
  { ordem: 32, pergunta: "O seu superior direto é amigável?", tipo: "escala", obrigatoria: true, categoria: "Apoio Social de Superiores", peso: 1 },
  { ordem: 33, pergunta: "Existe um bom ambiente de trabalho entre si e os seus colegas?", tipo: "escala", obrigatoria: true, categoria: "Comunidade Social no Trabalho", peso: 1 },
  { ordem: 34, pergunta: "Sente-se parte de uma comunidade no seu local de trabalho?", tipo: "escala", obrigatoria: true, categoria: "Comunidade Social no Trabalho", peso: 1 },
  { ordem: 35, pergunta: "Existe boa cooperação entre os colegas de trabalho?", tipo: "escala", obrigatoria: true, categoria: "Comunidade Social no Trabalho", peso: 1 },
  { ordem: 36, pergunta: "A sua chefia direta planeia o trabalho com antecedência?", tipo: "escala", obrigatoria: true, categoria: "Qualidade da Liderança", peso: 1 },
  { ordem: 37, pergunta: "A sua chefia direta resolve bem os conflitos?", tipo: "escala", obrigatoria: true, categoria: "Qualidade da Liderança", peso: 1 },
  { ordem: 38, pergunta: "A sua chefia direta comunica bem com os trabalhadores?", tipo: "escala", obrigatoria: true, categoria: "Qualidade da Liderança", peso: 1 },
  { ordem: 39, pergunta: "A sua chefia direta distribui o trabalho de forma justa?", tipo: "escala", obrigatoria: true, categoria: "Qualidade da Liderança", peso: 1 },

  // ── VALORES NO LOCAL DE TRABALHO ──
  { ordem: 40, pergunta: "Os funcionários ocultam informações uns dos outros?", tipo: "escala", obrigatoria: true, categoria: "Confiança Horizontal", peso: 1 },
  { ordem: 41, pergunta: "Os funcionários ocultam informação à gerência?", tipo: "escala", obrigatoria: true, categoria: "Confiança Horizontal", peso: 1 },
  { ordem: 42, pergunta: "Os funcionários confiam uns nos outros de um modo geral?", tipo: "escala", obrigatoria: true, categoria: "Confiança Horizontal", peso: 1 },
  { ordem: 43, pergunta: "A gerência confia nos seus funcionários para que executem bem o seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Confiança Vertical", peso: 1 },
  { ordem: 44, pergunta: "Confia na informação que lhe é transmitida pela gerência?", tipo: "escala", obrigatoria: true, categoria: "Confiança Vertical", peso: 1 },
  { ordem: 45, pergunta: "A gerência oculta informação aos seus funcionários?", tipo: "escala", obrigatoria: true, categoria: "Confiança Vertical", peso: 1 },
  { ordem: 46, pergunta: "Os conflitos são resolvidos de forma justa?", tipo: "escala", obrigatoria: true, categoria: "Justiça e Respeito", peso: 1 },
  { ordem: 47, pergunta: "As sugestões dos funcionários são tratadas de forma séria pela gestão?", tipo: "escala", obrigatoria: true, categoria: "Justiça e Respeito", peso: 1 },
  { ordem: 48, pergunta: "O trabalho é distribuído de forma justa?", tipo: "escala", obrigatoria: true, categoria: "Justiça e Respeito", peso: 1 },
  { ordem: 49, pergunta: "Sinto que posso lidar com a maioria das situações difíceis no trabalho.", tipo: "escala", obrigatoria: true, categoria: "Auto-eficácia", peso: 1 },
  { ordem: 50, pergunta: "Mesmo que as coisas no trabalho não corram bem, consigo manter a calma.", tipo: "escala", obrigatoria: true, categoria: "Auto-eficácia", peso: 1 },

  // ── INTERFACE TRABALHO–INDIVÍDUO ──
  { ordem: 51, pergunta: "O seu trabalho tem sentido para si?", tipo: "escala", obrigatoria: true, categoria: "Significado do Trabalho", peso: 1 },
  { ordem: 52, pergunta: "Sente que o seu trabalho é importante?", tipo: "escala", obrigatoria: true, categoria: "Significado do Trabalho", peso: 1 },
  { ordem: 53, pergunta: "Sente-se motivado(a) e envolvido(a) com o seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Significado do Trabalho", peso: 1 },
  { ordem: 54, pergunta: "Recomendaria a um bom amigo(a) que trabalhasse nesta empresa/organização?", tipo: "escala", obrigatoria: true, categoria: "Compromisso c/ Local de Trabalho", peso: 1 },
  { ordem: 55, pergunta: "Esta empresa/organização tem um grande significado pessoal para si?", tipo: "escala", obrigatoria: true, categoria: "Compromisso c/ Local de Trabalho", peso: 1 },
  { ordem: 56, pergunta: "Como avalia o seu local de trabalho em geral?", tipo: "escala", obrigatoria: true, categoria: "Satisfação Laboral", peso: 1 },
  { ordem: 57, pergunta: "Quão satisfeito(a) está com as suas perspetivas de trabalho?", tipo: "escala", obrigatoria: true, categoria: "Satisfação Laboral", peso: 1 },
  { ordem: 58, pergunta: "Quão satisfeito(a) está com o modo como as suas capacidades são utilizadas?", tipo: "escala", obrigatoria: true, categoria: "Satisfação Laboral", peso: 1 },
  { ordem: 59, pergunta: "Quão satisfeito(a) está com o seu trabalho em geral?", tipo: "escala", obrigatoria: true, categoria: "Satisfação Laboral", peso: 1 },
  { ordem: 60, pergunta: "Está preocupado(a) em perder o seu emprego?", tipo: "escala", obrigatoria: true, categoria: "Insegurança Laboral", peso: 1 },

  // ── SAÚDE E BEM-ESTAR ──
  { ordem: 61, pergunta: "Em geral, como avalia a sua saúde? (1 = Excelente → 5 = Deficitária)", tipo: "escala", obrigatoria: true, categoria: "Saúde Geral", peso: 1 },
  { ordem: 62, pergunta: "Tem dificuldade em cumprir com as responsabilidades familiares por causa do trabalho?", tipo: "escala", obrigatoria: true, categoria: "Conflito Trabalho–Família", peso: 1 },
  { ordem: 63, pergunta: "O seu trabalho perturba a sua vida familiar?", tipo: "escala", obrigatoria: true, categoria: "Conflito Trabalho–Família", peso: 1 },
  { ordem: 64, pergunta: "A sua família e os seus amigos dizem-lhe que trabalha demasiado?", tipo: "escala", obrigatoria: true, categoria: "Conflito Trabalho–Família", peso: 1 },
  { ordem: 65, pergunta: "Tem dificuldade em adormecer?", tipo: "escala", obrigatoria: true, categoria: "Problemas em Dormir", peso: 1 },
  { ordem: 66, pergunta: "Acorda várias vezes durante a noite?", tipo: "escala", obrigatoria: true, categoria: "Problemas em Dormir", peso: 1 },
  { ordem: 67, pergunta: "Sente-se emocionalmente esgotado(a) com o seu trabalho?", tipo: "escala", obrigatoria: true, categoria: "Burnout", peso: 1 },
  { ordem: 68, pergunta: "Sente-se exausto(a) de manhã quando pensa no dia de trabalho que tem pela frente?", tipo: "escala", obrigatoria: true, categoria: "Burnout", peso: 1 },
  { ordem: 69, pergunta: "Sente-se constantemente sob pressão?", tipo: "escala", obrigatoria: true, categoria: "Stress", peso: 1 },
  { ordem: 70, pergunta: "Não consegue \"desligar\" do trabalho no final do dia?", tipo: "escala", obrigatoria: true, categoria: "Stress", peso: 1 },
  { ordem: 71, pergunta: "Perde o interesse pelas coisas?", tipo: "escala", obrigatoria: true, categoria: "Sintomas Depressivos", peso: 1 },
  { ordem: 72, pergunta: "Sente-se triste?", tipo: "escala", obrigatoria: true, categoria: "Sintomas Depressivos", peso: 1 },

  // ── COMPORTAMENTOS OFENSIVOS ──
  { ordem: 73, pergunta: "É alvo de insultos ou provocações?", tipo: "escala", obrigatoria: true, categoria: "Comportamentos Ofensivos", peso: 1 },
  { ordem: 74, pergunta: "É alvo de assédio sexual indesejado?", tipo: "escala", obrigatoria: true, categoria: "Comportamentos Ofensivos", peso: 1 },
  { ordem: 75, pergunta: "É ameaçado(a) com violência?", tipo: "escala", obrigatoria: true, categoria: "Comportamentos Ofensivos", peso: 1 },
  { ordem: 76, pergunta: "É alvo de violência física?", tipo: "escala", obrigatoria: true, categoria: "Comportamentos Ofensivos", peso: 1 },
] as const;
```

---

### PARTE B — Adaptar `src/pages/Avaliacoes/CriarAvaliacao.tsx`

Quando o tipo selecionado for `"copsoq_medio"`, o fluxo de questões deve mudar completamente:

1. **Importar** `COPSOQ_MEDIO_QUESTOES` de `@/lib/copsoq-questoes`

2. **Ao selecionar o tipo `"copsoq_medio"`**, carregar automaticamente as questões no `formData`:
```typescript
if (tipo === "copsoq_medio") {
  setFormData(prev => ({
    ...prev,
    tipo,
    instrumento: "copsoq_medio",
    questoes: COPSOQ_MEDIO_QUESTOES.map((q, i) => ({
      id: `copsoq-${q.ordem}`,
      pergunta: q.pergunta,
      tipo: q.tipo as any,
      obrigatoria: q.obrigatoria,
      categoria: q.categoria,
      peso: q.peso,
      ordem: q.ordem,
    })),
  }));
}
```

3. **Na etapa de questões** (etapa 2 do formulário), quando `formData.instrumento === "copsoq_medio"`, substituir o `QuestoesManager` por um painel read-only:
```tsx
{formData.instrumento === "copsoq_medio" ? (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span>🧠</span> COPSOQ II — 76 questões padronizadas
      </CardTitle>
      <CardDescription>
        Instrumento validado. As questões não podem ser editadas para preservar a validade psicométrica.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Listar as 7 domínios com contagem de itens, somente leitura */}
      {["Exigências Laborais (Q1–Q8)", "Organização do Trabalho (Q9–Q15)", "Relações Sociais e Liderança (Q16–Q39)", "Valores no Local de Trabalho (Q40–Q50)", "Interface Trabalho–Indivíduo (Q51–Q60)", "Saúde e Bem-Estar (Q61–Q72)", "Comportamentos Ofensivos (Q73–Q76)"].map(dominio => (
        <div key={dominio} className="flex items-center gap-2 py-2 border-b last:border-0 text-sm">
          <span className="text-green-600">✓</span>
          <span>{dominio}</span>
        </div>
      ))}
    </CardContent>
  </Card>
) : (
  <QuestoesManager ... /> // manter fluxo original para outras avaliações
)}
```

---

### PARTE C — Corrigir `src/components/avaliacoes/TemplateSelector.tsx`

Na função `aplicarTemplate`, a linha `ordem: index` apaga o número do item original. Corrigir para:
```typescript
ordem: q.ordem ?? index + 1,
```
Isso garante que se alguém criar um template COPSOQ pelo banco, a `ordem` é preservada corretamente.
```

---

---

## PROMPT 5 (Opcional) — Rótulos Likert no Formulário Público COPSOQ

```
Modifique `src/pages/Avaliacoes/AvaliacaoPublica.tsx` para exibir os rótulos textuais corretos da escala Likert quando o instrumento for COPSOQ II.

### Contexto

O formulário público (`AvaliacaoPublicaContent`) já recebe o objeto `avaliacao` via hook `useAvaliacaoPublica`. Após as correções anteriores, `avaliacao.instrumento` pode ser `"copsoq_medio"`. Cada questão (objeto `questao`) já tem um campo `categoria` com o nome da subescala (ex.: "Satisfação Laboral", "Saúde Geral", "Comportamentos Ofensivos").

Hoje, todas as perguntas do tipo `'escala'` mostram apenas os números 1–5 com os rótulos genéricos "Discordo totalmente" / "Concordo totalmente" no rodapé. Para o COPSOQ, isso é inadequado — o instrumento usa escala de frequência, não de concordância.

### O que implementar

**1. Adicionar a função auxiliar `getCopsoqEscalaLabels`**

Adicione esta função logo antes de `const renderQuestao = (questao: any) => {`:

```typescript
const getCopsoqEscalaLabels = (categoria: string): string[] => {
  // Saúde Geral (Q61) — escala de saúde percebida
  if (categoria === "Saúde Geral") {
    return ["Excelente", "Muito boa", "Boa", "Razoável", "Deficitária"];
  }
  // Satisfação Laboral (Q56–Q59) — escala de satisfação
  if (categoria === "Satisfação Laboral") {
    return [
      "Muito insatisfeito(a)",
      "Insatisfeito(a)",
      "Moderadamente satisfeito(a)",
      "Satisfeito(a)",
      "Muito satisfeito(a)",
    ];
  }
  // Comportamentos Ofensivos (Q73–Q76) — escala de frequência temporal
  if (categoria === "Comportamentos Ofensivos") {
    return ["Nunca", "Raramente", "Mensalmente", "Semanalmente", "Diariamente"];
  }
  // Escala padrão COPSOQ — frequência (todos os outros domínios)
  return [
    "Nunca/\nQuase nunca",
    "Raramente",
    "Às vezes",
    "Frequentemente",
    "Sempre/\nQuase sempre",
  ];
};
```

**2. Modificar o case `'escala'` em `renderQuestao`**

Substitua o bloco inteiro do `case 'escala':` pelo seguinte:

```typescript
case 'escala': {
  const isCopsoq = avaliacao?.instrumento === "copsoq_medio";
  const copsoqLabels = isCopsoq ? getCopsoqEscalaLabels(questao.categoria || "") : null;

  return (
    <RadioGroup value={valor} onValueChange={(v) => handleResposta(questao.id, v)}>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="flex flex-col items-center gap-2 flex-1">
            <RadioGroupItem value={num.toString()} id={`${questao.id}-${num}`} />
            <Label
              htmlFor={`${questao.id}-${num}`}
              className={`text-center cursor-pointer ${isCopsoq ? "text-xs leading-tight text-muted-foreground" : "text-sm"}`}
              style={{ whiteSpace: "pre-line" }}
            >
              {isCopsoq && copsoqLabels ? copsoqLabels[num - 1] : num}
            </Label>
          </div>
        ))}
      </div>
      {!isCopsoq && (
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Discordo totalmente</span>
          <span>Concordo totalmente</span>
        </div>
      )}
    </RadioGroup>
  );
}
```

### Resultado esperado

- Para avaliações COPSOQ: cada opção exibe o rótulo textual correspondente (ex.: "Raramente", "Às vezes") abaixo do radio button, sem o rodapé genérico de concordância.
- Para todas as outras avaliações (instrumento ≠ "copsoq_medio"): comportamento idêntico ao atual (números 1–5 + rodapé "Discordo totalmente / Concordo totalmente").
- Nenhuma outra parte do formulário é alterada.

### Observações

- `avaliacao` está acessível dentro de `renderQuestao` via closure (ambos estão no mesmo componente `AvaliacaoPublicaContent`).
- O campo `categoria` já existe nas questões do COPSOQ desde o Prompt 4 (definido em `src/lib/copsoq-questoes.ts`).
- Não alterar lógica de navegação, validação, submissão ou qualquer outro `case` do switch.
```

---

## Observações para o Antigravity

- Os prompts 1–4 são independentes entre si mas devem ser executados em ordem
- O Prompt 5 é opcional e independente — pode ser executado a qualquer momento após os Prompts 1–4
- O mapeamento de itens nos Prompts 1 e 4 é extraído diretamente do **Manual COPSOQ II Portugal 2013 (pp. 26–39)** — não alterar os números de ordem
- A lógica de semáforo é diferente para fatores de risco vs. protetivos — isso é intencional e crítico para a interpretação clínica correta
- A tabela `avaliacoes_questoes` tem campo `ordem` (inteiro 1–76) que o engine usa para identificar cada item do instrumento
- As questões do COPSOQ são de domínio público (instrumento validado, manual disponível em copsoq.dk)
