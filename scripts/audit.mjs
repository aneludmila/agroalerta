import {readFile} from 'node:fs/promises';
const files=JSON.parse(await readFile(new URL('../PUBLIC_FILES.json',import.meta.url),'utf8'));
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bgh[pousr]_[A-Za-z0-9]{20,}\b/,/\bgithub_pat_[A-Za-z0-9_]{30,}\b/,/\bAKIA[0-9A-Z]{16}\b/,/\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/,/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/];
let issues=0;
for(const file of files){if(file.split('/').some(part=>['.git','.openai','node_modules'].includes(part)||part==='.env'||part.startsWith('.env.'))||/\.(pem|key|p12|pfx)$|backup.*\.json$/.test(file)){console.error('Arquivo proibido na seleção pública:',file);issues++;continue;}const content=await readFile(new URL('../'+file,import.meta.url),'utf8');if(patterns.some(p=>p.test(content))){console.error('Possível segredo:',file);issues++;}}
if(issues)process.exit(1);console.log(`Auditoria aprovada: ${files.length} arquivos públicos; nenhum padrão de segredo detectado. Não substitui revisão humana.`);
