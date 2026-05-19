# Plano Estratégico: Página Pessoal do Psicólogo/Consultor

## 1. Análise de Necessidades e Objetivos

### 1.1 Contexto do Mercado
- **White-label**: Sistema será usado por diferentes empresas/clínicas com suas próprias marcas
- **Marketing pessoal**: Psicólogos precisam divulgar seus serviços individuais
- **Credibilidade profissional**: Portfolio demonstra experiência e especialidades
- **Captação de clientes**: Página como ferramenta de conversão

### 1.2 Objetivos Principais
- Permitir que psicólogos criem uma presença digital profissional
- Facilitar a divulgação de serviços e especialidades
- Aumentar a conversão de visitantes em clientes
- Diferenciar o sistema da concorrência
- Gerar valor adicional para usuários consultores

### 1.3 Público-Alvo
- **Primário**: Psicólogos/consultores que usam o sistema
- **Secundário**: Potenciais clientes dos psicólogos
- **Terciário**: Empresas que licenciam o sistema white-label

## 2. Estrutura e Funcionalidades da Página Pessoal

### 2.1 Seções Essenciais

#### Header Profissional
- Foto profissional do psicólogo
- Nome completo e título/especialização
- CRP (Conselho Regional de Psicologia)
- Informações de contato (telefone, email, WhatsApp)
- Links para redes sociais profissionais

#### Sobre o Profissional
- Biografia profissional personalizada
- Formação acadêmica
- Experiência profissional
- Especialidades e áreas de atuação
- Abordagens terapêuticas utilizadas

#### Serviços Oferecidos
- Lista de serviços com descrições
- Modalidades (presencial, online, híbrido)
- Valores e formas de pagamento
- Duração das sessões
- Pacotes e promoções

#### Depoimentos e Avaliações
- Sistema de avaliações dos clientes
- Depoimentos em texto
- Classificação por estrelas
- Moderação de conteúdo

#### Agenda e Agendamento
- Calendário de disponibilidade
- Sistema de agendamento online
- Integração com sistema principal
- Confirmação automática por email/SMS

#### Blog/Artigos (Opcional)
- Artigos sobre saúde mental
- Dicas e orientações
- SEO para melhor posicionamento
- Compartilhamento em redes sociais

#### Certificações e Credenciais
- Diplomas e certificados
- Participação em eventos
- Publicações acadêmicas
- Associações profissionais

### 2.2 Funcionalidades Avançadas

#### Personalização Visual
- Temas de cores personalizáveis
- Upload de logo pessoal
- Escolha de layouts
- Customização de fontes

#### SEO e Marketing
- URLs personalizadas (ex: sistema.com/dr-joao-silva)
- Meta tags otimizadas
- Integração com Google Analytics
- Pixel do Facebook/Instagram
- Schema markup para profissionais de saúde

#### Integração com Redes Sociais
- Compartilhamento automático de conteúdo
- Feed do Instagram
- Posts do LinkedIn
- Botões de compartilhamento

#### Sistema de Lead Generation
- Formulários de contato
- Newsletter
- Ebooks/materiais gratuitos
- Chat online/WhatsApp Business

## 3. Aspectos Técnicos de Implementação

### 3.1 Arquitetura Proposta

#### Frontend
- Nova rota `/perfil/:slug` no React Router
- Componentes reutilizáveis para seções da página
- Responsividade mobile-first
- Otimização para SEO (React Helmet)

#### Backend/Dados
- Extensão do modelo de usuário consultor
- Novas tabelas: `perfil_publico`, `servicos`, `depoimentos`, `agenda_publica`
- Sistema de upload de imagens
- API para dados públicos do perfil

#### Tecnologias Adicionais
- Editor WYSIWYG para biografia (ex: TinyMCE)
- Sistema de calendário (ex: FullCalendar)
- Processamento de imagens (ex: Sharp)
- Geração de sitemap dinâmico

### 3.2 Estrutura de Dados

