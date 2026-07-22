from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Todo
from .serializers import RegisterSerializer, TodoSerializer

class RegisterView(APIView):
    authentication_classes = []  # public
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'token': token.key,
            },
            status=status.HTTP_201_CREATED,
        )
    
class TodoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        todos = Todo.objects.filter(user=request.user).order_by('-id')

        status_filter = request.query_params.get('status')
        if status_filter:
            valid = {c.value for c in Todo.Status}
            if status_filter not in valid:
                return Response(
                    {'status': [f'Must be one of: {", ".join(sorted(valid))}']},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            todos = todos.filter(status=status_filter)

        return Response(TodoSerializer(todos, many=True).data)

    def post(self, request):
        serializer = TodoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        todo = serializer.save(user=request.user)
        return Response(TodoSerializer(todo).data, status=status.HTTP_201_CREATED)