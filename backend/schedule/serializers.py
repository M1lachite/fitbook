from django.utils import timezone
from rest_framework import serializers

from accounts.models import User

from .models import Booking, FitnessClass


class FitnessClassSerializer(serializers.ModelSerializer):
    booked = serializers.IntegerField(read_only=True)

    class Meta:
        model = FitnessClass
        fields = ['id', 'title', 'description', 'instructor', 'start_time', 'capacity', 'booked']

    def validate_capacity(self, value):
        if self.instance and value < self.instance.booked:
            raise serializers.ValidationError(
                'Limit miejsc nie może być mniejszy niż liczba zapisanych osób.'
            )
        return value

    def validate_start_time(self, value):
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError('Termin zajęć nie może być w przeszłości.')
        return value


class BookingSerializer(serializers.ModelSerializer):
    class_title = serializers.CharField(source='fitness_class.title', read_only=True)
    instructor = serializers.CharField(source='fitness_class.instructor', read_only=True)
    start_time = serializers.DateTimeField(source='fitness_class.start_time', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'fitness_class', 'class_title', 'instructor', 'start_time']

    def validate_fitness_class(self, fitness_class):
        if fitness_class.start_time < timezone.now():
            raise serializers.ValidationError('Nie można zapisać się na zajęcia, które już się odbyły.')
        return fitness_class


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']