```typescript
interface PerfilPublico {
  id: string;
  consultorId: string;
  slug: string; // URL personalizada
  ativo: boolean;
  
  // Informações básicas
  nome: string;
  titulo: string;
  crp: string;
  foto: string;
  biografia: string;
  
  // Contato
  telefone?: string;
  email?: string;
  whatsapp?: string;
  endereco?: string;
  
  // Redes sociais
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  
  // Configurações
  tema: string;
  corPrimaria: string;
  corSecundaria: string;
  logo?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

interface Servico {
  id: string;
  perfilId: string;
  nome: string;
  descricao: string;
  preco?: number;
  duracao?: number; // em minutos
  modalidade: 'presencial' | 'online' | 'hibrido';
  ativo: boolean;
}

interface Depoimento {
  id: string;
  perfilId: string;
  nomeCliente: string;
  texto: string;
  avaliacao: number; // 1-5 estrelas
  aprovado: boolean;
  createdAt: Date;
}
```

### 3.3 Rotas da API

```
GET /api/perfil/:slug - Dados públicos do perfil
GET /api/perfil/:slug/servicos - Serviços oferecidos
GET /api/perfil/:slug/depoimentos - Depoimentos aprovados
GET /api/perfil/:slug/agenda - Horários disponíveis
POST /api/perfil/:slug/contato - Enviar mensagem
POST /api/perfil/:slug/agendamento - Solicitar agendamento

// Área administrativa (autenticada)
PUT /api/consultor/perfil - Atualizar perfil
POST /api/consultor/servicos - Criar serviço
GET /api/consultor/depoimentos - Gerenciar depoimentos
PUT /api/consultor/configuracoes - Configurações da página
```

## 4. Considerações para White-Label

### 4.1 Customização por Cliente
- Templates de página personalizáveis por empresa
- Cores e logos da empresa licenciada
- Domínios personalizados (ex: clinica.com.br/dr-joao)
- Termos de uso e políticas específicas

### 4.2 Configurações Administrativas
- Painel para administradores gerenciarem perfis
- Aprovação de conteúdo (opcional)
- Configurações de SEO globais
- Analytics consolidados

### 4.3 Monetização
- Planos diferenciados (básico vs premium)
- Cobrança por funcionalidades avançadas
- Comissão sobre agendamentos
- Publicidade direcionada

## 5. Benefícios para o Negócio

### 5.1 Para os Psicólogos
- **Presença digital profissional** sem custos de desenvolvimento
- **Captação de novos clientes** através da página
- **Credibilidade aumentada** com portfolio estruturado
- **Economia de tempo** com agendamento automatizado
- **Marketing integrado** com o sistema principal

### 5.2 Para a Empresa (PsiColab)
- **Diferencial competitivo** único no mercado
- **Aumento do valor percebido** do sistema
- **Maior retenção** de usuários consultores
- **Nova fonte de receita** com planos premium
- **Marketing viral** através das páginas dos psicólogos

### 5.3 Para Clientes White-Label
- **Valor agregado** para seus psicólogos
- **Atração de novos profissionais** para a plataforma
- **Melhoria da imagem** da empresa
- **Aumento da receita** através de mais agendamentos

## 6. Roadmap de Implementação

### 6.1 Fase 1 - MVP (4-6 semanas)
**Prioridade: Alta**

#### Funcionalidades Básicas
- Criação de perfil público simples
- Informações básicas do profissional
- Lista de serviços
- Formulário de contato
- Template básico responsivo

#### Entregáveis
- Página de configuração do perfil
- Página pública do psicólogo
- Sistema de URLs personalizadas
- Integração com dados existentes

### 6.2 Fase 2 - Funcionalidades Intermediárias (3-4 semanas)
**Prioridade: Média-Alta**

#### Novas Funcionalidades
- Sistema de depoimentos
- Personalização visual básica
- Integração com agenda
- SEO básico
- Upload de imagens

#### Melhorias
- Templates adicionais
- Otimização mobile
- Performance e carregamento

### 6.3 Fase 3 - Funcionalidades Avançadas (4-5 semanas)
**Prioridade: Média**

