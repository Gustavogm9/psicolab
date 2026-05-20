import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const MIGRACAO_DIR = 'c:/Users/gusta/OneDrive/Documentos/GitHub/psicolab/migracao_dados';
const STORAGE_DIR = path.join(MIGRACAO_DIR, 'storage');

// Configurações do Supabase de Destino
const supabaseUrl = process.env.DESTINO_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.DESTINO_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: DESTINO_SUPABASE_URL e DESTINO_SUPABASE_SERVICE_ROLE_KEY precisam estar configurados no arquivo .env!');
  process.exit(1);
}

// Instanciar o cliente Supabase com a chave master de administração (service role)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Lista de buckets necessários
const BUCKETS = ['marca-logos', 'intervencoes-anexos', 'perfil-imagens', 'portfolio-images'];

async function garantirBuckets() {
  console.log('🔄 Garantindo que todos os buckets de storage existam no Supabase de destino...');
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`Erro ao listar buckets: ${error.message}`);
  }

  const bucketNames = buckets.map(b => b.name);

  for (const bucketName of BUCKETS) {
    if (!bucketNames.includes(bucketName)) {
      console.log(`➕ Criando bucket público: ${bucketName}...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 10485760 // 10MB
      });
      if (createError) {
        console.error(`❌ Erro ao criar bucket ${bucketName}:`, createError.message);
      } else {
        console.log(`✔️ Bucket ${bucketName} criado e configurado como Público!`);
      }
    } else {
      console.log(`✔️ Bucket ${bucketName} já existe.`);
    }
  }
}

// Mapeamento dos arquivos físicos e seus destinos inferidos com base na auditoria
const FILE_TARGET_MAPPING = {
  // marca-logos
  '1763765896249.png': 'cad3eb84-a3ad-4f90-a9c4-c7f9ffdf87af/1763765896249.png',
  '1764417326939.png': 'f2a5b9f7-815e-487a-adf6-72ff0e4064dd/1764417326939.png',
  '1765303082296.jpeg': '930c44b5-3b73-4770-a9af-ac72471c65cc/1765303082296.jpeg',

  // intervencoes-anexos
  '1762779393495-lx7nwf.png': 'b990df2a-604e-41cd-a3b4-31844fc4035e/temp/1762779393495-lx7nwf.png',
  '1762789810729-9qgm7j.jpeg': 'b990df2a-604e-41cd-a3b4-31844fc4035e/temp/1762789810729-9qgm7j.jpeg',

  // perfil-imagens
  '5e200087-a353-4237-a68c-d2622a67cac3-favicon-1764419999349.png': '111acd18-b72f-4cbe-973e-c40a4c48c896/5e200087-a353-4237-a68c-d2622a67cac3-favicon-1764419999349.png',
  '5e200087-a353-4237-a68c-d2622a67cac3-capa-1764420759207.png': 'f2a5b9f7-815e-487a-adf6-72ff0e4064dd/5e200087-a353-4237-a68c-d2622a67cac3-capa-1764420759207.png',
  '5e200087-a353-4237-a68c-d2622a67cac3-perfil-1764419505465.png': 'f2a5b9f7-815e-487a-adf6-72ff0e4064dd/5e200087-a353-4237-a68c-d2622a67cac3-perfil-1764419505465.png',
  '5e200087-a353-4237-a68c-d2622a67cac3-hero-1766146631893.jpg': 'f2a5b9f7-815e-487a-adf6-72ff0e4064dd/5e200087-a353-4237-a68c-d2622a67cac3-hero-1766146631893.jpg',
  '17df36a9-2e4e-4e38-842a-9835d291a8cd-capa-1763767640547.png': 'cad3eb84-a3ad-4f90-a9c4-c7f9ffdf87af/17df36a9-2e4e-4e38-842a-9835d291a8cd-capa-1763767640547.png',
  '17df36a9-2e4e-4e38-842a-9835d291a8cd-hero-1763767276865.png': 'cad3eb84-a3ad-4f90-a9c4-c7f9ffdf87af/17df36a9-2e4e-4e38-842a-9835d291a8cd-hero-1763767276865.png',
  '17df36a9-2e4e-4e38-842a-9835d291a8cd-perfil-1763767628518.png': 'cad3eb84-a3ad-4f90-a9c4-c7f9ffdf87af/17df36a9-2e4e-4e38-842a-9835d291a8cd-perfil-1763767628518.png',

  // portfolio-images
  '1763767504502.jpg': 'cad3eb84-a3ad-4f90-a9c4-c7f9ffdf87af/1763767504502.jpg',
  '1763767518868.jpg': 'cad3eb84-a3ad-4f90-a9c4-c7f9ffdf87af/1763767518868.jpg'
};

async function migrarArquivos() {
  console.log('\n🔄 Iniciando upload de arquivos de mídia...');

  if (!fs.existsSync(STORAGE_DIR)) {
    console.error('❌ Diretório storage/ não encontrado localmente!');
    return;
  }

  const folders = fs.readdirSync(STORAGE_DIR);
  let uploadSuccessCount = 0;
  let uploadFailCount = 0;

  for (const folder of folders) {
    const folderPath = path.join(STORAGE_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    // Determinar o bucket de destino com base no nome da pasta
    let targetBucket = '';
    if (folder.includes('marca-logos')) targetBucket = 'marca-logos';
    else if (folder.includes('intervencoes-anexos')) targetBucket = 'intervencoes-anexos';
    else if (folder.includes('perfil-imagens')) targetBucket = 'perfil-imagens';
    else if (folder.includes('portfolio-images')) targetBucket = 'portfolio-images';

    if (!targetBucket) {
      console.log(`⚠️ Pasta desconhecida pulada: ${folder}`);
      continue;
    }

    const files = fs.readdirSync(folderPath);
    console.log(`\n📂 Processando pasta local: ${folder} -> Bucket: ${targetBucket} (${files.length} arquivos)`);

    for (const filename of files) {
      const filePath = path.join(folderPath, filename);
      if (!fs.statSync(filePath).isFile()) continue;

      // Determinar o subcaminho (path dentro do bucket)
      // Se tiver mapeado pela auditoria, usa o mapeamento exato (mantendo a árvore de pastas original).
      // Se for órfão, coloca direto na raiz ou usa o nome do arquivo para manter acessível.
      let targetPath = FILE_TARGET_MAPPING[filename];
      let isOrphan = false;

      if (!targetPath) {
        targetPath = filename; // Sobe na raiz do bucket
        isOrphan = true;
      }

      console.log(`  ⬆️ Enviando: ${filename} -> [${targetBucket}]/${targetPath} ${isOrphan ? '(Órfão - Raiz)' : ''}`);

      const fileBuffer = fs.readFileSync(filePath);
      
      // Upload do arquivo usando o SDK do Supabase
      const { data, error } = await supabase.storage
        .from(targetBucket)
        .upload(targetPath, fileBuffer, {
          upsert: true,
          contentType: getContentType(filename)
        });

      if (error) {
        console.error(`  ❌ Erro ao enviar ${filename}:`, error.message);
        uploadFailCount++;
      } else {
        console.log(`  ✔️ Sucesso!`);
        uploadSuccessCount++;
      }
    }
  }

  console.log('\n=== RESUMO DA MIGRAÇÃO DE STORAGE ===');
  console.log(`✔️ Arquivos enviados com sucesso: ${uploadSuccessCount}`);
  console.log(`❌ Falhas no upload: ${uploadFailCount}`);
  console.log('=====================================');
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.pdf': return 'application/pdf';
    case '.doc': return 'application/msword';
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default: return 'application/octet-stream';
  }
}

async function main() {
  try {
    await garantirBuckets();
    await migrarArquivos();
  } catch (error) {
    console.error('❌ Falha na migração:', error.message);
  }
}

main();
