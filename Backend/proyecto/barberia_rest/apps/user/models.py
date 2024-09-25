from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth.models import AbstractBaseUser,PermissionsMixin,BaseUserManager 
from simple_history.models import HistoricalRecords


##------------------------------------------------Usuario cliente---------------------------------------------------------------------

class UserManager(BaseUserManager):

    def _create_user(self, phonenumber,username, name, lastname, country,city, password,is_professional,is_staff,is_superuser,**extra_fields):
        if not phonenumber:
            raise ValueError("El usuario debe de tener un numero de celular")
        user = self.model(phonenumber=phonenumber, 
        username=username, 
        name=name,
        lastname=lastname,
        country=country,
        city=city,
        is_professional=is_professional,
        is_staff=is_staff,
        is_superuser=is_superuser,
        **extra_fields
        )

        user.set_password(password)
        user.save(using=self.db)
        return user

    def create_user(self, phonenumber, username,name, lastname,country,city,   password,**extra_fields):
        return self._create_user(phonenumber,username, name, lastname, country,city, password,False,False,**extra_fields)

    def create_superuser(self, phonenumber, username,name, lastname,country=None,city=None,  groups=None, password=None,**extra_fields):
        return self._create_user(phonenumber, username,name, lastname,country,city, password,False,True,True,**extra_fields)


class User(AbstractBaseUser,PermissionsMixin):
    phonenumber=PhoneNumberField(unique=True)
    username=models.CharField("Username",max_length=20,unique=True,null=False)
    name=models.CharField("Name",max_length=200,null=False)
    lastname=models.CharField("last Name",max_length=200,null=False)
    country=models.CharField("Country",max_length=200,null=False)
    city=models.CharField("city",max_length=200,null=False)

    is_professional=models.BooleanField(default=False)
    is_active=models.BooleanField(default=True)
    is_staff=models.BooleanField(default=False)

    #_________________________________________________________
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='user_set',  # Cambia 'user_set' por el nombre que desees
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )

    # Relación con Permission
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='user_set_permissions',  # Cambia 'user_set_permissions' por el nombre que desees
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    #_________________________________________________________


    historical=HistoricalRecords()
    objects=UserManager()
    

    class Meta:
        verbose_name="User"
        verbose_name_plural="Users"

    USERNAME_FIELD = "phonenumber"
    REQUIRED_FIELDS =["username","name","lastname","country","city"]

    def natural_key(self):
        return(self.phonenumber)

    def __str__(self):
        return f'{self.pk} {self.name} {self.lastname}'
    
##---------------------------------------------------------------------------------------------------------------------
    

