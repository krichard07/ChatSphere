from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    password_confirm = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "password",
            "password_confirm",
        ]

        read_only_fields = [
            "id",
        ]

    def validate(self, attrs):

        if (
            attrs["password"] !=
            attrs["password_confirm"]
        ):
            raise serializers.ValidationError({
                "password_confirm":
                    "A jelszavak nem egyeznek."
            })

        return attrs

    def create(self, validated_data):

        validated_data.pop(
            "password_confirm"
        )

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user


class ProfileSerializer(serializers.ModelSerializer):
    remove_avatar = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "avatar",
            "theme",
            "remove_avatar",
        ]

        read_only_fields = ["id"]

    def update(self, instance, validated_data):
        remove_avatar = validated_data.pop(
            "remove_avatar",
            False,
        )

        if remove_avatar and instance.avatar:
            instance.avatar.delete(save=False)
            instance.avatar = None

        return super().update(
            instance,
            validated_data
        )


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        write_only=True
    )

    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    new_password_confirm = serializers.CharField(
        write_only=True
    )

    def validate_current_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                "A jelenlegi jelszó helytelen."
            )

        return value

    def validate(self, attrs):
        if (
            attrs["new_password"] !=
            attrs["new_password_confirm"]
        ):
            raise serializers.ValidationError({
                "new_password_confirm":
                    "Az új jelszavak nem egyeznek."
            })

        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user

        user.set_password(
            self.validated_data["new_password"]
        )

        user.save()

        return user