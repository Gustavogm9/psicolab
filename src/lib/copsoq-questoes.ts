/**
 * COPSOQ II — Versão Média (76 itens)
 * Questões padronizadas e validadas psicometricamente.
 * NÃO editar os textos das perguntas para preservar validade do instrumento.
 *
 * Referência: COPSOQ II Portugal (2013)
 * Escala de resposta: 1 (Nunca/Quase nunca) → 5 (Sempre)
 * Exceção: item 61 usa 1 (Excelente) → 5 (Deficitária)
 * Itens invertidos na correção: 42 e 45 (tratados na engine useCopsoqRelatorio)
 */

export const COPSOQ_MEDIO_QUESTOES = [
    // ── EXIGÊNCIAS LABORAIS ──
    { ordem: 1, pergunta: "A sua carga de trabalho acumula-se por ser mal distribuída?", tipo: "escala" as const, obrigatoria: true, categoria: "Exigências Quantitativas", peso: 1 },
    { ordem: 2, pergunta: "Com que frequência não tem tempo para completar todas as tarefas do seu trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Exigências Quantitativas", peso: 1 },
    { ordem: 3, pergunta: "Precisa fazer horas-extra?", tipo: "escala" as const, obrigatoria: true, categoria: "Exigências Quantitativas", peso: 1 },
    { ordem: 4, pergunta: "Precisa trabalhar muito rapidamente?", tipo: "escala" as const, obrigatoria: true, categoria: "Ritmo de Trabalho", peso: 1 },
    { ordem: 5, pergunta: "O seu trabalho exige a sua atenção constante?", tipo: "escala" as const, obrigatoria: true, categoria: "Exigências Cognitivas", peso: 1 },
    { ordem: 6, pergunta: "O seu trabalho requer que seja bom a propor novas ideias?", tipo: "escala" as const, obrigatoria: true, categoria: "Exigências Cognitivas", peso: 1 },
    { ordem: 7, pergunta: "O seu trabalho exige que tome decisões difíceis?", tipo: "escala" as const, obrigatoria: true, categoria: "Exigências Cognitivas", peso: 1 },
    { ordem: 8, pergunta: "O seu trabalho exige emocionalmente de si?", tipo: "escala" as const, obrigatoria: true, categoria: "Exigências Emocionais", peso: 1 },

    // ── ORGANIZAÇÃO DO TRABALHO E CONTEÚDO ──
    { ordem: 9, pergunta: "Tem um elevado grau de influência no seu trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Influência no Trabalho", peso: 1 },
    { ordem: 10, pergunta: "Participa na escolha das pessoas com quem trabalha?", tipo: "escala" as const, obrigatoria: true, categoria: "Influência no Trabalho", peso: 1 },
    { ordem: 11, pergunta: "Pode influenciar a quantidade de trabalho que lhe compete a si?", tipo: "escala" as const, obrigatoria: true, categoria: "Influência no Trabalho", peso: 1 },
    { ordem: 12, pergunta: "Tem alguma influência sobre o tipo de tarefas que faz?", tipo: "escala" as const, obrigatoria: true, categoria: "Influência no Trabalho", peso: 1 },
    { ordem: 13, pergunta: "O seu trabalho exige que tenha iniciativa?", tipo: "escala" as const, obrigatoria: true, categoria: "Possibilidades de Desenvolvimento", peso: 1 },
    { ordem: 14, pergunta: "O seu trabalho permite-lhe aprender coisas novas?", tipo: "escala" as const, obrigatoria: true, categoria: "Possibilidades de Desenvolvimento", peso: 1 },
    { ordem: 15, pergunta: "O seu trabalho permite-lhe usar as suas habilidades ou perícias?", tipo: "escala" as const, obrigatoria: true, categoria: "Possibilidades de Desenvolvimento", peso: 1 },

    // ── RELAÇÕES SOCIAIS E LIDERANÇA ──
    { ordem: 16, pergunta: "No seu local de trabalho, é informado com antecedência sobre decisões importantes, mudanças ou planos para o futuro?", tipo: "escala" as const, obrigatoria: true, categoria: "Previsibilidade", peso: 1 },
    { ordem: 17, pergunta: "Recebe toda a informação de que necessita para fazer bem o seu trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Previsibilidade", peso: 1 },
    { ordem: 18, pergunta: "O seu trabalho apresenta objectivos claros?", tipo: "escala" as const, obrigatoria: true, categoria: "Transparência do Papel Laboral", peso: 1 },
    { ordem: 19, pergunta: "Sabe exactamente quais as suas responsabilidades?", tipo: "escala" as const, obrigatoria: true, categoria: "Transparência do Papel Laboral", peso: 1 },
    { ordem: 20, pergunta: "Sabe exactamente o que é esperado de si?", tipo: "escala" as const, obrigatoria: true, categoria: "Transparência do Papel Laboral", peso: 1 },
    { ordem: 21, pergunta: "O seu trabalho é reconhecido e apreciado pela gerência?", tipo: "escala" as const, obrigatoria: true, categoria: "Recompensas / Reconhecimento", peso: 1 },
    { ordem: 22, pergunta: "A gerência do seu local de trabalho respeita-o?", tipo: "escala" as const, obrigatoria: true, categoria: "Recompensas / Reconhecimento", peso: 1 },
    { ordem: 23, pergunta: "É tratado de forma justa no seu local de trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Recompensas / Reconhecimento", peso: 1 },
    { ordem: 24, pergunta: "Faz coisas no seu trabalho que uns concordam mas outros não?", tipo: "escala" as const, obrigatoria: true, categoria: "Conflitos de Papéis Laborais", peso: 1 },
    { ordem: 25, pergunta: "Por vezes tem que fazer coisas que deveriam ser feitas de outra maneira?", tipo: "escala" as const, obrigatoria: true, categoria: "Conflitos de Papéis Laborais", peso: 1 },
    { ordem: 26, pergunta: "Por vezes tem que fazer coisas que considera desnecessárias?", tipo: "escala" as const, obrigatoria: true, categoria: "Conflitos de Papéis Laborais", peso: 1 },
    { ordem: 27, pergunta: "Com que frequência tem ajuda e apoio dos seus colegas de trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Apoio Social de Colegas", peso: 1 },
    { ordem: 28, pergunta: "Com que frequência os seus colegas estão dispostos a ouvi-lo(a) sobre os seus problemas de trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Apoio Social de Colegas", peso: 1 },
    { ordem: 29, pergunta: "Com que frequência os seus colegas falam consigo acerca do seu desempenho laboral?", tipo: "escala" as const, obrigatoria: true, categoria: "Apoio Social de Colegas", peso: 1 },
    { ordem: 30, pergunta: "Com que frequência o seu superior imediato fala consigo sobre como está a decorrer o seu trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Apoio Social de Superiores", peso: 1 },
    { ordem: 31, pergunta: "Com que frequência tem ajuda e apoio do seu superior imediato?", tipo: "escala" as const, obrigatoria: true, categoria: "Apoio Social de Superiores", peso: 1 },
    { ordem: 32, pergunta: "Com que frequência é que o seu superior imediato fala consigo em relação ao seu desempenho laboral?", tipo: "escala" as const, obrigatoria: true, categoria: "Apoio Social de Superiores", peso: 1 },
    { ordem: 33, pergunta: "Existe um bom ambiente de trabalho entre si e os seus colegas?", tipo: "escala" as const, obrigatoria: true, categoria: "Comunidade Social no Trabalho", peso: 1 },
    { ordem: 34, pergunta: "Existe uma boa cooperação entre os colegas de trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Comunidade Social no Trabalho", peso: 1 },
    { ordem: 35, pergunta: "No seu local de trabalho sente-se parte de uma comunidade?", tipo: "escala" as const, obrigatoria: true, categoria: "Comunidade Social no Trabalho", peso: 1 },
    { ordem: 36, pergunta: "Em relação à sua chefia direta, até que ponto considera que oferece aos indivíduos e ao grupo boas oportunidades de desenvolvimento?", tipo: "escala" as const, obrigatoria: true, categoria: "Qualidade da Liderança", peso: 1 },
    { ordem: 37, pergunta: "Em relação à sua chefia direta, até que ponto considera que dá prioridade à satisfação no trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Qualidade da Liderança", peso: 1 },
    { ordem: 38, pergunta: "Em relação à sua chefia direta, até que ponto considera que é bom no planeamento do trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Qualidade da Liderança", peso: 1 },
    { ordem: 39, pergunta: "Em relação à sua chefia direta, até que ponto considera que é bom a resolver conflitos?", tipo: "escala" as const, obrigatoria: true, categoria: "Qualidade da Liderança", peso: 1 },

    // ── VALORES NO LOCAL DE TRABALHO ──
    { ordem: 40, pergunta: "Os funcionários ocultam informações uns dos outros?", tipo: "escala" as const, obrigatoria: true, categoria: "Confiança Horizontal", peso: 1 },
    { ordem: 41, pergunta: "Os funcionários ocultam informação à gerência?", tipo: "escala" as const, obrigatoria: true, categoria: "Confiança Horizontal", peso: 1 },
    { ordem: 42, pergunta: "Os funcionários confiam uns nos outros de um modo geral?", tipo: "escala" as const, obrigatoria: true, categoria: "Confiança Horizontal", peso: 1 },
    { ordem: 43, pergunta: "A gerência confia nos seus funcionários para fazerem o seu trabalho bem?", tipo: "escala" as const, obrigatoria: true, categoria: "Confiança Vertical", peso: 1 },
    { ordem: 44, pergunta: "Confia na informação que lhe é transmitida pela gerência?", tipo: "escala" as const, obrigatoria: true, categoria: "Confiança Vertical", peso: 1 },
    { ordem: 45, pergunta: "A gerência oculta informação aos seus funcionários?", tipo: "escala" as const, obrigatoria: true, categoria: "Confiança Vertical", peso: 1 },
    { ordem: 46, pergunta: "Os conflitos são resolvidos de uma forma justa?", tipo: "escala" as const, obrigatoria: true, categoria: "Justiça e Respeito", peso: 1 },
    { ordem: 47, pergunta: "As sugestões dos funcionários são tratadas de forma séria pela gerência?", tipo: "escala" as const, obrigatoria: true, categoria: "Justiça e Respeito", peso: 1 },
    { ordem: 48, pergunta: "O trabalho é igualmente distribuído pelos funcionários?", tipo: "escala" as const, obrigatoria: true, categoria: "Justiça e Respeito", peso: 1 },
    { ordem: 49, pergunta: "Sou sempre capaz de resolver problemas, se tentar o suficiente.", tipo: "escala" as const, obrigatoria: true, categoria: "Auto-eficácia", peso: 1 },
    { ordem: 50, pergunta: "É-me fácil seguir os meus planos e atingir os meus objetivos.", tipo: "escala" as const, obrigatoria: true, categoria: "Auto-eficácia", peso: 1 },

    // ── INTERFACE TRABALHO–INDIVÍDUO ──
    { ordem: 51, pergunta: "O seu trabalho tem algum significado para si?", tipo: "escala" as const, obrigatoria: true, categoria: "Significado do Trabalho", peso: 1 },
    { ordem: 52, pergunta: "Sente que o seu trabalho é importante?", tipo: "escala" as const, obrigatoria: true, categoria: "Significado do Trabalho", peso: 1 },
    { ordem: 53, pergunta: "Sente-se motivado e envolvido com o seu trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Significado do Trabalho", peso: 1 },
    { ordem: 54, pergunta: "Gosta de falar com os outros sobre o seu local de trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Compromisso c/ Local de Trabalho", peso: 1 },
    { ordem: 55, pergunta: "Sente que os problemas do seu local de trabalho são seus também?", tipo: "escala" as const, obrigatoria: true, categoria: "Compromisso c/ Local de Trabalho", peso: 1 },
    { ordem: 56, pergunta: "Em relação ao seu trabalho em geral, quão satisfeito está com as suas perspectivas de trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Satisfação Laboral", peso: 1 },
    { ordem: 57, pergunta: "Em relação ao seu trabalho em geral, quão satisfeito está com as condições físicas do seu local de trabalho?", tipo: "escala" as const, obrigatoria: true, categoria: "Satisfação Laboral", peso: 1 },
    { ordem: 58, pergunta: "Em relação ao seu trabalho em geral, quão satisfeito está com a forma como as suas capacidades são utilizadas?", tipo: "escala" as const, obrigatoria: true, categoria: "Satisfação Laboral", peso: 1 },
    { ordem: 59, pergunta: "Em relação ao seu trabalho em geral, quão satisfeito está com o seu trabalho de uma forma global?", tipo: "escala" as const, obrigatoria: true, categoria: "Satisfação Laboral", peso: 1 },
    { ordem: 60, pergunta: "Sente-se preocupado em ficar desempregado?", tipo: "escala" as const, obrigatoria: true, categoria: "Insegurança Laboral", peso: 1 },

    // ── SAÚDE E BEM-ESTAR ──
    { ordem: 61, pergunta: "Em geral, sente que a sua saúde é:", tipo: "escala" as const, obrigatoria: true, categoria: "Saúde Geral", peso: 1 },
    { ordem: 62, pergunta: "Sente que o seu trabalho lhe exige muita energia que acaba por afetar a sua vida privada negativamente?", tipo: "escala" as const, obrigatoria: true, categoria: "Conflito Trabalho–Família", peso: 1 },
    { ordem: 63, pergunta: "Sente que o seu trabalho lhe exige muito tempo que acaba por afetar a sua vida privada negativamente?", tipo: "escala" as const, obrigatoria: true, categoria: "Conflito Trabalho–Família", peso: 1 },
    { ordem: 64, pergunta: "A sua família e os seus amigos dizem-lhe que trabalha demais?", tipo: "escala" as const, obrigatoria: true, categoria: "Conflito Trabalho–Família", peso: 1 },
    { ordem: 65, pergunta: "Com que frequência durante as últimas 4 semanas sentiu dificuldade a adormecer?", tipo: "escala" as const, obrigatoria: true, categoria: "Problemas em Dormir", peso: 1 },
    { ordem: 66, pergunta: "Com que frequência durante as últimas 4 semanas acordou várias vezes durante a noite e depois não conseguia adormecer novamente?", tipo: "escala" as const, obrigatoria: true, categoria: "Problemas em Dormir", peso: 1 },
    { ordem: 67, pergunta: "Com que frequência durante as últimas 4 semanas sentiu-se fisicamente exausto?", tipo: "escala" as const, obrigatoria: true, categoria: "Burnout", peso: 1 },
    { ordem: 68, pergunta: "Com que frequência durante as últimas 4 semanas sentiu-se emocionalmente exausto?", tipo: "escala" as const, obrigatoria: true, categoria: "Burnout", peso: 1 },
    { ordem: 69, pergunta: "Com que frequência durante as últimas 4 semanas sentiu-se irritado?", tipo: "escala" as const, obrigatoria: true, categoria: "Stress", peso: 1 },
    { ordem: 70, pergunta: "Com que frequência durante as últimas 4 semanas sentiu-se ansioso?", tipo: "escala" as const, obrigatoria: true, categoria: "Stress", peso: 1 },
    { ordem: 71, pergunta: "Com que frequência durante as últimas 4 semanas sentiu-se triste?", tipo: "escala" as const, obrigatoria: true, categoria: "Sintomas Depressivos", peso: 1 },
    { ordem: 72, pergunta: "Com que frequência durante as últimas 4 semanas sentiu falta de interesse por coisas quotidianas?", tipo: "escala" as const, obrigatoria: true, categoria: "Sintomas Depressivos", peso: 1 },

    // ── COMPORTAMENTOS OFENSIVOS ──
    { ordem: 73, pergunta: "Nos últimos 12 meses, no seu local de trabalho: Tem sido alvo de insultos ou provocações verbais?", tipo: "escala" as const, obrigatoria: true, categoria: "Comportamentos Ofensivos", peso: 1 },
    { ordem: 74, pergunta: "Nos últimos 12 meses, no seu local de trabalho: Tem sido exposto a assédio sexual indesejado?", tipo: "escala" as const, obrigatoria: true, categoria: "Comportamentos Ofensivos", peso: 1 },
    { ordem: 75, pergunta: "Nos últimos 12 meses, no seu local de trabalho: Tem sido exposto a ameaças de violência?", tipo: "escala" as const, obrigatoria: true, categoria: "Comportamentos Ofensivos", peso: 1 },
    { ordem: 76, pergunta: "Nos últimos 12 meses, no seu local de trabalho: Tem sido exposto a violência física?", tipo: "escala" as const, obrigatoria: true, categoria: "Comportamentos Ofensivos", peso: 1 },
] as const;
