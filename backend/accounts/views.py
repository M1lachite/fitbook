from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import connection

from .models import User
from .permissions import IsAdmin
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    queryset = User.objects.order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    try:
        # Proste zapytanie do bazy: jeśli się uda, baza odpowiada
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        return Response({'status': 'UP', 'database': 'CONNECTED'})
    except Exception:
        return Response({'status': 'DOWN', 'database': 'DISCONNECTED'}, status=500)