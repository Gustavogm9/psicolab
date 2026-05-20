import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { validateImageFile, compressImage, MAX_FILE_SIZE_PROFILE, MAX_FILE_SIZE_PORTFOLIO } from "@/lib/file-validation";
import { validateCtaLink, normalizeCtaLink } from "@/lib/cta-validation";
import { getUserFriendlyError } from "@/lib/error-messages";
import {
  User,
  Globe,
  Palette,
  Eye,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Camera,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Linkedin,
  Briefcase,
  Star,
  GripVertical,
  Upload,
  Loader2,
  HelpCircle,
  Sparkles,
  Award,
  MessageSquare,
  FileQuestion,
  Zap,
  Image,
  AlertCircle,
  Rocket,
  ClipboardList,
  CheckCircle2,
  Package,
  Info,
  Send
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useMyPerfilPublico,
  usePerfilPublicoMutations,
  generateUniqueSlug,
  PerfilPublico
} from "@/hooks/usePerfilPublico";
import {
  useServicosPublicos,
  useServicosPublicosMutations,
  ServicoPublico
} from "@/hooks/useServicosPublicos";
import {
  useDepoimentosPublicos,
  useDepoimentosPublicosMutations,
  DepoimentoPublico
} from "@/hooks/useDepoimentosPublicos";
import { usePortfolioImagens } from "@/hooks/usePortfolioImagens";
import { useQuestionariosPerfilPublico } from "@/hooks/useQuestionariosPerfilPublico";
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsDashboard } from "@/components/perfil-publico/AnalyticsDashboard";
import { ThemePreview } from "@/components/perfil-publico/ThemePreview";
import { SlugValidator } from "@/components/perfil-publico/SlugValidator";
import { BarChart3 } from "lucide-react";
import { SortableSecaoItem } from "@/components/perfil-publico/SortableSecaoItem";
import { PortfolioManager } from "@/components/perfil-publico/PortfolioManager";
import { DomainSettings } from "@/components/perfil-publico/DomainSettings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProgressoConfiguracao } from "@/components/perfil-publico/ProgressoConfiguracao";
import { NavegacaoFases, FASES } from "@/components/perfil-publico/NavegacaoFases";
import { ServicosImportDialog } from "@/components/perfil-publico/ServicosImportDialog";
import { IntervencoesImportDialog } from "@/components/perfil-publico/IntervencoesImportDialog";
import { SolicitarDepoimentoDialog } from "@/components/perfil-publico/SolicitarDepoimentoDialog";
import { DepoimentosPendentesManager } from "@/components/perfil-publico/DepoimentosPendentesManager";
import { FirstAccessWizard } from "@/components/perfil-publico/FirstAccessWizard";
import { SmartSuggestionCards } from "@/components/perfil-publico/SmartSuggestionCards";
import { ConfiguracaoCompleta } from "@/components/perfil-publico/ConfiguracaoCompleta";
import { EstatisticasManager } from "@/components/perfil-publico/EstatisticasManager";
import { ProcessoTrabalhoManager } from "@/components/perfil-publico/ProcessoTrabalhoManager";
import { EspecialidadesManager } from "@/components/perfil-publico/EspecialidadesManager";
import { NavbarFooterConfig } from "@/components/perfil-publico/NavbarFooterConfig";
import { FaviconUploader } from "@/components/perfil-publico/FaviconUploader";
import { TrackingConfigForm } from "@/components/perfil-publico/TrackingConfigForm";
import { EmailSmtpConfig } from "@/components/perfil-publico/EmailSmtpConfig";

