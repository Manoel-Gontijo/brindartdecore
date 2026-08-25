async function apiCarrosselV34(url,opt={}){
 const r=await fetch(url,{cache:'no-store',headers:opt.body?BrindartAPI.headers(true):BrindartAPI.headers(false),...opt});
 const d=await r.json().catch(()=>({})); if(!r.ok)throw new Error(d.error||d.details||'Erro na operação.'); return d;
}
async function carregarCarrosselAdminV34(){
 const lista=document.querySelector('#listaCarrosselV34'); if(!lista)return;
 const result=await apiCarrosselV34('/api/carrossel?_='+Date.now()); const slides=result.data||[]; window.slidesCarrosselV34=slides;
 lista.innerHTML=slides.length?slides.map(s=>`<div class="carrossel-admin-card-v34"><img src="${s.imagem}" alt="${s.titulo||'Slide'}"><div><strong>${s.titulo||'Sem título'}</strong><p>${s.subtitulo||''}</p><small>Ordem: ${s.ordem||1}</small></div><div class="d-flex gap-2"><button type="button" class="btn-admin-edit" onclick="editarSlideCarrosselV34(${s.id})">Editar</button><button type="button" class="btn-admin-remove" onclick="removerSlideCarrosselV34(${s.id})">Remover</button></div></div>`).join(''):'<p class="text-muted">Nenhum slide cadastrado.</p>';
}
function editarSlideCarrosselV34(id){
 const s=(window.slidesCarrosselV34||[]).find(x=>Number(x.id)===Number(id)); const f=document.querySelector('#formCarrosselV34'); if(!s||!f)return;
 document.querySelector('#carrosselEditIdV34').value=s.id; f.titulo.value=s.titulo||''; f.subtitulo.value=s.subtitulo||''; f.imagem.value=s.imagem||''; f.link.value=s.link||'produtos.html'; f.ordem.value=s.ordem||1; f.texto_botao.value=s.texto_botao||'Ver produtos';
 const btn=f.querySelector('button[type="submit"]'); if(btn)btn.textContent='Atualizar slide'; f.scrollIntoView({behavior:'smooth',block:'center'});
}
async function removerSlideCarrosselV34(id){ if(!confirm('Remover slide do carrossel?'))return; try{await apiCarrosselV34('/api/carrossel/'+id,{method:'DELETE'}); alert('Slide removido com sucesso.'); await carregarCarrosselAdminV34();}catch(e){alert(e.message)}}
async function salvarSlideCarrosselV34(e){
 e.preventDefault(); const f=e.target; const editId=document.querySelector('#carrosselEditIdV34').value; const data=Object.fromEntries(new FormData(f).entries());
 if(!data.imagem)return alert('Informe a imagem do slide.');
 try{await apiCarrosselV34(editId?'/api/carrossel/'+editId:'/api/carrossel',{method:editId?'PUT':'POST',body:JSON.stringify(data)});
 alert(editId?'Slide atualizado com sucesso.':'Slide cadastrado com sucesso.'); f.reset(); document.querySelector('#carrosselEditIdV34').value=''; const btn=f.querySelector('button[type="submit"]'); if(btn)btn.textContent='Salvar slide'; await carregarCarrosselAdminV34();}catch(e){alert(e.message)}
}
document.addEventListener('DOMContentLoaded',()=>{const f=document.querySelector('#formCarrosselV34'); if(f)f.addEventListener('submit',salvarSlideCarrosselV34); carregarCarrosselAdminV34();});
