import React from 'react';
import { View, Text, Modal, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const DateModal = ({ visible, date, horariosDisponibles, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalView}>
        <Text style={styles.modalText}>
          {date ? date.toDateString() : ''}
        </Text>
        <FlatList
          data={horariosDisponibles}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.timeSlot}>
              <Text style={styles.timeSlotText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <Button title="Cerrar" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 50,
    padding: 35,
    backgroundColor: 'white',
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.50,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  timeSlot: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  timeSlotText: {
    fontSize: 16,
  },
});

export default DateModal;