# ⚽ Skauts Frontend ⚽

Skauts Frontend é uma aplicação web desenvolvida em Angular para gerenciamento de campeonatos, times, jogadores e eventos esportivos.

## 🚀 Tecnologias Utilizadas

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular%20Material-%233f51b5.svg?style=for-the-badge&logo=angular&logoColor=white)
![RxJS](https://img.shields.io/badge/rxjs-%23B7178C.svg?style=for-the-badge&logo=reactivex&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![ngx-translate](https://img.shields.io/badge/ngx--translate-%235C6AC4.svg?style=for-the-badge&logo=google-translate&logoColor=white)

## ✨ Funcionalidades

A aplicação está organizada nos seguintes módulos principais:

- 🔐 **Auth**: Gerenciamento de autenticação e seleção de organização.
- 🏆 **Championships**: Gestão de campeonatos.
- 📊 **Dashboard**: Painel principal com visão geral.
- 📅 **Events**: Gestão de tipos de eventos e registro de ocorrências em partidas.
- 🌐 **Internationalization**: Suporte completo a múltiplos idiomas (Português, Inglês e Espanhol).
- ⚔️ **Matches**: Gerenciamento de partidas.
- 🏢 **Organizations**: Administração de organizações.
- 🏃 **Players**: Cadastro e gestão de jogadores.
- 🎁 **Players Prizes**: Gerenciamento de prêmios e conquistas dos jogadores.
- 👥 **Teams**: Gerenciamento de times.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white) [Node.js](https://nodejs.org/) (versão compatível com Angular 20)
- ![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=flat&logo=npm&logoColor=white) [npm](https://www.npmjs.com/) (gerenciador de pacotes)

## 🔧 Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd skauts-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## ▶️ Executando a Aplicação

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

Acesse `http://localhost:4200/` no seu navegador. A aplicação irá recarregar automaticamente se você alterar qualquer arquivo de código.

## 📦 Build

Para construir o projeto para produção:

```bash
npm run build
```

Os artefatos de build serão armazenados no diretório `dist/`.

## 🧪 Testes

Para executar os testes unitários via [Karma](https://karma-runner.github.io):

```bash
npm test
```

## 📂 Estrutura do Projeto

```
skauts-frontend/
├── src/
│   ├── app/
│   │   ├── core/          # 🛡️ Serviços, guardas e interceptores globais
│   │   ├── features/      # 🧩 Módulos de funcionalidades (Auth, Dashboard, etc.)
│   │   ├── shared/        # 🔄 Componentes e pipes compartilhados
│   │   ├── app.component.*
│   │   └── ...
│   ├── assets/            # 🖼️ Imagens e arquivos estáticos
│   ├── environments/      # 🌍 Configurações de ambiente
│   ├── styles.scss        # 🎨 Estilos globais
│   ├── main.ts            # 🚀 Ponto de entrada da aplicação
│   └── ...
├── angular.json           # ⚙️ Configuração do Angular CLI
├── package.json           # 📦 Dependências e scripts
├── tsconfig.json          # 📝 Configuração do TypeScript
└── README.md              # 📖 Documentação do projeto
```

## 🔌 API

A aplicação se comunica com uma API backend. A especificação da API pode ser encontrada no arquivo `swagger.json` na raiz do projeto.

O endpoint da API está configurado em `src/environments/environment.ts`:
```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080'
};
```
