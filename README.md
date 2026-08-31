# TechCampus — COD New Era

Versão completa do protótipo Web do TechCampus, mantendo a estrutura de projeto baseada no modelo utilizado pela equipe:

```text
TechCampus/
├── public/
│   ├── images/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── src/
│   ├── database/
│   │   └── sqlite.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── models/
│   │   ├── productModel.js
│   │   ├── requestModel.js
│   │   └── userModel.js
│   └── routes/
│       └── index.js
├── uploads/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── seed.js
├── server.js
└── techcampus.db   (criado automaticamente)
```

## Tecnologias

- HTML5, CSS3 e JavaScript
- Node.js + Express
- SQLite
- Bootstrap não é obrigatório neste protótipo; o visual foi reproduzido com CSS próprio para manter a identidade das telas do Figma.
- Sessão de login com `express-session`
- Upload com `multer`
- Senhas com `bcryptjs`
- Integração preparada para a Máquina IoT via API REST

## Instalação

1. Instale o Node.js.
2. Abra o terminal dentro da pasta do projeto.
3. Execute:

```bash
npm install
npm run seed
npm start
```

4. Abra `http://localhost:3000`.

## Usuários de demonstração

Todos usam a senha `123456`:

- aluno@techcampus.local
- professor@techcampus.local
- secretaria@techcampus.local
- gestor@techcampus.local
- portaria@techcampus.local

## Funcionalidades incluídas

- Login e perfis: Aluno, Professor, Secretaria, Gestor e Portaria
- Dashboard personalizado
- Avisos gerais
- Produtos disponíveis
- Solicitação de materiais
- Token de retirada
- Meus pedidos
- Documentos com upload PDF/JPG/PNG até 10 MB
- Eventos e inscrições
- Controle de frequência
- Solicitação de compensação de ausência
- Painel administrativo e indicadores
- Notificações
- Página da Máquina IoT
- Endpoints `/api/iot/validate` e `/api/iot/confirm` para o ESP32

## IoT

O fluxo previsto é:

```text
TechCampus → token → ESP32 → API → validação → servo/motor → sensor → confirmação → estoque
```

A máquina não fica presa a um token fixo. O token é criado por uma solicitação no sistema e pode ser validado pela API.

## Importante

O projeto não utiliza PHP. O back-end foi estruturado em Node.js/Express, com SQLite como banco de dados.

A integração física com ESP32 depende da implementação do firmware e da rede Wi-Fi. O Web já possui os endpoints necessários para essa próxima etapa.
