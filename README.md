# TechCampus — AAPM

Sistema web desenvolvido para a Associação de Alunos, Ex-alunos, Pais e Mestres (AAPM), com funcionalidades destinadas aos alunos e administradores.

## 📋 Sobre o projeto

O TechCampus tem como objetivo facilitar o acesso dos alunos aos serviços da AAPM, reunindo funcionalidades em uma plataforma web.

O sistema possui áreas específicas para alunos e administradores, com recursos de gerenciamento e acesso às funcionalidades disponíveis de acordo com o perfil da conta.

## 🔐 Logins de teste

Utilize as contas abaixo para testar o sistema durante o desenvolvimento e a apresentação.

| Perfil | E-mail |
|---|---|
| **Administrador** | `admin@techcampus.com` |
| **Aluno** | `aluno@techcampus.com` |

**Senhas:** utilize as senhas cadastradas no banco de dados do projeto.

> **Importante:** os usuários precisam existir no banco de dados para que o login funcione. Informar os e-mails neste README não cria as contas automaticamente. Confirme as credenciais antes da apresentação.

## 🚀 Como iniciar o projeto

O TechCampus utiliza o arquivo `INICIAR.bat` para simplificar a inicialização no Windows. Após a configuração inicial, basta dar dois cliques nesse arquivo para iniciar o servidor e abrir a Landing Page.

### 1. Pré-requisitos

Antes de iniciar, verifique se o computador possui:

