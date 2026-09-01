from django.db import models
from django.conf import settings
from accounts.models import User


class Channel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    channel = models.ForeignKey(
        Channel,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    edited_at = models.DateTimeField(
    null=True,
    blank=True
)
    reply_to = models.ForeignKey(
    "self",
    on_delete=models.SET_NULL,
    related_name="replies",
    null=True,
    blank=True,
)

    def __str__(self):
        return f"{self.user.username}: {self.content[:30]}"
    

class MessageAttachment(models.Model):

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="attachments",
        null=True,
        blank=True,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_attachments",
    )

    file = models.FileField(
        upload_to="chat_files/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.file.name


class HiddenMessage(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="hidden_messages",
    )

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="hidden_by_users",
    )

    hidden_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "message"],
                name="unique_hidden_message_per_user",
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"Message {self.message.id}"
        )

class MessageReaction(models.Model):

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="reactions",
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="message_reactions",
    )

    emoji = models.CharField(
        max_length=10
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "message",
                    "user",
                    "emoji",
                ],
                name="unique_message_user_emoji_reaction",
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.emoji} - "
            f"Message {self.message.id}"
        )