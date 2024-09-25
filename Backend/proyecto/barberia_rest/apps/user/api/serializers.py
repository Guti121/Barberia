from rest_framework import serializers 
from apps.user.models import User
from apps.agenda.api.serializers.agenda_serializers import ListAgendaSerializer


class UserListSerializer(serializers.ModelSerializer):
   
        
    def to_representation(self, instance):
        return {

            'id':instance['id'],
            'phonenumber':instance['phonenumber'],
            'username': instance['username'],
            'name': instance['name'],
            'lastname': instance['lastname'],
            'country':instance['country'],
            'city':instance['city'],
            'password':instance['password'],
        }


class UserLisProSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username','phonenumber','city','name','lastname']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields ='__all__'
        

    def create(self, validated_data):
        user=User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user
    #_____________________Poner estado y arreglar el put delete _________________________________
    def update(self, instance, validated_data):
        update_user=super().update(instance,validated_data)
        update_user.set_password(validated_data['password'])
        update_user.save()
        return update_user
    


