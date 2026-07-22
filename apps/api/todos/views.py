from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

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
    
class TodoCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TodoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        todo = serializer.save(user=request.user)
        return Response(TodoSerializer(todo).data, status=status.HTTP_201_CREATED)