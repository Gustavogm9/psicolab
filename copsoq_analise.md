# Análise Técnica: COPSOQ na Plataforma
**Solicitação:** Mariangela (consultora) — 18/02/2026

---

## 1. Distinção importante: Avaliações ≠ Diagnósticos

A plataforma tem dois módulos completamente diferentes — e o COPSOQ pertence ao módulo **Avaliações**, não Diagnósticos.

| | Avaliações (`/avaliacoes`) | Diagnósticos (`/diagnosticos`) |
|---|---|---|
| **Para que serve** | Instrumentos psicométricos aplicados a colaboradores de empresas já clientes | Questionários de triagem enviados a potenciais clientes para captação de leads |
| **Integra com** | Gestão de participantes por convite, relatório técnico por avaliação | CRM, pipeline de vendas, ROI reports |
| **Exemplos de uso** | Clima organizacional, Burnout, Estresse, **COPSOQ** | "Diagnóstico gratuito de RH", questionário de triagem empresarial |
| **URL pública** | `/avaliacao/:slug` | `/q/:slug` |

**Conclusão:** qualquer melhoria para o COPSOQ deve ser feita no módulo de Avaliações, especificamente em `/avaliacoes/:id/relatorio` (o `RelatorioAvaliacao`).

---

## 2. O problema no relatório atual

O `RelatorioAvaliacao.tsx` usa a função `processarDadosQuestao()` — análise questão a questão, mostrando percentual de cada resposta por pergunta.

Para o COPSOQ, isso não tem utilidade nenhuma. A Mariangela vê um gráfico de barras por pergunta e não consegue extrair significado clínico disso. O COPSOQ não é interpretado questão a questão — é interpretado **por subescala**.

---

## 3. Como o COPSOQ funciona (lógica de correção completa)

### 3.1 Versão usada
**Versão Média — 76 questões, 29 subescalas.** (Manual COPSOQ II Portugal 2013)

### 3.2 Escala de respostas
Todos os 76 itens são Likert de 5 pontos (1 a 5), com pontuação direta.
**Exceção — apenas 2 itens são invertidos:** Q42 e Q45 → fórmula: `6 − resposta`

### 3.3 Por que Q42 e Q45 são invertidos?
- Q42 está em "Confiança Horizontal" junto com Q40 e Q41, que são perguntas negativas ("ocultam informações"). Q42 é positiva ("confiam uns nos outros"), então é invertida para alinhar a direção da subescala.
- Q45 está em "Confiança Vertical" junto com Q43 e Q44, que são positivas (confiança na gestão). Q45 é negativa ("A gerência oculta informação"), então é invertida para alinhar.

### 3.4 Cálculo das subescalas
**Média aritmética simples** dos itens que compõem cada subescala (após aplicar inversão onde necessário). O COPSOQ **não gera escore total** — cada subescala é analisada individualmente.

### 3.5 Classificação — Semáforo por Tercis Fixos
| Média da subescala | Cor |
|---|---|
| 1,00 – 2,33 | 🟢 Verde |
| 2,34 – 3,66 | 🟡 Amarelo |
| 3,67 – 5,00 | 🔴 Vermelho |

### 3.6 Interpretação: Risco vs. Protetivo
A cor **não significa a mesma coisa** para todas as subescalas:
- **Fatores de Risco** (alto = pior): Vermelho = Alerta. Ex: Burnout com média 4,2 → problema grave.
- **Fatores Protetivos** (alto = melhor): Vermelho = Baixo recurso. Ex: Satisfação Laboral com média 1,8 → problema grave.

---

## 4. Mapeamento Completo: Subescalas → Itens (Versão Média, 76 itens)

Extraído das páginas 36–39 do Manual COPSOQ II Portugal 2013.

### DOMÍNIO 1 — Exigências Laborais
| Subescala | Itens | Tipo | Direção semáforo |
|---|---|---|---|
| Exigências Quantitativas | Q1, Q2, Q3 | Risco | Alto = pior |
| Ritmo de Trabalho | Q4 | Risco | Alto = pior |
| Exigências Cognitivas | Q5, Q6, Q7 | Risco | Alto = pior |
| Exigências Emocionais | Q8 | Risco | Alto = pior |

### DOMÍNIO 2 — Organização do Trabalho e Conteúdo
| Subescala | Itens | Tipo | Direção semáforo |
|---|---|---|---|
| Influência no Trabalho | Q9, Q10, Q11, Q12 | Protetivo | Alto = melhor |
| Possibilidades de Desenvolvimento | Q13, Q14, Q15 | Protetivo | Alto = melhor |

### DOMÍNIO 3 — Relações Sociais e Liderança
| Subescala | Itens | Tipo | Direção semáforo |
|---|---|---|---|
| Previsibilidade | Q16, Q17 | Protetivo | Alto = melhor |
| Transparência do Papel Laboral | Q18, Q19, Q20 | Protetivo | Alto = melhor |
| Recompensas / Reconhecimento | Q21, Q22, Q23 | Protetivo | Alto = melhor |
| Conflitos de Papéis Laborais | Q24, Q25, Q26 | Risco | Alto = pior |
| Apoio Social de Colegas | Q27, Q28, Q29 | Protetivo | Alto = melhor |
| Apoio Social de Superiores | Q30, Q31, Q32 | Protetivo | Alto = melhor |
| Comunidade Social no Trabalho | Q33, Q34, Q35 | Protetivo | Alto = melhor |
| Qualidade da Liderança | Q36, Q37, Q38, Q39 | Protetivo | Alto = melhor |

