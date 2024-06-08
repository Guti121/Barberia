
from django.contrib import admin
from django.urls import path,include

#Token
from apps.user.views import Login,Logout,UserToken

urlpatterns = [
    path('',Login.as_view(),name='login'),
    path('refresh-token/',UserToken.as_view(),name='refresh-token'),
    path('logout/',Logout.as_view(),name='Logout'),
    path('admin/', admin.site.urls),
    path('user/', include('apps.user.api.urls')),
    path('agenda/', include('apps.agenda.api.urls')),
        
]
