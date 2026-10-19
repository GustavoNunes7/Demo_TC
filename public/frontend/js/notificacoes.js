/* Notificações persistentes para perfis de aluno e administrador. */
(() => {
  "use strict";
  const token = sessionStorage.getItem("techcampus_token");
  if (!token || document.getElementById("tc-notificacoes-botao")) return;

  const css = document.createElement("style");
  css.textContent = `
    #tc-notificacoes-botao{position:fixed;right:20px;bottom:20px;z-index:10050;border:0;border-radius:999px;padding:12px 16px;background:#c62828;color:#fff;font-weight:700;box-shadow:0 5px 20px #0003;cursor:pointer}
    #tc-notificacoes-botao .tc-contador{display:inline-flex;min-width:22px;height:22px;align-items:center;justify-content:center;border-radius:50%;background:#fff;color:#b71c1c;margin-left:7px;font-size:12px}
    #tc-notificacoes-painel{position:fixed;right:20px;bottom:78px;width:min(390px,calc(100vw - 32px));max-height:min(65vh,560px);overflow:auto;z-index:10051;background:var(--bs-body-bg,#fff);color:var(--bs-body-color,#222);border:1px solid #8885;border-radius:14px;box-shadow:0 8px 32px #0003;padding:16px}
    #tc-notificacoes-painel[hidden]{display:none} .tc-notif-item{padding:12px 0;border-bottom:1px solid #8883;overflow-wrap:anywhere}.tc-notif-item:last-child{border-bottom:0}.tc-notif-item.nao-lida{border-left:3px solid #c62828;padding-left:10px}.tc-notif-data{font-size:12px;opacity:.7;margin-top:5px}
  `;
  document.head.append(css);
  const botao = document.createElement("button");
  botao.id = "tc-notificacoes-botao";
  botao.type = "button";
  botao.textContent = "Notificações";
  const contador = document.createElement("span");
  contador.className = "tc-contador";
  contador.textContent = "0";
  botao.append(contador);
  const painel = document.createElement("section");
  painel.id = "tc-notificacoes-painel";
  painel.hidden = true;
  painel.setAttribute("aria-label", "Notificações da conta");
  const cabecalho = document.createElement("div");
  cabecalho.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px";
  const titulo = document.createElement("strong"); titulo.textContent = "Suas notificações";
  const atualizar = document.createElement("button"); atualizar.type = "button"; atualizar.className = "btn btn-sm btn-outline-secondary"; atualizar.textContent = "Atualizar";
  cabecalho.append(titulo, atualizar);
  const lista = document.createElement("div");
  painel.append(cabecalho, lista);
  document.body.append(botao, painel);
  function aplicarPreferencia() {
    const ativa = localStorage.getItem("tc_notificacoes_ativas") !== "0";
    botao.hidden = !ativa;
    if (!ativa) painel.hidden = true;
  }
  aplicarPreferencia();
  window.addEventListener("tc-preferencia-notificacoes", aplicarPreferencia);

  async function carregar() {
    try {
      const resp = await fetch("/api/notificacoes", { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) throw new Error("Não foi possível carregar notificações.");
      const itens = await resp.json();
      contador.textContent = String(itens.filter((n) => !n.lida).length);
      lista.replaceChildren();
      if (!itens.length) {
        const vazio = document.createElement("p"); vazio.className = "mb-0 small"; vazio.textContent = "Você não tem notificações no momento."; lista.append(vazio); return;
      }
      for (const item of itens) {
        const bloco = document.createElement("article");
        bloco.className = `tc-notif-item${item.lida ? "" : " nao-lida"}`;
        const h = document.createElement("strong"); h.textContent = item.titulo;
        const msg = document.createElement("p"); msg.className = "mb-1"; msg.textContent = item.mensagem;
        const data = document.createElement("div"); data.className = "tc-notif-data"; data.textContent = item.criada_em || "";
        bloco.append(h, msg, data);
        if (!item.lida) {
          const ler = document.createElement("button"); ler.type = "button"; ler.className = "btn btn-sm btn-outline-secondary mt-2"; ler.textContent = "Marcar como lida";
          ler.addEventListener("click", async () => {
            try { await fetch(`/api/notificacoes/${item.id}/lida`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }); await carregar(); }
            catch { /* A próxima atualização tentará novamente. */ }
          });
          bloco.append(ler);
        }
        lista.append(bloco);
      }
    } catch (e) {
      lista.replaceChildren(); const erro = document.createElement("p"); erro.className = "mb-0 text-danger small"; erro.textContent = e.message; lista.append(erro);
    }
  }
  botao.addEventListener("click", () => { painel.hidden = !painel.hidden; if (!painel.hidden) carregar(); });
  atualizar.addEventListener("click", carregar);
  carregar();
  window.setInterval(carregar, 60000);
})();
