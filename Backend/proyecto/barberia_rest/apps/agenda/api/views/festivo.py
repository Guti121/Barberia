import holidays
from datetime import date, timedelta

def is_day_holiday(day):
     # Define el país o región para obtener los días festivos
    co_holidays = holidays.CO()

    
    return day in co_holidays

   