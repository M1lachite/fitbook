from django.db import transaction
from django.utils.dateparse import parse_date
from rest_framework import generics, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsInstructorOrAdmin, IsInstructorOrReadOnly

from .models import Booking, FitnessClass
from .serializers import BookingSerializer, FitnessClassSerializer, ParticipantSerializer


def read_date_param(request, name):
    value = request.query_params.get(name)
    if value is None:
        return None
    try:
        parsed = parse_date(value)
    except ValueError:
        parsed = None
    if parsed is None:
        raise serializers.ValidationError({name: 'Nieprawidłowa data, użyj formatu RRRR-MM-DD.'})
    return parsed


class FitnessClassViewSet(viewsets.ModelViewSet):
    serializer_class = FitnessClassSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        queryset = FitnessClass.objects.all()
        date_from = read_date_param(self.request, 'from')
        date_to = read_date_param(self.request, 'to')
        instructor = self.request.query_params.get('instructor')
        if date_from:
            queryset = queryset.filter(start_time__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(start_time__date__lte=date_to)
        if instructor:
            queryset = queryset.filter(instructor__iexact=instructor)
        return queryset

    @action(detail=True, methods=['get'], permission_classes=[IsInstructorOrAdmin])
    def participants(self, request, pk=None):
        fitness_class = self.get_object()
        users = User.objects.filter(bookings__fitness_class=fitness_class).order_by('last_name', 'username')
        return Response(ParticipantSerializer(users, many=True).data)


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('fitness_class')

    def perform_create(self, serializer):
        with transaction.atomic():
            fitness_class = FitnessClass.objects.select_for_update().get(
                pk=serializer.validated_data['fitness_class'].pk
            )
            if fitness_class.bookings.filter(user=self.request.user).exists():
                raise serializers.ValidationError({'detail': 'Jesteś już zapisany na te zajęcia.'})
            if fitness_class.booked >= fitness_class.capacity:
                raise serializers.ValidationError({'detail': 'Brak wolnych miejsc na te zajęcia.'})
            serializer.save(user=self.request.user)


class BookingDestroyView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)