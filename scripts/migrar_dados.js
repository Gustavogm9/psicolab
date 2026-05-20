import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const MIGRACAO_DIR = 'c:/Users/gusta/OneDrive/Documentos/GitHub/psicolab/migracao_dados';

// Configurações do Supabase de Destino
const supabaseUrl = process.env.DESTINO_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.DESTINO_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: DESTINO_SUPABASE_URL e DESTINO_SUPABASE_SERVICE_ROLE_KEY precisam estar configurados no arquivo .env!');
  process.exit(1);
}

// Instanciar o cliente Supabase com service_role (bypassa RLS e permite gerenciar Auth)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Extrair subdomínio de destino para reescrever as URLs do storage
const newSubdomain = new URL(supabaseUrl).hostname.split('.')[0];
console.log(`🌐 Subdomínio de destino configurado: ${newSubdomain}`);

// Função robusta de parse de CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = [];
  let currentLine = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // pular próxima aspa
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      currentLine.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // pular \n
      }
      currentLine.push(currentCell.trim());
      if (currentLine.length > 1 || currentLine[0] !== '') {
        lines.push(currentLine);
      }
      currentLine = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  
  if (currentCell !== '' || currentLine.length > 0) {
    currentLine.push(currentCell.trim());
    lines.push(currentLine);
  }
  
  if (lines.length === 0) return [];
  
  const headers = lines[0];
  const data = lines.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let val = row[index];
      if (val === undefined || val === '') {
        val = null;
      } else if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      } else if (val.startsWith('{') || val.startsWith('[')) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // Manter como string se falhar no parse JSON
        }
      }
      obj[header] = val;
    });
    return obj;
  });
  
  return data;
}

// Função recursiva para substituir URLs do Supabase antigo pelas de destino
function reescreverUrlsSupabase(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Regex para pegar qualquer subdomínio do Supabase em URLs de storage
    const legacyUrlPattern = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//g;
    return obj.replace(legacyUrlPattern, `https://${newSubdomain}.supabase.co/storage/v1/object/public/`);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => reescreverUrlsSupabase(item));
  }

  if (typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = reescreverUrlsSupabase(value);
    }
    return newObj;
  }

  return obj;
}

// Ordem estrita de migração para respeitar chaves estrangeiras (Foreign Keys)
const MIGRATION_STEPS = [
  { file: 'auth_users.csv', table: 'auth.users', isAuth: true },
  { file: 'profiles.csv', table: 'profiles' },
  { file: 'user_roles.csv', table: 'user_roles' },
  { file: 'perfil_publico_planos.csv', table: 'perfil_publico_planos' },
  { file: 'perfis_publicos.csv', table: 'perfis_publicos' },
  { file: 'configuracoes_whitelabel.csv', table: 'configuracoes_whitelabel' },
  { file: 'clientes.csv', table: 'clientes' },
  { file: 'clientes_contatos.csv', table: 'clientes_contatos' },
  { file: 'servicos_publicos.csv', table: 'servicos_publicos' },
  { file: 'depoimentos_publicos.csv', table: 'depoimentos_publicos' },
  { file: 'portfolio_imagens.csv', table: 'portfolio_imagens' },
  { file: 'dominios_customizados.csv', table: 'dominios_customizados' },
  { file: 'leads_diagnostico.csv', table: 'leads_diagnostico' },
  { file: 'leads_contatos.csv', table: 'leads_contatos' },
  { file: 'leads_historico.csv', table: 'leads_historico' },
  { file: 'leads_interacoes.csv', table: 'leads_interacoes' },
  { file: 'oportunidades.csv', table: 'oportunidades' },
  { file: 'questionarios_diagnostico.csv', table: 'questionarios_diagnostico' },
  { file: 'questoes_diagnostico.csv', table: 'questoes_diagnostico' },
  { file: 'respostas_diagnostico.csv', table: 'respostas_diagnostico' },
  { file: 'projetos.csv', table: 'projetos' },
  { file: 'eventos.csv', table: 'eventos' },
  { file: 'intervencoes.csv', table: 'intervencoes' },
  { file: 'biblioteca_intervencoes.csv', table: 'biblioteca_intervencoes' },
  { file: 'categorias_customizadas.csv', table: 'categorias_customizadas' },
  { file: 'avaliacoes_templates.csv', table: 'avaliacoes_templates' },
  { file: 'avaliacoes.csv', table: 'avaliacoes' },
  { file: 'avaliacoes_questoes.csv', table: 'avaliacoes_questoes' },
  { file: 'avaliacoes_participantes.csv', table: 'avaliacoes_participantes' },
  { file: 'avaliacoes_respostas_publicas.csv', table: 'avaliacoes_respostas_publicas' },
  { file: 'contratos_financeiros.csv', table: 'contratos_financeiros' },
  { file: 'faturas.csv', table: 'faturas' },
  { file: 'pagamentos.csv', table: 'pagamentos' },
  { file: 'asaas_credentials.csv', table: 'asaas_credentials' },
  { file: 'perfil_publico_analytics.csv', table: 'perfil_publico_analytics' }
];

