export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_impersonation_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          target_user_id: string
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          target_user_id: string
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          target_user_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      alertas: {
        Row: {
          consultora_id: string
          created_at: string
          descricao: string | null
          id: string
          lido: boolean | null
          projeto_id: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          consultora_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          lido?: boolean | null
          projeto_id?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          consultora_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          lido?: boolean | null
          projeto_id?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      asaas_credentials: {
        Row: {
          account_name: string | null
          ativo: boolean | null
          connection_status: string | null
          consultora_id: string
          created_at: string | null
          environment: string
          id: string
          last_validation_at: string | null
          production_api_key: string | null
          production_webhook_token: string | null
          sandbox_api_key: string | null
          sandbox_webhook_token: string | null
          updated_at: string | null
          webhook_token: string | null
        }
        Insert: {
          account_name?: string | null
          ativo?: boolean | null
          connection_status?: string | null
          consultora_id: string
          created_at?: string | null
          environment?: string
          id?: string
          last_validation_at?: string | null
          production_api_key?: string | null
          production_webhook_token?: string | null
          sandbox_api_key?: string | null
          sandbox_webhook_token?: string | null
          updated_at?: string | null
          webhook_token?: string | null
        }
        Update: {
          account_name?: string | null
          ativo?: boolean | null
          connection_status?: string | null
          consultora_id?: string
          created_at?: string | null
          environment?: string
          id?: string
          last_validation_at?: string | null
          production_api_key?: string | null
          production_webhook_token?: string | null
          sandbox_api_key?: string | null
          sandbox_webhook_token?: string | null
          updated_at?: string | null
          webhook_token?: string | null
        }
        Relationships: []
      }
      asaas_sync_logs: {
        Row: {
          atualizadas: number | null
          consultora_id: string | null
          detalhes: Json | null
          duracao_ms: number | null
          erros: number | null
          id: string
          timestamp: string | null
          tipo: string | null
          total_faturas: number | null
        }
        Insert: {
          atualizadas?: number | null
          consultora_id?: string | null
          detalhes?: Json | null
          duracao_ms?: number | null
          erros?: number | null
          id?: string
          timestamp?: string | null
          tipo?: string | null
          total_faturas?: number | null
        }
        Update: {
          atualizadas?: number | null
          consultora_id?: string | null
          detalhes?: Json | null
          duracao_ms?: number | null
          erros?: number | null
          id?: string
          timestamp?: string | null
          tipo?: string | null
          total_faturas?: number | null
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          cliente_id: string | null
          configuracoes: Json | null
          consultora_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          frequencia_lembrete: number | null
          id: string
          instrumento: string | null
          lembretes_automaticos: boolean | null
          nome: string
          participantes_responderam: number | null
          participantes_total: number | null
          permite_auto_identificacao: boolean | null
          progresso: number | null
          slug: string | null
          status: Database["public"]["Enums"]["avaliacao_status"]
          tipo: string
          tipo_acesso:
            | Database["public"]["Enums"]["tipo_acesso_avaliacao"]
            | null
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          configuracoes?: Json | null
          consultora_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          frequencia_lembrete?: number | null
          id?: string
          instrumento?: string | null
          lembretes_automaticos?: boolean | null
          nome: string
          participantes_responderam?: number | null
          participantes_total?: number | null
          permite_auto_identificacao?: boolean | null
          progresso?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["avaliacao_status"]
          tipo: string
          tipo_acesso?:
            | Database["public"]["Enums"]["tipo_acesso_avaliacao"]
            | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          configuracoes?: Json | null
          consultora_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          frequencia_lembrete?: number | null
          id?: string
          instrumento?: string | null
          lembretes_automaticos?: boolean | null
          nome?: string
          participantes_responderam?: number | null
          participantes_total?: number | null
          permite_auto_identificacao?: boolean | null
          progresso?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["avaliacao_status"]
          tipo?: string
          tipo_acesso?:
            | Database["public"]["Enums"]["tipo_acesso_avaliacao"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_consultora_id_fkey"
            columns: ["consultora_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_participantes: {
        Row: {
          avaliacao_id: string
          cargo: string | null
          created_at: string
          data_convite: string | null
          data_resposta: string | null
          email: string
          id: string
          nome: string | null
          respondido: boolean | null
          respostas: Json | null
          setor: string | null
          token: string | null
          token_acesso: string | null
        }
        Insert: {
          avaliacao_id: string
          cargo?: string | null
          created_at?: string
          data_convite?: string | null
          data_resposta?: string | null
          email: string
          id?: string
          nome?: string | null
          respondido?: boolean | null
          respostas?: Json | null
          setor?: string | null
          token?: string | null
          token_acesso?: string | null
        }
        Update: {
          avaliacao_id?: string
          cargo?: string | null
          created_at?: string
          data_convite?: string | null
          data_resposta?: string | null
          email?: string
          id?: string
          nome?: string | null
          respondido?: boolean | null
          respostas?: Json | null
          setor?: string | null
          token?: string | null
          token_acesso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_participantes_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_questoes: {
        Row: {
          avaliacao_id: string
          categoria: string | null
          created_at: string | null
          id: string
          obrigatoria: boolean | null
          opcoes: Json | null
          ordem: number
          pergunta: string
          peso: number
          tipo: Database["public"]["Enums"]["questao_tipo"]
        }
        Insert: {
          avaliacao_id: string
          categoria?: string | null
          created_at?: string | null
          id?: string
          obrigatoria?: boolean | null
          opcoes?: Json | null
          ordem: number
          pergunta: string
          peso?: number
          tipo: Database["public"]["Enums"]["questao_tipo"]
        }
        Update: {
          avaliacao_id?: string
          categoria?: string | null
          created_at?: string | null
          id?: string
          obrigatoria?: boolean | null
          opcoes?: Json | null
          ordem?: number
          pergunta?: string
          peso?: number
          tipo?: Database["public"]["Enums"]["questao_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_questoes_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_respostas_publicas: {
        Row: {
          avaliacao_id: string
          cargo: string | null
          created_at: string | null
          data_resposta: string | null
          email: string | null
          id: string
          ip_address: string | null
          nome: string | null
          respondido: boolean | null
          respostas: Json
          setor: string | null
          user_agent: string | null
        }
        Insert: {
          avaliacao_id: string
          cargo?: string | null
          created_at?: string | null
          data_resposta?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          nome?: string | null
          respondido?: boolean | null
          respostas?: Json
          setor?: string | null
          user_agent?: string | null
        }
        Update: {
          avaliacao_id?: string
          cargo?: string | null
          created_at?: string | null
          data_resposta?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          nome?: string | null
          respondido?: boolean | null
          respostas?: Json
          setor?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_respostas_publicas_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_templates: {
        Row: {
          categoria: string
          configuracoes: Json | null
          consultora_id: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          numero_questoes: number | null
          questoes: Json
          status: string | null
          tempo_estimado: number | null
          tipo: string
          ultima_utilizacao: string | null
          uso_recente: number | null
        }
        Insert: {
          categoria: string
          configuracoes?: Json | null
          consultora_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          numero_questoes?: number | null
          questoes: Json
          status?: string | null
          tempo_estimado?: number | null
          tipo: string
          ultima_utilizacao?: string | null
          uso_recente?: number | null
        }
        Update: {
          categoria?: string
          configuracoes?: Json | null
          consultora_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          numero_questoes?: number | null
          questoes?: Json
          status?: string | null
          tempo_estimado?: number | null
          tipo?: string
          ultima_utilizacao?: string | null
          uso_recente?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_templates_consultora_id_fkey"
            columns: ["consultora_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      biblioteca_intervencoes: {
        Row: {
          ativo: boolean | null
          categoria: string
          consultora_id: string | null
          created_at: string
          custo_estimado: number | null
          descricao: string | null
          duracao_estimada: number | null
          esforco: string
          id: string
          impacto: string
          ordem: number | null
          template: boolean | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          consultora_id?: string | null
          created_at?: string
          custo_estimado?: number | null
          descricao?: string | null
          duracao_estimada?: number | null
          esforco?: string
          id?: string
          impacto?: string
          ordem?: number | null
          template?: boolean | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          consultora_id?: string | null
          created_at?: string
          custo_estimado?: number | null
          descricao?: string | null
          duracao_estimada?: number | null
          esforco?: string
          id?: string
          impacto?: string
          ordem?: number | null
          template?: boolean | null
          titulo?: string
        }
        Relationships: []
      }
      categorias_customizadas: {
        Row: {
          ativo: boolean | null
          consultora_id: string | null
          cor: string | null
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          consultora_id?: string | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          consultora_id?: string | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_customizadas_consultora_id_fkey"
            columns: ["consultora_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          asaas_customer_id: string | null
          colaboradores: number | null
          consultora_id: string
          contrato_inicio: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          responsavel: string | null
          risco_atual: number | null
          status: string | null
          telefone: string | null
          tipo: string | null
          ultima_avaliacao: string | null
          updated_at: string
        }
        Insert: {
          asaas_customer_id?: string | null
          colaboradores?: number | null
          consultora_id: string
          contrato_inicio?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          responsavel?: string | null
          risco_atual?: number | null
          status?: string | null
          telefone?: string | null
          tipo?: string | null
          ultima_avaliacao?: string | null
          updated_at?: string
        }
        Update: {
          asaas_customer_id?: string | null
          colaboradores?: number | null
          consultora_id?: string
          contrato_inicio?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          responsavel?: string | null
          risco_atual?: number | null
          status?: string | null
          telefone?: string | null
          tipo?: string | null
          ultima_avaliacao?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clientes_contatos: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          cliente_id: string
          created_at: string | null
          email: string
          id: string
          nome: string
          principal: boolean | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          cliente_id: string
          created_at?: string | null
          email: string
          id?: string
          nome: string
          principal?: boolean | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          cliente_id?: string
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          principal?: boolean | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_contatos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_interacoes: {
        Row: {
          cliente_id: string
          created_at: string | null
          criado_por: string
          data_interacao: string
          descricao: string | null
          duracao: number | null
          id: string
          participantes: string[] | null
          proximos_passos: string | null
          resultado: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          criado_por: string
          data_interacao?: string
          descricao?: string | null
          duracao?: number | null
          id?: string
          participantes?: string[] | null
          proximos_passos?: string | null
          resultado?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          criado_por?: string
          data_interacao?: string
          descricao?: string | null
          duracao?: number | null
          id?: string
          participantes?: string[] | null
          proximos_passos?: string | null
          resultado?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_interacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_whitelabel: {
        Row: {
          analytics_id: string | null
          ativo: boolean | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string
          dominio_customizado: string | null
          dominio_verificado: boolean | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          meta_tags: Json | null
          nome_empresa: string
          pixel_facebook: string | null
          politica_privacidade: string | null
          template_padrao: string | null
          termos_uso: string | null
          titulo_sistema: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analytics_id?: string | null
          ativo?: boolean | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          dominio_customizado?: string | null
          dominio_verificado?: boolean | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          meta_tags?: Json | null
          nome_empresa: string
          pixel_facebook?: string | null
          politica_privacidade?: string | null
          template_padrao?: string | null
          termos_uso?: string | null
          titulo_sistema?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analytics_id?: string | null
          ativo?: boolean | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          dominio_customizado?: string | null
          dominio_verificado?: boolean | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          meta_tags?: Json | null
          nome_empresa?: string
          pixel_facebook?: string | null
          politica_privacidade?: string | null
          template_padrao?: string | null
          termos_uso?: string | null
          titulo_sistema?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contratos_financeiros: {
        Row: {
          asaas_customer_id: string | null
          cliente_id: string
          consultora_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          dia_vencimento: number
          forma_pagamento: string
          id: string
          observacoes: string | null
          status: string
          updated_at: string | null
          valor_mensal: number
        }
        Insert: {
          asaas_customer_id?: string | null
          cliente_id: string
          consultora_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          dia_vencimento?: number
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string | null
          valor_mensal: number
        }
        Update: {
          asaas_customer_id?: string | null
          cliente_id?: string
          consultora_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          dia_vencimento?: number
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string | null
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_financeiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      depoimentos_publicos: {
        Row: {
          cargo: string | null
          created_at: string | null
          data: string | null
          empresa: string | null
          foto: string | null
          id: string
          nome: string
          perfil_publico_id: string
          rating: number | null
          status: string | null
          texto: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          data?: string | null
          empresa?: string | null
          foto?: string | null
          id?: string
          nome: string
          perfil_publico_id: string
          rating?: number | null
          status?: string | null
          texto: string
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          data?: string | null
          empresa?: string | null
          foto?: string | null
          id?: string
          nome?: string
          perfil_publico_id?: string
          rating?: number | null
          status?: string | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "depoimentos_publicos_perfil_publico_id_fkey"
            columns: ["perfil_publico_id"]
            isOneToOne: false
            referencedRelation: "perfis_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      dominios_customizados: {
        Row: {
          ativado_em: string | null
          created_at: string
          dns_verificado_em: string | null
          dominio: string
          erro_mensagem: string | null
          id: string
          notas_admin: string | null
          perfil_publico_id: string
          ssl_erro_mensagem: string | null
          ssl_status: string | null
          ssl_valido_ate: string | null
          ssl_verificado_em: string | null
          status: string
          token_verificacao: string
          updated_at: string
        }
        Insert: {
          ativado_em?: string | null
          created_at?: string
          dns_verificado_em?: string | null
          dominio: string
          erro_mensagem?: string | null
          id?: string
          notas_admin?: string | null
          perfil_publico_id: string
          ssl_erro_mensagem?: string | null
          ssl_status?: string | null
          ssl_valido_ate?: string | null
          ssl_verificado_em?: string | null
          status?: string
          token_verificacao?: string
          updated_at?: string
        }
        Update: {
          ativado_em?: string | null
          created_at?: string
          dns_verificado_em?: string | null
          dominio?: string
          erro_mensagem?: string | null
          id?: string
          notas_admin?: string | null
          perfil_publico_id?: string
          ssl_erro_mensagem?: string | null
          ssl_status?: string | null
          ssl_valido_ate?: string | null
          ssl_verificado_em?: string | null
          status?: string
          token_verificacao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dominios_customizados_perfil_publico_id_fkey"
            columns: ["perfil_publico_id"]
            isOneToOne: false
            referencedRelation: "perfis_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      dominios_verificacoes: {
        Row: {
          detalhes: Json | null
          dominio_id: string
          id: string
          sucesso: boolean
          tipo_verificacao: string
          verificado_em: string
        }
        Insert: {
          detalhes?: Json | null
          dominio_id: string
          id?: string
          sucesso: boolean
          tipo_verificacao: string
          verificado_em?: string
        }
        Update: {
          detalhes?: Json | null
          dominio_id?: string
          id?: string
          sucesso?: boolean
          tipo_verificacao?: string
          verificado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "dominios_verificacoes_dominio_id_fkey"
            columns: ["dominio_id"]
            isOneToOne: false
            referencedRelation: "dominios_customizados"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cliente_id: string | null
          consultora_id: string
          created_at: string
          data_hora: string
          id: string
          lead_id: string | null
          local: string | null
          observacoes: string | null
          status: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          cliente_id?: string | null
          consultora_id: string
          created_at?: string
          data_hora: string
          id?: string
          lead_id?: string | null
          local?: string | null
          observacoes?: string | null
          status?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          cliente_id?: string | null
          consultora_id?: string
          created_at?: string
          data_hora?: string
          id?: string
          lead_id?: string | null
          local?: string | null
          observacoes?: string | null
          status?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          asaas_bank_slip_url: string | null
          asaas_invoice_url: string | null
          asaas_payment_id: string | null
          asaas_pix_copy_paste: string | null
          asaas_pix_qr_code: string | null
          chargeback_status: string | null
          cliente_id: string | null
          consultora_id: string
          contrato_id: string | null
          created_at: string | null
          data_emissao: string
          data_pagamento: string | null
          data_pagamento_antecipado: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento: string | null
          id: string
          metodo_pagamento_real: string | null
          numero_fatura: string | null
          risco_analise_status: string | null
          status: string
          tentativas_pagamento: number | null
          updated_at: string | null
          valor: number
          visualizado_em: string | null
          webhook_logs: Json | null
        }
        Insert: {
          asaas_bank_slip_url?: string | null
          asaas_invoice_url?: string | null
          asaas_payment_id?: string | null
          asaas_pix_copy_paste?: string | null
          asaas_pix_qr_code?: string | null
          chargeback_status?: string | null
          cliente_id?: string | null
          consultora_id: string
          contrato_id?: string | null
          created_at?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_pagamento_antecipado?: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          metodo_pagamento_real?: string | null
          numero_fatura?: string | null
          risco_analise_status?: string | null
          status?: string
          tentativas_pagamento?: number | null
          updated_at?: string | null
          valor: number
          visualizado_em?: string | null
          webhook_logs?: Json | null
        }
        Update: {
          asaas_bank_slip_url?: string | null
          asaas_invoice_url?: string | null
          asaas_payment_id?: string | null
          asaas_pix_copy_paste?: string | null
          asaas_pix_qr_code?: string | null
          chargeback_status?: string | null
          cliente_id?: string | null
          consultora_id?: string
          contrato_id?: string | null
          created_at?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_pagamento_antecipado?: string | null
          data_vencimento?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          metodo_pagamento_real?: string | null
          numero_fatura?: string | null
          risco_analise_status?: string | null
          status?: string
          tentativas_pagamento?: number | null
          updated_at?: string | null
          valor?: number
          visualizado_em?: string | null
          webhook_logs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_financeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      intervencoes: {
        Row: {
          anexos: Json | null
          categoria: string
          cliente_id: string | null
          consultora_id: string
          created_at: string
          custo_estimado: number | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          duracao_estimada: number | null
          id: string
          participantes: string[] | null
          prioridade: string
          progresso: number | null
          responsavel: string | null
          resultados_esperados: string | null
          resultados_obtidos: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          anexos?: Json | null
          categoria: string
          cliente_id?: string | null
          consultora_id: string
          created_at?: string
          custo_estimado?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          participantes?: string[] | null
          prioridade?: string
          progresso?: number | null
          responsavel?: string | null
          resultados_esperados?: string | null
          resultados_obtidos?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          anexos?: Json | null
          categoria?: string
          cliente_id?: string | null
          consultora_id?: string
          created_at?: string
          custo_estimado?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          participantes?: string[] | null
          prioridade?: string
          progresso?: number | null
          responsavel?: string | null
          resultados_esperados?: string | null
          resultados_obtidos?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intervencoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      intervencoes_progresso: {
        Row: {
          anexos: Json | null
          autor_id: string
          created_at: string
          descricao: string
          id: string
          intervencao_id: string
          progresso_anterior: number | null
          progresso_novo: number | null
          tipo: string
        }
        Insert: {
          anexos?: Json | null
          autor_id: string
          created_at?: string
          descricao: string
          id?: string
          intervencao_id: string
          progresso_anterior?: number | null
          progresso_novo?: number | null
          tipo?: string
        }
        Update: {
          anexos?: Json | null
          autor_id?: string
          created_at?: string
          descricao?: string
          id?: string
          intervencao_id?: string
          progresso_anterior?: number | null
          progresso_novo?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "intervencoes_progresso_intervencao_id_fkey"
            columns: ["intervencao_id"]
            isOneToOne: false
            referencedRelation: "intervencoes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_anotacoes: {
        Row: {
          autor_id: string
          created_at: string | null
          id: string
          lead_id: string
          texto: string
        }
        Insert: {
          autor_id: string
          created_at?: string | null
          id?: string
          lead_id: string
          texto: string
        }
        Update: {
          autor_id?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_anotacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_contatos: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string | null
          email: string | null
          id: string
          lead_id: string
          nome: string
          principal: boolean | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_id: string
          nome: string
          principal?: boolean | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_id?: string
          nome?: string
          principal?: boolean | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_contatos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_diagnostico: {
        Row: {
          cargo: string | null
          categoria: string
          cliente_id: string | null
          colaboradores: number | null
          consultora_id: string
          contatado_em: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          origem: string
          prioridade: string | null
          proximo_followup: string | null
          resposta_id: string | null
          score: number
          status_crm: string
          tags: string[] | null
          telefone: string | null
          tipo: string | null
          ultima_interacao: string | null
          ultimo_contato: string | null
          valor_potencial: number | null
        }
        Insert: {
          cargo?: string | null
          categoria: string
          cliente_id?: string | null
          colaboradores?: number | null
          consultora_id: string
          contatado_em?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          origem: string
          prioridade?: string | null
          proximo_followup?: string | null
          resposta_id?: string | null
          score: number
          status_crm?: string
          tags?: string[] | null
          telefone?: string | null
          tipo?: string | null
          ultima_interacao?: string | null
          ultimo_contato?: string | null
          valor_potencial?: number | null
        }
        Update: {
          cargo?: string | null
          categoria?: string
          cliente_id?: string | null
          colaboradores?: number | null
          consultora_id?: string
          contatado_em?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string
          prioridade?: string | null
          proximo_followup?: string | null
          resposta_id?: string | null
          score?: number
          status_crm?: string
          tags?: string[] | null
          telefone?: string | null
          tipo?: string | null
          ultima_interacao?: string | null
          ultimo_contato?: string | null
          valor_potencial?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_diagnostico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_diagnostico_consultora_id_fkey"
            columns: ["consultora_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_diagnostico_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: true
            referencedRelation: "respostas_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_historico: {
        Row: {
          created_at: string | null
          data: string | null
          descricao: string
          id: string
          lead_id: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          descricao: string
          id?: string
          lead_id: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          data?: string | null
          descricao?: string
          id?: string
          lead_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_historico_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_interacoes: {
        Row: {
          created_at: string | null
          criado_por: string
          data_interacao: string
          descricao: string | null
          duracao: number | null
          id: string
          lead_id: string
          proximos_passos: string | null
          resultado: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          criado_por: string
          data_interacao?: string
          descricao?: string | null
          duracao?: number | null
          id?: string
          lead_id: string
          proximos_passos?: string | null
          resultado?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          criado_por?: string
          data_interacao?: string
          descricao?: string | null
          duracao?: number | null
          id?: string
          lead_id?: string
          proximos_passos?: string | null
          resultado?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_interacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          cliente_id: string | null
          consultora_id: string
          created_at: string | null
          data_fechamento_prevista: string | null
          data_fechamento_real: string | null
          descricao: string | null
          estagio: string
          id: string
          lead_id: string | null
          motivo_perda: string | null
          origem: string | null
          probabilidade: number | null
          tags: string[] | null
          titulo: string
          updated_at: string | null
          valor_estimado: number | null
        }
        Insert: {
          cliente_id?: string | null
          consultora_id: string
          created_at?: string | null
          data_fechamento_prevista?: string | null
          data_fechamento_real?: string | null
          descricao?: string | null
          estagio?: string
          id?: string
          lead_id?: string | null
          motivo_perda?: string | null
          origem?: string | null
          probabilidade?: number | null
          tags?: string[] | null
          titulo: string
          updated_at?: string | null
          valor_estimado?: number | null
        }
        Update: {
          cliente_id?: string | null
          consultora_id?: string
          created_at?: string | null
          data_fechamento_prevista?: string | null
          data_fechamento_real?: string | null
          descricao?: string | null
          estagio?: string
          id?: string
          lead_id?: string | null
          motivo_perda?: string | null
          origem?: string | null
          probabilidade?: number | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          asaas_payment_id: string | null
          asaas_transaction_id: string | null
          comprovante_url: string | null
          consultora_id: string
          created_at: string | null
          data_pagamento: string
          fatura_id: string
          forma_pagamento: string
          id: string
          observacoes: string | null
          valor_pago: number
        }
        Insert: {
          asaas_payment_id?: string | null
          asaas_transaction_id?: string | null
          comprovante_url?: string | null
          consultora_id: string
          created_at?: string | null
          data_pagamento?: string
          fatura_id: string
          forma_pagamento: string
          id?: string
          observacoes?: string | null
          valor_pago: number
        }
        Update: {
          asaas_payment_id?: string | null
          asaas_transaction_id?: string | null
          comprovante_url?: string | null
          consultora_id?: string
          created_at?: string | null
          data_pagamento?: string
          fatura_id?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfil_publico_analytics: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          origem: string | null
          perfil_publico_id: string
          tipo_evento: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          origem?: string | null
          perfil_publico_id: string
          tipo_evento: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          origem?: string | null
          perfil_publico_id?: string
          tipo_evento?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfil_publico_analytics_perfil_publico_id_fkey"
            columns: ["perfil_publico_id"]
            isOneToOne: false
            referencedRelation: "perfis_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfil_publico_analytics_consolidado: {
        Row: {
          created_at: string
          data: string
          id: string
          taxa_conversao_media: number | null
          total_cliques_cta: number | null
          total_diagnosticos_iniciados: number | null
          total_leads_capturados: number | null
          total_perfis_ativos: number | null
          total_visualizacoes: number | null
          whitelabel_id: string | null
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          taxa_conversao_media?: number | null
          total_cliques_cta?: number | null
          total_diagnosticos_iniciados?: number | null
          total_leads_capturados?: number | null
          total_perfis_ativos?: number | null
          total_visualizacoes?: number | null
          whitelabel_id?: string | null
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          taxa_conversao_media?: number | null
          total_cliques_cta?: number | null
          total_diagnosticos_iniciados?: number | null
          total_leads_capturados?: number | null
          total_perfis_ativos?: number | null
          total_visualizacoes?: number | null
          whitelabel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfil_publico_analytics_consolidado_whitelabel_id_fkey"
            columns: ["whitelabel_id"]
            isOneToOne: false
            referencedRelation: "configuracoes_whitelabel"
            referencedColumns: ["id"]
          },
        ]
      }
      perfil_publico_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          mensagem: string | null
          metadata: Json | null
          nome: string
          origem: string
          perfil_publico_id: string
          questionario_id: string | null
          resposta_id: string | null
          status: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          mensagem?: string | null
          metadata?: Json | null
          nome: string
          origem?: string
          perfil_publico_id: string
          questionario_id?: string | null
          resposta_id?: string | null
          status?: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          mensagem?: string | null
          metadata?: Json | null
          nome?: string
          origem?: string
          perfil_publico_id?: string
          questionario_id?: string | null
          resposta_id?: string | null
          status?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfil_publico_leads_perfil_publico_id_fkey"
            columns: ["perfil_publico_id"]
            isOneToOne: false
            referencedRelation: "perfis_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_publico_leads_questionario_id_fkey"
            columns: ["questionario_id"]
            isOneToOne: false
            referencedRelation: "questionarios_diagnostico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_publico_leads_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: false
            referencedRelation: "respostas_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      perfil_publico_planos: {
        Row: {
          analytics_avancado: boolean | null
          ativo: boolean | null
          created_at: string
          descricao: string | null
          dominio_customizado: boolean | null
          features: Json
          id: string
          max_depoimentos: number | null
          max_portfolio_imagens: number | null
          max_servicos: number | null
          nome: string
          ordem: number | null
          preco_mensal: number
          remover_marca: boolean | null
          suporte_prioritario: boolean | null
        }
        Insert: {
          analytics_avancado?: boolean | null
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          dominio_customizado?: boolean | null
          features?: Json
          id?: string
          max_depoimentos?: number | null
          max_portfolio_imagens?: number | null
          max_servicos?: number | null
          nome: string
          ordem?: number | null
          preco_mensal?: number
          remover_marca?: boolean | null
          suporte_prioritario?: boolean | null
        }
        Update: {
          analytics_avancado?: boolean | null
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          dominio_customizado?: boolean | null
          features?: Json
          id?: string
          max_depoimentos?: number | null
          max_portfolio_imagens?: number | null
          max_servicos?: number | null
          nome?: string
          ordem?: number | null
          preco_mensal?: number
          remover_marca?: boolean | null
          suporte_prioritario?: boolean | null
        }
        Relationships: []
      }
      perfis_publicos: {
        Row: {
          ativo: boolean | null
          beneficios: Json | null
          biografia: string | null
          created_at: string | null
          cta_flutuante_ativo: boolean | null
          cta_flutuante_link: string | null
          cta_flutuante_texto: string | null
          cta_hero_link: string | null
          cta_hero_texto: string | null
          cta_intermediario_botao_link: string | null
          cta_intermediario_botao_texto: string | null
          cta_intermediario_subtitulo: string | null
          cta_intermediario_titulo: string | null
          cta_rodape_botao_link: string | null
          cta_rodape_botao_texto: string | null
          cta_rodape_texto: string | null
          especialidades: Json | null
          estatisticas: Json | null
          facebook_domain_verification: string | null
          facebook_pixel_id: string | null
          faqs: Json | null
          favicon_url: string | null
          footer_texto_sobre: string | null
          foto_capa: string | null
          foto_perfil: string | null
          google_analytics_id: string | null
          gtm_id: string | null
          id: string
          imagem_hero_url: string | null
          instagram: string | null
          linkedin: string | null
          meta_capi_access_token: string | null
          mostrar_secao_conteudos: boolean | null
          navbar_cta_link: string | null
          navbar_cta_texto: string | null
          navbar_menu_items: Json | null
          plano_expira_em: string | null
          plano_id: string | null
          processo_trabalho: Json | null
          secoes_config: Json | null
          seo_descricao: string | null
          seo_palavras_chave: string[] | null
          seo_titulo: string | null
          site: string | null
          slug: string
          subtitulo_hero: string | null
          tema_cor_primaria: string | null
          tema_cor_secundaria: string | null
          tema_fonte: string | null
          titulo_hero: string | null
          titulo_profissional: string | null
          updated_at: string | null
          user_id: string
          whatsapp: string | null
          whitelabel_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          beneficios?: Json | null
          biografia?: string | null
          created_at?: string | null
          cta_flutuante_ativo?: boolean | null
          cta_flutuante_link?: string | null
          cta_flutuante_texto?: string | null
          cta_hero_link?: string | null
          cta_hero_texto?: string | null
          cta_intermediario_botao_link?: string | null
          cta_intermediario_botao_texto?: string | null
          cta_intermediario_subtitulo?: string | null
          cta_intermediario_titulo?: string | null
          cta_rodape_botao_link?: string | null
          cta_rodape_botao_texto?: string | null
          cta_rodape_texto?: string | null
          especialidades?: Json | null
          estatisticas?: Json | null
          facebook_domain_verification?: string | null
          facebook_pixel_id?: string | null
          faqs?: Json | null
          favicon_url?: string | null
          footer_texto_sobre?: string | null
          foto_capa?: string | null
          foto_perfil?: string | null
          google_analytics_id?: string | null
          gtm_id?: string | null
          id?: string
          imagem_hero_url?: string | null
          instagram?: string | null
          linkedin?: string | null
          meta_capi_access_token?: string | null
          mostrar_secao_conteudos?: boolean | null
          navbar_cta_link?: string | null
          navbar_cta_texto?: string | null
          navbar_menu_items?: Json | null
          plano_expira_em?: string | null
          plano_id?: string | null
          processo_trabalho?: Json | null
          secoes_config?: Json | null
          seo_descricao?: string | null
          seo_palavras_chave?: string[] | null
          seo_titulo?: string | null
          site?: string | null
          slug: string
          subtitulo_hero?: string | null
          tema_cor_primaria?: string | null
          tema_cor_secundaria?: string | null
          tema_fonte?: string | null
          titulo_hero?: string | null
          titulo_profissional?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
          whitelabel_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          beneficios?: Json | null
          biografia?: string | null
          created_at?: string | null
          cta_flutuante_ativo?: boolean | null
          cta_flutuante_link?: string | null
          cta_flutuante_texto?: string | null
          cta_hero_link?: string | null
          cta_hero_texto?: string | null
          cta_intermediario_botao_link?: string | null
          cta_intermediario_botao_texto?: string | null
          cta_intermediario_subtitulo?: string | null
          cta_intermediario_titulo?: string | null
          cta_rodape_botao_link?: string | null
          cta_rodape_botao_texto?: string | null
          cta_rodape_texto?: string | null
          especialidades?: Json | null
          estatisticas?: Json | null
          facebook_domain_verification?: string | null
          facebook_pixel_id?: string | null
          faqs?: Json | null
          favicon_url?: string | null
          footer_texto_sobre?: string | null
          foto_capa?: string | null
          foto_perfil?: string | null
          google_analytics_id?: string | null
          gtm_id?: string | null
          id?: string
          imagem_hero_url?: string | null
          instagram?: string | null
          linkedin?: string | null
          meta_capi_access_token?: string | null
          mostrar_secao_conteudos?: boolean | null
          navbar_cta_link?: string | null
          navbar_cta_texto?: string | null
          navbar_menu_items?: Json | null
          plano_expira_em?: string | null
          plano_id?: string | null
          processo_trabalho?: Json | null
          secoes_config?: Json | null
          seo_descricao?: string | null
          seo_palavras_chave?: string[] | null
          seo_titulo?: string | null
          site?: string | null
          slug?: string
          subtitulo_hero?: string | null
          tema_cor_primaria?: string | null
          tema_cor_secundaria?: string | null
          tema_fonte?: string | null
          titulo_hero?: string | null
          titulo_profissional?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
          whitelabel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_publicos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "perfil_publico_planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_publicos_whitelabel_id_fkey"
            columns: ["whitelabel_id"]
            isOneToOne: false
            referencedRelation: "configuracoes_whitelabel"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_imagens: {
        Row: {
          categoria: string | null
          created_at: string | null
          descricao: string | null
          destaque: boolean | null
          id: string
          imagem_url: string
          ordem: number | null
          perfil_publico_id: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_url: string
          ordem?: number | null
          perfil_publico_id: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_url?: string
          ordem?: number | null
          perfil_publico_id?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_imagens_perfil_publico_id_fkey"
            columns: ["perfil_publico_id"]
            isOneToOne: false
            referencedRelation: "perfis_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          anos_experiencia: number | null
          area_atuacao: string | null
          avatar_url: string | null
          bio: string | null
          cargo: string | null
          company: string | null
          created_at: string
          crp: string | null
          empresa_endereco: string | null
          empresa_setor: string | null
          empresa_tamanho: string | null
          id: string
          name: string
          phone: string | null
          smtp_app_password: string | null
          smtp_email: string | null
          updated_at: string
        }
        Insert: {
          anos_experiencia?: number | null
          area_atuacao?: string | null
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          company?: string | null
          created_at?: string
          crp?: string | null
          empresa_endereco?: string | null
          empresa_setor?: string | null
          empresa_tamanho?: string | null
          id: string
          name: string
          phone?: string | null
          smtp_app_password?: string | null
          smtp_email?: string | null
          updated_at?: string
        }
        Update: {
          anos_experiencia?: number | null
          area_atuacao?: string | null
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          company?: string | null
          created_at?: string
          crp?: string | null
          empresa_endereco?: string | null
          empresa_setor?: string | null
          empresa_tamanho?: string | null
          id?: string
          name?: string
          phone?: string | null
          smtp_app_password?: string | null
          smtp_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          cliente_id: string
          consultora_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          nome: string
          participantes_responderam: number | null
          participantes_total: number | null
          prioridade: string | null
          progresso: number | null
          status: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          consultora_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          nome: string
          participantes_responderam?: number | null
          participantes_total?: number | null
          prioridade?: string | null
          progresso?: number | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          consultora_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          nome?: string
          participantes_responderam?: number | null
          participantes_total?: number | null
          prioridade?: string | null
          progresso?: number | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      questionarios_diagnostico: {
        Row: {
          ativo: boolean | null
          categoria: string
          cliente_id: string | null
          configuracoes: Json | null
          consultora_id: string
          created_at: string | null
          descricao: string | null
          id: string
          leads_gerados: number | null
          perfil_publico_id: string | null
          slug: string
          tempo_estimado: number | null
          titulo: string
          total_questoes: number | null
          total_respostas: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          cliente_id?: string | null
          configuracoes?: Json | null
          consultora_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          leads_gerados?: number | null
          perfil_publico_id?: string | null
          slug: string
          tempo_estimado?: number | null
          titulo: string
          total_questoes?: number | null
          total_respostas?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          cliente_id?: string | null
          configuracoes?: Json | null
          consultora_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          leads_gerados?: number | null
          perfil_publico_id?: string | null
          slug?: string
          tempo_estimado?: number | null
          titulo?: string
          total_questoes?: number | null
          total_respostas?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionarios_diagnostico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionarios_diagnostico_consultora_id_fkey"
            columns: ["consultora_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionarios_diagnostico_perfil_publico_id_fkey"
            columns: ["perfil_publico_id"]
            isOneToOne: false
            referencedRelation: "perfis_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes_diagnostico: {
        Row: {
          created_at: string | null
          id: string
          obrigatoria: boolean | null
          opcoes: Json | null
          ordem: number
          peso: number | null
          questionario_id: string
          texto: string
          tipo: Database["public"]["Enums"]["questao_tipo"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          obrigatoria?: boolean | null
          opcoes?: Json | null
          ordem: number
          peso?: number | null
          questionario_id: string
          texto: string
          tipo: Database["public"]["Enums"]["questao_tipo"]
        }
        Update: {
          created_at?: string | null
          id?: string
          obrigatoria?: boolean | null
          opcoes?: Json | null
          ordem?: number
          peso?: number | null
          questionario_id?: string
          texto?: string
          tipo?: Database["public"]["Enums"]["questao_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "questoes_diagnostico_questionario_id_fkey"
            columns: ["questionario_id"]
            isOneToOne: false
            referencedRelation: "questionarios_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_roi: {
        Row: {
          consultora_id: string
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          investimento: number | null
          leads_gerados: number | null
          metricas_detalhadas: Json | null
          questionario_id: string
          retorno_estimado: number | null
          roi_percentual: number | null
          taxa_conversao: number | null
          total_respostas: number | null
        }
        Insert: {
          consultora_id: string
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          investimento?: number | null
          leads_gerados?: number | null
          metricas_detalhadas?: Json | null
          questionario_id: string
          retorno_estimado?: number | null
          roi_percentual?: number | null
          taxa_conversao?: number | null
          total_respostas?: number | null
        }
        Update: {
          consultora_id?: string
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          investimento?: number | null
          leads_gerados?: number | null
          metricas_detalhadas?: Json | null
          questionario_id?: string
          retorno_estimado?: number | null
          roi_percentual?: number | null
          taxa_conversao?: number | null
          total_respostas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_roi_consultora_id_fkey"
            columns: ["consultora_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_roi_questionario_id_fkey"
            columns: ["questionario_id"]
            isOneToOne: false
            referencedRelation: "questionarios_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_diagnostico: {
        Row: {
          analise_completa: Json | null
          categoria: string | null
          data_fim: string | null
          data_inicio: string | null
          email: string
          id: string
          ip_address: string | null
          nome: string
          origem: string | null
          questionario_id: string
          respostas: Json
          score_total: number | null
          status: string
          telefone: string | null
          tempo_resposta: number | null
          user_agent: string | null
        }
        Insert: {
          analise_completa?: Json | null
          categoria?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          email: string
          id?: string
          ip_address?: string | null
          nome: string
          origem?: string | null
          questionario_id: string
          respostas?: Json
          score_total?: number | null
          status?: string
          telefone?: string | null
          tempo_resposta?: number | null
          user_agent?: string | null
        }
        Update: {
          analise_completa?: Json | null
          categoria?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          nome?: string
          origem?: string | null
          questionario_id?: string
          respostas?: Json
          score_total?: number | null
          status?: string
          telefone?: string | null
          tempo_resposta?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_diagnostico_questionario_id_fkey"
            columns: ["questionario_id"]
            isOneToOne: false
            referencedRelation: "questionarios_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos_publicos: {
        Row: {
          created_at: string | null
          descricao: string | null
          duracao: number | null
          icone: string | null
          id: string
          modalidade: string | null
          ordem: number | null
          perfil_publico_id: string
          preco: number | null
          titulo: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          duracao?: number | null
          icone?: string | null
          id?: string
          modalidade?: string | null
          ordem?: number | null
          perfil_publico_id: string
          preco?: number | null
          titulo: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          duracao?: number | null
          icone?: string | null
          id?: string
          modalidade?: string | null
          ordem?: number | null
          perfil_publico_id?: string
          preco?: number | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_publicos_perfil_publico_id_fkey"
            columns: ["perfil_publico_id"]
            isOneToOne: false
            referencedRelation: "perfis_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          organization_id: string
          role: string
          status: string | null
          token: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          organization_id: string
          role: string
          status?: string | null
          token?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          status?: string | null
          token?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_eventos_passados: { Args: never; Returns: undefined }
      atualizar_faturas_vencidas: { Args: never; Returns: undefined }
      atualizar_faturas_vencidas_com_alertas: {
        Args: never
        Returns: undefined
      }
      avaliacao_permite_auto_identificacao: {
        Args: { p_avaliacao_id: string }
        Returns: boolean
      }
      avaliacao_permite_resposta_publica: {
        Args: { p_avaliacao_id: string }
        Returns: boolean
      }
      calcular_metricas_financeiras: {
        Args: {
          _consultora_id: string
          _data_fim?: string
          _data_inicio?: string
        }
        Returns: {
          faturas_atrasadas: number
          faturas_pagas: number
          faturas_pendentes: number
          receita_atrasada: number
          receita_pendente: number
          receita_total: number
          taxa_inadimplencia: number
          ticket_medio: number
          total_faturas: number
        }[]
      }
      can_impersonate: {
        Args: { admin_user_id: string; target_user_id: string }
        Returns: boolean
      }
      consolidar_analytics_diario: { Args: never; Returns: undefined }
      generate_avaliacao_slug:
        | { Args: { titulo: string }; Returns: string }
        | {
            Args: { p_consultora_id?: string; titulo: string }
            Returns: string
          }
      generate_perfil_slug: { Args: { nome: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_users_for_impersonation: {
        Args: never
        Returns: {
          avatar_url: string
          company: string
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      inserir_resposta_publica: {
        Args: {
          p_analise_completa?: Json
          p_categoria?: string
          p_email: string
          p_nome: string
          p_origem?: string
          p_questionario_id: string
          p_respostas?: Json
          p_score_total?: number
          p_status?: string
          p_telefone?: string
        }
        Returns: Json
      }
      questionario_permite_resposta_publica: {
        Args: { p_questionario_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "consultora" | "gestor" | "admin"
      avaliacao_status: "rascunho" | "ativa" | "pausada" | "finalizada"
      questao_tipo: "multipla_escolha" | "escala" | "texto_livre" | "sim_nao"
      tipo_acesso_avaliacao: "publico" | "restrito"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["consultora", "gestor", "admin"],
      avaliacao_status: ["rascunho", "ativa", "pausada", "finalizada"],
      questao_tipo: ["multipla_escolha", "escala", "texto_livre", "sim_nao"],
      tipo_acesso_avaliacao: ["publico", "restrito"],
    },
  },
} as const
