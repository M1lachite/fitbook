from django.contrib import admin

from .models import Booking, FitnessClass


@admin.register(FitnessClass)
class FitnessClassAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'start_time', 'capacity')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'fitness_class', 'created_at')
