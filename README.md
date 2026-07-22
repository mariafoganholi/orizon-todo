# Orizon Todo

App full-stack de lista de tarefas: criar conta, entrar e organizar TODOs por categoria e status (`pending` / `done`).

Monorepo com frontend e API no mesmo repositório.

## Estrutura

```
orizon-todo/
├── apps/
│   ├── api/          # Backend — Django + Django REST Framework (SQLite)
│   └── web/          # Frontend — React + TypeScript + Vite
├── mise.toml         # Versões de Node e Python (via mise)
└── README.md
```

### `apps/api`

API REST com autenticação por token.

Rotas principais: registro, login, listar/criar TODOs, atualizar status.

Detalhes: [`apps/api/README.md`](apps/api/README.md)

### `apps/web`

Interface web: login, cadastro e painel de tarefas (categorias + status).

Detalhes: [`apps/web/README.md`](apps/web/README.md)

## Stack

- **API:** Python, Django, DRF, SQLite
- **Web:** React, TypeScript, Vite, React Router
- **Tooling:** mise (Node + Python)

## Como rodar

Suba API e web em terminais separados.

### API

```bash
docker compose up
```

API em `http://127.0.0.1:8000/`

### Web

```bash
cd apps/web
npm install
npm run dev
```

App em `http://127.0.0.1:5173/` (porta padrão do Vite)

## Objetivo

Projeto parte de uma entrevista com objetivo full-stack: auth por token, CRUD de TODOs e UI React consumindo a API Django.