#### Funcionalidades Premium
- Blog/artigos
- Analytics integrado
- Integração com redes sociais
- Sistema de agendamento público
- Chat online

#### Customização Avançada
- Editor visual de página
- Múltiplos templates
- Configurações de SEO avançadas

### 6.4 Fase 4 - White-Label e Monetização (2-3 semanas)
**Prioridade: Baixa-Média**

#### Funcionalidades Empresariais
- Painel administrativo
- Configurações white-label
- Sistema de planos/cobrança
- Relatórios e analytics

## 7. Estimativas de Esforço e Recursos

### 7.1 Equipe Necessária
- **1 Desenvolvedor Frontend** (React/TypeScript)
- **1 Desenvolvedor Backend** (Node.js/API)
- **1 Designer UI/UX** (layouts e templates)
- **1 Product Owner** (definições e testes)

### 7.2 Estimativa de Tempo
- **Fase 1 (MVP)**: 4-6 semanas
- **Fase 2 (Intermediário)**: 3-4 semanas
- **Fase 3 (Avançado)**: 4-5 semanas
- **Fase 4 (White-label)**: 2-3 semanas
- **Total**: 13-18 semanas (3-4 meses)

### 7.3 Custos Estimados
- **Desenvolvimento**: R$ 80.000 - R$ 120.000
- **Design**: R$ 15.000 - R$ 25.000
- **Infraestrutura adicional**: R$ 2.000 - R$ 5.000
- **Total**: R$ 97.000 - R$ 150.000

### 7.4 ROI Projetado
- **Aumento de retenção**: 25-30%
- **Novos usuários atraídos**: 15-20%
- **Receita adicional** (planos premium): R$ 10.000-15.000/mês
- **Payback**: 8-12 meses

## 8. Riscos e Mitigações

### 8.1 Riscos Técnicos
- **Complexidade de SEO**: Implementar SSR ou pré-renderização
- **Performance**: Otimização de imagens e cache
- **Segurança**: Validação rigorosa de dados públicos

### 8.2 Riscos de Negócio
- **Baixa adoção**: Campanhas de onboarding e incentivos
- **Concorrência**: Foco em integração e facilidade de uso
- **Regulamentação**: Compliance com CFP e LGPD

### 8.3 Riscos Operacionais
- **Moderação de conteúdo**: Sistema automatizado + revisão manual
- **Suporte**: Documentação e tutoriais detalhados
- **Escalabilidade**: Arquitetura preparada para crescimento

## 9. Métricas de Sucesso

### 9.1 Métricas de Adoção
- % de consultores que criam perfil público
- Tempo médio para primeira publicação
- Taxa de perfis ativos vs inativos

### 9.2 Métricas de Engajamento
- Visualizações de página por perfil
- Taxa de conversão (visitante → contato)
- Tempo médio na página
- Taxa de rejeição

### 9.3 Métricas de Negócio
- Aumento na retenção de consultores
- Receita adicional gerada
- NPS dos usuários consultores
- Número de agendamentos via página pública

## 10. Conclusão e Recomendação

### 10.1 Viabilidade
**ALTA** - O projeto é tecnicamente viável e alinhado com as necessidades do mercado.

### 10.2 Impacto no Negócio
**ALTO** - Potencial significativo de diferenciação e geração de valor.

### 10.3 Recomendação
**IMPLEMENTAR** - Começar com MVP (Fase 1) para validar hipóteses e coletar feedback dos usuários.

### 10.4 Próximos Passos
1. **Validação com usuários**: Entrevistas com 5-10 psicólogos
2. **Prototipação**: Criar mockups das principais telas
3. **Definição técnica**: Arquitetura detalhada e stack tecnológico
4. **Planejamento**: Sprint planning para Fase 1
5. **Desenvolvimento**: Início da implementação do MVP

---

*Este documento serve como base para a tomada de decisão sobre a implementação da funcionalidade de página pessoal para psicólogos no sistema PsiColab.*