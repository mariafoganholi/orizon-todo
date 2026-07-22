from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Todo

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password')

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],  # hashed by create_user
        )
    
class TodoSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(
        choices=Todo.Status.choices,
        required=False,
        default=Todo.Status.PENDING
    )
    
    class Meta:
        model = Todo
        fields = ('id', 'user', 'description', 'status', 'category')
        read_only_fields = ('id', 'user')