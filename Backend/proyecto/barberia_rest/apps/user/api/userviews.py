from rest_framework import viewsets
from apps.user.models import User
from apps.user.api.serializers import UserSerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from apps.agenda.models import ListAgenda
from apps.agenda.api.serializers.agenda_serializers import ListAgendaSerializer

##Muestra un listado de agendas de un usuario en especifico
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    
    @action(detail=True, methods=['GET'])
    def list_filter(self, request, pk=None):
        userp = self.get_object()
        #Filtramos el listado con un user en especifico 
        filter = ListAgenda.objects.filter(user_pro=userp)
        serializer = ListAgendaSerializer(filter, many=True)
        return Response(serializer.data)