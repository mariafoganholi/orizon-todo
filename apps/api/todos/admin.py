# todos/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Todo  # + User if custom

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'description', 'status', 'category', 'created_at', 'updated_at')
    list_filter = ('status', 'category')
    search_fields = ('description', 'user__email', 'user__first_name')
