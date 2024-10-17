import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, Modal, TouchableOpacity, Text, Alert } from "react-native";

export function ModalBreakStart({ timeArray }) {
  const [modalVisibleBreakStart, setModalVisibleBreakStart] = useState(false);

  useEffect(() => {
    // Aquí aseguramos que se abra el modal
    setModalVisibleBreakStart(true);
  }, []);

  return (
    
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleBreakStart}  
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisibleBreakStart(false);  {/* Cambiado aquí */}
        }}
      >
        <FlatList
          data={timeArray}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.timeItem}
              onPress={(event) => {
                const selectedTime = item; // Esto será algo como "01:30:00"
                const [hours, minutes, seconds] = selectedTime.split(":");
                
                // Crea un objeto Date y configura solo la parte de tiempo
                const selectedDate = new Date();
                selectedDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
                
                console.log(item, "item", selectedDate.getHours()); // Manejo de selección
                onChange(event, selectedDate, "breakstart");
                setModalVisibleBreakStart(false); // Cierra el modal
              }}
            >
              <Text style={styles.timeText}>{item}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Modal>
   
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: "#ccc",
  },
  timeItem: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginVertical: 5,
  },
  timeText: {
    fontSize: 18,
    textAlign: "center",
  },
});
