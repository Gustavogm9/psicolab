import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase de Destino
const supabaseUrl = process.env.DESTINO_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.DESTINO_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: DESTINO_SUPABASE_URL e DESTINO_SUPABASE_SERVICE_ROLE_KEY precisam estar configurados no arquivo .env!');
  process.exit(1);
}

// Instanciar o cliente Supabase com service_role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function main() {
  console.log('🔄 Iniciando processo para forçar troca de senha de todos os usuários...');

  try {
    // 1. Listar todos os usuários existentes
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
      perPage: 1000
    });

    if (listError) {
      throw new Error(`Erro ao listar usuários: ${listError.message}`);
    }

    console.log(`👤 Encontrados ${users.length} usuários no sistema.`);

    let updatedCount = 0;

    for (const user of users) {
      console.log(`  🔄 Configurando flag para: ${user.email} (ID: ${user.id})...`);

      // 2. Atualizar user_metadata de cada um para incluir force_password_change: true
      const currentMetadata = user.user_metadata || {};
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...currentMetadata,
            force_password_change: true
          }
        }
      );

      if (error) {
        console.error(`  ❌ Erro ao atualizar usuário ${user.email}:`, error.message);
      } else {
        console.log(`  ✔️ Flag configurada com sucesso para ${user.email}!`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Processo concluído! ${updatedCount}/${users.length} usuários agora exigirão troca de senha no próximo acesso.`);
  } catch (error) {
    console.error('\n❌ Erro durante a execução do script:', error.message);
    process.exit(1);
  }
}

main();
