/* =========================================================
   AVISOS GERAIS - CALENDÁRIO (dados vindos da API)
========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  const calendarDays = document.getElementById("calendarDays");
  const calendarMonth = document.getElementById("calendarMonth");
  const previousButton = document.getElementById("calendarPrev");
  const nextButton = document.getElementById("calendarNext");
  const todayButton = document.getElementById("calendarToday");
  const agendaContainer = document.getElementById("agendaAvisos");
  const agendaEmpty = document.getElementById("agendaEmpty");
  if (!calendarDays || !calendarMonth) return;

  let statusCalendar = document.getElementById("calendarStatus");
  if (!statusCalendar) {
    statusCalendar = document.createElement("p");
    statusCalendar.id = "calendarStatus";
    statusCalendar.className = "small text-secondary mt-2 mb-0";
    statusCalendar.setAttribute("role", "status");
    calendarDays.insertAdjacentElement("afterend", statusCalendar);
  }

  const categoriaValida = ["evento", "academico", "reuniao", "importante"];
  const nomesMeses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const nomesMesesCurto = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const categorias = {evento:"Evento",academico:"Acadêmico",reuniao:"Reunião",importante:"Importante"};
  let avisos = [];
  let currentDate = new Date();

  function formatarData(valor) {
    if (!valor) return "Data não informada";
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {day:"numeric",month:"long",year:"numeric"});
  }
  function abrirAviso(aviso) {
    const modalElement = document.getElementById("avisoModal");
    if (!modalElement || !window.bootstrap?.Modal) return;
    const setText = (id, value) => { const el=document.getElementById(id); if(el) el.textContent=value || "Não informado"; };
    setText("avisoModalLabel", aviso.titulo);
    setText("modalAvisoCategoria", categorias[aviso.categoria] || "Aviso");
    const tag=document.getElementById("modalAvisoCategoria"); if(tag) tag.className="agenda-tag "+aviso.categoria;
    setText("modalAvisoData", formatarData(aviso.data));
    setText("modalAvisoHorario", aviso.horario || "Não informado");
    setText("modalAvisoLocal", aviso.local || "Não informado");
    setText("modalAvisoDescricao", aviso.descricao);
    window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }
  function renderAgenda() {
    if (!agendaContainer) return;
    agendaContainer.replaceChildren();
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const proximos = avisos.filter(a => { if(!a.data) return false; const [y,m,d]=a.data.split("-").map(Number); return new Date(y,m-1,d)>=hoje; }).sort((a,b)=>a.data.localeCompare(b.data)).slice(0,8);
    proximos.forEach(aviso=>{
      const item=document.createElement("button"); item.type="button"; item.className="agenda-item"; item.dataset.category=aviso.categoria; item.dataset.aviso=String(aviso.id);
      const [y,m,d]=aviso.data.split("-").map(Number);
      const date=document.createElement("div"); date.className="agenda-date"; const day=document.createElement("span");day.className="agenda-day";day.textContent=String(d).padStart(2,"0");const month=document.createElement("span");month.className="agenda-month";month.textContent=nomesMesesCurto[m-1];date.append(day,month);
      const content=document.createElement("div");content.className="agenda-content";const tag=document.createElement("span");tag.className="agenda-tag "+aviso.categoria;tag.textContent=categorias[aviso.categoria]||"Aviso";const title=document.createElement("h5");title.textContent=aviso.titulo;const desc=document.createElement("p");desc.textContent=aviso.descricao;const time=document.createElement("small");const icon=document.createElement("i");icon.className="bi bi-clock me-1";time.append(icon,document.createTextNode(aviso.horario||"Horário não informado"));content.append(tag,title,desc,time);const arrow=document.createElement("i");arrow.className="bi bi-chevron-right agenda-arrow";item.append(date,content,arrow);item.addEventListener("click",()=>abrirAviso(aviso));agendaContainer.append(item);
    });
    if(agendaEmpty) agendaEmpty.classList.toggle("d-none",proximos.length>0);
  }
  function createDayElement(dayNumber, otherMonth) {
    const element=document.createElement("div"); element.className="calendar-day";
    if(otherMonth){element.classList.add("other-month");const n=document.createElement("span");n.className="calendar-day-number";n.textContent=dayNumber;element.append(n);return element;}
    const year=currentDate.getFullYear(),month=currentDate.getMonth();
    const dateString=year+"-"+String(month+1).padStart(2,"0")+"-"+String(dayNumber).padStart(2,"0");
    const now=new Date(); if(dayNumber===now.getDate()&&month===now.getMonth()&&year===now.getFullYear())element.classList.add("today");
    const n=document.createElement("span");n.className="calendar-day-number";n.textContent=dayNumber;element.append(n);
    const events=document.createElement("div");events.className="calendar-events";
    const dayAvisos=avisos.filter(a=>a.data===dateString);
    dayAvisos.slice(0,3).forEach(aviso=>{const event=document.createElement("div");event.className="calendar-event "+aviso.categoria;event.title=aviso.titulo;event.textContent=aviso.titulo;events.append(event);});
    element.append(events);
    if(dayAvisos.length){element.classList.add("has-events");element.tabIndex=0;element.setAttribute("role","button");element.setAttribute("aria-label",dayAvisos.length+" aviso(s) em "+formatarData(dateString));element.addEventListener("click",()=>abrirAviso(dayAvisos[0]));element.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();abrirAviso(dayAvisos[0]);}});}
    return element;
  }
  function renderCalendar(){
    const year=currentDate.getFullYear(),month=currentDate.getMonth();calendarMonth.textContent=nomesMeses[month]+" "+year;calendarDays.replaceChildren();
    const firstDay=new Date(year,month,1).getDay(),lastDate=new Date(year,month+1,0).getDate(),previousLastDate=new Date(year,month,0).getDate();
    for(let i=firstDay-1;i>=0;i--)calendarDays.append(createDayElement(previousLastDate-i,true));
    for(let day=1;day<=lastDate;day++)calendarDays.append(createDayElement(day,false));
    const remaining=(7-(calendarDays.children.length%7))%7;for(let day=1;day<=remaining;day++)calendarDays.append(createDayElement(day,true));
  }
  function aplicarFiltro(filtro){
    document.querySelectorAll(".avisos-filter").forEach(btn=>{const ativo=btn.dataset.filter===filtro;btn.classList.toggle("active",ativo);btn.classList.toggle("btn-danger",ativo);btn.classList.toggle("btn-outline-secondary",!ativo);});
    document.querySelectorAll("#agendaAvisos .agenda-item").forEach(item=>{item.style.display=filtro==="todos"||item.dataset.category===filtro?"flex":"none";});
    if(agendaEmpty){const visiveis=[...document.querySelectorAll("#agendaAvisos .agenda-item")].some(item=>item.style.display!=="none");agendaEmpty.classList.toggle("d-none",visiveis);}
  }
  document.querySelectorAll(".avisos-filter").forEach(button=>button.addEventListener("click",()=>aplicarFiltro(button.dataset.filter||"todos")));
  previousButton?.addEventListener("click",()=>{currentDate.setMonth(currentDate.getMonth()-1);renderCalendar();});
  nextButton?.addEventListener("click",()=>{currentDate.setMonth(currentDate.getMonth()+1);renderCalendar();});
  todayButton?.addEventListener("click",()=>{currentDate=new Date();renderCalendar();});
  async function carregarAvisosCalendario(dataAlvo = "") {
    try {
      const response = await fetch("/api/avisos", { cache: "no-store" });
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error("A API de avisos respondeu HTTP " + response.status + ". Reinicie o servidor com a versão atual do projeto.");
      if (!Array.isArray(data)) throw new Error("A API de avisos retornou um formato inesperado.");
      avisos = data
        .filter(a => Number(a.publicado ?? 1) === 1)
        .map(a => ({
          id: Number(a.id),
          titulo: String(a.titulo || "Aviso"),
          categoria: categoriaValida.includes(a.categoria) ? a.categoria : "importante",
          data: String(a.data_evento || "").trim().slice(0, 10),
          horario: String(a.horario || ""),
          local: String(a.local || ""),
          descricao: String(a.conteudo || "")
        }))
        .filter(a => /^\d{4}-\d{2}-\d{2}$/.test(a.data));
      if (dataAlvo && /^\d{4}-\d{2}-\d{2}$/.test(dataAlvo)) {
        const [ano, mes] = dataAlvo.split("-").map(Number);
        currentDate = new Date(ano, mes - 1, 1);
      }
      statusCalendar.textContent = avisos.length
        ? avisos.length + " aviso(s) publicado(s)."
        : "Nenhum aviso publicado com data válida.";
      statusCalendar.classList.remove("text-danger");
    } catch (error) {
      console.error("Erro ao carregar avisos do calendário:", error);
      avisos = [];
      statusCalendar.textContent = "Não foi possível carregar os avisos. " + error.message;
      statusCalendar.classList.add("text-danger");
    }
    renderCalendar();
    renderAgenda();
    aplicarFiltro("todos");
  }
  // Botão explícito de atualização para evitar depender de cache ou navegação.
  const refreshButton = document.createElement("button");
  refreshButton.type = "button";
  refreshButton.className = "btn btn-outline-secondary btn-sm ms-2";
  refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Atualizar calendário';
  refreshButton.addEventListener("click", () => carregarAvisosCalendario());
  (todayButton?.parentElement || calendarMonth?.parentElement)?.append(refreshButton);

  document.addEventListener("tc-avisos-atualizados", (event) => {
    carregarAvisosCalendario(event.detail?.data || "");
  });
  window.addEventListener("hashchange", () => {
    if (location.hash === "#avisos") carregarAvisosCalendario();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && location.hash === "#avisos") carregarAvisosCalendario();
  });
  document.querySelectorAll('a[href="#avisos"]').forEach((link) => {
    link.addEventListener("click", () => carregarAvisosCalendario());
  });
  await carregarAvisosCalendario();
});
