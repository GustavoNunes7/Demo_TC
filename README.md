# TechCampus - DEMO

>## Como acessar os usuários de demonstração

### 1. Pré-requisitos

Antes de iniciar, instale o [Node.js](https://nodejs.org/) e extraia o projeto Demo TechCampus.

### 2. Instalação e inicialização

Abra o terminal na pasta principal do projeto e execute os comandos abaixo, um por vez:

```bash
npm install
npm run seed
npm start
```

- `npm install`: instala as dependências necessárias.
- `npm run seed`: prepara o banco de dados e cadastra os usuários e dados de demonstração.
- `npm start`: inicia o servidor da aplicação.

### 3. Acessar o sistema

Com o servidor em execução, abra o navegador e acesse:

**http://localhost:3000**

### 4. Usuários de demonstração

Todos os usuários de demonstração utilizam a senha `123456`.

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | `aluno@techcampus.local` | `123456` |
| Professor | `professor@techcampus.local` | `123456` |
| Secretaria | `secretaria@techcampus.local` | `123456` |
| Gestor (administrador) | `gestor@techcampus.local` | `123456` |
| Portaria | `portaria@techcampus.local` | `123456` |

Para entrar com outro perfil, saia da conta atual e faça login utilizando o e-mail e a senha do perfil desejado.

### 5. Testar o token de retirada e a máquina IoT

1. Entre com o perfil de aluno.
2. Acesse a área de produtos e solicite um item disponível.
3. Consulte o token gerado e os detalhes do pedido.
4. Utilize a página ou integração da máquina IoT para validar o token.
5. Após a validação e confirmação da retirada, confira o registro do pedido e a atualização do estoque.

Os tokens são temporários e possuem validade de 15 minutos.

### Observações

- A conta `gestor@techcampus.local` corresponde ao perfil de gestão administrativa da Demo.
- Os usuários e as senhas acima são destinados exclusivamente a testes locais.
- Se o servidor estiver em execução, mantenha o terminal aberto enquanto utiliza o sistema.
- Caso a porta 3000 já esteja ocupada, encerre o servidor que a utiliza ou configure outra porta.
- O funcionamento físico da máquina IoT depende da configuração do ESP32, da conexão de rede e do firmware correspondente.