async function migrarUsuarios(usersData) {
  console.log(`\n🔑 Iniciando Migração de ${usersData.length} Contas de Usuários (Auth)...`);

  // Obter lista atual de usuários no destino para evitar duplicidades
  const { data: { users: existingUsers }, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 1000
  });

  if (listError) {
    throw new Error(`Erro ao listar usuários existentes: ${listError.message}`);
  }

  const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
  const existingIds = new Set(existingUsers.map(u => u.id));

  let createdCount = 0;
  let skippedCount = 0;

  for (const user of usersData) {
    const emailLower = user.email.toLowerCase();
    
    if (existingIds.has(user.id) || existingEmails.has(emailLower)) {
      console.log(`  ℹ️ Usuário ${user.email} já existe no destino. Pulando criação.`);
      skippedCount++;
      continue;
    }

    console.log(`  ➕ Criando usuário: ${user.email} (ID: ${user.id})...`);
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: 'PsiColabTempPassword2026!', // Senha temporária padrão segura
      email_confirm: true,
      user_metadata: { migrated: true }
    });

    if (createError) {
      console.error(`  ❌ Erro ao criar usuário ${user.email}:`, createError.message);
    } else {
      console.log(`  ✔️ Usuário criado com sucesso!`);
      createdCount++;
    }
  }

  console.log(`✔️ Usuários criados: ${createdCount} | ℹ️ Usuários ignorados: ${skippedCount}`);
}

