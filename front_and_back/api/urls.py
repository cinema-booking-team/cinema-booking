from django.urls import path
from rest_framework import routers
from .views import MovieViewSet, register, login, user_tickets, buy_ticket, cancel_ticket, admin_stats, admin_tickets, admin_delete_ticket

router = routers.SimpleRouter()
router.register(r'movies', MovieViewSet, basename='movie')

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('tickets/<int:user_id>/', user_tickets),
    path('buy/', buy_ticket),
    path('cancel/<int:ticket_id>/', cancel_ticket),
    path('admin/stats/', admin_stats),
    path('admin/tickets/', admin_tickets),
    path('admin/tickets/<int:ticket_id>/', admin_delete_ticket),
] + router.urls