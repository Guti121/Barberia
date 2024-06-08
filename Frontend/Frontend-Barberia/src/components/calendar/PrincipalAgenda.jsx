import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AgendaComponent from './Agenda';
import DateModal from './DateModal';
import { getHorariosDisponibles } from '../../repository_list_day';

const PrincipalAgenda = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  const onDateClick = (date) => {
    console.log('Fecha seleccionada:', date);
    setSelectedDate(date);
    const horarios = getHorariosDisponibles();
    console.log('Horarios disponibles:', horarios);
    setHorariosDisponibles(horarios);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <AgendaComponent onDateClick={onDateClick} />
      <DateModal
        visible={modalVisible}
        date={selectedDate}
        horariosDisponibles={horariosDisponibles}
        onClose={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop:20,
    paddingHorizontal: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PrincipalAgenda;