import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const AgendaComponent = ({ onDateClick }) => {
  // Obtener la fecha actual
  const today = new Date();

  // Calcular las fechas desde hoy hasta 20 días adelante
  const dates = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  // Agrupar las fechas por mes
  const datesByMonth = dates.reduce((acc, date) => {
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(date);
    return acc;
  }, {});

  const renderDaysOfWeek = () => {
    const daysOfWeek = [];
    const weekDays = ['Dom', 'Lun', 'Mart', 'Mier', 'Jue', 'Vier', 'Sab'];
    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(
        <View style={styles.dayOfWeek} key={i}>
          <Text style={styles.dayOfWeekText}>{weekDays[i]}</Text>
        </View>
      );
    }
    return daysOfWeek;
  };

  const renderDays = (dates) => {
    const days = [];
    const firstDate = dates[0];
    const firstDayOfWeek = firstDate.getDay();
    const monthDays = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0).getDate();

    // Rellenar los días anteriores al primer día del mes
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<View style={styles.day} key={`empty-${i}`} />);
    }

    // Añadir los días del mes
    dates.forEach((date, i) => {
      days.push(
        <TouchableOpacity
          style={styles.day}
          key={i + firstDayOfWeek}
          onPress={() => onDateClick(date)}
        >
          <Text style={styles.dayText}>{date.getDate()}</Text>
        </TouchableOpacity>
      );
    });

    // Rellenar los días restantes de la última semana si es necesario
    const remainingDays = 7 - ((days.length) % 7);
    if (remainingDays < 7) {
      for (let i = 0; i < remainingDays; i++) {
        days.push(<View style={styles.day} key={`remaining-${i}`} />);
      }
    }

    return days;
  };

  return (
    <ScrollView style={styles.calendar}>
      {Object.keys(datesByMonth).map((monthKey) => (
        <View key={monthKey} style={styles.month}>
          <Text style={styles.monthText}>
            {new Date(datesByMonth[monthKey][0]).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <View style={styles.calendarGrid}>
            {renderDaysOfWeek()}
            {renderDays(datesByMonth[monthKey])}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  calendar: {
    flex: 5,
    paddingTop:30,
    
  },
  month: {
    backgroundColor:'#FFFAF0',
    marginVertical: 10,
    padding:10,
    margin:10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.50,
    shadowRadius: 4,
    elevation: 5,
    borderRadius:20
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    
  },
  dayOfWeek: {
    width: '14.28%',
    alignItems: 'center',
    padding: 5,
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: 'bold',

  },
  day: {
    width: '14.28%',
    alignItems: 'center',
    padding: 5,
    marginTop:2,
    
  },
  dayText: {
    fontSize: 16,
  },
});

export default AgendaComponent;
