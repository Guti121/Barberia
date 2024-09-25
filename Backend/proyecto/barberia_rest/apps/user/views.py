from datetime import datetime
from django.shortcuts import render 
from django.contrib.sessions.models import Session

from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import APIView
from rest_framework.response import Response
from rest_framework import status

#import del proyecto 
from apps.user.api.tokenseralizers import CustomAuthTokenSerializer 
from apps.user.api.tokenseralizers import UserTokenSerializer

from django.contrib.auth import get_user_model


#refrescar token para que se realice desde el frontend

class UserToken(APIView):
    def post(self, request, *args, **kwargs):
        phonenumber = request.data.get('phonenumber')  # Obtener el número de teléfono desde el cuerpo de la solicitud
        
        if not phonenumber:
            return Response({'error': 'El número de teléfono es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Busca al usuario por el número de teléfono
            User = get_user_model()  # Obtener el modelo de usuario personalizado
            user = User.objects.filter(phonenumber="+" + phonenumber).first()
            
            if user:
                # Obtener o crear un nuevo token para el usuario
                user_token, created = Token.objects.get_or_create(user=user)
                
                # Opcional: Si quieres crear un nuevo token al refrescar (por seguridad)
                if not created:
                    user_token.delete()  # Eliminar el token anterior
                    user_token = Token.objects.create(user=user)  # Crear uno nuevo
                
                return Response({'token': user_token.key}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({'error': 'Error al procesar la solicitud. Detalles: {}'.format(str(e))}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#login con token
class Login(ObtainAuthToken):
    serializer_class= CustomAuthTokenSerializer

    def post(self,request,*args,**kwargs):
     
        # resive un username y password
        print("gholaa")
        login_serializer=self.serializer_class(data= request.data ,context={'request':request})
        print(login_serializer.is_valid())
        if login_serializer.is_valid():
            print("entre al")
            user=login_serializer.validated_data["user"]
            print(user)
            #verificamos si el usuario esta activo (para saber si averiguamos el token)
            if user.is_active:
                #traemos del modelo token el token de un usuario y en caso de que no exita se crea
                token,created= Token.objects.get_or_create(user=user)
                #serializamos las consulta para devolver los valores conforme al establecido en UserTokenSerializer 
                user_serializer=UserTokenSerializer(user)
                #creamos un token 
                if created:
                    return Response({
                        'token':token.key,
                        'user':user_serializer.data,
                        'message':'Inicio de sesion Exitoso'
                    },status=status.HTTP_201_CREATED)
                #Si el token ya fue creado
                else:
                    #--------------------------------------------------------------------
                    #En caso de que el usuario ya tenga la session abierta , se cerrara 
                    all_sessions= Session.objects.filter(expire_date__gte=datetime.now())
                    if all_sessions.exists:
                        for session in all_sessions:
                            session_data=session.get_decoded()
                            if user.id==int(session_data.get('_auth_user_id')):
                                session.delete()
                    #---------------------------------------------------------------------
                    token.delete()
                    token= Token.objects.create(user=user)
                    return Response({
                        'token':token.key,
                        'user':user_serializer.data,
                        'message':'Inicio de sesion Exitoso'
                    },status=status.HTTP_201_CREATED)
                      
            #en caso de que no este activo    
            else:
                return Response ({"error":'Este usuario no puede iniciar sesion.'}, 
                                 status=status.HTTP_401_UNAUTHORIZED)
            
        #En caso de que las credenciales no sean correctas 
        else:
            return Response ({"error":'Nombre de usuario o contraseña incorrectos.'},
                              status=status.HTTP_400_BAD_REQUEST)
        
        return Response ({"mensaje":'Hola desde response'}, status=status.HTTP_200_OK)
    

class Logout(APIView):
    def post(self, request, *args, **kwargs):
        try:
            token_value = request.data.get('token')  # Cambiado a request.data
            if not token_value:
                return Response({'error': 'No se ha encontrado el token en la petición'},
                                status=status.HTTP_400_BAD_REQUEST)

            token = Token.objects.filter(key=token_value).first()
            if token:
                user = token.user
                all_sessions = Session.objects.filter(expire_date__gte=datetime.now())

                if all_sessions.exists():
                    for session in all_sessions:
                        session_data = session.get_decoded()
                        if user.id == int(session_data.get('_auth_user_id')):
                            session.delete()

                token.delete()
                return Response({'token_message': 'Token eliminado',
                                 'session_message': 'Sesiones de usuario eliminadas.'},
                                status=status.HTTP_200_OK)

            return Response({'error': 'No se ha encontrado un usuario con estas credenciales'},
                            status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': f'Error al procesar la petición: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)