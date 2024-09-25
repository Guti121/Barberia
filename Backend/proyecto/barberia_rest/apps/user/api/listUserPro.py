from apps.user.models import User
from rest_framework.views import APIView
from apps.user.api.serializers import UserLisProSerializer
from rest_framework import status
from rest_framework.response import Response
from apps.user.authentication_mixins import Authentication
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

class listUserPro(Authentication,APIView):
    authentication_classes = [TokenAuthentication]  # Agrega TokenAuthentication
    permission_classes = [IsAuthenticated]  # Agrega IsAuthenticated


    def get(self,request,*args,**kwargs):
        
        search_query=request.query_params.get("search", None)

        if search_query is None or search_query.strip() == "":
            return Response({'No se recibieron datos '},status=status.HTTP_204_NO_CONTENT)
        
        else:
            users = User.objects.filter(
                Q(username__icontains=search_query) |  Q(phonenumber__icontains=search_query) | Q(country__icontains=search_query) | Q(city__icontains=search_query), is_professional=True, is_active=True)[:5]
            response=UserLisProSerializer(users,many=True)
            if not response.data:
                return Response({'warning': 'No se encontraron usuarios con esas caracteristicas'}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(response.data, status=status.HTTP_200_OK)
            