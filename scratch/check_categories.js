import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['DESTINO_SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('categorias_customizadas')
    .select('*')
    .eq('tipo', 'avaliacao');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('--- ALL AVALIACAO CATEGORIES ---');
  data.forEach(cat => {
    console.log(`ID: ${cat.id} | Nome: ${cat.nome} | consultora_id: ${cat.consultora_id} | isSystem: ${!cat.consultora_id}`);
  });
}

run();
