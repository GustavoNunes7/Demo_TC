# TechCampus - DEMO

># Acessando os Usuários — NovaDemo

## 1. Pré-requisitos

Antes de iniciar, verifique se você possui:

- [Node.js](https://nodejs.org/) instalado.
- npm instalado (já vem com o Node.js).
- O projeto NovaDemo extraído em uma pasta local.

## 2. Configure o arquivo `.env`

Na pasta principal do projeto, crie um arquivo chamado `.env`. Caso exista um `.env.example`, copie-o e renomeie a cópia para `.env`.

Configure as seguintes variáveis:

```env
PORT=3002
JWT_SECRET=coloque_aqui_um_segredo_aleatorio_com_mais_de_32_caracteres
PAGAMENTO_SIMULADO=true

ADMIN_NAME=Administrador TechCampus
ADMIN_EMAIL=admin@techcampus.com
ADMIN_PASSWORD=DefinaUmaSenhaForte123!
```

**Importante:**
- Substitua o `JWT_SECRET` por um segredo aleatório com pelo menos 32 caracteres.
- Defina uma senha administrativa própria, com pelo menos 12 caracteres.
- Não compartilhe o arquivo `.env` nem o envie ao GitHub.
- `PAGAMENTO_SIMULADO=true` habilita o fluxo de pagamento simulado para testes; não realiza pagamentos reais.

## 3. Instale as dependências

Abra o terminal na pasta principal do projeto e execute:

```bash
npm install
```

Aguarde a instalação terminar.

## 4. Crie os usuários de teste

### 4.1. Criar o aluno de teste

Execute:

```bash
npm run seed
```

Esse comando prepara os dados de demonstração, incluindo a conta de aluno e os produtos de teste.

Credenciais do aluno de teste:

- **E-mail:** `teste@techcampus.com`
- **Senha:** `123456!`

### 4.2. Criar o administrador

Depois de configurar `ADMIN_EMAIL` e `ADMIN_PASSWORD` no arquivo `.env`, execute:

```bash
npm run admin:create
```

A conta administrativa será criada com as credenciais definidas no `.env`.

Guarde esses dados para realizar o login como administrador.

## 5. Inicie o servidor

Execute:

```bash
npm run dev
```

Mantenha o terminal aberto enquanto estiver utilizando o sistema.

Se aparecer o erro `EADDRINUSE`, significa que a porta configurada já está sendo utilizada por outro processo. Encerre o servidor anterior ou configure outra porta disponível.

## 6. Acesse a tela de login

Com o servidor em execução, abra o navegador e acesse:

**http://localhost:3002/frontend/login.html**

### Perfil de aluno

Utilize as credenciais da conta de teste:

- **E-mail:** `teste@techcampus.com`
- **Senha:** `123456!`

### Perfil de administrador

Utilize os dados definidos no arquivo `.env`:

- **E-mail:** valor configurado em `ADMIN_EMAIL`.
- **Senha:** valor configurado em `ADMIN_PASSWORD`.

Após entrar, o sistema deverá identificar o perfil da conta e disponibilizar as funcionalidades correspondentes, conforme a implementação do projeto.

## 7. Problemas comuns

| Problema | O que fazer |
|---|---|
| `EADDRINUSE` | Verifique se outro servidor já está usando a porta 3002. |
| `Invalid credentials` ou erro de login | Confira o e-mail e a senha e execute `npm run seed` para preparar a conta de teste. |
| Administrador não consegue entrar | Confira as variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` e execute `npm run admin:create`. |
| Página não encontrada | Confirme se o servidor está ativo e se o endereço corresponde à estrutura do projeto. |

## 8. Testar compra, notificações e token IoT

Depois de configurar o `.env`, execute `npm run seed` para sincronizar os produtos da vitrine com os preços e estoques de demonstração. Esse comando atualiza os registros de produtos existentes e pode redefinir os estoques para os valores de teste.

1. Inicie o servidor com `npm run dev`.
2. Entre como aluno usando a conta de teste.
3. Abra **Pedidos disponíveis**, escolha um produto com estoque e adicione-o ao carrinho.
4. Finalize a compra e confirme o pagamento simulado. O token numérico de seis dígitos é criado pelo servidor e fica válido por 15 minutos.
5. Consulte **Meus tokens** para visualizar os tokens dos pedidos pagos.
6. Para testar a retirada, abra [http://localhost:3002/Iot/retirada.html](http://localhost:3002/Iot/retirada.html), informe o token e confirme a retirada somente depois de entregar os itens.
7. Use o sino no cabeçalho para consultar notificações da conta. O administrador também recebe notificações de novos pagamentos, documentos e dúvidas.

O token é validado no backend, vinculado ao pedido e não pode ser reutilizado depois que a retirada for confirmada. O pagamento é simulado e não movimenta dinheiro real.

## 9. Correções e observações

- Os comandos devem ser executados na pasta principal do projeto, onde está o `package.json`.
- O comando `npm run seed` sincroniza o catálogo e redefine os estoques dos produtos de demonstração. Faça backup do banco antes de executá-lo em uma base com dados que deseja preservar.
- O pagamento simulado é apenas para testes.
- Não utilize as credenciais de demonstração em produção.
