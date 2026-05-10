from django.db import models

class User(models.Model):
    fullname = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=10, default='user')

    class Meta:
        db_table = 'users'

class Movie(models.Model):
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    duration = models.IntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    age_limit = models.CharField(max_length=10)
    poster_url = models.CharField(max_length=255)

    class Meta:
        db_table = 'movies'

class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    show_date = models.DateField()
    show_time = models.TimeField()
    row_num = models.IntegerField()
    seat_num = models.IntegerField()
    barcode = models.CharField(max_length=50)
    purchase_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'purchases'