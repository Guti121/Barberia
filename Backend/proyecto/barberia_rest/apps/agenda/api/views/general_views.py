import datetime
from datetime import date, timedelta,time,datetime

from django.utils import timezone
from rest_framework import viewsets ,status
from rest_framework.generics import CreateAPIView,DestroyAPIView,UpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.agenda.api.serializers.general_serializers import DateUserSerializer,TimetableSerializer
from apps.agenda.api.serializers.agenda_serializers import ListAgendaSerializer,CreateAgendaSerializer
from apps.agenda.models import ListAgenda,DateUser
from apps.user.models import User
from apps.agenda.api.views.festivo import is_day_holiday
#import proyecto authenticate
from apps.user.authentication_mixins import Authentication
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

#Listado de agenda para cliente,turnos reservados por el 
class UserAgendasViewClie(Authentication,APIView):
    serializer_class = ListAgendaSerializer
    authentication_classes =[TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def validate_date_format(self,date_str):
        try:
            # Intenta convertir la cadena a un objeto datetime
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except ValueError:
            # La cadena no está en el formato correcto
            return False

    def post(self,request,*args,**kwargs):
        #obtenemos el token para verificar el usuario
        token= request.auth
        print(token)
        dateGet = request.data.get('date')
        print(dateGet)
        user_id =token.user.id

        if user_id is None or token is None:
            return Response({'error': 'Se produjo un error desconocido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = User.objects.get(id = user_id)
        except User.DoesNotExist:
            return Response({'error':'Usuario no existe'}, status=status.HTTP_404_NOT_FOUND)
        
        if usuario.is_active :
            # Verifica si la fecha tiene el formato correcto
            if not self.validate_date_format(dateGet):
                return Response("Formato de hora erroneo", status=status.HTTP_400_BAD_REQUEST)
            
            agendas = ListAgenda.objects.filter(user_clie=user_id, day__gte=dateGet)
            serializer = ListAgendaSerializer(agendas, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        else:
            return Response({'error': 'Usuario no disponible o no profesional.'}, status=status.HTTP_400_BAD_REQUEST)



#Listado de agenda para listar turnos agendados de un profecional (Solo profesionales)
class UserAgendasView(Authentication,APIView):
    serializer_class = ListAgendaSerializer
    authentication_classes = [TokenAuthentication]  # Agrega TokenAuthentication
    permission_classes = [IsAuthenticated]  # Agrega IsAuthenticated

    def validate_date_format(self,date_str):
        try:
            # Intenta convertir la cadena a un objeto datetime
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except ValueError:
            # La cadena no está en el formato correcto
            return False

    def post(self, request, *args, **kwargs):
        # Obtén los datos de la solicitud POST enviados desde el frontend
        token = request.auth
        dateGet = request.data.get('date')
        type = request.data.get('type')
        user_id = token.user.id

        print(type)

        if user_id is None or dateGet is None:
            return Response({'error': 'Se produjo un error desconocido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"message": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if usuario.is_professional and usuario.is_active:
            # Verifica si la fecha tiene el formato correcto
            if not self.validate_date_format(dateGet):
                return Response("Formato de hora erroneo", status=status.HTTP_400_BAD_REQUEST)
            
            # Filtra las agendas según el usuario y el día
            if type == 'confirmed':
                agendas = ListAgenda.objects.filter(user_pro=usuario, day=dateGet, state=True)
            elif type == 'pending':
                agendas = ListAgenda.objects.filter(user_pro=usuario, day=dateGet, state=False)
            serializer = ListAgendaSerializer(agendas, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Usuario no disponible o no profesional.'}, status=status.HTTP_400_BAD_REQUEST)

class ConfirmScheduls(Authentication, UpdateAPIView):
    authentication_classes = [TokenAuthentication]  # Token de autenticación
    permission_classes = [IsAuthenticated]  # Permisos de autenticación
    serializer_class = ListAgendaSerializer

    def patch(self, request, *args, **kwargs):
        print('hola patch')
        token = request.auth
        user_id = token.user.id if token else None  # Verificar que el token no sea None
        print(token,'user:',user_id)
        if token is None:
            return Response({'error': 'Token no encontrado'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            usuario = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"message": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if usuario.is_professional and usuario.is_active:
            try:
                # Obtén el 'agenda_id' desde los kwargs
                agenda_id = request.data.get('itemID')  # Asegúrate de pasar 'agenda_id' en la URL

                # Busca la agenda por id y profesional
                query = ListAgenda.objects.get(id=agenda_id, user_pro=user_id)
                print(query.user_pro)
                if user_id == query.user_pro.id:
                    # Actualiza el estado a 'True'
                    query.state = True
                    query.save()  # Guarda los cambios en la base de datos

                    # Retorna la representación del objeto actualizado
                    serializer = self.get_serializer(query)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response({'Error':'Usuario no autorizado'},status=status.HTTP_401_UNAUTHORIZED)
            
            except ListAgenda.DoesNotExist:
                return Response({'error': 'Agenda no encontrada'}, status=status.HTTP_404_NOT_FOUND)
            
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response({'error': 'Usuario no es profesional o no está activo'}, status=status.HTTP_401_UNAUTHORIZED)


#Se realizo la vista create para que lo usuarios puedan agendar su cita
class AgendaCreateAPIView(Authentication,CreateAPIView):
    serializer_class=CreateAgendaSerializer
    authentication_classes = [TokenAuthentication]  # Agrega TokenAuthentication
    permission_classes = [IsAuthenticated]  # Agrega IsAuthenticated

    

    def post(self, request, *args, **kwargs):
        # Accede al token de autenticación

        token = request.auth

        # Accede a los datos de la solicitud POST enviados desde el frontend
        data = request.data.copy() 
        
        day = request.data.get('day')
        date_start = request.data.get('date_start')
        user_pro = request.data.get('user_pro')
        
        # Verificamos que el token del user_clie que va a hacer la reserva coincida con el ususario autenticado en ese momento
        if not token:
            return Response({'error': 'Token de autenticación no proporcionado.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Accede al usuario autenticado a través del token
        usuario_autenticado = token.user
        
        
        # Verificacion de usuario profesional
        user = User.objects.get(id=user_pro)
        user_id=user.id

        if user.is_professional and user.is_active:

            day_as_date = datetime.strptime(day, "%Y-%m-%d").date()
            if day_as_date == date.today() and date_start<= (datetime.now().time().strftime("%H:%M:%S")):
                    return Response({'error':'Este turno ya no esta disponible'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Se trae el usuario profesional para después verificar si tiene activos los festivos o no
                agenda = DateUser.objects.get(foreinguser=user_pro,state=True)
                # Llamamos a la función Validate_datefinish
                date_finish = self.Validate_datefinish(date_start,agenda)
                print (date_finish)
                #Verificamos que la fecha que ingrese el cliente este dentro del rango establecido por el usuario profesional 
            
                enabled_days=enabled_days = date.today() + timedelta(days=8)
                today=date.today()

                # Convierte la cadena en una fecha
                date_obj = datetime.strptime(day, "%Y-%m-%d").date()
                print(date_obj)

                if today <= date_obj <= enabled_days:
                    
                    #Agregamos el user_clie al serializador tomandolo de Usuario_Autenticado.id
                    data['user_clie']=usuario_autenticado.id
                    data['date_finish'] = date_finish.strftime("%H:%M:%S")
                    serializer = CreateAgendaSerializer(data=data)
                    print("""""""""""""""""""""""""""""""""""""""""""""""")
                    print(data)

                    if self.validar_cita(data,agenda):
                        print("valido cita1")
                        # verificamos llamando la funcion para asegurarnos que el cliente como minimo lleve 7 dias de la ultima reserva 
                        if self.minimum_time_date(usuario_autenticado.id):
                            
                            if agenda.is_holidays:
                                if self.validate_hora(day,date_start,user_id,festivo=True):
                                    print(serializer,"validate:hora" )
                                    if serializer.is_valid():
                                        print("valido el serializador")  
                                        serializer.save()
                                        return Response(serializer.data, status=status.HTTP_201_CREATED)
                                    else:
                                        
                                        return Response({'error': 'Fecha o hora  no disponibles'}, status=status.HTTP_400_BAD_REQUEST)
                                else: 
                                    return Response({'error': 'La fecha o hora se salen de los parametros establecidos por el profesional '}, status=status.HTTP_400_BAD_REQUEST)
                            else:
                                    # Obtiene la fecha de hoy
                                    current_date = day            

                                    # Verifica si cada fecha en la lista es un día festivo
                                    # Se convierte el day en tipo de dato DATE
                                    day_date= datetime.strptime(current_date, "%Y-%m-%d").date()
                                    es_domingo = day_date.weekday() == 6

                                    if self.validate_hora(day,date_start,user_id,festivo=False):

                                        if is_day_holiday(current_date) or es_domingo:
                                            return Response({'error': 'Dia no disponible(Festivo).'}, status=status.HTTP_400_BAD_REQUEST)
                                    
                                        else:
                                            if serializer.is_valid():
                                                serializer.save()
                                                return Response(serializer.data, status=status.HTTP_201_CREATED)
                                    else: 
                                        return Response({'error': 'La fecha o hora se salen de los parametros establecidos por el profesional '}, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            return Response({'error': 'Asegurate de haber cumplido como minimo 7 dias para la siguiente reserva'}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        return Response({'error': 'Fecha o hora  no disponibles'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'error': 'Fecha excede los dias disponibles'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Usuario no disponible o no profesional.'}, status=status.HTTP_400_BAD_REQUEST)



    def Validate_datefinish(self,date_start,agenda):
        

        # Calcula la fecha de finalización sumando el tiempo de la sección a la fecha de inicio
        # Convierte agenda.timeseccion a timedelta
        timeseccion = timedelta(hours=agenda.timeseccion.hour, minutes=agenda.timeseccion.minute)

        # Supongamos que 'date_start' es una cadena en formato HH:MM:SS
        date_start = datetime.strptime(date_start, "%H:%M:%S").time()

        # Suma 'timeseccion' a 'date_start'
        date_finish = (datetime.combine(datetime.today(), date_start) + timeseccion).time()

        # 'time_finish' ahora contiene la hora de finalización
        return date_finish

   
    def validate_hora(self, day, date_start, user_id, festivo):
        current_date = day
        day_date = datetime.strptime(current_date, "%Y-%m-%d").date()
        es_domingo = day_date.weekday() == 6
        print (",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,asdasdas")
        dateu_timetable = TimetableSerializer.Meta.model.objects.filter(foreinguser=user_id, state=True).first()
        print(dateu_timetable)
        if festivo:
            if is_day_holiday(current_date) or es_domingo:
                # Comprobamos si el horario está en la lista de festivos
                if "Holidays" in dateu_timetable.datos_json and date_start in dateu_timetable.datos_json["Holidays"]:
                    print(f"{date_start} está en los festivos")
                    return True
                else:
                    print(f"{date_start} no está en los festivos")
                    return False
            else:
                # Comprobamos si el horario está en la lista de días habilitados (lunes a sábado)
                if "mon_sa" in dateu_timetable.datos_json and date_start in dateu_timetable.datos_json["mon_sa"]:
                    print(f"{date_start} está habilitado entre semana")
                    return True
                else:
                    print(f"{date_start} no está habilitado entre semana")
                    return False
        else:
            if dateu_timetable and "mon_sa" in dateu_timetable.datos_json:
                    if date_start in dateu_timetable.datos_json["mon_sa"]:
                        print("si esta en semana con holidays no habilitados ",date_start)
                        return True
                
    
                
        """
        fecha_objeto = datetime.strptime(day, '%Y-%m-%d')
        # Obtiene el nombre del día de la semana
        dia_semana = fecha_objeto.strftime('%A')
        """



    def validar_cita(self, data,agenda):
        user_pro = data['user_pro']
        user_clie = data['user_clie']
        day = data['day']
        date_start = data['date_start']
        date_finish = data['date_finish']
        print("validando cita2")
        print(date_finish)
        # Verificar superposición de citas
        
        citas_superpuestas = ListAgenda.objects.filter(
            user_pro=user_pro,
            day=day,
            date_start__lt=date_finish,
            date_finish__gt=date_start  )
        print(citas_superpuestas)
        if citas_superpuestas.exists():
            print("validamos False Superpuesta")
            return False

        # Verificar horario de trabajo
        if not self.esta_dentro_del_horario_trabajo(date_start,day,agenda):
            print('no esta dentro del horario Trabajo')
            return False
  
        return True
    
    
    #Se verifica que el usuario no tenga una cita en los ultimos 7 dias 
    def minimum_time_date(self, user_clie):
        ultima_cita = ListAgenda.objects.filter(
                user_clie=user_clie
            ).exclude(
                user_pro=user_clie
            ).order_by(
                '-day'
            ).first()
        
        if ultima_cita:
           
            # Obtén la fecha actual
            fecha_actual = datetime.now().date()

            # Calcula la diferencia de días entre ultima_cita y la fecha actual
            dias_de_diferencia = abs((ultima_cita.day - fecha_actual).days)

            # Verifica si la diferencia de días está fuera del rango de 7 días
            if dias_de_diferencia > 7:
                # La última cita no está dentro de los 7 días anteriores ni dentro de los 7 días siguientes
               return True
            else:
                # La última cita está dentro del rango de 7 días
                return False
        else:
           return True
      
        

    def esta_dentro_del_horario_trabajo(self, date_start, day, agenda):
        """
        Verifica si la fecha y hora `date_start` están dentro del horario laboral definido en `agenda`.
        Considera si el día es festivo o domingo.
        """
        print(is_day_holiday(day))

        # Convierte el día a formato date
        day_format = datetime.strptime(day, "%Y-%m-%d").date()

        if agenda.is_holidays:
            print('trabaja los festivos', day)

            # Verifica si es domingo o festivo
            if day_format.weekday() == 6 or is_day_holiday(day):
                print('trabaja los festivos y es día festivo', day)
                agenda_startwork = agenda.startwork_holi
                agenda_finishwork = agenda.finishwork_holi
                agenda_breakstart = agenda.breakstart_holi
                agenda_timebreak = agenda.timebreak
            else:
                agenda_startwork = agenda.startwork
                agenda_finishwork = agenda.finishwork
                agenda_breakstart = agenda.breakstart
                agenda_timebreak = agenda.timebreak
        else:
            agenda_startwork = agenda.startwork
            agenda_finishwork = agenda.finishwork
            agenda_breakstart = agenda.breakstart
            agenda_timebreak = agenda.timebreak

        # Llama a la función que comprueba si está dentro del horario
        return self.dentro_horario(date_start, agenda_startwork, agenda_finishwork, agenda_breakstart, agenda_timebreak)


    def dentro_horario(self, date_start, agenda_startwork, agenda_finishwork, agenda_breakstart, agenda_timebreak):
        print('entro dentro_horario')

        # Convierte date_start a datetime.time si no lo es ya
        if not isinstance(date_start, time):
            date_start = datetime.strptime(date_start, "%H:%M:%S").time()

        # Verifica si está fuera del horario laboral
        if not (agenda_startwork <= date_start < agenda_finishwork):
            return False

        # Verifica si está dentro del horario de descanso
        start_datetime = datetime.combine(datetime.today(), agenda_breakstart)
        timebreak_timedelta = timedelta(hours=agenda_timebreak.hour, minutes=agenda_timebreak.minute)
        break_finish_datetime = start_datetime + timebreak_timedelta

        start_time = start_datetime.time()
        break_finish_time = break_finish_datetime.time()

        if start_time <= date_start < break_finish_time:
            return False

        return True


class AgendaDestroyAPIView(DestroyAPIView):
    serializer_class1=CreateAgendaSerializer
    
    authentication_classes = [TokenAuthentication]  # Agrega TokenAuthentication
    permission_classes = [IsAuthenticated]  # Agrega IsAuthenticated
   


    def delete(self, request, pk=None):
        token = request.auth
        user = token.user
        user_id=user.id

        if not token:
            return Response({'error': 'Token de autenticación no proporcionado.'}, status=status.HTTP_401_UNAUTHORIZED)
        

        if user.is_authenticated:
            if user.is_active:
                # Obtener el primer objeto
                date_agenda = CreateAgendaSerializer.Meta.model.objects.filter(id=pk).first()
                if date_agenda:
                    print(date_agenda)
                    if date_agenda.user_clie.id == user_id or user_id == date_agenda.user_pro.id:           
                        # Verificar si se encontró alguno de los objetos
                        if date_agenda:
                            date_agenda.delete()
                            return Response({'message': 'Formularios eliminados correctamente'}, status=status.HTTP_200_OK)
                    else:
                        return Response({'error':'Usuario no autorizado!'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'error':'No existe un formulario con estos datos!'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'Usuario no autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        else:
            # Hacer algo si el usuario no está autenticado
            return Response({'error': 'Usuario no autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        
""" 
class AgendaViewSet(Authentication,viewsets.ModelViewSet):
    queryset = ListAgenda.objects.all()
    serializer_class = ListAgendaSerializer
"""
        
""" ##se lista los usuarios sin filtro
class DateUserListAPIView(GeneralListAPIView):
    serializer_class= DateUserSerializer

##Podemos listar una agenda en general sin ningun filtro    
class ListAgendaAPIView(GeneralListAPIView):
    serializer_class= ListAgendaSerializer



##Podemos listar por PK , en este caso se podria listar por PK de turno agendado 
class AgendaRetrieveAPIView(generics.RetrieveAPIView): 
    serializer_class=ListAgendaSerializer


    def get_queryset(self):
        return self.get_serializer().Meta.model.objects.filter(state=True)
    

##Podemos eliminar un turno agendado 
class AgendaDestroyAPIView(generics.DestroyAPIView):
    serializer_class=ListAgendaSerializer

    def get_queryset(self):
       return self.get_serializer().Meta.model.objects.filter(state=True)
    
    #Se modifico el metodo delete para hacer una eliminacion logica 
    def delete(self, request,pk=None):
        agendamiento=self.get_queryset().filter(id=pk).first()
        
        if agendamiento:
            agendamiento.state = False
            agendamiento.save()

            return Response({'message':'Agendamiento eliminado correctamente'},status=status.HTTP_200_OK)
        return Response({'error':'No existe un Agendamiento con estos datos!'}, status=status.HTTP_400_BAD_REQUEST)

##Podemos actualizar un turno agendado 
  
class AgendaUpdateAPIView(generics.UpdateAPIView):
    serializer_class=ListAgendaSerializer

    def get_queryset(self):
       return self.get_serializer().Meta.model.objects.filter(state=True)

    # Modificamos el metodo PATCH que es el que trae la instancia a la que hacemos referencia con el pk
    def patch(self, request, pk=None):
        agendamiento=self.get_queryset().filter(id=pk).first()

        if agendamiento:
            ListAgendaSerializer=self.serializer_class(agendamiento)
            return Response (ListAgendaSerializer.data,status=status.HTTP_200_OK)
        return Response({'error':'No existe un Agendamiento con estos datos!'}, status=status.HTTP_400_BAD_REQUEST)
        """
