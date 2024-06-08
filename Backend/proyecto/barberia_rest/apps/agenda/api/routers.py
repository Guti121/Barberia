from rest_framework.routers import DefaultRouter,Route,SimpleRouter
from apps.agenda.api.views.general_views import AgendaViewSet

from apps.user.api.userviews import UserViewSet
from django.urls import path, include

 
router =  SimpleRouter()

#Usuairo por el cual se filtra
router.register(r'userp',UserViewSet , basename='userp')
#metodo para filtrar
router.register(r'list_filter',AgendaViewSet,basename='list_filter')
urlpatterns = [
  
    path('api/userp/<int:userp_pk>/list_filter/', UserViewSet.as_view({'get': 'list_filter'}), name='user-detail'),

]

urlpatterns += router.urls

# Agrega las rutas a la URL principal
urlpatterns = [
    path('api/', include(urlpatterns)),
]