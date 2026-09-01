from rest_framework import serializers
from .models import Channel, Message, MessageAttachment


class ChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ["id", "name", "created_at"]


class MessageAttachmentSerializer(serializers.ModelSerializer):

    file = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()

    class Meta:
        model = MessageAttachment
        fields = [
            "id",
            "file",
            "size",
        ]

    def get_file(self, obj):
        return obj.file.url

    def get_size(self, obj):
        return obj.file.size

class ReplyMessageSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = Message

        fields = [
            "id",
            "username",
            "content",
        ]


class MessageSerializer(serializers.ModelSerializer):

    reactions = serializers.SerializerMethodField()

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    attachments = MessageAttachmentSerializer(
    many=True,
    read_only=True,
    )

    reply_to = ReplyMessageSerializer(
        read_only=True
    )

    def get_reactions(self, obj):

        grouped_reactions = {}

        request = self.context.get("request")

        current_user = None

        if request and request.user.is_authenticated:
            current_user = request.user

        for reaction in obj.reactions.all():

            emoji = reaction.emoji

            if emoji not in grouped_reactions:
                grouped_reactions[emoji] = {
                    "emoji": emoji,
                    "count": 0,
                    "reacted_by_me": False,
                }

            grouped_reactions[emoji]["count"] += 1

            if (
                current_user
                and reaction.user_id == current_user.id
            ):
                grouped_reactions[emoji]["reacted_by_me"] = True

        return list(grouped_reactions.values())

    class Meta:
        model = Message
        fields = [
        "id",
        "channel",
        "username",
        "content",
        "attachments",
        "reply_to",
        "reactions",
        "created_at",
        "updated_at",
        "edited_at",
    ]
        
    extra_kwargs = {
        "channel": {"write_only": False},
}