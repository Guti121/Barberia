from django.urls import path
from apps.agenda.api.views.general_views import UserAgendasView ,UserAgendasViewClie,AgendaCreateAPIView,AgendaDestroyAPIView
from apps.agenda.api.views.date_time_tables import DateCreateAPIView,DateDestroyAPIView,ListDateUserView,ListAvailableSchedules
"""DateUserListAPIView,ListAgendaAPIView,AgendaRetrieveAPIView
,AgendaDestroyAPIView,AgendaUpdateAPIView,""" 

urlpatterns=[
    path('user-agendas/', UserAgendasView.as_view(), name='user-agendas') ,#Se requiere enviar token y usuario a listar
    path('user-agendas-clie/',UserAgendasViewClie.as_view(),name='user agendas clie'),
    path('create-agendas/',AgendaCreateAPIView.as_view(),name ='AgendaCreateAPIView'),
    path('destroy-agendas/<int:pk>/',AgendaDestroyAPIView.as_view(),name ='Destroy Agendas Users'),
    #vistas de date_time_tables
    path('list_date/',ListDateUserView.as_view(),name ='List Date Users '),
    path('create-date/',DateCreateAPIView.as_view(),name ='Date User Create'),
    path('destroy-date/<int:pk>/',DateDestroyAPIView.as_view(),name ='Destroy Date Users'),
    #Vista para Seccions disponibles
    path('listavailable/',ListAvailableSchedules.as_view(),name ='List Available Seccions'),
    ]
    #----------------------------------------------------------------------------------------


"""path(create_agendas/',AgendaCreateAPIView.as_view(),name ='AgendaCreateAPIView'),
    path('agenda_list/',ListAgendaAPIView.as_view(),name ='AgendaListUser'),
    path('agenda_list/retrieve/<int:pk>/',AgendaRetrieveAPIView.as_view(),name ='AgendaReatrieve'),
    path('agenda_list/destroy/<int:pk>/',AgendaDestroyAPIView.as_view(),name ='AgendaDestroy'), 
    path('agenda_list/update/<int:pk>/',AgendaUpdateAPIView.as_view(),name ='AgendaUpdate'),
    """
    