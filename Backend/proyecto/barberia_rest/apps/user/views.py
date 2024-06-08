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


#refrescar token para que se realice desde el frontend

class UserToken(APIView):
    def get (self,request,*args,**kwargs):
        phonenumber=request.GET.get('phonenumber')
        
        try:
            user_token=Token.objects.get(user= UserTokenSerializer().Meta.model.objects.filter(phonenumber="+"+phonenumber).first())
            print( user_token)
            return Response({'token': user_token.key})
        
        except:
            return Response({'error':'Credenciales enviadas incorrectas'},status=status.HTTP_400_BAD_REQUEST)


#login con token
class Login(ObtainAuthToken):
    serializer_class= CustomAuthTokenSerializer

    def post(self,request,*args,**kwargs):
     
        # resive un username y passwork
        login_serializer=self.serializer_class(data= request.data ,context={'request':request})
       
        if login_serializer.is_valid():
            user=login_serializer.validated_data["user"]

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
    def post(self,request,*args,**kwargs):
        try:
            token= request.POST.get('token') 
            print(request.POST)
            token= Token.objects.filter(key= token).first()
            if token:
                user=token.user
                all_sessions= Session.objects.filter(expire_date__gte=datetime.now())
                if all_sessions.exists:
                    for session in all_sessions:
                        session_data=session.get_decoded()
                        if user.id==int(session_data.get('_auth_user_id')):
                            session.delete()
                token.delete()
                session_message='Sessiones de usuario eliminadas.'
                token_message='token eliminado'
                return Response({'token_message':token_message,'session_message':session_message},
                                status=status.HTTP_200_OK)
            return Response({'error':'No se ha encontrado un usuario con estas credenciales'})

        except:
            return Response({'error':'No se ha encontrado toquen en la peticion '},
                            status=status.HTTP_409_CONFLICT)