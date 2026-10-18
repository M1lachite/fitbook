from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import BookingDestroyView, BookingListCreateView, FitnessClassViewSet

router = SimpleRouter()
router.register('classes', FitnessClassViewSet, basename='class')

urlpatterns = router.urls + [
    path('bookings/', BookingListCreateView.as_view()),
    path('bookings/<int:pk>/', BookingDestroyView.as_view()),
]