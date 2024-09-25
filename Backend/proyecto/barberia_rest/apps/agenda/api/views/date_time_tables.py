from rest_framework.generics import CreateAPIView, DestroyAPIView
from apps.agenda.api.serializers.agenda_serializers import CreateAgendaSerializer
from rest_framework.response import Response
from rest_framework import status,generics
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from apps.agenda.models import ListAgenda
from django.db.models import Q
#import proyecto authenticate
from apps.user.authentication_mixins import Authentication
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.agenda.api.serializers.general_serializers import DateUserSerializer,TimetableSerializer,ScheduleRequestSerializer,AvailableSchedulesSerializer
from apps.agenda.models import DateUser,User,Timetable,ListAgenda
from apps.agenda.api.views.festivo import is_day_holiday
#Import para timetable 
import datetime
from datetime import date, timedelta,time,datetime  



from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

"""Vista se realiza para poder visualizar el Date user que tiene guardado el usuario"""
class ListDateUserView(Authentication,APIView):
    serializer_class1 = DateUserSerializer
    serializer_class2=TimetableSerializer
    authentication_classes = [TokenAuthentication]  # Agrega TokenAuthentication
    permission_classes = [IsAuthenticated]  # Agrega IsAuthenticated
   

    def post(self, request, *args, **kwargs):
        # Obtén los datos de la solicitud POST enviados desde el frontend
        token = request.auth
        user=token.user
        user_id=user.id
        
        if user_id is None:
            return Response({'error': 'Se requiere el usuario'}, status=status.HTTP_400_BAD_REQUEST)


        if user.is_professional and user.is_active:

            dateu_date = DateUserSerializer.Meta.model.objects.filter(foreinguser=user.id, state=True).first()
            dateu_timetable= TimetableSerializer.Meta.model.objects.filter(foreinguser=user.id, state=True).first()

            serializer1 = DateUserSerializer(dateu_date, many=False)
            
            return Response(serializer1.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Usuario no disponible o no profesional.'}, status=status.HTTP_400_BAD_REQUEST)


""" Esta vista se realiza para guardar el DATEUSER (Los datos de trabajo del ususario) y con la funcion generar_horario_diario
se guarda el horario distribuido como el usuariopro lo designo en DATEUSER """
#Podemos crear un DateUser y un Timetables al tiempo 
class DateCreateAPIView(Authentication,CreateAPIView):
    serializer_class=DateUserSerializer
    serializer_ghd=TimetableSerializer
    authentication_classes = [TokenAuthentication]  # Agrega TokenAuthentication
    permission_classes = [IsAuthenticated]  # Agrega IsAuthenticated
   

    def post(self, request, *args, **kwargs):
        token = request.auth
        
        if not token:
            return Response({'error': 'Token de autenticación no proporcionado.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = token.user
        data = request.data.copy() 
        
        if user.is_professional and user.is_active:
            try:
                is_created = DateUser.objects.get(foreinguser=user.id,state=True)
                
            except ObjectDoesNotExist:
                # Manejar la situación en la que el objeto no existe
                is_created = None

            if is_created:
                return Response({'error': 'Tu formulario ya ha sido diligenciado, debes eliminar el formulario si deseas actualizarlo.'}, status=status.HTTP_403_FORBIDDEN)
            
            else:
                startwork = datetime.strptime(request.data.get('startwork'), '%H:%M:%S').time()
                finishwork = datetime.strptime(request.data.get('finishwork'), '%H:%M:%S').time()
                timeseccion = datetime.strptime(request.data.get('timeseccion'), '%H:%M:%S').time()
                timebreak = datetime.strptime(request.data.get('timebreak'), '%H:%M:%S').time()
                breakstart = datetime.strptime(request.data.get('breakstart'), '%H:%M:%S').time()
                is_holidays = request.data.get('is_holidays', 'false').lower() == 'true'# Convertir a booleano
                print("Holidays is :----------",is_holidays)
                # Para los campos de tiempo relacionados con las vacaciones
                
                # Si es festivo, asegurarse de que los campos relacionados estén presentes
                if is_holidays:
                    startwork_holi = request.data.get('startwork_holi')
                    finishwork_holi = request.data.get('finishwork_holi')
                    breakstart_holi = request.data.get('breakstart_holi')

                    # Verificar si faltan datos para el día festivo
                    if not all([startwork_holi, finishwork_holi, breakstart_holi]):
                        return Response(
                            {"error": "Faltan datos para el horario de días festivos. Se requieren 'startwork_holi', 'finishwork_holi' y 'breakstart_holi'."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Convertir los datos a tipo `time`
                    startwork_holi = datetime.strptime(startwork_holi, '%H:%M:%S').time()
                    finishwork_holi = datetime.strptime(finishwork_holi, '%H:%M:%S').time()
                    breakstart_holi = datetime.strptime(breakstart_holi, '%H:%M:%S').time()
                    # Llamar a la función con is_holidays=True
                    schedule_result = self.generate_schedule(startwork, finishwork, timeseccion, timebreak, breakstart, 
                                                            startwork_holi, finishwork_holi, breakstart_holi, is_holidays=True)
                    
                else:

                    print('entro a is holidays False' )
                    # Llamar a la función con is_holidays=False
                    schedule_result = self.generate_schedule(startwork, finishwork, timeseccion, timebreak, breakstart, 
                                                            None, None, None,  is_holidays=False)
                #print(schedule_result,"schedule_result")
                
                if schedule_result is not False and schedule_result is not None:
                    
                    self.save_horario_diario(schedule_result)
                    data['foreinguser'] = user.id
                    
                    
                    #Desempaquetar los valores de las listas (si están presentes)
                    data = {key: value[0] if isinstance(value, list) else value for key, value in data.items()}
                    serializer_class = DateUserSerializer(data=data)
                    print(serializer_class)
                    
                    if serializer_class.is_valid(raise_exception=True):
                        serializer_class.save()
                        return Response(serializer_class.data, status=status.HTTP_201_CREATED)
                    
                    else:
                        return Response({'error': 'Fecha o hora no válida'}, status=status.HTTP_400_BAD_REQUEST)
                
                else:
                    return Response({'error': 'El horario no es divisible uniformemente.'}, status=status.HTTP_400_BAD_REQUEST)
            
        else:
            return Response({'error': 'Usuario no autorizado.'}, status=status.HTTP_403_FORBIDDEN)
    

    def generate_schedule(self, startwork, finishwork, timeseccion, timebreak, breakstart, 
                      startwork_holi, finishwork_holi, breakstart_holi, is_holidays):
        try:
            # Validar que las horas estén en el formato correcto
            start_time = startwork
            finish_time = finishwork
            break_start_time = breakstart
            print(start_time, finish_time, break_start_time)   

            if is_holidays:
                print(is_holidays, "holidays")
                start_time_holi = startwork_holi
                print(start_time_holi)
                finish_time_holi = finishwork_holi
                print(finish_time_holi)
                break_start_time_holi = breakstart_holi
                print(break_start_time_holi)
            
            # Validar que ambos horarios sean divisibles uniformemente por timeseccion
            print(timeseccion, "Timeseccion")
            # Convertir la cadena de tiempo a un objeto timedelta
            timeseccion_timedelta = datetime.combine(datetime.now().date(), timeseccion) - datetime(1900, 1, 1)

            # Calcular la duración total en minutos 
            if isinstance(timeseccion_timedelta.total_seconds(), (int, float)) and timeseccion_timedelta.total_seconds() != 0:
                print(timeseccion_timedelta, "---------------------------")
                
                # Separar las ramas condicionales del for según si es día festivo o no
                if not is_holidays:
                    print("No es día festivo")
                    for time_info in [(start_time, finish_time)]:
                        diferencia_minutos = (
                            datetime.combine(datetime.now().date(), time_info[1]) - 
                            datetime.combine(datetime.now().date(), time_info[0])
                        ).total_seconds() / 60
                        timeseccion = int(timeseccion_timedelta.seconds // 60)  # Convertir la duración a minutos
                        print(timeseccion)
                        print(diferencia_minutos, "diferencia_minutos")

                        # Verificar que timeseccion sea un valor numérico y evitar la división por cero
                        if isinstance(timeseccion, (int, float)) and timeseccion != 0:
                            print(diferencia_minutos % timeseccion)
                            if diferencia_minutos % timeseccion != 0:
                                print("diferente de cero")
                                return False
                
                else:
                    print("Es día festivo")
                    for time_info in [(start_time_holi, finish_time_holi)]:
                        diferencia_minutos = (
                            datetime.combine(datetime.now().date(), time_info[1]) - 
                            datetime.combine(datetime.now().date(), time_info[0])
                        ).total_seconds() / 60
                        timeseccion = int(timeseccion_timedelta.seconds // 60)  # Convertir la duración a minutos
                        print(timeseccion)
                        print(diferencia_minutos, "diferencia_minutos")

                        # Verificar que timeseccion sea un valor numérico y evitar la división por cero
                        if isinstance(timeseccion, (int, float)) and timeseccion != 0:
                            print(diferencia_minutos % timeseccion)
                            if diferencia_minutos % timeseccion != 0:
                                print("diferente de cero")
                                return False

                print("entro..................................................................................................")
                horarios_dict = {'mon_sa': self.generar_horario_diario(
                    start_time, finish_time, timeseccion, timebreak, break_start_time
                )}

                if is_holidays:
                    print('holidays issss-------------------------:::', is_holidays)
                    horarios_dict['Holidays'] = self.generar_horario_diario(
                        start_time_holi, finish_time_holi, timeseccion, timebreak, break_start_time_holi
                    )
                return horarios_dict

                
    
        except ValueError:
            # Capturar errores de formato de hora
            print("value error")
            return False
            
   
      
    def generar_horario_diario(self, start, finish, timeseccion, timebreak, break_start_time):
        current_time = datetime.combine(datetime.now().date(), start)
        horario_diario = []

        print(current_time)
        print(horario_diario)
        print("Estamos en generar horario")
        
        # Supongamos que timebreak es una cadena en formato "HH:MM:SS"
        
        while current_time.time() < finish:
            print(current_time)
            
            print("Entró en while")
            if current_time.time() == break_start_time:
                print("Entró en if current time")
                print(timebreak)
                # Asegúrate de que current_time sea un objeto datetime
                current_time = datetime.combine(datetime.now().date(), current_time.time())
                print(current_time)
                timebreak_str = timebreak.strftime('%H:%M:%S')  # Convertir timebreak a cadena de texto
                # Parsea timebreak a un objeto timedelta
                hours, minutes, seconds = map(int, timebreak_str.split(':'))
                timebreak_timedelta = timedelta(hours=hours, minutes=minutes, seconds=seconds)

                # Suma current_time y timebreak_timedelta
                current_time += timebreak_timedelta
                # Suma current_time y time_break_timedelta
                print(current_time)
                
                # Asegúrate de que current_time sea un objeto datetime al final
                current_time = datetime.combine(datetime.today(), current_time.time())

            print("Entró en else")
            horario_diario.append(current_time.time().strftime('%H:%M:%S'))
            current_time += timedelta(minutes=int(timeseccion))
            print(horario_diario)

            
        return horario_diario
    
    def save_horario_diario(self,horarios_dict):
        data = []
        data = {'foreinguser': self.user.id, 'datos_json': horarios_dict}

        serializer_ghd = TimetableSerializer(data=data)       
    
        print(serializer_ghd,"-------------------------------------------------------------------")
        if serializer_ghd.is_valid():
            print("guardamos--------------------------------")
            serializer_ghd.save()
            return Response(serializer_ghd.data, status=status.HTTP_201_CREATED)
                            
        else:
            return Response({'error': 'Error'}, status=status.HTTP_400_BAD_REQUEST)



##Podemos eliminar un DateUser  
class DateDestroyAPIView(DestroyAPIView):
    serializer_class1=DateUserSerializer
    serializer_class2=TimetableSerializer
    authentication_classes = [TokenAuthentication]  # Agrega TokenAuthentication
    permission_classes = [IsAuthenticated]  # Agrega IsAuthenticated
   


    def delete(self, request, pk=None):
        token = request.auth
        user = token.user
        

        if user.is_professional and user.is_active:
            # Obtener el primer objeto
            dateu_date = DateUserSerializer.Meta.model.objects.filter(id=pk, foreinguser=user.id, state=True).first()

            # Obtener el segundo objeto
            dateu_timetable = TimetableSerializer.Meta.model.objects.filter(foreinguser=user.id, state=True).first()
            
            # Verificar si se encontró alguno de los objetos
            if dateu_date and dateu_timetable:
                now = datetime.now()
                day_now=now.date()
                time_now=now.time().replace(microsecond=0)
                print(time_now)
                #Elimina todas las citas pendientes hasta el momento 
                dates_agendas_count,_= ListAgenda.objects.filter(
                    Q(day__gt=day_now) |  # Fechas mayores a hoy
                    Q(day=day_now, date_finish__gt=time_now),
                    user_pro=user.id,
                    state=True).delete()
                dateu_date.state = False
                dateu_timetable.state = False
                dateu_date.save()
                dateu_timetable.save() 

            # Verificar si al menos uno de los objetos fue encontrado y actualizado
            if dateu_date and dateu_timetable:
                return Response({'message': 'Formularios eliminados correctamente'}, status=status.HTTP_200_OK)
            else:
                return Response({'error':'No existe un formulario con estos datos!'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Usuario no autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        

class ListAvailableSchedules(generics.GenericAPIView):
    serializer_class = ScheduleRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_pro']
            fecha = serializer.validated_data['fecha']

            try:
                user = User.objects.get(id=user_id)
                if user.is_professional and user.is_active:
                    horarios_disponibles = self.obtener_horarios_disponibles(user_id, fecha)

                    if horarios_disponibles == True:
                        return Response({'error': 'El usuario no trabaja días festivos'}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        response_serializer = AvailableSchedulesSerializer({'horarios_disponibles': list(horarios_disponibles)})
                        return JsonResponse(response_serializer.data)
                else:
                    return Response({'error': 'Usuario no disponible o no profesional.'}, status=status.HTTP_400_BAD_REQUEST)
            except ObjectDoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def obtener_horarios_disponibles(self, user_id, fecha):
        fecha_is_holiday = is_day_holiday(fecha)
        es_domingo = fecha.weekday() == 6

        #Se verifica si el dia es festivo o es un domingo y en caso de ser true alguno de los dos se le da el valor de true a day_holiday
        if fecha_is_holiday or es_domingo:
            day_holiday= True
        else:
            day_holiday= False
            
        data_work = DateUser.objects.get(foreinguser=user_id, state=True)

        #Este if se utiliza para verificar si el usuario trabaja los dias festivos y en caso de que trabaje los festivos 
        # y la fecha sea un dia festivo se da el valor holiday = 'Holidays', Si alguno de estos dos valores es false se pasa ..
        # al elif para verificar si es un dia en semana , en caso de que si holiday = 'mon_sa'
        #si el usuario no trabaja los dias festivos y es un dia festivo se retorna True
        if data_work.is_holidays and day_holiday:
            holiday = 'Holidays'
        elif not day_holiday:
            holiday = 'mon_sa'
        else:
            return True

        #En caso de que las validaciones anteriores retornen valores diferentes a True procederemos a buscar la lista de horario disponible 
        #esto lo hacemos haciendo un conjunto entre el horario que trabaja el usuario y las fechas ya reservadas, asi obtendriamos solo la lista de horas disponibles 
        #en caso de que el usuario ese dia no tenga ninguna reserva se enviara el horario completo , con todas las horas disponibles 
        
        schedules = Timetable.objects.filter(foreinguser=user_id, state=True)
        horario_lista_anidada = schedules.values_list('datos_json__'+holiday, flat=True)
        horario_lista_plana = [item for sublist in horario_lista_anidada for item in sublist]

        try:
            session_agendas = ListAgenda.objects.filter(day=fecha, user_pro=user_id)
            date_start_list = session_agendas.values_list('date_start', flat=True)
            date_start_list = [t.strftime("%H:%M:%S") for t in date_start_list]
            date_start_set = set(date_start_list)
            horario_set = set(horario_lista_plana)
            horario_desordenado = horario_set - date_start_set
            fechas_disponibles = sorted(horario_desordenado, key=lambda x: datetime.strptime(x, "%H:%M:%S"))
            return fechas_disponibles

        except (ObjectDoesNotExist, ValueError) as e:
            print("Error al obtener sesiones de agenda:", e)
            return horario_lista_plana
    

    
        
        
        
        