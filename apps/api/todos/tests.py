from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Todo


class TodoFlowE2ETest(APITestCase):
    def test_full_todo_flow(self):
        # 1) cria usuário
        register_response = self.client.post(
            '/api/register/',
            {
                'username': 'joao',
                'email': 'joao@example.com',
                'first_name': 'Joao',
                'last_name': 'Ulian',
                'password': 'secret123',
            },
            format='json',
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        token = register_response.data['token']
        self.assertTrue(token)

        # autentica próximas requests
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

        # 2) cria todo
        create_response = self.client.post(
            '/api/todos/',
            {
                'description': 'Comprar leite',
                'status': 'pending',
                'category': 'compras',
            },
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        todo_id = create_response.data['id']
        self.assertEqual(create_response.data['status'], 'pending')
        self.assertIsNotNone(create_response.data['created_at'])
        self.assertIsNotNone(create_response.data['updated_at'])
        created_at = create_response.data['created_at']
        initial_updated_at = create_response.data['updated_at']

        # 3) lista todos
        list_response = self.client.get('/api/todos/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['id'], todo_id)

        # 4) atualiza status
        update_response = self.client.patch(
            f'/api/todos/{todo_id}/status/',
            {'status': 'done'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['status'], 'done')
        self.assertEqual(update_response.data['created_at'], created_at)
        self.assertNotEqual(update_response.data['updated_at'], initial_updated_at)

        # 5) lista com filtro
        filtered_done = self.client.get('/api/todos/', {'status': 'done'})
        self.assertEqual(filtered_done.status_code, status.HTTP_200_OK)
        self.assertEqual(len(filtered_done.data), 1)
        self.assertEqual(filtered_done.data[0]['status'], 'done')

        filtered_pending = self.client.get('/api/todos/', {'status': 'pending'})
        self.assertEqual(filtered_pending.status_code, status.HTTP_200_OK)
        self.assertEqual(len(filtered_pending.data), 0)

        restore_response = self.client.patch(
            f'/api/todos/{todo_id}/status/',
            {'status': 'pending'},
            format='json',
        )
        self.assertEqual(restore_response.status_code, status.HTTP_200_OK)
        self.assertEqual(restore_response.data['status'], 'pending')

        invalid_status = self.client.get('/api/todos/', {'status': 'in_progress'})
        self.assertEqual(invalid_status.status_code, status.HTTP_400_BAD_REQUEST)

        invalid_create = self.client.post(
            '/api/todos/',
            {
                'description': 'Old status',
                'status': 'in_progress',
                'category': 'compras',
            },
            format='json',
        )
        self.assertEqual(invalid_create.status_code, status.HTTP_400_BAD_REQUEST)

        other_user = User.objects.create_user(username='other-user', password='secret123')
        Todo.objects.create(
            user=other_user,
            description='Another user task',
            status='pending',
            category='private',
        )
        own_todos = self.client.get('/api/todos/')
        self.assertEqual(own_todos.status_code, status.HTTP_200_OK)
        self.assertEqual(len(own_todos.data), 1)


class InProgressStatusMigrationTest(TransactionTestCase):
    migrate_from = ('todos', '0002_todo_timestamps')
    migrate_to = ('todos', '0003_remove_in_progress_status')

    @property
    def executor(self):
        return MigrationExecutor(connection)

    def setUp(self):
        super().setUp()
        self.executor.migrate([self.migrate_from])
        old_apps = self.executor.loader.project_state([self.migrate_from]).apps
        User = old_apps.get_model('auth', 'User')
        Todo = old_apps.get_model('todos', 'Todo')
        self.user = User.objects.create(username='legacy-user', password='unused')
        self.todo_id = Todo.objects.create(
            user_id=self.user.id,
            description='Legacy task',
            category='work',
            status='in_progress',
        ).id

    def tearDown(self):
        self.executor.migrate([self.migrate_to])
        super().tearDown()

    def test_in_progress_records_become_pending(self):
        self.executor.migrate([self.migrate_to])
        new_apps = self.executor.loader.project_state([self.migrate_to]).apps
        Todo = new_apps.get_model('todos', 'Todo')

        self.assertEqual(Todo.objects.get(pk=self.todo_id).status, 'pending')
