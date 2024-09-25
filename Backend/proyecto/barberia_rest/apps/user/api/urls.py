from django.urls import path
from apps.user.api.api import user_APIView,user_detail_api_view
from apps.user.api.listUserPro import listUserPro 

urlpatterns=[
    path('',user_APIView,name ='create user and get users'),
    path('detail/<int:pk>/',user_detail_api_view,name ='retrived and update user for pk'),
    path('userpro/search/',listUserPro.as_view(),name ='AgendaCreateAPIView')
    ]