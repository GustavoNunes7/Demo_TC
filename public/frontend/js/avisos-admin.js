(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("avisosAdminForm");
    const lista = document.getElementById("avisosAdminLista");
    const editor = document.getElementById("avisosAdminEditor");
    const abrir = document.getElementById("avisosAdminAbrir");
    const novo = document.getElementById("avisosAdminNovo");
    const fechar = document.getElementById("avisosAdminFechar");
    const msg = document.getElementById("avisosAdminMsg");
    if (!form || !lista || !editor) return;

    const byId = (id) => document.getElementById(id);
    const token = () => sessionStorage.getItem("techcampus_token");
    const authHeaders = () => ({
      "Content-Type": "application/json",
      Authorization: "Bearer " + (token() || "")
    });
    const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);

    function mensagem(texto, erro = false) {
      msg.textContent = texto;
      msg.classList.toggle("text-danger", erro);
      msg.classList.toggle("text-success", !erro);
    }

    function limparFormulario() {
      form.reset();
      byId("avisosAdminId").value = "";
      byId("avisosAdminTitulo").textContent = "Publicar aviso";
      byId("avisosAdminSalvar").textContent = "Publicar aviso";
      mensagem("");
    }

    function dispararAtualizacaoCalendario(data = "") {
      document.dispatchEvent(new CustomEvent("tc-avisos-atualizados", { detail: { data } }));
    }

    async function carregarLista() {
      lista.setAttribute("aria-busy", "true");
      try {
        const response = await fetch("/api/admin/avisos", {
          headers: { Authorization: "Bearer " + (token() || "") },
          cache: "no-store"
        });
        const avisos = await response.json().catch(() => []);
        if (!response.ok) throw new Error(avisos.erro || "Não foi possível carregar os avisos. Entre novamente como administrador.");
        const publicados = Array.isArray(avisos) ? avisos.filter(a => Number(a.publicado) === 1) : [];
        lista.replaceChildren();
        if (!publicados.length) {
          const vazio = document.createElement("p");
          vazio.className = "text-secondary mb-0";
          vazio.textContent = "Nenhum aviso publicado.";
          lista.append(vazio);
          return;
        }
        publicados.forEach((aviso) => {
          const card = document.createElement("div");
          card.className = "border border-secondary rounded p-3 mt-2";
          card.dataset.avisoId = String(aviso.id);
          card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div class="min-w-0">
                <strong class="d-block text-white">${esc(aviso.titulo)}</strong>
                <p class="text-secondary mb-2 mt-2" style="white-space:pre-wrap">${esc(aviso.conteudo)}</p>
                <small class="text-secondary">${esc(aviso.data_evento || "Sem data")} · ${esc(aviso.horario || "Sem horário")} · ${esc(aviso.local || "Sem local")} · ${esc(aviso.categoria || "Aviso")}</small>
              </div>
              <div class="d-flex gap-2 flex-shrink-0">
                <button type="button" class="btn btn-sm btn-outline-light" data-acao="editar">Editar</button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-acao="excluir">Excluir</button>
              </div>
            </div>`;
          card.querySelector('[data-acao="editar"]').addEventListener("click", () => {
            byId("avisosAdminId").value = aviso.id;
            byId("avisosAdminNome").value = aviso.titulo || "";
            byId("avisosAdminCategoria").value = aviso.categoria || "importante";
            byId("avisosAdminData").value = String(aviso.data_evento || "").slice(0, 10);
            byId("avisosAdminHorario").value = aviso.horario || "";
            byId("avisosAdminLocal").value = aviso.local || "";
            byId("avisosAdminDescricao").value = aviso.conteudo || "";
            byId("avisosAdminTitulo").textContent = "Editar aviso";
            byId("avisosAdminSalvar").textContent = "Salvar alterações";
            editor.hidden = false;
            editor.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
          card.querySelector('[data-acao="excluir"]').addEventListener("click", async (event) => {
            const button = event.currentTarget;
            if (!window.confirm("Deseja excluir este aviso? Ele deixará de aparecer no calendário.")) return;
            button.disabled = true;
            button.textContent = "Excluindo...";
            try {
              const response = await fetch("/api/avisos/" + encodeURIComponent(aviso.id), {
                method: "DELETE",
                headers: { Authorization: "Bearer " + (token() || "") }
              });
              if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.erro || "A API não confirmou a exclusão (HTTP " + response.status + ").");
              }
              // Remove o card somente após a API confirmar a exclusão.
              card.remove();
              if (!lista.querySelector("[data-aviso-id]")) {
                lista.innerHTML = '<p class="text-secondary mb-0">Nenhum aviso publicado.</p>';
              }
              mensagem("Aviso excluído com sucesso.");
              dispararAtualizacaoCalendario();
            } catch (error) {
              mensagem(error.message || "Erro ao excluir o aviso.", true);
              button.disabled = false;
              button.textContent = "Excluir";
            }
          });
          lista.append(card);
        });
      } catch (error) {
        lista.replaceChildren();
        const erro = document.createElement("p");
        erro.className = "text-danger";
        erro.textContent = error.message || "Erro ao carregar avisos.";
        lista.append(erro);
      } finally {
        lista.removeAttribute("aria-busy");
      }
    }

    abrir?.addEventListener("click", () => {
      editor.hidden = false;
      carregarLista();
    });
    novo?.addEventListener("click", limparFormulario);
    fechar?.addEventListener("click", () => { editor.hidden = true; });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = byId("avisosAdminId").value;
      const payload = {
        titulo: byId("avisosAdminNome").value.trim(),
        categoria: byId("avisosAdminCategoria").value,
        data_evento: byId("avisosAdminData").value,
        horario: byId("avisosAdminHorario").value,
        local: byId("avisosAdminLocal").value.trim(),
        conteudo: byId("avisosAdminDescricao").value.trim()
      };
      const salvar = byId("avisosAdminSalvar");
      salvar.disabled = true;
      try {
        const response = await fetch("/api/avisos" + (id ? "/" + encodeURIComponent(id) : ""), {
          method: id ? "PATCH" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.erro || "Não foi possível salvar o aviso.");
        limparFormulario();
        mensagem(id ? "Aviso atualizado com sucesso." : "Aviso publicado com sucesso.");
        await carregarLista();
        dispararAtualizacaoCalendario(payload.data_evento);
      } catch (error) {
        mensagem(error.message || "Erro ao salvar aviso.", true);
      } finally {
        salvar.disabled = false;
      }
    });

    abrir?.addEventListener("click", carregarLista);
  });
})();
