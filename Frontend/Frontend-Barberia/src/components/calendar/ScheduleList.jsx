import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import CustomCalendar from './CustomCalendar'; // Asegúrate de que el nombre del archivo es correcto
import { handleCreateAgenda, handleListCalendar } from '../axiosRequest/AxiosCalendar';

const MyComponent = (idUserPro) => {
  console.log('entre a myComponent',idUserPro.idUserPro)
  // convierto el Objeto idUserPro en solo un valor str
  const id_Pro= idUserPro.idUserPro
 
  const [selectedDate, setSelectedDate] = useState(null);
  const [responseData, setResponseData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalNotification, setModalNotification] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [error, setError] = useState(null);
  const [approved, setApproved] = useState(null);
  const [refresh, setRefresh] = useState(false); // Estado para controlar el refresco de datos

  useEffect(() => {
    if (selectedDate) {
      
      handleListCalendar(selectedDate,id_Pro)
        .then(data => {
          setResponseData(data.horarios_disponibles || []);
          setModalVisible(true);
        })
        .catch(error => {
          console.error("Error al listar el calendario:", error);
          setError(error.message || 'Error desconocido');
        });
    }
  }, [selectedDate,refresh]);

  const handleCreate = async () => {
    try {
      const result = await handleCreateAgenda(selectedDate, selectedTime,id_Pro);
      console.log("Agenda Creada!", result);
      setError(null);
      setApproved("Proceso Exitoso");
      setModalNotification(true);
      setRefresh(!refresh); // Cambia el estado para refrescar la lista de citas
    } catch (error) {
      setError(error.message || 'Error desconocido');
      setApproved(null);
      setModalNotification(true);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const dataForDates = Array.isArray(responseData)
    ? responseData.reduce((acc, item) => {
        const dateKey = item.date;
        acc[dateKey] = { marked: true };
        return acc;
      }, {})
    : {};

  return (
    <View style={styles.container}>
      <CustomCalendar
        onDateSelect={setSelectedDate}
        dataForDates={dataForDates}
      />

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View>
              <Text style={styles.modalTitle}>Horarios Disponibles</Text>
              <Text>Horarios disponibles para el {selectedDate}:</Text>
            </View>

            <FlatList
              style={styles.scrollView}
              data={responseData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeItem}
                  onPress={() => handleTimeSelect(item)}
                >
                  <Text style={styles.timeText}>Hora: {item}</Text>
                </TouchableOpacity>
              )}
            />

            {selectedTime && (
              <View style={styles.selectedTimeContainer}>
                <Text style={styles.selectedTimeText}>Horario seleccionado: {selectedTime}</Text>
                <Button title='Agendar' onPress={handleCreate} />
              </View>
            )}

            <Modal
              visible={modalNotification}
              animationType='fade'
              transparent={true}
              onRequestClose={() => setModalNotification(false)}
            >
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  {error && <Text style={styles.errorText}>{error}</Text>}
                  {approved && <Text style={styles.approvedText}>{approved}</Text>}
                  <Button title="Cerrar" onPress={() => setModalNotification(false)} />
                </View>
              </View>
            </Modal>

            <Button title="Cerrar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollView: {
    flexGrow: 1,
  },
  timeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  timeText: {
    fontSize: 16,
  },
  selectedTimeContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  approvedText: {
    color: 'green',
    marginTop: 10,
  }
});

export default MyComponent;
