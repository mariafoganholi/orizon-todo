# Orizon Todo — Web

Frontend do Orizon Todo: login, cadastro e painel de tarefas por categoria.

Feito com React + TypeScript + Vite. Consome a API em `apps/api`.

## Estrutura

```
apps/web/
├── public/                 # Assets estáticos
├── src/
│   ├── api/                # Cliente HTTP (auth + todos)
│   ├── components/         # Auth, rotas protegidas e UI de TODOs
│   │   └── todos/          # Categorias, navegação e painel de tarefas
│   ├── hooks/              # Hooks (ex.: usuário atual)
│   ├── pages/              # Telas (Login, Signup, Todos)
│   ├── App.tsx             # Rotas e providers
│   └── main.tsx            # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

| Caminho                             | Função                               |
| ----------------------------------- | ------------------------------------ |
| `src/pages/`                        | Telas: `/login`, `/signup`, `/todos` |
| `src/components/AuthProvider.tsx`   | Sessão e token de autenticação       |
| `src/components/ProtectedRoute.tsx` | Bloqueia rotas sem login             |
| `src/components/todos/`             | UI de categorias e tarefas           |
| `src/api/auth.ts`                   | Login, registro e `/api/me/`         |
| `src/api/todo.ts`                   | Listar, criar e atualizar status     |
| `src/api/shared.ts`                 | `API_BASE` e helpers de erro         |

## Rotas

| Rota      | Acesso      | Página                    |
| --------- | ----------- | ------------------------- |
| `/login`  | público     | Login                     |
| `/signup` | público     | Cadastro                  |
| `/todos`  | autenticado | Lista de TODOs            |
| `*`       | —           | Redireciona para `/login` |

## Stack

- React 19 + TypeScript
- Vite
- React Router
- Biome / ESLint

## Pré-requisito

API rodando em `http://127.0.0.1:8000` (ver `apps/api/README.md`).

A base URL fica em `src/api/shared.ts`:

```ts
export const API_BASE = "http://127.0.0.1:8000";
```

## Como rodar

```bash
cd apps/web
npm install
npm run dev
```

App em `http://127.0.0.1:5173/`

### Outros comandos

```bash
npm run build    # build de produção
npm run preview  # preview do build
npm run lint     # lint
```

## Objetivo

UI pra autenticar o usuário e gerenciar TODOs (criar, organizar por categoria, marcar como `pending` / `done`) via API Django.
