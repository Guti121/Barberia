from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

#import del proyecto 
from apps.user.models import User


#modificacion del serializador del authToken
class CustomAuthTokenSerializer(serializers.Serializer):
    phonenumber = serializers.CharField(
        label=_("Phone number"),
        write_only=True
    )
    password = serializers.CharField(
        label=_("Password"),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )
    token = serializers.CharField(
        label=_("Token"),
        read_only=True
    )

    def validate(self, attrs):
        phonenumber = attrs.get('phonenumber')
        password = attrs.get('password')

        if phonenumber and password:
            user = authenticate(request=self.context.get('request'),
                                phonenumber=phonenumber, password=password)

            # The authenticate call simply returns None for is_active=False
            # users. (Assuming the default ModelBackend authentication
            # backend.)
            if not user:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Must include "username" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs
    
    
#Serializador para retorno del token de usuario  
class UserTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=('username','phonenumber','name','lastname')
