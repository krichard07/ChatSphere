import json

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from django.contrib.auth import get_user_model

from .models import Channel, Message, MessageAttachment, HiddenMessage, MessageReaction
from .serializers import MessageSerializer

from datetime import timedelta
from django.utils import timezone

User = get_user_model()


class ChatConsumer(WebsocketConsumer):

    def connect(self):
        print("WEBSOCKET CONNECTED")

        self.channel_id = self.scope["url_route"]["kwargs"]["channel_id"]
        self.channel_group_name = f"chat_{self.channel_id}"

        async_to_sync(
            self.channel_layer.group_add
        )(
            self.channel_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(
            self.channel_layer.group_discard
        )(
            self.channel_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        print("WEBSOCKET USER:", self.scope["user"])

        data = json.loads(text_data)

        message_type = data.get("type")

        user = self.scope["user"]


        # =====================================================
        # NEW MESSAGE
        # =====================================================

        if message_type == "message":

            message_text = data.get(
                "content",
                ""
            )

            attachment_ids = data.get(
                "attachments",
                []
            )

            reply_to_id = data.get(
                "reply_to"
            )

            if (
                not message_text.strip()
                and not attachment_ids
            ):
                return

            channel = Channel.objects.get(
                id=self.channel_id
            )

            reply_to_message = None

            if reply_to_id:

                try:
                    reply_to_message = Message.objects.get(
                        id=reply_to_id,
                        channel_id=self.channel_id,
                    )

                except Message.DoesNotExist:
                    reply_to_message = None

            message = Message.objects.create(
                channel=channel,
                user=user,
                content=message_text,
                reply_to=reply_to_message,
            )

            MessageAttachment.objects.filter(
                id__in=attachment_ids,
                user=user,
                message__isnull=True,
            ).update(
                message=message
            )

            print(
                "MENTVE:",
                message.content
            )

            message_data = MessageSerializer(
                message
            ).data

            async_to_sync(
                self.channel_layer.group_send
            )(
                self.channel_group_name,
                {
                    "type": "chat_message",
                    "message": message_data,
                }
            )

            return


        # =====================================================
        # EDIT MESSAGE
        # =====================================================

        if message_type == "message_edit":

            message_id = data.get(
                "message_id"
            )

            new_content = data.get(
                "content",
                ""
            )

            if not message_id:
                return

            if not new_content.strip():
                return

            try:

                message = Message.objects.get(
                    id=message_id,
                    channel_id=self.channel_id,
                    user=user,
                )

            except Message.DoesNotExist:
                return

            edit_deadline = (
                message.created_at +
                timedelta(minutes=15)
            )

            if timezone.now() > edit_deadline:

                self.send(
                    text_data=json.dumps({
                        "type": "message_edit_error",
                        "message_id": message.id,
                        "error": "edit_time_expired",
                    })
                )

                return

            message.content = new_content.strip()
            message.edited_at = timezone.now()
            message.save()

            message_data = MessageSerializer(
                message
            ).data

            async_to_sync(
                self.channel_layer.group_send
            )(
                self.channel_group_name,
                {
                    "type": "message_edited",
                    "message": message_data,
                }
            )

            return

        # =====================================================
        # DELETE / UNSEND MESSAGE
        # =====================================================

        if message_type == "message_delete":

            message_id = data.get(
                "message_id"
            )

            if not message_id:
                return

            try:

                message = Message.objects.get(
                    id=message_id,
                    channel_id=self.channel_id,
                    user=user,
                )

            except Message.DoesNotExist:
                return

            delete_deadline = (
                message.created_at +
                timedelta(minutes=15)
            )

            if timezone.now() > delete_deadline:

                self.send(
                    text_data=json.dumps({
                        "type": "message_delete_error",
                        "message_id": message.id,
                        "error": "delete_time_expired",
                    })
                )

                return

            deleted_message_id = message.id

            message.delete()

            async_to_sync(
                self.channel_layer.group_send
            )(
                self.channel_group_name,
                {
                    "type": "message_deleted",
                    "message_id": deleted_message_id,
                }
            )

            return

        # =====================================================
        # HIDE MESSAGE FOR CURRENT USER
        # =====================================================

        if message_type == "message_hide":

            message_id = data.get(
                "message_id"
            )

            if not message_id:
                return

            try:

                message = Message.objects.get(
                    id=message_id,
                    channel_id=self.channel_id,
                )

            except Message.DoesNotExist:
                return

            if message.user == user:

                self.send(
                    text_data=json.dumps({
                        "type": "message_hide_error",
                        "message_id": message.id,
                        "error": "cannot_hide_own_message",
                    })
                )

                return

            HiddenMessage.objects.get_or_create(
                user=user,
                message=message,
            )

            self.send(
                text_data=json.dumps({
                    "type": "message_hidden",
                    "message_id": message.id,
                })
            )

            return

            # =====================================================
        # ADD / REMOVE MESSAGE REACTION
        # =====================================================

        if message_type == "message_reaction":

            message_id = data.get(
                "message_id"
            )

            emoji = data.get(
                "emoji"
            )

            if not message_id or not emoji:
                return

            try:
                message = Message.objects.get(
                    id=message_id,
                    channel_id=self.channel_id,
                )

            except Message.DoesNotExist:
                return

            existing_reaction = (
                MessageReaction.objects.filter(
                    message=message,
                    user=user,
                    emoji=emoji,
                ).first()
            )

            if existing_reaction:

                existing_reaction.delete()

            else:

                MessageReaction.objects.create(
                    message=message,
                    user=user,
                    emoji=emoji,
                )

            reactions = []

            grouped_reactions = {}

            for reaction in message.reactions.all():

                if reaction.emoji not in grouped_reactions:

                    grouped_reactions[
                        reaction.emoji
                    ] = 0

                grouped_reactions[
                    reaction.emoji
                ] += 1

            for reaction_emoji, count in grouped_reactions.items():

                reactions.append({
                    "emoji": reaction_emoji,
                    "count": count,
                })

            async_to_sync(
                self.channel_layer.group_send
            )(
                self.channel_group_name,
                {
                    "type": "message_reaction_updated",
                    "message_id": message.id,
                    "reactions": reactions,
                }
            )

            return

    def chat_message(self, event):
        print("KÜLDÉS:", event)

        self.send(
            text_data=json.dumps(event["message"])
        )

    def message_edited(self, event):

        self.send(
            text_data=json.dumps({
                "type": "message_edited",
                "message": event["message"],
            })
        )

    def message_deleted(self, event):

        self.send(
            text_data=json.dumps({
                "type": "message_deleted",
                "message_id": event["message_id"],
            })
        )

    def message_reaction_updated(self, event):

        self.send(
            text_data=json.dumps({
                "type": "message_reaction_updated",
                "message_id": event["message_id"],
                "reactions": event["reactions"],
            })
        )