export function ConfigurarPerfilPublico() {
  const { user, effectiveUserId } = useAuth();
  const { data: perfilPublico, isLoading: isLoadingPerfil, isFetched } = useMyPerfilPublico();
  const perfilCriacaoTentadaRef = useRef(false);
  const { create: createPerfil, update: updatePerfil, isCreating, isUpdating } = usePerfilPublicoMutations();

  const { data: servicos = [], isLoading: isLoadingServicos } = useServicosPublicos(perfilPublico?.id);
  const { create: createServico, update: updateServico, delete: deleteServico } = useServicosPublicosMutations();

  const { data: depoimentos = [], isLoading: isLoadingDepoimentos } = useDepoimentosPublicos(perfilPublico?.id);
  const { create: createDepoimento, delete: deleteDepoimento } = useDepoimentosPublicosMutations();

  const { data: portfolioImagens = [] } = usePortfolioImagens(perfilPublico?.id);

  const { data: questionarios = [] } = useQuestionariosPerfilPublico(perfilPublico?.id);

  const [isLoading, setIsLoading] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  const [perfil, setPerfil] = useState<Partial<PerfilPublico>>({
    slug: '',
    ativo: false,
    titulo_profissional: '',
    biografia: '',
    foto_perfil: null,
    foto_capa: null,
    favicon_url: null,
    whatsapp: null,
    site: null,
    instagram: null,
    linkedin: null,
    tema_cor_primaria: '#6366f1',
    tema_cor_secundaria: '#8b5cf6',
    tema_fonte: 'Inter',
    seo_titulo: null,
    seo_descricao: null,
    seo_palavras_chave: null,
    titulo_hero: 'Transforme sua organização',
    subtitulo_hero: 'Diagnósticos precisos e intervenções eficazes em clima e cultura organizacional',
    imagem_hero_url: null,
    cta_hero_texto: 'Fazer Diagnóstico Gratuito',
    cta_hero_link: '#contato',
    cta_flutuante_ativo: true,
    cta_flutuante_texto: 'Agende uma Conversa',
    cta_flutuante_link: '#contato',
    cta_intermediario_titulo: 'Pronto para Transformar sua Organização?',
    cta_intermediario_subtitulo: 'Vamos conversar sobre como posso ajudar sua empresa',
    cta_intermediario_botao_texto: 'Falar com Especialista',
    cta_intermediario_botao_link: '#contato',
    cta_rodape_texto: 'Transforme sua organização hoje',
    cta_rodape_botao_texto: 'Entre em Contato',
    cta_rodape_botao_link: '#contato',
    beneficios: [],
    faqs: [],
    navbar_menu_items: [],
    navbar_cta_texto: 'Agendar Consulta',
    navbar_cta_link: '#contato',
    estatisticas: [],
    processo_trabalho: [],
    especialidades: [],
    mostrar_secao_conteudos: false,
    footer_texto_sobre: '',
    gtm_id: null,
    facebook_pixel_id: null,
    google_analytics_id: null,
    secoes_config: [
      { id: "hero", nome: "Hero Section", visivel: true, ordem: 0 },
      { id: "numeros", nome: "Números & Conquistas", visivel: true, ordem: 1 },
      { id: "sobre", nome: "Sobre", visivel: true, ordem: 2 },
      { id: "beneficios", nome: "Benefícios", visivel: true, ordem: 3 },
      { id: "como_funciona", nome: "Como Funciona", visivel: true, ordem: 4 },
      { id: "servicos", nome: "Serviços", visivel: true, ordem: 5 },
      { id: "especialidades", nome: "Especialidades", visivel: true, ordem: 6 },
      { id: "depoimentos", nome: "Depoimentos", visivel: true, ordem: 7 },
      { id: "portfolio", nome: "Portfólio", visivel: true, ordem: 8 },
      { id: "faq", nome: "FAQ", visivel: true, ordem: 9 },
      { id: "diagnosticos", nome: "Diagnósticos", visivel: true, ordem: 10 },
      { id: "cta_intermediario", nome: "CTA Intermediário", visivel: true, ordem: 11 },
      { id: "contato", nome: "Formulário de Contato", visivel: true, ordem: 12 }
    ],
  });

  const [novoServico, setNovoServico] = useState({
    titulo: "",
    descricao: "",
    preco: "",
    duracao: "",
    modalidade: "presencial" as const,
    icone: "Briefcase"
  });

  const [novoDepoimento, setNovoDepoimento] = useState({
    nome: "",
    cargo: "",
    empresa: "",
    texto: "",
    rating: 5
  });

  const [isSlugValid, setIsSlugValid] = useState(true);
  const [secaoAtual, setSecaoAtual] = useState("inicio");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importIntervencoesDialogOpen, setImportIntervencoesDialogOpen] = useState(false);
  const [solicitarDepoimentoDialogOpen, setSolicitarDepoimentoDialogOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Configurar sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calcular progresso por fase
  const calcularProgressoPorFase = () => {
    const progressos: Record<string, number> = {};

    // Fase 1: Configuração Inicial (4 itens)
    const fase1 = [
      !!perfil.slug,
      !!perfil.titulo_profissional,
      !!perfil.foto_perfil,
      !!perfil.tema_cor_primaria
    ];
    progressos["fase-1"] = Math.round((fase1.filter(Boolean).length / fase1.length) * 100);

    // Fase 2: Construir Conteúdo (8 itens)
    const fase2 = [
      !!perfil.titulo_hero,
      !!perfil.biografia && perfil.biografia.length > 50,
      !!(perfil.estatisticas && (perfil.estatisticas as any[]).length > 0),
      !!(perfil.processo_trabalho && (perfil.processo_trabalho as any[]).length > 0),
      !!(perfil.especialidades && (perfil.especialidades as any[]).length > 0),
      servicos.length > 0,
      depoimentos.length > 0,
      portfolioImagens.length > 0,
    ];
    progressos["fase-2"] = Math.round((fase2.filter(Boolean).length / fase2.length) * 100);

    // Fase 3: Otimizar Conversão (4 itens)
    const fase3 = [
      !!perfil.cta_hero_link,
      !!perfil.whatsapp || !!perfil.instagram || !!perfil.linkedin,
      !!(perfil.faqs && (perfil.faqs as any[]).length > 0),
      !!perfil.cta_flutuante_ativo
    ];
    progressos["fase-3"] = Math.round((fase3.filter(Boolean).length / fase3.length) * 100);

    // Fase 4: Avançado (5 itens)
    const fase4 = [
      !!(perfil.navbar_menu_items && (perfil.navbar_menu_items as any[]).length > 0),
      !!perfil.seo_titulo,
      !!perfil.seo_descricao,
      !!perfil.secoes_config,
      perfil.ativo === true
    ];
    progressos["fase-4"] = Math.round((fase4.filter(Boolean).length / fase4.length) * 100);

    return progressos;
  };

  // Detectar primeiro acesso e mostrar wizard
  useEffect(() => {
    if (perfilPublico && !isLoadingPerfil) {
      const isFirstAccess = !perfilPublico.titulo_profissional || !perfilPublico.biografia || !perfilPublico.titulo_hero;
      const hasSeenWizard = localStorage.getItem(`wizard_completed_${perfilPublico.id}`);

      if (isFirstAccess && !hasSeenWizard) {
        setShowWizard(true);
      }
    }
  }, [perfilPublico, isLoadingPerfil]);

  // Resetar flag quando effectiveUserId muda (para suportar impersonação)
  useEffect(() => {
    perfilCriacaoTentadaRef.current = false;
  }, [effectiveUserId]);

  // Carregar dados do perfil quando disponível OU criar perfil rascunho automaticamente
  useEffect(() => {
    const criarPerfilRascunho = async () => {
      // Só tenta criar UMA VEZ por sessão e apenas se a query já foi buscada
      if (perfilCriacaoTentadaRef.current) return;

      // Se não há perfil, não está carregando, query foi buscada, e o usuário efetivo existe
      if (!perfilPublico && !isLoadingPerfil && isFetched && effectiveUserId) {
        perfilCriacaoTentadaRef.current = true; // Marca que já tentou criar
        try {
          // Buscar nome do usuário efetivo para gerar slug
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', effectiveUserId)
            .maybeSingle();

          const nomeParaSlug = userProfile?.name || 'usuario';
          const slugGerado = await generateUniqueSlug(nomeParaSlug);

          // Buscar cores do Manual de Marca
          const { data: whiteLabelConfig } = await supabase
            .from('configuracoes_whitelabel')
            .select('cor_primaria, cor_secundaria')
            .eq('user_id', effectiveUserId)
            .maybeSingle();

          const corPrimaria = whiteLabelConfig?.cor_primaria || '#6366f1';
          const corSecundaria = whiteLabelConfig?.cor_secundaria || '#8b5cf6';

          // Criar perfil rascunho automaticamente
          const perfilRascunho = await createPerfil({
            slug: slugGerado,
            ativo: false, // Inativo até o usuário configurar
            titulo_profissional: null,
            biografia: null,
            foto_perfil: null,
            foto_capa: null,
            whatsapp: null,
            site: null,
            instagram: null,
            linkedin: null,
            tema_cor_primaria: corPrimaria,
            tema_cor_secundaria: corSecundaria,
            tema_fonte: 'Inter',
            seo_titulo: null,
            seo_descricao: null,
            seo_palavras_chave: null,
          });

          toast.success('Perfil criado! Agora você pode personalizar sua página.');
        } catch (error: any) {
          console.error('Erro ao criar perfil rascunho:', error);
          // Não mostrar toast de erro para não assustar o usuário
          // Apenas log para debug
        }
      }
    };

    if (perfilPublico) {
      // Mesclar seções faltantes para perfis existentes
      const secoesCompletas = [
        { id: "hero", nome: "Hero Section", visivel: true, ordem: 0 },
        { id: "numeros", nome: "Números & Conquistas", visivel: true, ordem: 1 },
        { id: "sobre", nome: "Sobre", visivel: true, ordem: 2 },
        { id: "beneficios", nome: "Benefícios", visivel: true, ordem: 3 },
        { id: "como_funciona", nome: "Como Funciona", visivel: true, ordem: 4 },
        { id: "servicos", nome: "Serviços", visivel: true, ordem: 5 },
        { id: "especialidades", nome: "Especialidades", visivel: true, ordem: 6 },
        { id: "depoimentos", nome: "Depoimentos", visivel: true, ordem: 7 },
        { id: "portfolio", nome: "Portfólio", visivel: true, ordem: 8 },
        { id: "faq", nome: "FAQ", visivel: true, ordem: 9 },
        { id: "diagnosticos", nome: "Diagnósticos", visivel: true, ordem: 10 },
        { id: "cta_intermediario", nome: "CTA Intermediário", visivel: true, ordem: 11 },
        { id: "contato", nome: "Formulário de Contato", visivel: true, ordem: 12 }
      ];

      const secoesExistentes = (perfilPublico.secoes_config as any[]) || [];
      const idsExistentes = secoesExistentes.map(s => s.id);

      // Adicionar seções que estão faltando no final, mantendo ordem existente
      const secoesFaltantes = secoesCompletas
        .filter(s => !idsExistentes.includes(s.id))
        .map((s, idx) => ({ ...s, ordem: secoesExistentes.length + idx }));

      const secoesAtualizadas = [...secoesExistentes, ...secoesFaltantes];

      setPerfil({
        ...perfilPublico,
        secoes_config: secoesAtualizadas
      });

      // Auto-salvar seções mescladas se houver seções faltantes
      if (secoesFaltantes.length > 0 && perfilPublico.id) {
        updatePerfil({ id: perfilPublico.id, secoes_config: secoesAtualizadas })
          .then(() => {
            console.log('Seções sincronizadas automaticamente:', secoesFaltantes.map(s => s.nome));
          })
          .catch((error) => {
            console.error('Erro ao sincronizar seções:', error);
          });
      }
    } else {
      // Tentar criar perfil rascunho automaticamente
      criarPerfilRascunho();
    }
  }, [perfilPublico, isLoadingPerfil, isFetched, effectiveUserId, createPerfil]);

  const handlePerfilChange = (field: keyof PerfilPublico, value: any) => {
    setPerfil(prev => ({ ...prev, [field]: value }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const secoes = perfil.secoes_config || [];
      const oldIndex = secoes.findIndex((s) => s.id === active.id);
      const newIndex = secoes.findIndex((s) => s.id === over.id);

      const novasSecoes = arrayMove(secoes, oldIndex, newIndex).map((s, index) => ({
        ...s,
        ordem: index,
      }));

      setPerfil({ ...perfil, secoes_config: novasSecoes });

      // Auto-save após reordenação
      if (perfilPublico?.id) {
        try {
          await updatePerfil({ id: perfilPublico.id, secoes_config: novasSecoes });
          toast.success('Ordem das seções salva automaticamente');
        } catch (error) {
          console.error('Erro ao salvar ordem:', error);
          toast.error('Erro ao salvar a ordem das seções');
        }
      }
    }
  };

  const handleToggleVisibilidade = async (secaoId: string) => {
    const secoes = perfil.secoes_config || [];
    const novasSecoes = secoes.map((s) =>
      s.id === secaoId ? { ...s, visivel: !s.visivel } : s
    );
    setPerfil({ ...perfil, secoes_config: novasSecoes });

    // Auto-save após toggle de visibilidade (consistente com drag and drop)
    if (perfilPublico?.id) {
      try {
        await updatePerfil({ id: perfilPublico.id, secoes_config: novasSecoes });
        const secaoAtualizada = novasSecoes.find(s => s.id === secaoId);
        toast.success(
          secaoAtualizada?.visivel
            ? `"${secaoAtualizada.nome}" agora está visível`
            : `"${secaoAtualizada?.nome}" foi ocultada`
        );
      } catch (error) {
        console.error('Erro ao salvar visibilidade:', error);
        toast.error('Erro ao salvar alteração de visibilidade');
      }
    }
  };

  const handleUploadImage = async (file: File, tipo: 'perfil' | 'capa') => {
    if (!perfilPublico?.id) {
      // Não mostrar toast aqui, os botões já estão desabilitados com tooltip
      return;
    }

    if (!effectiveUserId) {
      toast.error('Você precisa estar autenticado para fazer upload de imagens');
      return;
    }

    // Validar arquivo (3MB para perfil, 5MB para capa)
    const maxSize = tipo === 'capa' ? MAX_FILE_SIZE_PORTFOLIO : MAX_FILE_SIZE_PROFILE;
    if (!validateImageFile(file, maxSize)) {
      return;
    }

    const loadingToast = toast.loading(`Otimizando e enviando imagem de ${tipo}...`);

    try {
      // Comprimir imagem antes do upload
      const maxDimensions = tipo === 'perfil'
        ? { width: 500, height: 500 }
        : { width: 1920, height: 1080 };

      const compressedFile = await compressImage(file, maxDimensions.width, maxDimensions.height);

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${perfilPublico.id}-${tipo}-${Date.now()}.${fileExt}`;
      const filePath = `${effectiveUserId}/${fileName}`;

      console.log('[Upload] Tentando upload:', { bucket: 'perfil-imagens', filePath, userId: effectiveUserId });

      const { error: uploadError } = await supabase.storage
        .from('perfil-imagens')
        .upload(filePath, compressedFile);

      if (uploadError) {
        console.error('[Upload] Erro de upload:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('perfil-imagens')
        .getPublicUrl(filePath);

      console.log('[Upload] Upload bem-sucedido, publicUrl:', publicUrl);

      const field = tipo === 'perfil' ? 'foto_perfil' : 'foto_capa';
      await updatePerfil({ id: perfilPublico.id, [field]: publicUrl });

      setPerfil(prev => ({ ...prev, [field]: publicUrl }));

      toast.dismiss(loadingToast);
      toast.success(`Imagem de ${tipo} atualizada com sucesso!`);
    } catch (error: any) {
      console.error('[Upload] Erro completo:', error);
      toast.dismiss(loadingToast);
      const errorMessage = getUserFriendlyError(error, {
        action: 'enviar',
        entity: tipo === 'perfil' ? 'foto de perfil' : 'foto de capa' as any
      });
      toast.error(errorMessage);
    }
  };

  const handleAlterarFoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleUploadImage(file, 'perfil');
      }
    };
    input.click();
  };

  const handleAdicionarImagemFundo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleUploadImage(file, 'capa');
      }
    };
    input.click();
  };

  const handleUploadImagemHero = async (file: File) => {
    if (!perfilPublico?.id) {
      // Não mostrar toast aqui, os botões já estão desabilitados com tooltip
      return;
    }

    if (!effectiveUserId) {
      toast.error('Você precisa estar autenticado para fazer upload de imagens');
      return;
    }

    // Validar arquivo (5MB máximo para hero)
    if (!validateImageFile(file, MAX_FILE_SIZE_PORTFOLIO)) {
      return;
    }

    const loadingToast = toast.loading('Fazendo upload da imagem hero...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${perfilPublico.id}-hero-${Date.now()}.${fileExt}`;
      const filePath = `${effectiveUserId}/${fileName}`;

      console.log('[Upload Hero] Tentando upload:', { bucket: 'perfil-imagens', filePath, userId: effectiveUserId });

      const { error: uploadError } = await supabase.storage
        .from('perfil-imagens')
        .upload(filePath, file);

      if (uploadError) {
        console.error('[Upload Hero] Erro de upload:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('perfil-imagens')
        .getPublicUrl(filePath);

      console.log('[Upload Hero] Upload bem-sucedido, publicUrl:', publicUrl);

      await updatePerfil({ id: perfilPublico.id, imagem_hero_url: publicUrl });

      setPerfil(prev => ({ ...prev, imagem_hero_url: publicUrl }));

      toast.dismiss(loadingToast);
      toast.success('Imagem hero atualizada com sucesso!');
    } catch (error: any) {
      console.error('[Upload Hero] Erro completo:', error);
      toast.dismiss(loadingToast);
      const errorMessage = getUserFriendlyError(error, {
        action: 'enviar',
        entity: 'imagem hero' as any
      });
      toast.error(errorMessage);
    }
  };

  const handleAdicionarImagemHero = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleUploadImagemHero(file);
      }
    };
    input.click();
  };

  const adicionarServico = async () => {
    if (!perfilPublico?.id) {
      toast.error('Salve o perfil primeiro antes de adicionar serviços');
      return;
    }

    if (!novoServico.titulo || !novoServico.descricao) {
      toast.error('Preencha o título e descrição do serviço');
      return;
    }

    try {
      const maxOrdem = servicos.length > 0
        ? Math.max(...servicos.map(s => s.ordem))
        : 0;

      await createServico({
        perfil_publico_id: perfilPublico.id,
        titulo: novoServico.titulo,
        descricao: novoServico.descricao,
        preco: novoServico.preco ? parseFloat(novoServico.preco) : null,
        duracao: novoServico.duracao ? parseInt(novoServico.duracao) : null,
        modalidade: novoServico.modalidade || null,
        icone: novoServico.icone,
        ordem: maxOrdem + 1,
      });

      setNovoServico({
        titulo: "",
        descricao: "",
        preco: "",
        duracao: "",
        modalidade: "presencial",
        icone: "Briefcase"
      });
    } catch (error: any) {
      toast.error(`Erro ao adicionar serviço: ${error.message}`);
    }
  };

  const removerServico = async (id: string) => {
    if (!perfilPublico?.id) return;

    try {
      await deleteServico({ id, perfil_publico_id: perfilPublico.id });
    } catch (error: any) {
      toast.error(`Erro ao remover serviço: ${error.message}`);
    }
  };

  const adicionarDepoimento = async () => {
    if (!perfilPublico?.id) {
      toast.error('Salve o perfil primeiro antes de adicionar depoimentos');
      return;
    }

    if (!novoDepoimento.nome || !novoDepoimento.texto) {
      toast.error('Preencha o nome e texto do depoimento');
      return;
    }

    try {
      await createDepoimento({
        perfil_publico_id: perfilPublico.id,
        nome: novoDepoimento.nome,
        cargo: novoDepoimento.cargo || null,
        empresa: novoDepoimento.empresa || null,
        texto: novoDepoimento.texto,
        foto: null,
        rating: novoDepoimento.rating,
        data: new Date().toISOString().split('T')[0],
      });

      setNovoDepoimento({
        nome: "",
        cargo: "",
        empresa: "",
        texto: "",
        rating: 5
      });
    } catch (error: any) {
      toast.error(`Erro ao adicionar depoimento: ${error.message}`);
    }
  };

  const removerDepoimento = async (id: string) => {
    if (!perfilPublico?.id) return;

    try {
      await deleteDepoimento({ id, perfil_publico_id: perfilPublico.id });
    } catch (error: any) {
      toast.error(`Erro ao remover depoimento: ${error.message}`);
    }
  };

  const perfilSchema = z.object({
    slug: z.string().trim().min(3, "URL deve ter pelo menos 3 caracteres").max(50, "URL muito longa"),
    titulo_profissional: z.string().trim().max(200, "Título muito longo").optional().nullable(),
    biografia: z.string().trim().max(2000, "Biografia muito longa").optional().nullable(),
    whatsapp: z.string().trim().max(50, "WhatsApp muito longo").optional().nullable(),
    site: z.string().trim().max(200, "Site muito longo").optional().nullable(),
    instagram: z.string().trim().max(100, "Instagram muito longo").optional().nullable(),
    linkedin: z.string().trim().max(200, "LinkedIn muito longo").optional().nullable(),
    cta_hero_link: z.string().trim().min(1, "Link do CTA Hero é obrigatório").optional().nullable(),
    cta_flutuante_link: z.string().trim().optional().nullable(),
    cta_intermediario_botao_link: z.string().trim().optional().nullable(),
    cta_rodape_botao_link: z.string().trim().optional().nullable(),
  });

  // Validação adicional para ativação do perfil
  const validarCamposObrigatoriosParaAtivar = () => {
    const erros: string[] = [];

    if (!perfil.slug || perfil.slug.length < 3) {
      erros.push('URL Personalizada');
    }

    if (!perfil.titulo_profissional || perfil.titulo_profissional.trim().length === 0) {
      erros.push('Título Profissional');
    }

    if (erros.length > 0) {
      setErrosValidacao(erros);
      // Scroll para o topo onde o Alert será exibido
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    setErrosValidacao([]);
    return true;
  };

  const salvarConfiguracoes = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para configurar o perfil público');
      return;
    }

    // Validações com zod
    try {
      perfilSchema.parse(perfil);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    // Se tentando ativar o perfil, validar campos obrigatórios
    if (perfil.ativo === true) {
      if (!validarCamposObrigatoriosParaAtivar()) {
        return;
      }
    }

    // Validar e normalizar links de CTA
    const ctaLinks = [
      { field: 'cta_hero_link', label: 'Link do CTA Hero' },
      { field: 'cta_flutuante_link', label: 'Link do CTA Flutuante' },
      { field: 'cta_intermediario_botao_link', label: 'Link do CTA Intermediário' },
      { field: 'cta_rodape_botao_link', label: 'Link do CTA Rodapé' },
    ];

    const perfilNormalizado: any = { ...perfil };

    for (const { field, label } of ctaLinks) {
      const link = perfil[field as keyof typeof perfil] as string | null | undefined;
      if (link) {
        const validation = validateCtaLink(link);
        if (!validation.valid) {
          toast.error(`${label}: ${validation.error}`);
          return;
        }
        if (validation.warning) {
          toast.warning(`${label}: ${validation.warning}`);
        }
        perfilNormalizado[field] = normalizeCtaLink(link);
      }
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Salvando configurações...');

    try {
      if (perfilPublico) {
        // Atualizar perfil existente com links normalizados
        await updatePerfil({
          id: perfilPublico.id,
          ...perfilNormalizado
        });
      } else {
        // Criar novo perfil
        // Gerar slug único se necessário
        let slugFinal = perfil.slug;
        if (!slugFinal) {
          slugFinal = await generateUniqueSlug(user.email || 'usuario');
        }

        await createPerfil({
          slug: slugFinal!,
          ativo: perfil.ativo ?? false,
          titulo_profissional: perfil.titulo_profissional || null,
          biografia: perfil.biografia || null,
          foto_perfil: perfil.foto_perfil || null,
          foto_capa: perfil.foto_capa || null,
          whatsapp: perfil.whatsapp || null,
          site: perfil.site || null,
          instagram: perfil.instagram || null,
          linkedin: perfil.linkedin || null,
          tema_cor_primaria: perfil.tema_cor_primaria || '#6366f1',
          tema_cor_secundaria: perfil.tema_cor_secundaria || '#8b5cf6',
          tema_fonte: perfil.tema_fonte || 'Inter',
          seo_titulo: perfil.seo_titulo || null,
          seo_descricao: perfil.seo_descricao || null,
          seo_palavras_chave: perfil.seo_palavras_chave || null,
        });
      }

      toast.dismiss(loadingToast);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Erro ao salvar configurações: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWizardComplete = async (data: any) => {
    if (!perfilPublico) return;

    try {
      await updatePerfil({
        id: perfilPublico.id,
        ...data
      });
      localStorage.setItem(`wizard_completed_${perfilPublico.id}`, "true");
      setShowWizard(false);
      setPerfil(prev => ({ ...prev, ...data }));
      toast.success("Perfil configurado com sucesso!");
    } catch (error) {
      console.error("Erro ao completar wizard:", error);
      const errorMessage = getUserFriendlyError(error, {
        action: 'atualizar',
        entity: 'configurações do perfil' as any
      });
      toast.error(errorMessage);
    }
  };

  const handleWizardSkip = () => {
    if (perfilPublico) {
      localStorage.setItem(`wizard_completed_${perfilPublico.id}`, "true");
    }
    setShowWizard(false);
  };

  // Importar cores e logo do Manual de Marca
  const importarDoManualDeMarca = async () => {
    if (!effectiveUserId || !perfilPublico?.id) return;

    try {
      const { data: whiteLabelConfig } = await supabase
        .from('configuracoes_whitelabel')
        .select('cor_primaria, cor_secundaria, logo_url')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (!whiteLabelConfig?.cor_primaria && !whiteLabelConfig?.cor_secundaria && !whiteLabelConfig?.logo_url) {
        toast.error("Configure as cores e logo no Manual de Marca primeiro");
        return;
      }

      // Preparar dados para atualização
      const updateData: any = {
        id: perfilPublico.id,
      };

      if (whiteLabelConfig.cor_primaria) {
        updateData.tema_cor_primaria = whiteLabelConfig.cor_primaria;
      }
      if (whiteLabelConfig.cor_secundaria) {
        updateData.tema_cor_secundaria = whiteLabelConfig.cor_secundaria;
      }
      if (whiteLabelConfig.logo_url) {
        updateData.foto_perfil = whiteLabelConfig.logo_url;
      }

      // Salvar no banco de dados
      await updatePerfil(updateData);

      // Atualizar estado local
      setPerfil(prev => ({
        ...prev,
        tema_cor_primaria: whiteLabelConfig.cor_primaria || prev.tema_cor_primaria,
        tema_cor_secundaria: whiteLabelConfig.cor_secundaria || prev.tema_cor_secundaria,
        foto_perfil: whiteLabelConfig.logo_url || prev.foto_perfil,
      }));

      toast.success("Identidade visual importada do Manual de Marca!");
    } catch (error) {
      console.error('Erro ao importar do Manual de Marca:', error);
      toast.error("Erro ao importar do Manual de Marca");
    }
  };

  if (isLoadingPerfil || isLoadingServicos || isLoadingDepoimentos) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const progressoPorFase = calcularProgressoPorFase();

  return (
    <TooltipProvider>
      <MainLayout>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                Configurar Página Pública
              </h1>
              <p className="text-muted-foreground mt-1">
                Personalize sua página pública para atrair novos clientes
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!perfil.slug) {
                    toast.error('Preencha a URL personalizada primeiro');
                    return;
                  }
                  window.open(`/perfil/${perfil.slug}`, '_blank');
                }}
                className="gap-2"
                disabled={!perfil.slug}
              >
                <Eye className="h-4 w-4" />
                {perfil.ativo ? 'Ver Página Pública' : 'Visualizar Preview'}
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                onClick={salvarConfiguracoes}
                className={!perfilPublico ? "bg-gradient-to-r from-primary to-accent animate-pulse" : "bg-gradient-to-r from-primary to-accent"}
                disabled={isLoading || isCreating || isUpdating || !isSlugValid}
              >
                {!perfilPublico ? <Rocket className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {isLoading || isCreating || isUpdating
                  ? 'Salvando...'
                  : !perfilPublico
                    ? 'Criar Minha Página Pública'
                    : 'Salvar Alterações'}
              </Button>
            </div>
          </div>

          {/* Barra de Progresso */}
          <Card>
            <CardContent className="pt-6">
              <ProgressoConfiguracao
                perfil={perfil}
                servicos={servicos}
                depoimentos={depoimentos}
                portfolioImagens={portfolioImagens}
              />
            </CardContent>
          </Card>

          {/* Smart Suggestions ou Configuração Completa */}
          {progressoPorFase["fase-1"] === 100 &&
            progressoPorFase["fase-2"] === 100 &&
            progressoPorFase["fase-3"] === 100 &&
            progressoPorFase["fase-4"] === 100 ? (
            <ConfiguracaoCompleta
              slug={perfil.slug || ""}
              ativo={perfil.ativo || false}
              onNavigateToAnalytics={() => setSecaoAtual("analytics")}
            />
          ) : (
            <SmartSuggestionCards
              perfil={perfil}
              servicos={servicos}
              depoimentos={depoimentos}
              portfolioImagens={portfolioImagens}
              onNavigate={setSecaoAtual}
            />
          )}

          {/* Alert explicativo - agora perfil já foi criado automaticamente */}
          {!perfilPublico && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>⚠️ Configure Seu Perfil</AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                <p>Seu perfil foi criado! Agora personalize-o:</p>
                <ul className="list-none space-y-1 ml-4">
                  <li>✓ <strong>URL Personalizada</strong> - já configurada automaticamente</li>
                  <li>✓ <strong>Título Profissional</strong> - OBRIGATÓRIO para ativar a página</li>
                  <li>✓ <strong>Biografia, fotos e redes sociais</strong> - recomendados</li>
                </ul>
                <p className="mt-2">Após preencher, ative seu perfil no switch acima.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Alert de erros de validação */}
          {errosValidacao.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Campos obrigatórios faltando</AlertTitle>
              <AlertDescription>
                Para ativar sua página pública, você precisa preencher:
                <ul className="list-disc list-inside mt-2">
                  {errosValidacao.map((erro, idx) => (
                    <li key={idx}>{erro}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Alert quando perfil já existe mas ainda não foi ativado/configurado */}
          {perfilPublico && !perfilPublico.ativo && !perfilPublico.titulo_profissional && (
            <Alert className="border-primary bg-primary/5">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertTitle className="text-lg font-semibold">
                Configure sua Página Pública
              </AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                <p className="text-sm">
                  Seu perfil foi criado com sucesso! Agora você já pode fazer upload de imagens e personalizar todos os detalhes.
                  Quando estiver pronto, ative seu perfil no switch acima.
                </p>
                <div className="flex flex-col gap-1 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">OBRIGATÓRIO</Badge>
                    <span>URL Personalizada - já configurada automaticamente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">RECOMENDADO</Badge>
                    <span>Preencha o Título Profissional antes de ativar - na aba <strong>Informações</strong></span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Status da Página */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Status da Página</p>
                    <p className="text-sm text-muted-foreground">
                      Sua página está {perfil.ativo ? "ativa" : "inativa"}
                      {perfil.slug && (
                        <>
                          {" "}em:
                          <span className="font-mono text-primary ml-1">
                            mentemetrics.com.br/perfil/{perfil.slug}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={perfil.ativo ?? false}
                  onCheckedChange={(checked) => handlePerfilChange('ativo', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Nova Estrutura: Navegação Lateral + Conteúdo */}
          <div className="grid grid-cols-12 gap-6">
            {/* Navegação Lateral */}
            <div className="col-span-3">
              <Card className="sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Jornada de Configuração</CardTitle>
                  <CardDescription className="text-xs">
                    Configure sua página em etapas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NavegacaoFases
                    faseAtual="fase-1"
                    secaoAtual={secaoAtual}
                    onSecaoChange={setSecaoAtual}
                    progressoPorFase={progressoPorFase}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Área de Conteúdo */}
            <div className="col-span-9 space-y-6">
              {secaoAtual === "inicio" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Início & Status</CardTitle>
                    <CardDescription>Configure a URL da sua página e ative quando estiver pronto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Personalizada *</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            id="slug"
                            value={perfil.slug || ''}
                            onChange={(e) => handlePerfilChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="seu-nome"
                          />
                        </div>
                      </div>
                      <SlugValidator
                        slug={perfil.slug || ''}
                        currentSlug={perfilPublico?.slug || ''}
                        onChange={(isValid, normalizedSlug) => {
                          setIsSlugValid(isValid);
                          if (isValid && normalizedSlug !== perfil.slug) {
                            handlePerfilChange('slug', normalizedSlug);
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Sua página será: <span className="font-mono text-primary">mentemetrics.com.br/perfil/{perfil.slug || 'seu-nome'}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="titulo_profissional">Título Profissional *</Label>
                      <Input
                        id="titulo_profissional"
                        value={perfil.titulo_profissional || ''}
                        onChange={(e) => handlePerfilChange('titulo_profissional', e.target.value)}
                        placeholder="Ex: Psicóloga Organizacional | Especialista em Clima e Cultura"
                      />
                      <p className="text-xs text-muted-foreground">
                        Este título aparecerá logo abaixo do seu nome
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {secaoAtual === "identidade" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Identidade Visual</CardTitle>
                    <CardDescription>Defina as cores, fotos e estilo da sua página</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Botão Importar do Manual de Marca */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Configure as cores e imagens da sua página</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          As cores podem ser importadas do seu Manual de Marca
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={importarDoManualDeMarca}
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        Importar do Manual de Marca
                      </Button>
                    </div>

                    {/* Fotos */}
                    <div className="space-y-4">
                      <div>
                        <Label>Foto de Perfil</Label>
                        <p className="text-xs text-muted-foreground mb-2">Aparece no topo da página (máx. 3MB)</p>
                        <div className="flex items-center gap-4">
                          {perfil.foto_perfil && (
                            <img
                              src={perfil.foto_perfil}
                              alt="Foto de perfil"
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    variant="outline"
                                    onClick={handleAlterarFoto}
                                    disabled={!perfilPublico?.id}
                                  >
                                    <Camera className="mr-2 h-4 w-4" />
                                    {perfil.foto_perfil ? 'Alterar Foto' : 'Adicionar Foto'}
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!perfilPublico?.id && (
                                <TooltipContent>
                                  <p>Salve o perfil primeiro para fazer upload de imagens</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <div>
                        <Label>Foto de Capa</Label>
                        <p className="text-xs text-muted-foreground mb-2">Imagem de fundo da sua página (máx. 5MB)</p>
                        <div className="space-y-2">
                          {perfil.foto_capa && (
                            <div className="relative h-32 rounded-lg overflow-hidden">
                              <img
                                src={perfil.foto_capa}
                                alt="Foto de capa"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    variant="outline"
                                    onClick={handleAdicionarImagemFundo}
                                    disabled={!perfilPublico?.id}
                                  >
                                    <Image className="mr-2 h-4 w-4" />
                                    {perfil.foto_capa ? 'Alterar Capa' : 'Adicionar Capa'}
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!perfilPublico?.id && (
                                <TooltipContent>
                                  <p>Salve o perfil primeiro para fazer upload de imagens</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    {/* Cores */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="tema_cor_primaria">Cor Primária</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="tema_cor_primaria"
                            type="color"
                            value={perfil.tema_cor_primaria || '#6366f1'}
                            onChange={(e) => handlePerfilChange('tema_cor_primaria', e.target.value)}
                            className="w-20 h-10 cursor-pointer"
                          />
                          <Input
                            value={perfil.tema_cor_primaria || '#6366f1'}
                            onChange={(e) => handlePerfilChange('tema_cor_primaria', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tema_cor_secundaria">Cor Secundária</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="tema_cor_secundaria"
                            type="color"
                            value={perfil.tema_cor_secundaria || '#8b5cf6'}
                            onChange={(e) => handlePerfilChange('tema_cor_secundaria', e.target.value)}
                            className="w-20 h-10 cursor-pointer"
                          />
                          <Input
                            value={perfil.tema_cor_secundaria || '#8b5cf6'}
                            onChange={(e) => handlePerfilChange('tema_cor_secundaria', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {/* Preview de Cores */}
                      <ThemePreview
                        corPrimaria={perfil.tema_cor_primaria || '#6366f1'}
                        corSecundaria={perfil.tema_cor_secundaria || '#8b5cf6'}
                      />
                    </div>

                    {/* Favicon Personalizado */}
                    {perfilPublico?.id && (
                      <div className="pt-6 border-t">
                        <FaviconUploader
                          perfilId={perfilPublico.id}
                          faviconUrl={perfil.favicon_url}
                          onUploadComplete={async (url) => {
                            setPerfil(prev => ({ ...prev, favicon_url: url }));
                            if (perfilPublico?.id) {
                              await updatePerfil({ id: perfilPublico.id, favicon_url: url || null });
                            }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Hero & Sobre Mim */}
              {secaoAtual === "hero" && (
                <div className="space-y-6">
                  {/* Hero Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero Section</CardTitle>
                      <CardDescription>
                        A primeira impressão é a que fica. Configure o topo da sua página com impacto.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Preview do Hero */}
                      <div className="relative h-96 rounded-lg overflow-hidden">
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background: perfil.imagem_hero_url
                              ? `url(${perfil.imagem_hero_url}) center/cover`
                              : `linear-gradient(135deg, ${perfil.tema_cor_primaria}, ${perfil.tema_cor_secundaria})`,
                          }}
                        >
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="relative z-10 text-center text-white px-6 max-w-4xl">
                            <h1 className="text-5xl font-bold mb-4">
                              {perfil.titulo_hero || 'Seu título aqui'}
                            </h1>
                            <p className="text-xl mb-8 opacity-90">
                              {perfil.subtitulo_hero || 'Seu subtítulo aqui'}
                            </p>
                            <Button
                              size="lg"
                              className="bg-white text-gray-900 hover:bg-gray-100"
                            >
                              {perfil.cta_hero_texto || 'Call to Action'}
                            </Button>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="outline"
                                  className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white"
                                  onClick={handleAdicionarImagemHero}
                                  disabled={!perfilPublico?.id}
                                >
                                  <Camera className="mr-2 h-4 w-4" />
                                  {perfil.imagem_hero_url ? 'Alterar Imagem' : 'Adicionar Imagem'}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {!perfilPublico?.id && (
                              <TooltipContent>
                                <p>Salve o perfil primeiro para fazer upload de imagens</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        {!perfil.imagem_hero_url && (
                          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-white/90 px-3 py-1 rounded-full">
                            Máx: 5MB (JPG, PNG, WEBP)
                          </p>
                        )}
                      </div>

                      {/* Campos de Configuração */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="titulo_hero">Título Principal *</Label>
                          <Input
                            id="titulo_hero"
                            value={perfil.titulo_hero || ''}
                            onChange={(e) => handlePerfilChange('titulo_hero', e.target.value)}
                            placeholder="Transforme sua organização"
                          />
                          <p className="text-xs text-muted-foreground">
                            Frase de impacto que resume sua proposta de valor
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtitulo_hero">Subtítulo *</Label>
                          <Input
                            id="subtitulo_hero"
                            value={perfil.subtitulo_hero || ''}
                            onChange={(e) => handlePerfilChange('subtitulo_hero', e.target.value)}
                            placeholder="Diagnósticos precisos e intervenções eficazes"
                          />
                          <p className="text-xs text-muted-foreground">
                            Complemente o título com mais detalhes
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cta_hero_texto">Texto do Botão (CTA) *</Label>
                          <Input
                            id="cta_hero_texto"
                            value={perfil.cta_hero_texto || ''}
                            onChange={(e) => handlePerfilChange('cta_hero_texto', e.target.value)}
                            placeholder="Fazer Diagnóstico Gratuito"
                          />
                          <p className="text-xs text-muted-foreground">
                            Ação clara que você quer que o visitante faça
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cta_hero_link">Link do Botão *</Label>
                          <Input
                            id="cta_hero_link"
                            value={perfil.cta_hero_link || ''}
                            onChange={(e) => handlePerfilChange('cta_hero_link', e.target.value)}
                            placeholder="#contato ou https://wa.me/5511999999999"
                          />
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Use âncoras para rolar até seções da sua página, ou URLs completas para links externos</p>
                            <p className="text-primary">Seções disponíveis: #contato, #servicos, #diagnosticos, #sobre, #depoimentos, #faq</p>
                          </div>
                        </div>
                      </div>

                      {perfil.imagem_hero_url && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            handlePerfilChange('imagem_hero_url', null);
                            toast.success('Imagem removida. Salve para confirmar.');
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover Imagem de Fundo
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sobre Mim / Biografia */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre Mim</CardTitle>
                      <CardDescription>
                        Conte sua história e construa conexão com os visitantes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="biografia">Biografia</Label>
                        <Textarea
                          id="biografia"
                          value={perfil.biografia || ''}
                          onChange={(e) => handlePerfilChange('biografia', e.target.value)}
                          placeholder="Fale sobre sua experiência, formação, especialidades e o que te move..."
                          rows={8}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {perfil.biografia?.length || 0}/2000 caracteres
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="whatsapp">
                            <Phone className="inline h-4 w-4 mr-1" />
                            WhatsApp
                          </Label>
                          <Input
                            id="whatsapp"
                            value={perfil.whatsapp || ''}
                            onChange={(e) => handlePerfilChange('whatsapp', e.target.value)}
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="instagram">
                            <Instagram className="inline h-4 w-4 mr-1" />
                            Instagram
                          </Label>
                          <Input
                            id="instagram"
                            value={perfil.instagram || ''}
                            onChange={(e) => handlePerfilChange('instagram', e.target.value)}
                            placeholder="@seu_usuario"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedin">
                            <Linkedin className="inline h-4 w-4 mr-1" />
                            LinkedIn
                          </Label>
                          <Input
                            id="linkedin"
                            value={perfil.linkedin || ''}
                            onChange={(e) => handlePerfilChange('linkedin', e.target.value)}
                            placeholder="linkedin.com/in/seu-perfil"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="site">
                            <Globe className="inline h-4 w-4 mr-1" />
                            Website
                          </Label>
                          <Input
                            id="site"
                            value={perfil.site || ''}
                            onChange={(e) => handlePerfilChange('site', e.target.value)}
                            placeholder="https://seu-site.com"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Placeholder para outras seções - serão implementadas gradualmente */}
              {secaoAtual === "servicos" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Serviços
                    </CardTitle>
                    <CardDescription>
                      Configure os serviços que você oferece
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Configure os serviços oferecidos no seu perfil público
                      </p>
                      <Button
                        onClick={() => setImportDialogOpen(true)}
                        size="sm"
                        variant="outline"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Importar da Biblioteca
                      </Button>
                    </div>

                    {/* Lista de Serviços Existentes */}
                    {servicos.length > 0 && (
                      <div className="space-y-3">
                        {servicos.map((servico) => (
                          <Card key={servico.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{servico.titulo}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{servico.descricao}</p>
                                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                  {servico.preco && <span>R$ {servico.preco}</span>}
                                  {servico.duracao && <span>{servico.duracao}h</span>}
                                  {servico.modalidade && <Badge variant="outline">{servico.modalidade}</Badge>}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removerServico(servico.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {servicos.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum serviço adicionado ainda</p>
                        <p className="text-xs">Comece adicionando seus serviços abaixo</p>
                      </div>
                    )}

                    {/* Formulário para Novo Serviço */}
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-base">Adicionar Novo Serviço</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="servico-titulo">Título *</Label>
                            <Input
                              id="servico-titulo"
                              value={novoServico.titulo}
                              onChange={(e) => setNovoServico({ ...novoServico, titulo: e.target.value })}
                              placeholder="Ex: Diagnóstico Organizacional"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="servico-icone">Ícone</Label>
                            <Input
                              id="servico-icone"
                              value={novoServico.icone}
                              onChange={(e) => setNovoServico({ ...novoServico, icone: e.target.value })}
                              placeholder="Briefcase, Target, Users, etc"
                            />
                            <p className="text-xs text-muted-foreground">
                              Veja em: lucide.dev/icons
                            </p>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="servico-descricao">Descrição *</Label>
                            <Textarea
                              id="servico-descricao"
                              value={novoServico.descricao}
                              onChange={(e) => setNovoServico({ ...novoServico, descricao: e.target.value })}
                              placeholder="Descreva o serviço..."
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="servico-preco">Preço (R$)</Label>
                            <Input
                              id="servico-preco"
                              type="number"
                              value={novoServico.preco}
                              onChange={(e) => setNovoServico({ ...novoServico, preco: e.target.value })}
                              placeholder="1500.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="servico-duracao">Duração (horas)</Label>
                            <Input
                              id="servico-duracao"
                              type="number"
                              value={novoServico.duracao}
                              onChange={(e) => setNovoServico({ ...novoServico, duracao: e.target.value })}
                              placeholder="8"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="servico-modalidade">Modalidade</Label>
                            <Select
                              value={novoServico.modalidade}
                              onValueChange={(value: any) => setNovoServico({ ...novoServico, modalidade: value })}
                            >
                              <SelectTrigger id="servico-modalidade">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="presencial">Presencial</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="hibrido">Híbrido</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button onClick={adicionarServico} className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Serviço
                        </Button>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}

              {secaoAtual === "portfolio" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Portfólio & Cases
                    </CardTitle>
                    <CardDescription>
                      Adicione imagens de projetos, certificações, cases de sucesso e outros trabalhos realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {perfilPublico?.id && (
                      <div className="flex items-center justify-end">
                        <Button
                          onClick={() => setImportIntervencoesDialogOpen(true)}
                          size="sm"
                          variant="outline"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Importar Intervenções
                        </Button>
                      </div>
                    )}

                    {perfilPublico?.id ? (
                      <PortfolioManager perfilPublicoId={perfilPublico.id} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Salve o perfil primeiro para gerenciar o portfólio</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {secaoAtual === "prova-social" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Prova Social & Depoimentos
                          </CardTitle>
                          <CardDescription>
                            Depoimentos de clientes aumentam credibilidade e conversões
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => setSolicitarDepoimentoDialogOpen(true)}
                          size="sm"
                          disabled={!perfil.slug}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Solicitar Depoimento
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Lista de Depoimentos */}
                      {depoimentos.length > 0 && (
                        <div className="space-y-3">
                          {depoimentos.map((depoimento) => (
                            <Card key={depoimento.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{depoimento.nome}</h4>
                                    <div className="flex">
                                      {[...Array(depoimento.rating || 5)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  </div>
                                  {(depoimento.cargo || depoimento.empresa) && (
                                    <p className="text-xs text-muted-foreground">
                                      {depoimento.cargo}{depoimento.cargo && depoimento.empresa ? " - " : ""}{depoimento.empresa}
                                    </p>
                                  )}
                                  <p className="text-sm mt-2">{depoimento.texto}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removerDepoimento(depoimento.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {depoimentos.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum depoimento adicionado ainda</p>
                          <p className="text-xs">Comece adicionando depoimentos dos seus clientes</p>
                        </div>
                      )}

                      {/* Formulário para Novo Depoimento */}
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-base">Adicionar Novo Depoimento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="depoimento-nome">Nome *</Label>
                              <Input
                                id="depoimento-nome"
                                value={novoDepoimento.nome}
                                onChange={(e) => setNovoDepoimento({ ...novoDepoimento, nome: e.target.value })}
                                placeholder="Nome do cliente"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="depoimento-cargo">Cargo</Label>
                              <Input
                                id="depoimento-cargo"
                                value={novoDepoimento.cargo}
                                onChange={(e) => setNovoDepoimento({ ...novoDepoimento, cargo: e.target.value })}
                                placeholder="Ex: Gerente de RH"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="depoimento-empresa">Empresa</Label>
                              <Input
                                id="depoimento-empresa"
                                value={novoDepoimento.empresa}
                                onChange={(e) => setNovoDepoimento({ ...novoDepoimento, empresa: e.target.value })}
                                placeholder="Nome da empresa"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="depoimento-rating">Avaliação</Label>
                              <Select
                                value={novoDepoimento.rating.toString()}
                                onValueChange={(value) => setNovoDepoimento({ ...novoDepoimento, rating: parseInt(value) })}
                              >
                                <SelectTrigger id="depoimento-rating">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5 estrelas)</SelectItem>
                                  <SelectItem value="4">⭐⭐⭐⭐ (4 estrelas)</SelectItem>
                                  <SelectItem value="3">⭐⭐⭐ (3 estrelas)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="depoimento-texto">Depoimento *</Label>
                              <Textarea
                                id="depoimento-texto"
                                value={novoDepoimento.texto}
                                onChange={(e) => setNovoDepoimento({ ...novoDepoimento, texto: e.target.value })}
                                placeholder="O que o cliente disse sobre seu trabalho..."
                                rows={4}
                              />
                            </div>
                          </div>

                          <Button onClick={adicionarDepoimento} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Depoimento
                          </Button>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>

                  {/* Depoimentos Pendentes */}
                  {perfilPublico?.id && (
                    <DepoimentosPendentesManager perfilPublicoId={perfilPublico.id} />
                  )}
                </div>
              )}

              {secaoAtual === "ctas" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      CTAs & Conversão
                    </CardTitle>
                    <CardDescription>
                      Configure múltiplos Call-to-Actions ao longo da página para maximizar conversões
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* CTA Flutuante */}
                    <div className="space-y-4 pb-6 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Botão Flutuante Fixo</h3>
                          <p className="text-sm text-muted-foreground">
                            Botão sempre visível no canto da tela enquanto o usuário navega
                          </p>
                        </div>
                        <Switch
                          checked={perfil.cta_flutuante_ativo ?? true}
                          onCheckedChange={(checked) => handlePerfilChange('cta_flutuante_ativo', checked)}
                        />
                      </div>

                      {perfil.cta_flutuante_ativo && (
                        <div className="space-y-4 pl-4">
                          <div className="space-y-2">
                            <Label>Texto do Botão</Label>
                            <Input
                              value={perfil.cta_flutuante_texto || ''}
                              onChange={(e) => handlePerfilChange('cta_flutuante_texto', e.target.value)}
                              placeholder="Ex: Agende uma Conversa"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link de Destino</Label>
                            <Input
                              value={perfil.cta_flutuante_link || ''}
                              onChange={(e) => handlePerfilChange('cta_flutuante_link', e.target.value)}
                              placeholder="#contato ou https://wa.me/5511999999999"
                            />
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>Use âncoras para rolar até seções da sua página, ou URLs completas para links externos</p>
                              <p className="text-primary">Seções disponíveis: #contato, #servicos, #diagnosticos, #sobre, #depoimentos, #faq</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA Intermediário */}
                    <div className="space-y-4 pb-6 border-b">
                      <div>
                        <h3 className="text-lg font-semibold">CTA Intermediário</h3>
                        <p className="text-sm text-muted-foreground">
                          Seção de conversão estratégica entre o conteúdo principal
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Título Principal</Label>
                          <Input
                            value={perfil.cta_intermediario_titulo || ''}
                            onChange={(e) => handlePerfilChange('cta_intermediario_titulo', e.target.value)}
                            placeholder="Ex: Pronto para Transformar sua Organização?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input
                            value={perfil.cta_intermediario_subtitulo || ''}
                            onChange={(e) => handlePerfilChange('cta_intermediario_subtitulo', e.target.value)}
                            placeholder="Ex: Vamos conversar sobre como posso ajudar sua empresa"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Texto do Botão</Label>
                            <Input
                              value={perfil.cta_intermediario_botao_texto || ''}
                              onChange={(e) => handlePerfilChange('cta_intermediario_botao_texto', e.target.value)}
                              placeholder="Ex: Falar com Especialista"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link do Botão</Label>
                            <Input
                              value={perfil.cta_intermediario_botao_link || ''}
                              onChange={(e) => handlePerfilChange('cta_intermediario_botao_link', e.target.value)}
                              placeholder="#contato ou https://wa.me/5511999999999"
                            />
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>Seções disponíveis: #contato, #servicos, #diagnosticos, #sobre, #depoimentos, #faq</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preview CTA Intermediário */}
                      <div className="mt-6 p-6 rounded-lg text-center" style={{
                        background: `linear-gradient(135deg, ${perfil.tema_cor_primaria}, ${perfil.tema_cor_secundaria})`
                      }}>
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {perfil.cta_intermediario_titulo || 'Pronto para Transformar sua Organização?'}
                        </h3>
                        <p className="text-lg text-white/90 mb-6">
                          {perfil.cta_intermediario_subtitulo || 'Vamos conversar sobre como posso ajudar sua empresa'}
                        </p>
                        <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: perfil.tema_cor_primaria }}>
                          {perfil.cta_intermediario_botao_texto || 'Falar com Especialista'}
                        </Button>
                      </div>
                    </div>

                    {/* CTA Rodapé */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">CTA no Rodapé</h3>
                        <p className="text-sm text-muted-foreground">
                          Última chamada para ação antes do fim da página
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Texto Principal</Label>
                          <Input
                            value={perfil.cta_rodape_texto || ''}
                            onChange={(e) => handlePerfilChange('cta_rodape_texto', e.target.value)}
                            placeholder="Ex: Transforme sua organização hoje"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Texto do Botão</Label>
                            <Input
                              value={perfil.cta_rodape_botao_texto || ''}
                              onChange={(e) => handlePerfilChange('cta_rodape_botao_texto', e.target.value)}
                              placeholder="Ex: Entre em Contato"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link do Botão</Label>
                            <Input
                              value={perfil.cta_rodape_botao_link || ''}
                              onChange={(e) => handlePerfilChange('cta_rodape_botao_link', e.target.value)}
                              placeholder="#contato, /diagnostico ou URL"
                            />
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>Sugestões: #contato, #servicos, #diagnosticos</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(secaoAtual === "faq-beneficios" || secaoAtual === "beneficios-faq") && (
                <div className="space-y-6">
                  {/* Benefícios */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Benefícios & Diferenciais
                      </CardTitle>
                      <CardDescription>
                        Destaque os diferenciais do seu trabalho com ícones e descrições personalizadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {perfil.beneficios?.map((beneficio, index) => (
                        <Card key={beneficio.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-4">
                              <div>
                                <Label>Ícone (nome do Lucide Icon)</Label>
                                <Input
                                  value={beneficio.icone}
                                  onChange={(e) => {
                                    const novos = [...(perfil.beneficios || [])];
                                    novos[index].icone = e.target.value;
                                    setPerfil({ ...perfil, beneficios: novos });
                                  }}
                                  placeholder="Target, Award, Users, TrendingUp, etc"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Veja ícones disponíveis em: lucide.dev/icons
                                </p>
                              </div>
                              <div>
                                <Label>Título</Label>
                                <Input
                                  value={beneficio.titulo}
                                  onChange={(e) => {
                                    const novos = [...(perfil.beneficios || [])];
                                    novos[index].titulo = e.target.value;
                                    setPerfil({ ...perfil, beneficios: novos });
                                  }}
                                  placeholder="Ex: Resultados Comprovados"
                                />
                              </div>
                              <div>
                                <Label>Descrição</Label>
                                <Textarea
                                  value={beneficio.descricao}
                                  onChange={(e) => {
                                    const novos = [...(perfil.beneficios || [])];
                                    novos[index].descricao = e.target.value;
                                    setPerfil({ ...perfil, beneficios: novos });
                                  }}
                                  placeholder="Descreva este benefício..."
                                  rows={3}
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const novos = perfil.beneficios?.filter((_, i) => i !== index) || [];
                                setPerfil({ ...perfil, beneficios: novos });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}

                      {(!perfil.beneficios || perfil.beneficios.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum benefício adicionado ainda</p>
                          <p className="text-xs">Comece adicionando seus diferenciais!</p>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => {
                          const novoBeneficio = {
                            id: crypto.randomUUID(),
                            icone: "Target",
                            titulo: "",
                            descricao: ""
                          };
                          setPerfil({
                            ...perfil,
                            beneficios: [...(perfil.beneficios || []), novoBeneficio]
                          });
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Benefício
                      </Button>
                    </CardContent>
                  </Card>

                  {/* FAQ */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileQuestion className="h-5 w-5" />
                        FAQ (Perguntas Frequentes)
                      </CardTitle>
                      <CardDescription>
                        Responda as dúvidas mais comuns dos seus visitantes para aumentar conversões
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {perfil.faqs?.map((faq, index) => (
                        <Card key={faq.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-4">
                              <div>
                                <Label>Pergunta</Label>
                                <Input
                                  value={faq.pergunta}
                                  onChange={(e) => {
                                    const novos = [...(perfil.faqs || [])];
                                    novos[index].pergunta = e.target.value;
                                    setPerfil({ ...perfil, faqs: novos });
                                  }}
                                  placeholder="Ex: Quanto tempo dura o processo de diagnóstico?"
                                />
                              </div>
                              <div>
                                <Label>Resposta</Label>
                                <Textarea
                                  value={faq.resposta}
                                  onChange={(e) => {
                                    const novos = [...(perfil.faqs || [])];
                                    novos[index].resposta = e.target.value;
                                    setPerfil({ ...perfil, faqs: novos });
                                  }}
                                  rows={3}
                                  placeholder="Explique detalhadamente a resposta para esta pergunta..."
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const novos = perfil.faqs?.filter((_, i) => i !== index) || [];
                                setPerfil({ ...perfil, faqs: novos });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}

                      {(!perfil.faqs || perfil.faqs.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma pergunta adicionada ainda</p>
                          <p className="text-xs">Comece respondendo as dúvidas mais comuns!</p>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => {
                          const novoFaq = {
                            id: crypto.randomUUID(),
                            pergunta: "",
                            resposta: ""
                          };
                          setPerfil({
                            ...perfil,
                            faqs: [...(perfil.faqs || []), novoFaq]
                          });
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Pergunta
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {secaoAtual === "diagnosticos" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Diagnósticos & Avaliações
                    </CardTitle>
                    <CardDescription>
                      Seus questionários de diagnóstico ativos serão exibidos na página pública
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {questionarios.length > 0 ? (
                      <>
                        <Alert>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle>Diagnósticos Configurados</AlertTitle>
                          <AlertDescription>
                            Você tem {questionarios.length} questionário(s) ativo(s) que aparecerão na sua página pública
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          {questionarios.map((questionario) => (
                            <Card key={questionario.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{questionario.titulo}</h4>
                                  {questionario.descricao && (
                                    <p className="text-sm text-muted-foreground mt-1">{questionario.descricao}</p>
                                  )}
                                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                    {questionario.tempo_estimado && <span>⏱️ {questionario.tempo_estimado} min</span>}
                                    {questionario.total_questoes && <span>📝 {questionario.total_questoes} questões</span>}
                                    <Badge variant="outline" className="text-xs">Ativo</Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/diagnostico/${questionario.slug}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Visualizar
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum diagnóstico ativo configurado</p>
                        <p className="text-xs mt-2">
                          Crie questionários de diagnóstico na seção <Link to="/diagnosticos" className="text-primary hover:underline">Diagnósticos</Link>
                        </p>
                      </div>
                    )}

                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertTitle>Como Funciona</AlertTitle>
                      <AlertDescription className="text-xs space-y-1">
                        <p>• Questionários ativos aparecem automaticamente na sua página pública</p>
                        <p>• Visitantes podem responder diretamente pela sua página</p>
                        <p>• Respostas geram leads automaticamente no CRM</p>
                        <p>• Gerencie seus questionários na seção <Link to="/diagnosticos" className="text-primary hover:underline font-medium">Diagnósticos</Link></p>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {secaoAtual === "layout" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Layout & Organização</CardTitle>
                    <CardDescription>
                      Arraste as seções para reordenar e controle a visibilidade de cada bloco da sua página
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <h4 className="font-medium">Como usar:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                              <li>• Arraste as seções para reorganizar a ordem na página</li>
                              <li>• Use o switch para mostrar/ocultar seções específicas</li>
                              <li>• Seções ocultas não aparecem na página pública</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={(perfil.secoes_config || []).map((s) => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {(perfil.secoes_config || [])
                              .sort((a, b) => a.ordem - b.ordem)
                              .map((secao) => {
                                // Calcular status de conteúdo para cada seção
                                const depoimentosAprovados = depoimentos.filter(d => d.status === 'aprovado');
                                const questionariosAtivos = questionarios.filter(q => q.ativo);

                                const secoesStatus: Record<string, { temConteudo: boolean; aviso: string }> = {
                                  hero: {
                                    temConteudo: Boolean(perfil.titulo_hero),
                                    aviso: 'Adicione um título na seção Hero para exibir esta seção.'
                                  },
                                  sobre: {
                                    temConteudo: Boolean(perfil.biografia && perfil.biografia.length > 10),
                                    aviso: 'Adicione uma biografia para exibir esta seção.'
                                  },
                                  beneficios: {
                                    temConteudo: Array.isArray(perfil.beneficios) && (perfil.beneficios as any[]).length > 0,
                                    aviso: 'Adicione pelo menos um benefício para exibir esta seção.'
                                  },
                                  servicos: {
                                    temConteudo: servicos.length > 0,
                                    aviso: 'Adicione pelo menos um serviço para exibir esta seção.'
                                  },
                                  depoimentos: {
                                    temConteudo: depoimentosAprovados.length > 0,
                                    aviso: 'Adicione depoimentos aprovados para exibir esta seção.'
                                  },
                                  diagnosticos: {
                                    temConteudo: questionariosAtivos.length > 0,
                                    aviso: 'Ative pelo menos um questionário de diagnóstico para exibir esta seção.'
                                  },
                                  portfolio: {
                                    temConteudo: portfolioImagens.length > 0,
                                    aviso: 'Adicione imagens ao portfólio para exibir esta seção.'
                                  },
                                  faq: {
                                    temConteudo: Array.isArray(perfil.faqs) && (perfil.faqs as any[]).length > 0,
                                    aviso: 'Adicione perguntas frequentes para exibir esta seção.'
                                  },
                                  numeros: {
                                    temConteudo: Array.isArray(perfil.estatisticas) && (perfil.estatisticas as any[]).length > 0,
                                    aviso: 'Adicione estatísticas/números para exibir esta seção.'
                                  },
                                  como_funciona: {
                                    temConteudo: Array.isArray(perfil.processo_trabalho) && (perfil.processo_trabalho as any[]).length > 0,
                                    aviso: 'Adicione etapas do processo de trabalho para exibir esta seção.'
                                  },
                                  especialidades: {
                                    temConteudo: Array.isArray(perfil.especialidades) && (perfil.especialidades as any[]).length > 0,
                                    aviso: 'Adicione especialidades para exibir esta seção.'
                                  },
                                  cta_intermediario: {
                                    temConteudo: Boolean(perfil.cta_intermediario_titulo && perfil.cta_intermediario_botao_texto && perfil.cta_intermediario_botao_link),
                                    aviso: 'Configure título, texto do botão e link do CTA para exibir esta seção.'
                                  },
                                  contato: {
                                    temConteudo: true,
                                    aviso: ''
                                  }
                                };

                                const status = secoesStatus[secao.id] || { temConteudo: true, aviso: '' };

                                return (
                                  <SortableSecaoItem
                                    key={secao.id}
                                    secao={secao}
                                    onToggleVisibility={handleToggleVisibilidade}
                                    temConteudo={status.temConteudo}
                                    avisoConteudo={status.aviso}
                                  />
                                );
                              })}
                          </div>
                        </SortableContext>
                      </DndContext>

                      {(!perfil.secoes_config || perfil.secoes_config.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Nenhuma seção configurada</p>
                          <p className="text-sm mt-1">Salve o perfil para inicializar as seções</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {secaoAtual === "seo-dominio" && (
                <div className="space-y-6">
                  {/* SEO */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Otimização para Buscadores (SEO)</CardTitle>
                      <CardDescription>
                        Melhore a visibilidade da sua página nos resultados de busca
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="seoTitulo">Título da Página</Label>
                        <Input
                          id="seoTitulo"
                          value={perfil.seo_titulo || ''}
                          onChange={(e) => handlePerfilChange('seo_titulo', e.target.value)}
                          placeholder="Ex: Dra. Ana Silva - Psicóloga Organizacional em São Paulo"
                        />
                        <p className="text-xs text-muted-foreground">
                          {(perfil.seo_titulo || '').length}/60 caracteres (recomendado)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seoDescricao">Descrição</Label>
                        <Textarea
                          id="seoDescricao"
                          value={perfil.seo_descricao || ''}
                          onChange={(e) => handlePerfilChange('seo_descricao', e.target.value)}
                          rows={3}
                          placeholder="Descreva seus serviços e especialidades..."
                        />
                        <p className="text-xs text-muted-foreground">
                          {(perfil.seo_descricao || '').length}/160 caracteres (recomendado)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seoKeywords">Palavras-chave</Label>
                        <Input
                          id="seoKeywords"
                          value={Array.isArray(perfil.seo_palavras_chave)
                            ? perfil.seo_palavras_chave.join(', ')
                            : (perfil.seo_palavras_chave || '')}
                          onChange={(e) => {
                            // Durante digitação, guardar como string (permite vírgulas)
                            setPerfil(prev => ({ ...prev, seo_palavras_chave: e.target.value as any }));
                          }}
                          onBlur={(e) => {
                            // Ao sair do campo, converter para array limpo
                            const keywords = e.target.value
                              .split(',')
                              .map(k => k.trim())
                              .filter(Boolean);
                            handlePerfilChange('seo_palavras_chave', keywords);
                          }}
                          placeholder="psicóloga, clima organizacional, cultura, RH"
                        />
                        <p className="text-xs text-muted-foreground">
                          Separadas por vírgula
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Domínio Customizado */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Domínio Customizado</CardTitle>
                      <CardDescription>
                        Configure um domínio próprio para sua página profissional
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {perfil.slug ? (
                        <DomainSettings perfilPublicoId={perfil.id} slug={perfil.slug} />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Configure um slug primeiro para ver as opções de domínio customizado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {secaoAtual === "estatisticas" && (
                <EstatisticasManager
                  estatisticas={perfil.estatisticas || []}
                  onChange={(estatisticas) => handlePerfilChange('estatisticas', estatisticas)}
                />
              )}

              {secaoAtual === "processo" && (
                <ProcessoTrabalhoManager
                  processo={perfil.processo_trabalho || []}
                  onChange={(processo) => handlePerfilChange('processo_trabalho', processo)}
                />
              )}

              {secaoAtual === "especialidades" && (
                <EspecialidadesManager
                  especialidades={perfil.especialidades || []}
                  onChange={(especialidades) => handlePerfilChange('especialidades', especialidades)}
                />
              )}

              {secaoAtual === "navbar-footer" && (
                <NavbarFooterConfig
                  navbarMenuItems={perfil.navbar_menu_items || []}
                  navbarCtaTexto={perfil.navbar_cta_texto || ''}
                  navbarCtaLink={perfil.navbar_cta_link || ''}
                  footerTextoSobre={perfil.footer_texto_sobre || ''}
                  mostrarSecaoConteudos={perfil.mostrar_secao_conteudos ?? false}
                  onChangeNavbarMenuItems={(items) => handlePerfilChange('navbar_menu_items', items)}
                  onChangeNavbarCtaTexto={(texto) => handlePerfilChange('navbar_cta_texto', texto)}
                  onChangeNavbarCtaLink={(link) => handlePerfilChange('navbar_cta_link', link)}
                  onChangeFooterTextoSobre={(texto) => handlePerfilChange('footer_texto_sobre', texto)}
                  onChangeMostrarSecaoConteudos={(mostrar) => handlePerfilChange('mostrar_secao_conteudos', mostrar)}
                />
              )}

              {secaoAtual === "rastreamento" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rastreamento & Analytics</CardTitle>
                    <CardDescription>
                      Configure GTM, Facebook Pixel e Google Analytics para medir conversões
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TrackingConfigForm
                      gtmId={perfil.gtm_id || null}
                      facebookPixelId={perfil.facebook_pixel_id || null}
                      googleAnalyticsId={perfil.google_analytics_id || null}
                      metaCapiToken={perfil.meta_capi_access_token || null}
                      facebookDomainVerification={perfil.facebook_domain_verification || null}
                      onSave={async (data) => {
                        if (perfilPublico?.id) {
                          setPerfil({ ...perfil, ...data });
                          await updatePerfil({ id: perfilPublico.id, ...data });
                        }
                      }}
                      isSaving={isUpdating}
                    />
                  </CardContent>
                </Card>
              )}

              {secaoAtual === "email" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email & Envios
                    </CardTitle>
                    <CardDescription>
                      Configure o email que será usado como remetente nos questionários e convites de avaliação enviados aos seus clientes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmailSmtpConfig />
                  </CardContent>
                </Card>
              )}

              {secaoAtual === "analytics" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics & Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {perfilPublico?.id ? (
                      <AnalyticsDashboard perfilPublicoId={perfilPublico.id} />
                    ) : (
                      <p className="text-muted-foreground">
                        Salve seu perfil público primeiro para visualizar as estatísticas
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <ServicosImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          perfilPublicoId={perfil?.id || ''}
        />
        <IntervencoesImportDialog
          open={importIntervencoesDialogOpen}
          onOpenChange={setImportIntervencoesDialogOpen}
          perfilPublicoId={perfil?.id || ''}
        />
        <SolicitarDepoimentoDialog
          open={solicitarDepoimentoDialogOpen}
          onOpenChange={setSolicitarDepoimentoDialogOpen}
          perfilSlug={perfil?.slug || ''}
        />

        <FirstAccessWizard
          open={showWizard}
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      </MainLayout>
    </TooltipProvider>
  );
}
