import fs from 'fs';
import path from 'path';

const MIGRACAO_DIR = 'c:/Users/gusta/OneDrive/Documentos/GitHub/psicolab/migracao_dados';
const STORAGE_DIR = path.join(MIGRACAO_DIR, 'storage');

async function runAudit() {
  console.log('=== INICIANDO AUDITORIA DE MIGRAÇÃO ===\n');

  // 1. Verificar se a pasta existe
  if (!fs.existsSync(MIGRACAO_DIR)) {
    console.error(`Erro: Diretório de migração não encontrado em: ${MIGRACAO_DIR}`);
    return;
  }

  // 2. Listar todos os arquivos CSV
  const files = fs.readdirSync(MIGRACAO_DIR);
  const csvFiles = files.filter(f => f.endsWith('.csv'));
  console.log(`Encontrados ${csvFiles.length} arquivos CSV para análise.`);

  // 3. Mapear arquivos físicos no Storage local
  console.log('\nMapeando arquivos físicos na pasta storage/...');
  const physicalFiles = []; // { name, size, localPath }
  
  if (fs.existsSync(STORAGE_DIR)) {
    const storageFolders = fs.readdirSync(STORAGE_DIR);
    for (const folder of storageFolders) {
      const folderPath = path.join(STORAGE_DIR, folder);
      const stat = fs.statSync(folderPath);
      if (stat.isDirectory()) {
        const filesInFolder = fs.readdirSync(folderPath);
        for (const file of filesInFolder) {
          const filePath = path.join(folderPath, file);
          const fileStat = fs.statSync(filePath);
          if (fileStat.isFile()) {
            physicalFiles.push({
              name: file,
              size: fileStat.size,
              localPath: filePath,
              folderName: folder
            });
          }
        }
      }
    }
  }
  
  console.log(`Encontrados ${physicalFiles.length} arquivos físicos no storage local.`);

  // 4. Buscar referências de URLs do Supabase nos CSVs
  console.log('\nAnalisando referências de mídia nos arquivos CSV...');
  const urlReferences = []; // { csvFile, lineNum, bucket, fullPath, filename, rawUrl }
  const legacySubdomainPattern = /https:\/\/([a-z0-9]+)\.supabase\.co\/storage\/v1\/object\/public\/([^"'}?\s;]+)/g;

  for (const csv of csvFiles) {
    const csvPath = path.join(MIGRACAO_DIR, csv);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      let match;
      // Reset regex index for safety
      legacySubdomainPattern.lastIndex = 0;
      
      while ((match = legacySubdomainPattern.exec(line)) !== null) {
        const subdomain = match[1];
        const fullPath = match[2]; // e.g. perfil-imagens/f2a5b9.../image.png
        
        // Separar o bucket do restante do caminho
        const pathParts = fullPath.split('/');
        const bucket = pathParts[0];
        const subPath = pathParts.slice(1).join('/');
        const filename = pathParts[pathParts.length - 1];

        urlReferences.push({
          csvFile: csv,
          lineNum: index + 1,
          subdomain,
          bucket,
          subPath,
          filename,
          rawUrl: match[0]
        });
      }
    });
  }

  console.log(`Encontradas ${urlReferences.length} referências de URLs de mídia nos CSVs.`);

  // 5. Cruzar dados
  console.log('\n=== REALIZANDO O DE/PARA E CRUSAMENTO DE DADOS ===');
  const auditReport = [];
  const foundPhysicalFiles = new Set();

  for (const ref of urlReferences) {
    // Tentar encontrar o arquivo físico que coincida com o nome do arquivo da URL
    // Como os arquivos locais estão flat, buscamos pelo nome exato do arquivo.
    const matches = physicalFiles.filter(pf => pf.name === ref.filename);
    
    if (matches.length > 0) {
      // Arquivo encontrado!
      matches.forEach(m => foundPhysicalFiles.add(m.localPath));
      auditReport.push({
        status: 'FOUND',
        csvFile: ref.csvFile,
        line: ref.lineNum,
        bucket: ref.bucket,
        targetSubPath: ref.subPath,
        filename: ref.filename,
        originalUrl: ref.rawUrl,
        localFolder: matches[0].folderName,
        localPath: matches[0].localPath,
        size: matches[0].size
      });
    } else {
      // Arquivo referenciado mas não encontrado fisicamente
      auditReport.push({
        status: 'MISSING',
        csvFile: ref.csvFile,
        line: ref.lineNum,
        bucket: ref.bucket,
        targetSubPath: ref.subPath,
        filename: ref.filename,
        originalUrl: ref.rawUrl,
        localFolder: null,
        localPath: null,
        size: null
      });
    }
  }

  // Identificar arquivos físicos que não estão referenciados pelas URLs padrão
  const orphanedFiles = physicalFiles.filter(pf => !foundPhysicalFiles.has(pf.localPath));

  // Verificar se os arquivos órfãos são citados como texto plano em algum CSV
  console.log('\nVerificando se arquivos órfãos são citados em texto plano nos CSVs...');
  const trulyOrphaned = [];
  const textReferenced = [];

  for (const pf of orphanedFiles) {
    let foundInText = false;
    let foundDetails = null;

    for (const csv of csvFiles) {
      const csvPath = path.join(MIGRACAO_DIR, csv);
      const content = fs.readFileSync(csvPath, 'utf-8');
      if (content.includes(pf.name)) {
        // Encontrar a linha
        const lines = content.split('\n');
        const lineIndex = lines.findIndex(l => l.includes(pf.name)) + 1;
        foundInText = true;
        foundDetails = { csvFile: csv, lineNum: lineIndex };
        break;
      }
    }

    if (foundInText) {
      textReferenced.push({
        file: pf,
        csvFile: foundDetails.csvFile,
        lineNum: foundDetails.lineNum
      });
      // Adicionar aos mapeados para não perdê-lo!
      // Vamos inferir o bucket pelo nome da pasta local
      let inferredBucket = 'desconhecido';
      if (pf.folderName.includes('perfil-imagens')) inferredBucket = 'perfil-imagens';
      else if (pf.folderName.includes('marca-logos')) inferredBucket = 'marca-logos';
      else if (pf.folderName.includes('portfolio-images')) inferredBucket = 'portfolio-images';
      else if (pf.folderName.includes('intervencoes-anexos')) inferredBucket = 'intervencoes-anexos';

      // Tentar descobrir o caminho original
      // Se está em texto plano no CSV, podemos extrair a linha do CSV para ver a URL ou caminho
      const csvPath = path.join(MIGRACAO_DIR, foundDetails.csvFile);
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.split('\n');
      const matchingLine = lines[foundDetails.lineNum - 1];
      
      // Tentar extrair um caminho com o nome do arquivo da linha
      const pathRegex = new RegExp(`([^"'}?\\s;]*/${pf.name})`);
      const pathMatch = matchingLine.match(pathRegex);
      const targetSubPath = pathMatch ? pathMatch[1] : `${pf.name}`;

      auditReport.push({
        status: 'FOUND',
        csvFile: foundDetails.csvFile,
        line: foundDetails.lineNum,
        bucket: inferredBucket,
        targetSubPath: targetSubPath.includes('/') ? targetSubPath.split('/').slice(1).join('/') : targetSubPath,
        filename: pf.name,
        originalUrl: 'Referência em texto plano',
        localFolder: pf.folderName,
        localPath: pf.localPath,
        size: pf.size
      });
      foundPhysicalFiles.add(pf.localPath);
    } else {
      trulyOrphaned.push(pf);
    }
  }

  // 6. Imprimir Relatório Consolidado
  console.log('\n=== RESULTADO DA AUDITORIA ===\n');
  
  const missing = auditReport.filter(r => r.status === 'MISSING');
  const found = auditReport.filter(r => r.status === 'FOUND');

  console.log(`✔️ Referências Encontradas e Mapeadas: ${found.length}`);
  console.log(`❌ Referências Faltantes (Orfãs no Banco): ${missing.length}`);
  console.log(`ℹ️ Arquivos Referenciados por Texto Plano (Recuperados): ${textReferenced.length}`);
  console.log(`⚠️ Arquivos Físicos Realmente Órfãos (Sem Nenhuma Referência): ${trulyOrphaned.length}\n`);

  if (missing.length > 0) {
    console.log('--- DETALHES DE ARQUIVOS FALTANTES ---');
    missing.forEach(m => {
      console.log(`- [${m.csvFile}:L${m.line}] Bucket: ${m.bucket} | Path Esperado: ${m.targetSubPath}`);
      console.log(`  URL: ${m.originalUrl}\n`);
    });
  }

  if (textReferenced.length > 0) {
    console.log('--- DETALHES DE ARQUIVOS EM TEXTO PLANO ---');
    textReferenced.forEach(tr => {
      console.log(`- [${tr.csvFile}:L${tr.lineNum}] File: ${tr.file.name} (${(tr.file.size / 1024).toFixed(1)} KB)`);
    });
    console.log('');
  }

  if (trulyOrphaned.length > 0) {
    console.log('--- DETALHES DE ARQUIVOS FÍSICOS REALMENTE ÓRFÃOS ---');
    trulyOrphaned.forEach(o => {
      console.log(`- Folder: ${o.folderName} | File: ${o.name} (${(o.size / 1024).toFixed(1)} KB)`);
    });
    console.log('');
  }

  // Listar arquivos físicos encontrados e para onde devem ir
  console.log('--- MAPEAMENTO DE CARGA (DE/PARA DE STORAGE) ---');
  const bucketMappings = {};
  found.forEach(f => {
    if (!bucketMappings[f.bucket]) {
      bucketMappings[f.bucket] = [];
    }
    bucketMappings[f.bucket].push({
      localFolder: f.localFolder,
      filename: f.filename,
      targetSubPath: f.targetSubPath
    });
  });

  for (const [bucket, files] of Object.entries(bucketMappings)) {
    console.log(`\nBucket: ${bucket} (${files.length} arquivos mapeados):`);
    // Mostrar os primeiros 5 exemplos
    files.slice(0, 5).forEach(f => {
      console.log(`  - [Local: ${f.localFolder}/${f.filename}] -> [Target Path: ${f.targetSubPath}]`);
    });
    if (files.length > 5) {
      console.log(`  ... e mais ${files.length - 5} arquivos.`);
    }
  }

  console.log('\n=======================================');
  console.log('Auditoria concluída com sucesso!');
}

runAudit().catch(console.error);
