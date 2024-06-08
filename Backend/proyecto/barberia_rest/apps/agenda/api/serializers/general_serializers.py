from apps.agenda.models import DateUser,Timetable
from rest_framework import serializers

class DateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = DateUser
        exclude = ('state', 'created_date', 'modified_date', 'delete_date')

    def to_representation(self, instance):
        data = {
            'id': instance.id,
            'local': instance.local,
            'foreinguser': instance.foreinguser.id,
            'startwork': instance.startwork,
            'finishwork': instance.finishwork,
            'timebreak': instance.timebreak,
            'timeseccion': instance.timeseccion,
            'breakstart': instance.breakstart,
        }   

        is_holidays = self.context.get('is_holidays', False)
        if is_holidays:
            data['startwork_holi'] = instance.startwork_holi
            data['finishwork_holi'] = instance.finishwork_holi
            data['breakstart_holi'] = instance.breakstart_holi

        return data

    def is_valid(self, raise_exception=True):
        # Verificar si el estado es False y permitir la creación de datos repetidos
        print("is validate created ------------------------------------------------------------------------------------------------------------------------------")
        print(not self.initial_data.get('state', True))
        if not self.initial_data.get('state', True):
            
            return True
        else:
            # Si el estado no es False, llamar a la validación normal
            return super().is_valid(raise_exception=raise_exception)

class TimetableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timetable
        fields = ['id', 'foreinguser', 'datos_json']
    
    def is_valid(self, raise_exception=False):
        # Verificar si el estado es False y permitir la creación de datos repetidos
        if not self.initial_data.get('state', True):
            return True
        else:
            # Si el estado no es False, llamar a la validación normal
            return super().is_valid(raise_exception=raise_exception)
        

class ScheduleRequestSerializer(serializers.Serializer):
    user_pro = serializers.IntegerField(required=True)
    fecha = serializers.DateField(required=True)

class AvailableSchedulesSerializer(serializers.Serializer):
    horarios_disponibles = serializers.ListField(child=serializers.CharField())