- [Node.js](https://nodejs.org/) — inclui o npm.
- [Git](https://git-scm.com/) — necessário para clonar o repositório.

O arquivo `INICIAR.bat` verifica se o Node.js e o npm estão disponíveis. Ele não instala esses programas automaticamente.

### 2. Baixar o projeto

Clone o repositório utilizando o terminal:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta criada:

```bash
cd TechCampus
```

**Observação:** substitua `URL_DO_REPOSITORIO` pela URL real do GitHub. Quando o projeto for transferido para o repositório definitivo `TechCampus`, atualize este endereço conforme necessário.

Também é possível baixar o projeto diretamente pelo GitHub, utilizando a opção **Code → Download ZIP**.

### 3. Configurar o arquivo `.env`

O arquivo `.env` contém as configurações utilizadas pelo servidor.

Exemplo:

```env
PORT=3022
DB_PATH=./techcampus.db
JWT_SECRET=SEU_SEGREDO_UNICO
```

Descrição das variáveis:

| Variável | Finalidade |
|---|---|
| `PORT` | Define a porta utilizada pelo servidor. |
| `DB_PATH` | Define o caminho do banco de dados SQLite, caso o código utilize essa variável. |
| `JWT_SECRET` | Define o segredo utilizado para assinar os tokens de autenticação. |

**Atenção:** os nomes das variáveis precisam corresponder aos utilizados no código do projeto. O `index.js` também precisa utilizar `process.env.PORT` para respeitar a porta configurada.

Se o arquivo `.env` não estiver disponível após baixar ou clonar o projeto, crie-o na pasta principal e configure as variáveis necessárias.

Não publique segredos reais ou credenciais pessoais em um repositório público.

### 4. Instalar as dependências

Na primeira configuração, abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Esse comando instala as bibliotecas necessárias para o funcionamento do sistema.

O `INICIAR.bat` também verifica se a pasta `node_modules` existe. Caso ela esteja ausente, o arquivo executa `npm install` automaticamente.

Assim, nas próximas inicializações, não será necessário instalar as dependências manualmente, desde que elas já estejam instaladas.

### 5. Iniciar o TechCampus

Depois de configurar o ambiente, localize o arquivo `INICIAR.bat` na pasta principal do projeto e dê dois cliques nele.

O arquivo realiza as seguintes etapas:

1. Verifica se o Node.js está instalado.
2. Verifica se o npm está disponível.
3. Confere se o arquivo `.env` existe.
4. Instala as dependências caso a pasta `node_modules` não exista.
5. Lê a porta configurada no `.env`.
6. Verifica se o TechCampus já está funcionando.
7. Inicia o servidor com `npm start`, caso necessário.
8. Aguarda o servidor responder.
9. Abre a Landing Page no navegador.

Se ocorrer algum erro, confira a janela do servidor para identificar a mensagem exibida.

### 6. Acessar o sistema

Com o servidor iniciado e `PORT=3022` configurado, acesse:

```text
http://localhost:3022/
```

O endereço corresponde à execução local do projeto. O computador utilizado precisa estar com o servidor em funcionamento.

Se a porta for alterada no `.env`, o endereço também deverá ser atualizado conforme a configuração do projeto.

### 7. Próximas inicializações

Depois de concluir a configuração inicial, o procedimento será simples:

1. Abra a pasta do TechCampus.
2. Dê dois cliques em `INICIAR.bat`.
3. Aguarde a abertura do navegador.
4. Faça login com a conta de aluno ou administrador.

Não é necessário executar `npm install` em todas as inicializações.

**Importante:** não abra várias instâncias do servidor manualmente. Se o sistema já estiver funcionando na porta configurada, o `INICIAR.bat` deve detectar a instância existente e abrir a página sem iniciar outro servidor.

## 🛠️ Comandos disponíveis

| Comando | Finalidade |
|---|---|
| `npm install` | Instala as dependências do projeto. |
| `npm start` | Inicia o servidor Node.js. |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento, utilizando o recurso de monitoramento configurado no projeto. |
| `npm run seed` | Executa o script de preparação dos dados de demonstração. |
| `npm run admin:create` | Executa o script de criação ou atualização da conta administrativa. |

Os comandos de preparação de dados e de conta administrativa devem ser utilizados apenas quando necessário, conforme o funcionamento dos scripts. Eles não precisam ser executados a cada inicialização.

O procedimento normal de abertura é utilizar o `INICIAR.bat`.

## 🗄️ Banco de dados

O TechCampus utiliza SQLite para armazenar dados do sistema.

O caminho do banco pode ser configurado pela variável `DB_PATH`, desde que o código esteja preparado para utilizá-la.

### Cuidados importantes

- Verifique se o banco de dados existe antes de iniciar uma instalação nova.
- Faça cópias de segurança antes de modificar ou substituir o banco.
- Não apague o banco de dados para tentar corrigir erros de login sem verificar a causa.
- Confira se as contas de teste estão cadastradas e se suas senhas correspondem às credenciais utilizadas.
- Lembre-se de que o arquivo `.env`, sozinho, não cria o banco nem cadastra automaticamente todos os usuários.

Arquivos de banco de dados SQLite normalmente são excluídos do versionamento pelo `.gitignore`. Por isso, um clone novo pode não conter os dados existentes no computador de desenvolvimento. Será necessário preparar o banco e as contas de acordo com os procedimentos do projeto.

## 🔒 Segurança

- Não compartilhe senhas reais ou segredos de autenticação.
- Utilize credenciais de demonstração controladas para a apresentação.
- Evite manter senhas padrão em ambientes acessíveis publicamente.
- Não execute scripts de criação ou atualização de contas sem compreender suas alterações.
- Faça cópias de segurança do banco de dados antes de executar scripts que modifiquem os dados.

As credenciais de teste deste documento destinam-se exclusivamente ao ambiente de demonstração.

## 📁 Estrutura geral do projeto

A estrutura abaixo é ilustrativa e pode variar conforme a versão do repositório.

```text
TechCampus/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── index.js
├── INICIAR.bat
├── seed.js
├── seed-admin.js
├── public/
├── src/
├── uploads/
└── node_modules/
```

Descrição de alguns arquivos e diretórios:

| Arquivo ou diretório | Descrição |
|---|---|
| `.env` | Configurações locais do ambiente. |
| `.gitignore` | Define arquivos e diretórios que não devem ser versionados. |
| `package.json` | Contém informações do projeto, scripts e dependências. |
| `package-lock.json` | Registra as versões resolvidas das dependências. |
| `index.js` | Arquivo de inicialização do servidor, conforme a configuração atual. |
| `INICIAR.bat` | Automatiza a inicialização no Windows. |
| `seed.js` | Script de preparação dos dados de demonstração. |
| `seed-admin.js` | Script de criação ou atualização da conta administrativa. |
| `public/` | Pode conter arquivos públicos da aplicação. |
| `src/` | Pode conter módulos e arquivos de código-fonte. |
| `uploads/` | Diretório destinado a arquivos enviados pelos usuários, conforme a implementação. |
| `node_modules/` | Bibliotecas instaladas pelo npm; não precisa ser enviado ao GitHub. |

## 💻 Tecnologias utilizadas

- **Node.js:** ambiente de execução JavaScript no servidor.
- **Express:** framework para criação do servidor e das rotas.
- **SQLite:** banco de dados relacional.
- **JavaScript:** linguagem utilizada na aplicação.
- **HTML e CSS:** estrutura e estilização das páginas.
- **npm:** gerenciamento das dependências do projeto.

## 🔄 Transferência para o repositório definitivo

O projeto será transferido futuramente para o repositório GitHub `TechCampus`.

Antes de concluir a transferência:

1. Atualize a URL do repositório neste README.
2. Confirme que o `INICIAR.bat` está presente na pasta principal.
3. Verifique se o servidor utiliza corretamente as variáveis do `.env`.
4. Confirme que a rota `/` abre a Landing Page.
5. Garanta que existe um procedimento para preparar o banco de dados em uma instalação nova.
6. Confirme que as contas de teste estão cadastradas e funcionando.
7. Verifique se o `.gitignore` exclui `node_modules`, arquivos de banco de dados e uploads que não devam ser publicados.
8. Confira se nenhum segredo ou dado pessoal foi enviado ao GitHub.

## 📌 Observações finais

O `INICIAR.bat` foi desenvolvido para facilitar a execução local do TechCampus em computadores Windows, reduzindo a necessidade de digitar comandos manualmente.

A primeira configuração ainda depende dos pré-requisitos, das dependências, das configurações do ambiente e da preparação do banco de dados. Depois que tudo estiver configurado, a inicialização diária deverá ser feita pelo arquivo `INICIAR.bat`.