from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class FitnessClass(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    instructor = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    capacity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        ordering = ['start_time']

    @property
    def booked(self):
        return self.bookings.count()

    def __str__(self):
        return f'{self.title} ({self.start_time:%Y-%m-%d %H:%M})'


class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    fitness_class = models.ForeignKey(FitnessClass, on_delete=models.CASCADE, related_name='bookings')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['fitness_class__start_time']
        constraints = [
            models.UniqueConstraint(fields=['user', 'fitness_class'], name='unique_booking_per_user_class'),
        ]

    def __str__(self):
        return f'{self.user} → {self.fitness_class}'
