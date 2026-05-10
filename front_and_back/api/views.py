from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from .models import User, Movie, Purchase
from .serializers import MovieSerializer


class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer


@api_view(['POST'])
def register(request):
    data = request.data
    if User.objects.filter(email=data['email']).exists():
        return Response({'error': 'Email уже занят'}, status=400)
    user = User.objects.create(
        fullname=data['fullname'],
        email=data['email'],
        password=make_password(data['password']),
        role='user'
    )
    return Response({
        'id': user.id,
        'fullname': user.fullname,
        'email': user.email,
        'role': user.role
    })


@api_view(['POST'])
def login(request):
    data = request.data
    try:
        user = User.objects.get(email=data['email'])
        if check_password(data['password'], user.password):
            return Response({
                'id': user.id,
                'fullname': user.fullname,
                'email': user.email,
                'role': user.role
            })
        return Response({'error': 'Неверный пароль'}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=400)


@api_view(['GET'])
def user_tickets(request, user_id):
    purchases = Purchase.objects.filter(user_id=user_id).select_related('movie')
    data = []
    for p in purchases:
        data.append({
            'id': p.id,
            'movie_title': p.movie.title,
            'poster_url': p.movie.poster_url,
            'show_date': p.show_date,
            'show_time': p.show_time,
            'row_num': p.row_num,
            'seat_num': p.seat_num,
            'barcode': p.barcode,
            'price': str(p.movie.price),
            'purchase_date': p.purchase_date
        })
    return Response(data)


@api_view(['POST'])
def buy_ticket(request):
    data = request.data
    purchase = Purchase.objects.create(
        user_id=data['user_id'],
        movie_id=data['movie_id'],
        show_date=data['show_date'],
        show_time=data['show_time'],
        row_num=data['row_num'],
        seat_num=data['seat_num'],
        barcode=f"TK-{data['user_id']}{data['movie_id']}{data['row_num']}{data['seat_num']}"
    )
    return Response({'id': purchase.id, 'barcode': purchase.barcode}, status=201)


@api_view(['DELETE'])
def cancel_ticket(request, ticket_id):
    Purchase.objects.filter(id=ticket_id).delete()
    return Response({'status': 'ok'})


@api_view(['GET'])
def admin_stats(request):
    total_tickets = Purchase.objects.count()
    total_users = User.objects.count()
    total_revenue = 0
    for p in Purchase.objects.select_related('movie'):
        total_revenue += float(p.movie.price)
    return Response({
        'total_tickets': total_tickets,
        'total_users': total_users,
        'total_revenue': round(total_revenue, 2)
    })


@api_view(['GET'])
def admin_tickets(request):
    purchases = Purchase.objects.select_related('user', 'movie')
    data = []
    for p in purchases:
        data.append({
            'id': p.id,
            'user_name': p.user.fullname,
            'movie_title': p.movie.title,
            'show_date': p.show_date,
            'show_time': p.show_time,
            'row_num': p.row_num,
            'seat_num': p.seat_num,
            'price': str(p.movie.price),
            'barcode': p.barcode
        })
    return Response(data)


@api_view(['DELETE'])
def admin_delete_ticket(request, ticket_id):
    Purchase.objects.filter(id=ticket_id).delete()
    return Response({'status': 'ok'})