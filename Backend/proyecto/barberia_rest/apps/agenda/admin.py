from django.contrib import admin

# Register your models here.

from apps.agenda.models import  DateUser,ListAgenda,Timetable

admin.site.register(DateUser)
admin.site.register(ListAgenda)
admin.site.register(Timetable)