### DOMÍNIO 4 — Valores no Local de Trabalho
| Subescala | Itens | Tipo | Direção semáforo |
|---|---|---|---|
| Confiança Horizontal | Q40, Q41, **Q42\*** | Risco | Alto = pior (Q42 invertida) |
| Confiança Vertical | Q43, Q44, **Q45\*** | Protetivo | Alto = melhor (Q45 invertida) |
| Justiça e Respeito | Q46, Q47, Q48 | Protetivo | Alto = melhor |
| Auto-eficácia | Q49, Q50 | Protetivo | Alto = melhor |

\* Itens invertidos: pontuação = 6 − resposta

### DOMÍNIO 5 — Interface Trabalho–Indivíduo
| Subescala | Itens | Tipo | Direção semáforo |
|---|---|---|---|
| Significado do Trabalho | Q51, Q52, Q53 | Protetivo | Alto = melhor |
| Compromisso c/ Local de Trabalho | Q54, Q55 | Protetivo | Alto = melhor |
| Satisfação Laboral | Q56, Q57, Q58, Q59 | Protetivo | Alto = melhor |
| Insegurança Laboral | Q60 | Risco | Alto = pior |

### DOMÍNIO 6 — Saúde e Bem-Estar
| Subescala | Itens | Tipo | Direção semáforo |
|---|---|---|---|
| Saúde Geral | Q61 | Risco¹ | Alto = pior |
| Conflito Trabalho–Família | Q62, Q63, Q64 | Risco | Alto = pior |
| Problemas em Dormir | Q65, Q66 | Risco | Alto = pior |
| Burnout | Q67, Q68 | Risco | Alto = pior |
| Stress | Q69, Q70 | Risco | Alto = pior |
| Sintomas Depressivos | Q71, Q72 | Risco | Alto = pior |

¹ Saúde Geral: escala do questionário é 1=Excelente, 5=Deficitária — portanto alta pontuação = saúde pior. **A confirmar com a Mariangela se ela prefere exibir invertida** (1=Deficitária → alto = melhor), pois conceptualmente é um recurso protetivo.

### DOMÍNIO 7 — Comportamentos Ofensivos
| Subescala | Itens | Tipo | Direção semáforo |
|---|---|---|---|
| Comportamentos Ofensivos | Q73, Q74, Q75, Q76 | Risco | Alto = pior |

**Total: 29 subescalas, 76 questões ✓**

---

## 5. O Que Mudar na Plataforma

### 5.1 O que NÃO precisa mudar
- O banco de dados de respostas já coleta os dados corretamente (respostas Q1–Q76).
- O fluxo de criação de avaliação, envio de link, e coleta de participantes já funciona.
- Não é preciso tocar no módulo de Diagnósticos.

### 5.2 O que precisa ser construído

**a) Campo `instrumento` na avaliação**
Identificar que uma avaliação específica é "COPSOQ Versão Média" para que o sistema saiba qual engine de correção usar. Pode ser um campo no banco (`instrumento: "copsoq_medio"`) ou um template especial.

**b) Engine de cálculo COPSOQ** (`/src/hooks/useCopsoqRelatorio.ts` — novo arquivo)
- Recebe todas as respostas brutas (Q1–Q76 por participante)
- Aplica inversão em Q42 e Q45: `score = 6 - resposta`
- Calcula média por subescala para o grupo (não individual)
- Classifica cada subescala no semáforo (Verde/Amarelo/Vermelho) considerando a direção do fator

**c) Componente de relatório COPSOQ** (`/src/components/avaliacoes/RelatorioCopsoq.tsx` — novo arquivo)
- Painel por domínio mostrando cada subescala com sua cor de semáforo
- Gráfico de barras horizontal com cores Verde/Amarelo/Vermelho
- Destaque visual para subescalas em Vermelho (prioridade de intervenção)
- Resumo executivo por domínio

**d) Lógica condicional no `RelatorioAvaliacao.tsx`**
Quando `avaliacao.instrumento === "copsoq_medio"`, renderizar `<RelatorioCopsoq>` em vez da análise genérica por questão.

---

## 6. Prioridades

| # | O Que | Urgência |
|---|---|---|
| 1 | Engine de cálculo por subescala + inversão Q42/Q45 | 🔴 Alta — sem isso o resultado é errado |
| 2 | Semáforo com direção correta por subescala | 🔴 Alta — sem isso o resultado não tem significado clínico |
| 3 | Componente visual do relatório COPSOQ | 🟡 Média — é o que a Mariangela vê |
| 4 | Campo `instrumento` na criação de avaliação | 🟡 Média — permite identificar automaticamente |
| 5 | Saúde Geral: confirmar direção de exibição | 🟢 Baixa — detalhe de UX |

---

## 7. Pergunta pendente para a Mariangela

- **Saúde Geral (Q61):** ela prefere ver "Excelente=verde" (invertida para exibição) ou aceita ver a escala como está no questionário (1=Excelente=baixo score)?
- **Ela disse que enviaria uma planilha Excel com o mapeamento.** Se vier, deve confirmar o mapeamento acima — que foi extraído diretamente do manual que ela mesma enviou.
