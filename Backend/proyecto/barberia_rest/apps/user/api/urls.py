from django.urls import path
from apps.user.api.api import user_APIView,user_detail_api_view

urlpatterns=[
    path('',user_APIView,name ='usuario_api'),
    path('detail/<int:pk>/',user_detail_api_view,name ='usuarioclie_detail_api'),
    
    ]