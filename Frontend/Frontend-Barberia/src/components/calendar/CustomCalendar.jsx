// CustomCalendar.js
import React from 'react';
import { Calendar } from 'react-native-calendars';
import { addDays, format } from 'date-fns';

const CustomCalendar = ({ onDateSelect, dataForDates }) => {
  // Obtener la fecha actual y definir el rango de fechas
  const today = new Date();
  const startDate = format(today, 'yyyy-MM-dd');
  const endDate = format(addDays(today, 15), 'yyyy-MM-dd');

  // Generar las fechas permitidas y marcar las fechas con datos
  const markedDates = {};
  for (let i = 0; i <= 15; i++) {
    const date = format(addDays(today, i), 'yyyy-MM-dd');
    markedDates[date] = {
      disabled: false,
      ...(dataForDates[date] ? { selected: true, selectedColor: 'orange' } : {})
    };
  }

  return (
    <Calendar
      minDate={startDate}
      maxDate={endDate}
      markedDates={markedDates}
      onDayPress={(day) => {
        onDateSelect(day.dateString); // Notifica la fecha seleccionada
      }}
      disableAllTouchEventsForDisabledDays={true}
      theme={{
        todayTextColor: 'red',
        arrowColor: 'blue',
        selectedDayTextColor: 'red',
        selectedDayBackgroundColor: 'orange'
      }}
    />
  );
};

export default CustomCalendar;
