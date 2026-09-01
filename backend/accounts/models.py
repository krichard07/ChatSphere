from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)

    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
    )

    theme = models.CharField(
        max_length=10,
        choices=[
            ("dark", "Dark"),
            ("light", "Light"),
        ],
        default="dark",
    )

    def __str__(self):
        return self.username