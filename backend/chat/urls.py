from django.urls import path

from .views import (
    ChannelListCreateView,
    MessageListCreateView,
    ChannelMessagesView,
    FileUploadView,
    AttachmentPreviewView,
)

urlpatterns = [
    path(
        "channels/",
        ChannelListCreateView.as_view(),
        name="channels",
    ),

    path(
        "messages/",
        MessageListCreateView.as_view(),
        name="messages",
    ),

    path(
        "channels/<int:channel_id>/messages/",
        ChannelMessagesView.as_view(),
        name="channel_messages",
    ),

    path(
        "upload/",
        FileUploadView.as_view(),
        name="upload_file",
    ),

    path(
    "attachments/<int:attachment_id>/preview/",
    AttachmentPreviewView.as_view(),
    name="attachment_preview",
),

]