from apps.agenda.models import ListAgenda
from rest_framework import serializers

class ListAgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model= ListAgenda
        exclude= ('created_date','modified_date','delete_date')
    
    
    # Lo utilizamos para indicar que atributo se va a mostrar en la llave foranea...

    def to_representation(self, instance):
        return {
            'id':instance.id,
            'day': instance.day,
            'date_start':instance.date_start,
            'date_finish':instance.date_finish,
            'user_pro':f"{instance.user_pro.name} {instance.user_pro.lastname}" if instance.user_pro and instance.user_pro.name and instance.user_pro.lastname else None,
            'user_clie': f"{instance.user_clie.name} {instance.user_clie.lastname}" if instance.user_clie and instance.user_clie.name and instance.user_clie.lastname else None,
            'state':instance.state
        }
    

class CreateAgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model= ListAgenda
        exclude= ('state','created_date','modified_date','delete_date')
    
    
    # Lo utilizamos para indicar que atributo se va a mostrar en la llave foranea...

    def to_representation(self, instance):
        return {
            'id':instance.id,
            'day': instance.day,
            'date_start':instance.date_start,
            'user_pro':instance.user_pro.name,
            'user_clie':instance.user_clie.name,
        }