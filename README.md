# TechCampus - DEMO

>Configure as informações
No .env, deixe as configurações abaixo, substituindo os exemplos por valores seus:
PORT=3001
JWT_SECRET=coloque_aqui_um_segredo_aleatorio_com_mais_de_32_caracteres
PAGAMENTO_SIMULADO=true

ADMIN_NAME=Administrador TechCampus
ADMIN_EMAIL=admin@techcampus.com
ADMIN_PASSWORD=MinhaSenhaForte123!


Use uma senha administrativa própria, com pelo menos 12 caracteres.
4. Instale e inicie o projeto
Execute estes comandos um por vez, no terminal aberto na pasta principal:
npm install


Depois:
npm run seed


Esse comando prepara um aluno de teste e os produtos de demonstração.

Agora crie a conta de administrador:
npm run admin:create


Por fim, inicie o servidor:
npm run dev