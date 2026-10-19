/* Integra o formulário de perfil e as preferências com a API original. */
(() => {
  "use strict";
  const token = () => sessionStorage.getItem("techcampus_token");
  const api = async (url, options = {}) => {
    const headers = { Authorization: `Bearer ${token()}`, ...(options.headers || {}) };
    if (!(options.body instanceof FormData) && options.body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(`/api${url}`, { ...options, headers });
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json") ? await response.json() : null;
    if (!response.ok) throw new Error(data?.erro || `Erro ${response.status}`);
    return data;
  };
  const avisar = (mensagem, erro = false) => {
    let el = document.getElementById("tc-perfil-feedback");
    if (!el) {
      el = document.createElement("div"); el.id = "tc-perfil-feedback";
      el.className = "alert mt-3";
      (document.getElementById("perfilForm") || document.getElementById("configuracoesForm") || document.body).append(el);
    }
    el.className = `alert mt-3 ${erro ? "alert-danger" : "alert-success"}`;
    el.textContent = mensagem;
  };
  async function carregarFoto() {
    const img = document.getElementById("profilePreview");
    if (!img || !token()) return;
    try {
      const response = await fetch("/api/perfil/foto", { headers: { Authorization: `Bearer ${token()}` } });
      if (!response.ok) return;
      const blob = await response.blob();
      if (img.dataset.objectUrl) URL.revokeObjectURL(img.dataset.objectUrl);
      const url = URL.createObjectURL(blob); img.dataset.objectUrl = url; img.src = url;
      const avatar = document.querySelector("#userDropdown .user-avatar");
      if (avatar) {
        let avatarImg = avatar.querySelector("img");
        if (!avatarImg) {
          avatar.replaceChildren();
          avatarImg = document.createElement("img");
          avatarImg.alt = "Foto de perfil";
          avatarImg.className = "rounded-circle";
          avatarImg.style.width = "38px";
          avatarImg.style.height = "38px";
          avatarImg.style.objectFit = "cover";
          avatar.append(avatarImg);
        }
        avatarImg.src = url;
      }
    } catch { /* Perfil sem foto ou API temporariamente indisponível. */ }
  }
  function ligarGerenciamentoUsuarios() {
    const tabela = document.getElementById("tabelaUsuarios");
    const form = document.getElementById("formUsuario");
    const botaoNovo = document.getElementById("btnNovoUsuario");
    if (!tabela || !form || !botaoNovo || form.dataset.apiWired) return;
    form.dataset.apiWired = "1";
    let usuarios = [];
    const fotoObjectUrls = new Set();
    const modalEl = document.getElementById("modalUsuario");
    const modal = window.bootstrap?.Modal && modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;
    const campo = (id) => document.getElementById(id);
    const filtros = ["buscarUsuario", "filtroTipoUsuario", "filtroStatusUsuario"];
    const mostrarErro = (msg) => {
      let el = document.getElementById("tc-usuarios-feedback");
      if (!el) { el = document.createElement("div"); el.id = "tc-usuarios-feedback"; el.className = "alert alert-danger mt-3"; document.getElementById("usuarios")?.prepend(el); }
      el.textContent = msg;
    };
    async function carregar() {
      try {
        usuarios = await api("/usuarios");
        campo("totalAlunos") && (campo("totalAlunos").textContent = String(usuarios.filter(u => u.papel === "aluno").length));
        campo("totalAtivos") && (campo("totalAtivos").textContent = String(usuarios.filter(u => u.ativo !== 0).length));
        renderizar();
      } catch (e) { mostrarErro(e.message); }
    }
    function renderizar() {
      const q = (campo("buscarUsuario")?.value || "").trim().toLowerCase();
      const papel = campo("filtroTipoUsuario")?.value || "aluno";
      const status = campo("filtroStatusUsuario")?.value || "todos";
      const filtrados = usuarios.filter(u => {
        const texto = `${u.nome || ""} ${u.email || ""} ${u.turma || ""}`.toLowerCase();
        return (!q || texto.includes(q)) && (papel === "todos" || u.papel === papel) &&
          (status === "todos" || (status === "ativo" ? u.ativo !== 0 : u.ativo === 0));
      });
      for (const url of fotoObjectUrls) URL.revokeObjectURL(url);
      fotoObjectUrls.clear();
      tabela.replaceChildren();
      for (const u of filtrados) {
        const tr = document.createElement("tr");
        const fotoCelula = document.createElement("td");
        const foto = document.createElement("img");
        foto.alt = "Foto de " + (u.nome || "usuário");
        foto.className = "rounded-circle border border-secondary";
        foto.width = 42; foto.height = 42;
        foto.style.objectFit = "cover";
        foto.src = "/landing/images/logoTechCampus.png";
        fotoCelula.append(foto);
        tr.append(fotoCelula);
        if (u.foto_url) {
          fetch("/api/usuarios/" + u.id + "/foto", { headers: { Authorization: `Bearer ${token()}` }, cache: "no-store" })
            .then(response => { if (!response.ok) throw new Error("Foto indisponível"); return response.blob(); })
            .then(blob => {
              const url = URL.createObjectURL(blob);
              if (!foto.isConnected) { URL.revokeObjectURL(url); return; }
              fotoObjectUrls.add(url);
              foto.src = url;
            })
            .catch(() => {});
        }
        for (const valor of [u.nome, u.turma || "—", u.email, u.papel === "admin" ? "Administrador" : "Aluno", u.ativo === 0 ? "Inativo" : "Ativo"]) {
          const td = document.createElement("td"); td.textContent = valor || "—"; tr.append(td);
        }
        const acoes = document.createElement("td"); acoes.className = "text-end text-nowrap";
        const editar = document.createElement("button"); editar.type = "button"; editar.className = "btn btn-sm btn-outline-primary me-1"; editar.textContent = "Editar"; editar.addEventListener("click", () => abrir(u));
        const statusBtn = document.createElement("button"); statusBtn.type = "button"; statusBtn.className = `btn btn-sm ${u.ativo === 0 ? "btn-outline-success" : "btn-outline-danger"}`; statusBtn.textContent = u.ativo === 0 ? "Ativar" : "Desativar";
        statusBtn.addEventListener("click", async () => {
          if (!confirm(`${u.ativo === 0 ? "Ativar" : "Desativar"} a conta de ${u.nome}?`)) return;
          try { await api(`/usuarios/${u.id}`, { method: "PATCH", body: JSON.stringify({ ativo: u.ativo === 0 ? 1 : 0 }) }); await carregar(); }
          catch (e) { mostrarErro(e.message); }
        });
        acoes.append(editar, statusBtn); tr.append(acoes); tabela.append(tr);
      }
      const vazio = document.getElementById("usuariosVazio"); if (vazio) vazio.style.display = filtrados.length ? "none" : "block";
    }
    function abrir(u = null) {
      form.reset();
      campo("usuarioId").value = u?.id || "";
      campo("tituloModalUsuario").textContent = u ? "Editar cadastro" : "Novo cadastro";
      campo("usuarioNome").value = u?.nome || "";
      campo("usuarioTipo").value = u?.papel || "aluno";
      campo("usuarioMatricula").value = u?.turma || "";
      campo("usuarioEmail").value = u?.email || "";
      campo("usuarioSenha").value = "";
      campo("usuarioSenha").required = !u;
      campo("usuarioStatus").value = u?.ativo === 0 ? "inativo" : "ativo";
      if (modal) modal.show(); else modalEl?.classList.add("show");
    }
    botaoNovo.addEventListener("click", () => abrir());
    filtros.forEach(id => campo(id)?.addEventListener("input", renderizar));
    campo("filtroTipoUsuario")?.addEventListener("change", renderizar);
    campo("filtroStatusUsuario")?.addEventListener("change", renderizar);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = campo("usuarioId").value;
      const senha = campo("usuarioSenha").value;
      if (!id && senha.length < 5) return mostrarErro("A senha inicial precisa ter pelo menos 5 caracteres.");
      const body = {
        nome: campo("usuarioNome").value.trim(),
        email: campo("usuarioEmail").value.trim(),
        papel: campo("usuarioTipo").value,
        turma: campo("usuarioMatricula").value.trim(),
        ativo: campo("usuarioStatus").value === "ativo" ? 1 : 0
      };
      if (senha) body.senha = senha;
      const btn = form.querySelector('[type="submit"]'); if (btn) btn.disabled = true;
      try {
        await api(id ? `/usuarios/${id}` : "/usuarios", { method: id ? "PATCH" : "POST", body: JSON.stringify(body) });
        modal?.hide(); await carregar();
      } catch (e) { mostrarErro(e.message); }
      finally { if (btn) btn.disabled = false; }
    });
    carregar();
  }

  async function iniciar() {
    if (!token()) return;
    try {
      const perfil = await api("/perfil");
      for (const [id, value] of [["nome", perfil.nome], ["email", perfil.email], ["telefone", perfil.telefone || ""]]) {
        const campo = document.getElementById(id); if (campo) campo.value = value || "";
      }
      await carregarFoto();
      if (perfil.papel === "admin") ligarGerenciamentoUsuarios();
    } catch (e) { console.warn("Perfil não carregado:", e.message); }

    const form = document.getElementById("perfilForm");
    if (form && !form.dataset.apiWired) {
      form.dataset.apiWired = "1";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const btn = form.querySelector('[type="submit"]'); if (btn) btn.disabled = true;
        try {
          await api("/perfil", { method: "PATCH", body: JSON.stringify({
            nome: document.getElementById("nome")?.value || "",
            email: document.getElementById("email")?.value || "",
            telefone: document.getElementById("telefone")?.value || ""
          }) });
          avisar("Perfil salvo na conta TechCampus.");
        } catch (e) { avisar(e.message, true); }
        finally { if (btn) btn.disabled = false; }
      });
    }

    const foto = document.getElementById("profilePhoto");
    if (foto && !foto.dataset.apiWired) {
      foto.dataset.apiWired = "1";
      foto.addEventListener("change", async () => {
        const arquivo = foto.files?.[0]; if (!arquivo) return;
        if (!/^image\/(jpeg|png)$/.test(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
          avisar("Escolha uma imagem JPG ou PNG de até 5 MB.", true); foto.value = ""; return;
        }
        const dados = new FormData(); dados.append("foto", arquivo);
        try { await api("/perfil/foto", { method: "POST", body: dados }); await carregarFoto(); avisar("Foto de perfil atualizada."); }
        catch (e) { avisar(e.message, true); }
      });
    }

    const configForm = document.getElementById("configuracoesForm");
    const notif = document.getElementById("notificacoesSistema");
    const notifEmail = document.getElementById("notificacoesEmail");
    const selectTema = document.getElementById("tema");
    const chave = "techcampusConfiguracoes";
    let prefs = {};
    try { prefs = JSON.parse(localStorage.getItem(chave) || "{}"); } catch { prefs = {}; }
    if (notif && prefs.notificacoesSistema !== undefined) notif.checked = !!prefs.notificacoesSistema;
    if (notifEmail && prefs.notificacoesEmail !== undefined) notifEmail.checked = !!prefs.notificacoesEmail;
    if (selectTema && window.TechCampusTema) selectTema.value = window.TechCampusTema.get();
    if (notif && !notif.dataset.apiWired) {
      notif.dataset.apiWired = "1";
      notif.addEventListener("change", () => {
        localStorage.setItem("tc_notificacoes_ativas", notif.checked ? "1" : "0");
        window.dispatchEvent(new CustomEvent("tc-preferencia-notificacoes"));
      });
    }
    if (configForm && !configForm.dataset.apiWired) {
      configForm.dataset.apiWired = "1";
      configForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const config = {
          notificacoesSistema: notif?.checked ?? true,
          notificacoesEmail: notifEmail?.checked ?? true,
          exibirTelefone: document.getElementById("exibirTelefone")?.checked ?? false,
          exibirEmail: document.getElementById("exibirEmail")?.checked ?? false,
          tema: selectTema?.value || "escuro"
        };
        localStorage.setItem(chave, JSON.stringify(config));
        localStorage.setItem("tc_notificacoes_ativas", config.notificacoesSistema ? "1" : "0");
        if (window.TechCampusTema) window.TechCampusTema.set(config.tema);
        window.dispatchEvent(new CustomEvent("tc-preferencia-notificacoes"));
        avisar("Configurações salvas.");
      });
    }

    // Os botões do layout passam a executar ações reais.
    const sair = [...document.querySelectorAll(".settings-action")].find((b) => /encerrar sessão/i.test(b.textContent));
    if (sair && !sair.dataset.apiWired) {
      sair.dataset.apiWired = "1";
      sair.addEventListener("click", () => { sessionStorage.removeItem("techcampus_token"); sessionStorage.removeItem("techcampus_usuario"); location.replace("/landing/index.html"); });
    }
    const encerrar = document.createElement("button");
    encerrar.type = "button"; encerrar.className = "btn btn-outline-danger mt-3"; encerrar.textContent = "Encerrar minha conta";
    encerrar.addEventListener("click", async () => {
      const senha = prompt("Para encerrar a conta, confirme sua senha:");
      if (senha === null) return;
      if (!senha) return avisar("Informe sua senha para continuar.", true);
      if (!confirm("Essa ação desativará seu acesso ao TechCampus. Deseja continuar?")) return;
      try {
        await api("/perfil", { method: "DELETE", body: JSON.stringify({ senha }) });
        sessionStorage.removeItem("techcampus_token"); sessionStorage.removeItem("techcampus_usuario");
        alert("Conta encerrada."); location.replace("/landing/index.html");
      } catch (e) { avisar(e.message, true); }
    });
    const seguranca = [...document.querySelectorAll(".settings-card")].find((card) => /segurança/i.test(card.textContent));
    if (seguranca && !seguranca.querySelector("#tc-encerrar-conta")) { encerrar.id = "tc-encerrar-conta"; seguranca.append(encerrar); }
  }
  document.addEventListener("DOMContentLoaded", iniciar);
})();
