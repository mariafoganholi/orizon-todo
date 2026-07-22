# TODO List API — Django + DRF

API simples de lista de tarefas (TODO list) com autenticação por token, feita em Django + Django REST Framework, usando SQLite.

## Estrutura de pastas

```
todo_project/
├── manage.py
├── requirements.txt
├── db.sqlite3
├── todo_project/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
└── todos/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── migrations/
    └── tests.py
```

| Pasta/arquivo              | O que é                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `todo_project/settings.py` | Configuração do projeto (apps, banco SQLite, DRF)                                        |
| `todo_project/urls.py`     | Rotas da API (`/api/login/`, `/api/register/`, `/api/todos/`, `/api/todos/<id>/status/`) |
| `todos/models.py`          | Model `Todo` (id, user_id, description, status, category)                                |
| `todos/serializers.py`     | `RegisterSerializer`, `TodoSerializer`                                                   |
| `todos/views.py`           | Views de registro, login, criação/listagem/atualização de TODOs                          |
| `todos/admin.py`           | Configuração do Django Admin                                                             |
| `db.sqlite3`               | Banco de dados SQLite                                                                    |

## Getting Started

### Use Python 3.14

Verifique se tem Python 3.14 instalado:

```bash
python3 --version
```

Se não tiver, instale antes de continuar (via [python.org](https://www.python.org/downloads/), `pyenv`, ou gerenciador de pacotes do seu SO).

### Configurando o projeto

Crie e ative o ambiente virtual:

```bash
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Rode as migrations:

```bash
python manage.py migrate
```

Crie um superusuário (acesso ao admin):

```bash
python manage.py createsuperuser
```

Suba o servidor:

```bash
python manage.py runserver
```

API disponível em `http://127.0.0.1:8000/`.

Admin disponível em `http://127.0.0.1:8000/admin/`.

---

## Exemplos de uso

### Criar um usuário (registro)

```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria",
    "email": "maria@example.com",
    "first_name": "Maria",
    "last_name": "Foganholi",
    "password": "secret123"
  }'
```

Resposta (`201`):

```json
{
  "id": 2,
  "username": "Maria",
  "email": "maria@example.com",
  "first_name": "Maria",
  "last_name": "Foganholi",
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

Guarde o `token` — ele é usado em todas as chamadas autenticadas abaixo.

### Login (caso já tenha um usuário)

```bash
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "maria", "password": "secret123"}'
```

Resposta (`200`):

```json
{ "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" }
```

### Criar uma TODO

```bash
curl -X POST http://127.0.0.1:8000/api/todos/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -d '{
    "description": "Comprar leite",
    "status": "pending",
    "category": "compras"
  }'
```

Resposta (`201`):

```json
{
  "id": 1,
  "user": 2,
  "description": "Comprar leite",
  "status": "pending",
  "category": "compras"
}
```

### Listar TODOs (do usuário autenticado)

```bash
curl http://127.0.0.1:8000/api/todos/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

Filtrando por status:

```bash
curl "http://127.0.0.1:8000/api/todos/?status=pending" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

Valores válidos: `pending`, `in_progress`, `done`.

### Atualizar o status de uma TODO

```bash
curl -X PATCH http://127.0.0.1:8000/api/todos/1/status/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -d '{"status": "done"}'
```

Resposta (`200`):

```json
{
  "id": 1,
  "user": 2,
  "description": "Comprar leite",
  "status": "done",
  "category": "compras"
}
```

---

## Referência rápida das rotas

| Método  | Rota                      | Autenticação | Descrição                                  |
| ------- | ------------------------- | ------------ | ------------------------------------------ |
| `POST`  | `/api/register/`          | não          | Cria usuário e retorna token               |
| `POST`  | `/api/login/`             | não          | Retorna token pra usuário existente        |
| `GET`   | `/api/todos/`             | sim          | Lista TODOs do usuário (filtro `?status=`) |
| `POST`  | `/api/todos/`             | sim          | Cria uma nova TODO                         |
| `PATCH` | `/api/todos/<id>/status/` | sim          | Atualiza status de uma TODO                |
