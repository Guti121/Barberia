from django.db import models
from simple_history.models import HistoricalRecords

from apps.user.models import User
from apps.base.models import BaseModel
# Create your models here.


class DateUser(BaseModel):
    
    foreinguser = models.ForeignKey(User, on_delete=models.CASCADE,null=False, blank=False, verbose_name='User Pro')
    local = models.CharField("Namelocal", max_length=200, null=False)
    startwork = models.TimeField(null=False, blank=False)
    finishwork = models.TimeField(null=False, blank=False)
    timeseccion = models.TimeField(null=False, blank=False)
    timebreak = models.TimeField(null=False, blank=False)
    breakstart = models.TimeField(null=False, blank=False)
    is_holidays = models.BooleanField(default=False)
    startwork_holi = models.TimeField(null=True, blank=True)
    finishwork_holi = models.TimeField(null=True, blank=True)
    breakstart_holi = models.TimeField(null=True, blank=True)
    
    historical = HistoricalRecords()

    @property
    def _history_user(self):
        return self.changed_by
    
    @_history_user.setter
    def _history_user(self,value):
        self.changed_by = value

    class Meta:
        verbose_name = "Date user"
        verbose_name_plural = "Dates users"

    def __str__(self):
        return f'{self.id} {self.foreinguser} {self.timeseccion} {self.state}'

    


class ListAgenda (BaseModel):
    day=models.DateField(null=False,blank=False)
    date_start=models.TimeField(null=False,blank=False,verbose_name="Start shift")
    date_finish=models.TimeField(null=False,blank=False,verbose_name="Finish shift")
    user_pro = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, verbose_name="Profesional", related_name="professional_listagenda_set")
    user_clie = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, verbose_name="Cliente", related_name="client_listagenda_set")
    
    historical=HistoricalRecords()

    @property
    def _history_user(self):
        return self.changed_by
    
    @_history_user.setter
    def _history_user(self,value):
        self.changed_by = value

    class Meta:
        
        #abstract=True
        verbose_name="Agenda"
        verbose_name_plural="Agendas"

    def __str__(self):
        return f' {self.id} {self.day} {self.date_start} {self.user_pro} {self.user_clie}'
    
class Timetable(BaseModel):

    foreinguser=models.ForeignKey(User,on_delete=models.CASCADE,null=False,blank=False,verbose_name='User Pro')
    # Campo para almacenar un diccionario
    datos_json = models.JSONField()

    historical=HistoricalRecords()

    @property
    def _history_user(self):
        return self.changed_by
    
    @_history_user.setter
    def _history_user(self,value):
        self.changed_by = value

    class Meta:
        
        #abstract=True
        verbose_name="time table"
        verbose_name_plural="times table"

    def __str__(self):
        return f'{self.id} {self.foreinguser} {self.state}'
    
    