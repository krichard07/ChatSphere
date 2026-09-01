from pathlib import Path

from django.contrib.auth import get_user_model

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Channel, Message, MessageAttachment, HiddenMessage
from .serializers import (
    ChannelSerializer,
    MessageSerializer,
    MessageAttachmentSerializer,
)

User = get_user_model()


class ChannelListCreateView(generics.ListCreateAPIView):
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticated]


class MessageListCreateView(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        message = serializer.save(
            user=self.request.user
        )

        channel_layer = get_channel_layer()

        message_data = MessageSerializer(message).data

        async_to_sync(
            channel_layer.group_send
        )(
            f"chat_{message.channel.id}",
            {
                "type": "chat_message",
                "message": message_data,
            }
        )


class ChannelMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        channel_id = self.kwargs["channel_id"]

        hidden_message_ids = (
            HiddenMessage.objects.filter(
                user=self.request.user
            )
            .values_list(
                "message_id",
                flat=True
            )
        )

        return (
            Message.objects.filter(
                channel_id=channel_id
            )
            .exclude(
                id__in=hidden_message_ids
            )
            .order_by("created_at")
        )


class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"error": "No file uploaded."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attachment = MessageAttachment.objects.create(
            user=request.user,
            file=uploaded_file,
        )

        return Response(
            {
                "attachment_id": attachment.id,
                "name": attachment.file.name.split("/")[-1],
                "url": attachment.file.url,
            },
            status=status.HTTP_201_CREATED,
        )


class AttachmentPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attachment_id):

        try:
            attachment = MessageAttachment.objects.get(
                id=attachment_id,
                user=request.user,
            )

        except MessageAttachment.DoesNotExist:
            return Response(
                {
                    "error": "Attachment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        attachment_data = MessageAttachmentSerializer(
            attachment
        ).data

        extension = Path(
            attachment.file.name
        ).suffix.lower()

        text_extensions = {
            ".txt",
            ".md",
            ".json",
            ".csv",
            ".xml",
            ".yaml",
            ".yml",
            ".log",
        }

        document_extensions = {
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
        }

        image_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp",
        }

        media_extensions = {
            ".mp3",
            ".wav",
            ".ogg",
            ".aac",
            ".flac",
            ".mp4",
            ".mov",
            ".avi",
            ".mkv",
            ".webm",
        }

        if extension in document_extensions:
            return Response(
                {
                    "preview_type": "document",
                    "attachment": attachment_data,
                    "filename": attachment.file.name.split("/")[-1],
                }
            )

        if extension in image_extensions:
            return Response(
                {
                    "preview_type": "image",
                    "attachment": attachment_data,
                }
            )

        if extension in media_extensions:
            return Response(
                {
                    "preview_type": "media",
                    "attachment": attachment_data,
                    "filename": attachment.file.name.split("/")[-1],
                }
            )

        if extension not in text_extensions:
            return Response(
                {
                    "preview_type": "unknown",
                    "attachment": attachment_data,
                    "filename": attachment.file.name.split("/")[-1],
                }
            )

        try:

            with attachment.file.open("rb") as file:

                content = file.read().decode("utf-8")

        except UnicodeDecodeError:

            return Response(
                {
                    "error": "The file is not UTF-8 encoded."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "preview_type": "text",
                "attachment": attachment_data,
                "filename": attachment.file.name.split("/")[-1],
                "content": content,
            }
        )