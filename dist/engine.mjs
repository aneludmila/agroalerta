export const DAY=86400000;
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Porto_Velho',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const epoch=d=>Date.parse(d+'T00:00:00Z');
export const dateValid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(epoch(d))&&new Date(epoch(d)).toISOString().slice(0,10)===d;
export const days=(a,b)=>Math.round((epoch(b)-epoch(a))/DAY);
export const shift=(d,n)=>new Date(epoch(d)+n*DAY).toISOString().slice(0,10);
export const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
export function analyze(db,asOf=today(),settings={window:30,urgent:7,expiry:30,excess:120}){
 const result=db.products.map(p=>{
 const ms=db.moves.filter(m=>m.productId===p.id&&m.date<=asOf);
 const lots=db.lots.filter(l=>l.productId===p.id).map(l=>({...l,balance:ms.filter(m=>m.lotId===l.id).reduce((s,m)=>s+(m.type==='entrada'?m.quantity:-m.quantity),0)}));
 const physical=lots.reduce((s,l)=>s+l.balance,0), usable=lots.filter(l=>!l.expiry||l.expiry>=asOf).reduce((s,l)=>s+Math.max(0,l.balance),0);
 const start=shift(asOf,-settings.window+1),prev=shift(start,-settings.window);
 const outs=ms.filter(m=>m.type==='saida'),recent=outs.filter(m=>m.date>=start),previous=outs.filter(m=>m.date>=prev&&m.date<start);
 const sum=a=>a.reduce((s,m)=>s+m.quantity,0),consumed=sum(recent),rate=consumed/settings.window;
 const first=ms.length?ms.map(m=>m.date).sort()[0]:asOf,historyDays=days(first,asOf)+1;
 const enough=historyDays>=settings.window&&recent.length>=3;
 const coverage=enough&&rate>0?usable/rate:null;
 const known=lots.filter(l=>l.balance>0&&l.price!==null),unknown=lots.filter(l=>l.balance>0&&l.price===null);
 const value=known.reduce((s,l)=>s+l.balance*l.price,0),alerts=[];
 const add=(priority,title,why,action,kind)=>alerts.push({priority,title,why,action,kind,productId:p.id});
 if(lots.some(l=>l.balance< -1e-8))add(0,'Saldo inconsistente','Há lote com saldo negativo. A cobertura pode estar incorreta.','Conferir importação e histórico.','data');
 if(usable<=0)add(0,'Sem estoque utilizável','O saldo disponível para uso é zero.','Planejar reposição e conferir os lotes.','shortage');
 else if(usable<=p.minimum)add(1,'Estoque abaixo do mínimo',`Saldo utilizável ${usable.toFixed(1)} ${p.unit}; mínimo ${p.minimum} ${p.unit}.`,'Avaliar reposição conforme as atividades previstas.','shortage');
 if(coverage!==null&&coverage<=settings.urgent)add(0,'Risco de falta',`Cobertura de ${coverage.toFixed(1)} dias, a ${rate.toFixed(2)} ${p.unit}/dia na janela de ${settings.window} dias.`,'Planejar compra e conferir prazo do fornecedor.','coverage');
 let ahead=0;
 for(const l of [...lots].filter(l=>l.balance>0).sort((a,b)=>(a.expiry||'9999').localeCompare(b.expiry||'9999'))){
 if(l.expiry&&l.expiry<asOf){add(0,'Lote vencido',`Lote ${l.code}: ${l.balance.toFixed(1)} ${p.unit}; validade ${l.expiry}.`,'Separar o lote e buscar orientação para destinação adequada.','expiry');continue;}
 if(l.expiry){const remaining=days(asOf,l.expiry);const projected=enough?Math.max(0,l.balance-Math.max(0,rate*remaining-ahead)):null;
 if(remaining<=settings.expiry||(projected!==null&&projected>0))add(remaining<=settings.urgent?0:1,'Risco de vencimento',`Lote ${l.code} vence em ${remaining} dias.${projected!==null?' Possível sobra: '+projected.toFixed(1)+' '+p.unit+'.':' Histórico insuficiente para prever a sobra.'}`,'Conferir planejamento de uso e necessidade de novas compras.','expiry');}
 ahead+=l.balance;
 }
 const before=sum(previous);
 if(historyDays>=settings.window*2&&before>0&&consumed>before*1.5)add(1,'Consumo crescente',`Consumo aumentou ${((consumed/before-1)*100).toFixed(0)}% entre duas janelas de ${settings.window} dias (${before.toFixed(1)} → ${consumed.toFixed(1)} ${p.unit}).`,'Conferir calendário de atividades e necessidade de reposição.','trend');
 for(const m of recent){const prior=outs.filter(x=>x.date<m.date&&x.date>=shift(m.date,-90)).map(x=>x.quantity).sort((a,b)=>a-b);if(prior.length>=5){const med=prior.length%2?prior[(prior.length-1)/2]:(prior[prior.length/2-1]+prior[prior.length/2])/2;if(m.quantity>med*3&&med>0)add(1,'Retirada fora do padrão',`${m.quantity} ${p.unit} em ${m.date}, acima de 3× a mediana histórica (${med} ${p.unit}).`,'Conferir quantidade, destino e responsável; pode ser uma retirada legítima.','anomaly');}}
 const last=outs.length?outs.map(m=>m.date).sort().at(-1):null;
 const idle=last?days(last,asOf):historyDays;
 if(coverage!==null&&coverage>settings.excess)add(2,'Possível excesso',`Cobertura estimada de ${coverage.toFixed(0)} dias, acima da referência de ${settings.excess} dias.`,'Revisar novas compras e necessidades sazonais.','excess');
 else if(usable>0&&idle>=60)add(2,'Produto parado',`Sem retiradas há ${idle} dias. Valor conhecido: R$ ${value.toFixed(2)}.`,'Conferir reserva de manutenção e planejamento sazonal.','idle');
 const prices=lots.filter(l=>l.price!==null&&l.price>0&&ms.some(m=>m.lotId===l.id&&m.type==='entrada')).sort((a,b)=>{const firstDate=l=>ms.filter(m=>m.lotId===l.id&&m.type==='entrada').map(m=>m.date).sort()[0];return firstDate(a).localeCompare(firstDate(b));});
 if(prices.length>=2){const a=prices.at(-2),b=prices.at(-1);if(b.price>a.price*1.2)add(2,'Preço de aquisição aumentou',`Custo unitário subiu ${((b.price/a.price-1)*100).toFixed(0)}% entre os lotes ${a.code} e ${b.code}.`,'Conferir equivalência dos lotes e comparar fornecedores.','price');}
 return {...p,lots,physical,usable,consumed,rate,coverage,historyDays,enough,value,unknown:unknown.length,alerts,priority:alerts.length?Math.min(...alerts.map(a=>a.priority)):3,outs,recent,idle};
 });
 return {products:result,alerts:result.flatMap(p=>p.alerts).sort((a,b)=>a.priority-b.priority),value:result.reduce((s,p)=>s+p.value,0),unknown:result.reduce((s,p)=>s+p.unknown,0)};
}
export function addMove(db,m){
 if(!dateValid(m.date)||m.date>today())throw Error('Use uma data válida, até hoje.');
 if(!['entrada','saida'].includes(m.type)||!Number.isFinite(m.quantity)||m.quantity<=0)throw Error('Quantidade deve ser maior que zero.');
 const p=db.products.find(p=>p.id===m.productId),l=db.lots.find(l=>l.id===m.lotId&&l.productId===m.productId);
 if(!p||!l)throw Error('Produto ou lote inválido.');
 const candidate={...db,moves:[...db.moves,m]};
 let balance=0;for(const x of candidate.moves.filter(x=>x.lotId===l.id).sort((a,b)=>a.date.localeCompare(b.date)||(a.type==='entrada'?-1:1))){balance+=x.type==='entrada'?x.quantity:-x.quantity;if(balance< -1e-8)throw Error('Esta movimentação deixa o lote negativo no histórico.');}
 if(m.type==='saida'&&l.expiry&&l.expiry<m.date)throw Error('Não é possível retirar um lote vencido.');
 db.moves.push(m);return db;
}
export function demo(asOf=today()){
 const db={version:1,source:'simulados',products:[],lots:[],moves:[]};
 const specs=[['Diesel S10','Combustíveis','L',50,580,6.2,null,10],['Ureia','Fertilizantes','kg',100,950,4.5,shift(asOf,18),8],['Sementes de milho','Sementes','kg',30,80,15,shift(asOf,-3),0],['Filtro de óleo','Peças','un',2,24,85,null,0],['Luvas de proteção','EPI','un',10,28,12,null,0.4],['Calcário dolomítico','Corretivos','kg',500,9000,0.45,null,12],['Mangueira de irrigação','Irrigação','m',20,400,null,null,2],['Trichoderma','Biológicos','L',5,60,95,shift(asOf,8),0.5]];
 specs.forEach((s,i)=>{const [name,category,unit,minimum,initial,price,expiry,daily]=s,id='p'+i,lotId='l'+i;db.products.push({id,name,category,unit,minimum});db.lots.push({id:lotId,productId:id,code:'L2026-'+(i+1),price,expiry});db.moves.push({id:'init'+i,productId:id,lotId,type:'entrada',date:shift(asOf,-60),quantity:initial,destination:'Estoque inicial',responsible:'Equipe demonstração'});if(daily)for(let d=49;d>=0;d-=5)db.moves.push({id:`m${i}-${d}`,productId:id,lotId,type:'saida',date:shift(asOf,-d),quantity:daily*5,destination:'Talhão 01',responsible:'Equipe demonstração'});});
 db.moves.push({id:'anomalia',productId:'p1',lotId:'l1',type:'saida',date:shift(asOf,-1),quantity:180,destination:'Talhão 02',responsible:'Equipe demonstração'});return db;
}
export function parseCSV(text){
 const clean=text.replace(/^\uFEFF/,'');const delim=clean.split(/\r?\n/)[0].includes(';')?';':',';const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<clean.length;i++){const c=clean[i];if(c==='"'){if(quoted&&clean[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===delim&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&clean[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('CSV com aspas sem fechamento.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);if(rows.length<2)throw Error('CSV deve conter cabeçalho e registros.');
 const keys=rows.shift().map(x=>norm(x));const required=['produto','categoria','unidade','minimo','lote','tipo','data','quantidade'];for(const k of required)if(!keys.includes(k))throw Error('Coluna obrigatória: '+k);
 return rows.map((r,i)=>{if(r.length!==keys.length)throw Error(`Linha ${i+2}: quantidade de colunas diferente do cabeçalho.`);return Object.fromEntries(keys.map((k,j)=>[k,r[j].trim()]));});
}
export function importRows(db,rows,source){
 const next=structuredClone(db);let imported=0,skipped=0;const warnings=[];
 const num=(s,nullable=false)=>{if(s===''||s==null){if(nullable)return null;throw Error('Campo numérico ausente.');}const n=Number(String(s).replace(',','.'));if(!Number.isFinite(n)||n<0)throw Error('Número inválido: '+s);return n;};
 rows.forEach((r,i)=>{try{if(!r.produto||!r.categoria||!r.unidade||!r.lote)throw Error('Produto, categoria, unidade e lote são obrigatórios.');if(!dateValid(r.data)||r.data>today())throw Error('Data inválida ou futura (use AAAA-MM-DD).');if(r.validade&&!dateValid(r.validade))throw Error('Validade inválida.');
 const minimum=num(r.minimo);let p=next.products.find(p=>norm(p.name)===norm(r.produto)&&norm(p.unit)===norm(r.unidade)&&norm(p.category)===norm(r.categoria));
 if(!p){p={id:crypto.randomUUID(),name:r.produto,category:r.categoria,unit:r.unidade,minimum};next.products.push(p);}else if(p.minimum!==minimum)throw Error('Estoque mínimo diverge do produto existente.');
 let l=next.lots.find(l=>l.productId===p.id&&norm(l.code)===norm(r.lote));const price=num(r.preco,true),expiry=r.validade||null;
 if(!l){l={id:crypto.randomUUID(),productId:p.id,code:r.lote,price,expiry};next.lots.push(l);}else if((price!==null&&l.price!==price)||(expiry!==null&&l.expiry!==expiry))throw Error('Preço ou validade diverge do lote existente. Use outro código de lote.');
 const m={id:r.id||crypto.randomUUID(),productId:p.id,lotId:l.id,type:norm(r.tipo),date:r.data,quantity:num(r.quantidade),destination:r.destino||'',responsible:r.responsavel||''};
 const sig=m=>[m.productId,m.lotId,m.type,m.date,m.quantity,m.destination,m.responsible].join('|');
 const sameId=next.moves.find(x=>x.id===m.id);if(sameId&&sig(sameId)!==sig(m))throw Error('ID já existe com conteúdo diferente.');
 if(sameId||(!r.id&&next.moves.some(x=>sig(x)===sig(m)))){skipped++;return;}
 if(!r.id)warnings.push('Registros sem ID: movimentações idênticas são consideradas duplicadas.');
 if(!['entrada','saida'].includes(m.type)||m.quantity<=0)throw Error('Tipo deve ser entrada/saida e quantidade positiva.');next.moves.push(m);imported++;
 }catch(e){throw Error(`Linha ${i+2}: ${e.message}`);}});
 for(const l of next.lots){let balance=0;for(const m of next.moves.filter(m=>m.lotId===l.id).sort((a,b)=>a.date.localeCompare(b.date)||(a.type==='entrada'?-1:1))){balance+=m.type==='entrada'?m.quantity:-m.quantity;if(balance< -1e-8)throw Error(`Lote ${l.code}: saldo negativo no histórico. Inclua a entrada inicial.`);}}
 next.source=db.moves.length&&db.source!==source?'mista':source;return {db:next,imported,skipped,warnings:[...new Set(warnings)]};
}
