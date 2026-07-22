from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


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