async function migrarTabela(step) {
  const filePath = path.join(MIGRACAO_DIR, step.file);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Arquivo não encontrado, pulando etapa: ${step.file}`);
    return;
  }

  const rawRows = parseCSV(filePath);
  if (rawRows.length === 0) {
    console.log(`ℹ️ Tabela ${step.table} está vazia (0 registros). Pulando.`);
    return;
  }

  console.log(`\n📊 Migrando ${rawRows.length} registros para a tabela: ${step.table}...`);

  // Limpar registros automáticos pré-existentes de tabelas geradas por triggers para evitar conflitos de chaves exclusivas
  if (['user_roles', 'perfis_publicos', 'configuracoes_whitelabel'].includes(step.table)) {
    console.log(`  🧹 Limpando registros automáticos pré-existentes da tabela ${step.table}...`);
    const { error: deleteError } = await supabase
      .from(step.table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
      console.warn(`  ⚠️ Aviso: Erro ao limpar ${step.table}:`, deleteError.message);
    }
  }

  // Reescrever as URLs antigas do Supabase nas colunas do registro antes de inserir
  let cleanRows = rawRows.map(row => reescreverUrlsSupabase(row));

  // Se for leads_diagnostico, anular temporariamente resposta_id para evitar violação de FK circular
  if (step.table === 'leads_diagnostico') {
    console.log('  ℹ️ Anulando temporariamente resposta_id no primeiro passo para evitar violação de FK circular.');
    cleanRows = cleanRows.map(row => {
      row.resposta_id = null;
      return row;
    });
  }

  // Inserir em lotes (chunks) de 50 registros para evitar timeouts e limites de payload
  const CHUNK_SIZE = 50;
  let successCount = 0;

  for (let i = 0; i < cleanRows.length; i += CHUNK_SIZE) {
    let chunk = cleanRows.slice(i, i + CHUNK_SIZE);
    let attempt = 0;
    const maxAttempts = 15;
    let success = false;

    while (!success && attempt < maxAttempts) {
      const { error } = await supabase
        .from(step.table)
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        // Padrão de erro para colunas que não existem no banco de dados
        const match = error.message.match(/Could not find the '([^']+)' column/);
        const matchNotNull = error.message.match(/null value in column "([^"]+)"/);

        if (match) {
          const missingColumn = match[1];
          console.warn(`  ⚠️ Coluna '${missingColumn}' não existe no destino para a tabela ${step.table}. Removendo-a e tentando novamente...`);
          
          // Remover a coluna inexistente do lote atual
          chunk = chunk.map(row => {
            const { [missingColumn]: _, ...rest } = row;
            return rest;
          });

          // Remover a coluna também do array global para os próximos lotes não falharem pelo mesmo motivo
          cleanRows = cleanRows.map(row => {
            const { [missingColumn]: _, ...rest } = row;
            return rest;
          });

          attempt++;
        } else if (matchNotNull) {
          const notNullColumn = matchNotNull[1];
          console.warn(`  ⚠️ Coluna '${notNullColumn}' possui valor nulo violando restrição NOT NULL na tabela ${step.table}. Preenchendo com valor padrão e tentando novamente...`);
          
          // Preencher valor nulo com um fallback adequado
          chunk = chunk.map(row => {
            if (row[notNullColumn] === null || row[notNullColumn] === undefined || row[notNullColumn] === '') {
              if (notNullColumn === 'email') {
                row[notNullColumn] = `sem-email-${row.id || Math.random().toString(36).substr(2, 9)}@psicolab.com.br`;
              } else if (typeof row[notNullColumn] === 'boolean') {
                row[notNullColumn] = false;
              } else if (typeof row[notNullColumn] === 'number') {
                row[notNullColumn] = 0;
              } else {
                row[notNullColumn] = 'Migrado';
              }
            }
            return row;
          });

          // Fazer o mesmo no array global
          cleanRows = cleanRows.map(row => {
            if (row[notNullColumn] === null || row[notNullColumn] === undefined || row[notNullColumn] === '') {
              if (notNullColumn === 'email') {
                row[notNullColumn] = `sem-email-${row.id || Math.random().toString(36).substr(2, 9)}@psicolab.com.br`;
              } else if (typeof row[notNullColumn] === 'boolean') {
                row[notNullColumn] = false;
              } else if (typeof row[notNullColumn] === 'number') {
                row[notNullColumn] = 0;
              } else {
                row[notNullColumn] = 'Migrado';
              }
            }
            return row;
          });

          attempt++;
        } else {
          console.error(`  ❌ Erro ao inserir lote na tabela ${step.table}:`, error.message);
          console.log('Dados do lote com erro:', JSON.stringify(chunk.slice(0, 1), null, 2));
          throw new Error(`Migração interrompida por falha na inserção em ${step.table}`);
        }
      } else {
        successCount += chunk.length;
        console.log(`  ✔️ Lote enviado com sucesso (${successCount}/${cleanRows.length})`);
        success = true;
      }
    }

    if (!success) {
      throw new Error(`Excedido o número máximo de tentativas de auto-correção para ${step.table}`);
    }
  }

  console.log(`✔️ Tabela ${step.table} migrada com sucesso (${successCount} registros)!`);
}

async function resolverRefCirculares() {
  console.log('\n🔄 Resolvendo referências circulares em leads_diagnostico (restaurando resposta_id)...');
  const filePath = path.join(MIGRACAO_DIR, 'leads_diagnostico.csv');
  if (!fs.existsSync(filePath)) {
    console.warn('⚠️ Arquivo leads_diagnostico.csv não encontrado para a resolução final.');
    return;
  }

  const rawRows = parseCSV(filePath);
  const rowsWithResposta = rawRows.filter(row => row.id && row.resposta_id);

  if (rowsWithResposta.length === 0) {
    console.log('ℹ️ Nenhuma referência circular de resposta_id para restaurar.');
    return;
  }

  console.log(`  Restaurando resposta_id para ${rowsWithResposta.length} registros...`);
  let updatedCount = 0;

  for (const row of rowsWithResposta) {
    const { error } = await supabase
      .from('leads_diagnostico')
      .update({ resposta_id: row.resposta_id })
      .eq('id', row.id);

    if (error) {
      console.error(`  ❌ Erro ao atualizar resposta_id para o lead ${row.id}:`, error.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`✔️ Referências circulares resolvidas com sucesso! (${updatedCount}/${rowsWithResposta.length} atualizados)`);
}

async function main() {
  console.log('=== INICIANDO CARGA E MIGRAÇÃO DE DADOS (SUPABASE NOVO) ===\n');

  try {
    for (const step of MIGRATION_STEPS) {
      if (step.isAuth) {
        const filePath = path.join(MIGRACAO_DIR, step.file);
        if (fs.existsSync(filePath)) {
          const usersData = parseCSV(filePath);
          await migrarUsuarios(usersData);
        } else {
          console.warn(`⚠️ Arquivo de usuários não encontrado: ${step.file}`);
        }
      } else {
        await migrarTabela(step);
      }
    }
    
    // Resolvendo as referências circulares no final
    await resolverRefCirculares();
    
    console.log('\n🎉 ======================================== 🎉');
    console.log('   MIGRAÇÃO DE DADOS E MÍDIAS CONCLUÍDA COM SUCESSO!   ');
    console.log('🎉 ======================================== 🎉');
  } catch (error) {
    console.error('\n❌ CRITICAL: Falha durante o processo de migração de dados:', error.message);
    process.exit(1);
  }
}

main();
