import React, { useState } from 'react';
import { View, Button, Platform, Text,StyleSheet, Switch, Pressable, ScrollView,TouchableOpacity, FlatList,Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { handleCreateTimesTable } from '../components/axiosRequest/AxiosUserConfig';


export default function ModalCreateTimesTable() {
  // Estados para cada uno de los valores de tiempo
  const [startwork, setStartwork] = useState(new Date());
  const [finishwork, setFinishwork] = useState(new Date());
  const [timebreak, setTimebreak] = useState(new Date());
  const [timeseccion, setTimeseccion] = useState(new Date());
  const [breakstart, setBreakstart] = useState(new Date());
  const [breakstart_holi,setBreakstart_holi] = useState(new Date())
  const [startwork_holi,setStartwork_holi] = useState(new Date())
  const [finishwork_holi,setFinishwork_holi] = useState(new Date())
  const [isWorkingOnHoliday, setIsWorkingOnHoliday] = useState(false);  // Estado booleano para saber si el cliente trabajará en festivos
  const [minutes,setMinutes] =useState(new Date().getMinutes());
  const [timeArray,setTimeArray]= useState()
  //modals state
  const [modalVisibleBreakStart,setModalVisibleBreakStart] = useState(false)
  const [modalVisibleTimeseccion,setModalVisibleTimeseccion] = useState(false)
  const [modalVisibleTimebreak,setModalVisibleTimebreak] = useState(false)

  const toggleSwitch = () => {
    setIsWorkingOnHoliday(previousState => !previousState); // Cambia el estado al valor opuesto
  }

  // Estados para mostrar u ocultar el picker
  const [showPicker, setShowPicker] = useState({
    startwork: false,
    finishwork: false,
    timebreak: false,
    timeseccion: false,
    breakstart: false,
    startwork_holi:false,
    finishwork_holi:false,
    breakstart_holi:false
  });

  

  const onChange = (event, selectedTime, field) => {
    console.log('selectedTime',selectedTime)
    const currentTime = selectedTime || new Date(0, 0, 0, 0, 0, 0);
    const selectedHours = currentTime.getHours();
    const selectedMinutes = currentTime.getMinutes();
    console.log(selectedHours,selectedMinutes,field)
    setShowPicker(prev => ({ ...prev, [field]: Platform.OS === 'ios' })); // Ocultar picker en Android
    
    
    if (field === 'startwork')setStartwork(currentTime);
    if (field === 'timeseccion') {
      

      const timeArray = [];
      let sumStartwork = new Date(startwork);
    
      // Inicialmente sumamos las horas y minutos de currentTime a sumStartwork
      
      sumStartwork.setHours(sumStartwork.getHours()+ currentTime.getHours());
      sumStartwork.setMinutes(sumStartwork.getMinutes() + currentTime.getMinutes());
      sumStartwork.setSeconds(0);  // Reiniciar los segundos a 0
    
      // Agregar la hora inicial al array en formato "HH:MM"
      timeArray.push(sumStartwork.toTimeString().slice(0, 8));
    
      // Bucle para seguir sumando mientras sumStartwork esté dentro del mismo día (hasta 24 horas)
      while (sumStartwork.getHours() < 23 &&  sumStartwork.getHours() >= new Date(startwork).getHours()) {
        console.log(new Date(startwork).getHours(),new Date(startwork).getMinutes(),'holaaa')
        // Sumar las horas y minutos en cada iteración
        sumStartwork.setMinutes(sumStartwork.getMinutes() + currentTime.getMinutes());
        sumStartwork.setHours(sumStartwork.getHours() + currentTime.getHours());
        sumStartwork.setSeconds(sumStartwork.getSeconds() + currentTime.getSeconds());
        console.log(sumStartwork)
          // Reiniciar los segundos a 0 nuevamente
        sumStartwork.setSeconds(0);
        console.log(sumStartwork.getHours() )
        // Verificar si la hora sigue estando dentro del día
        if (sumStartwork.getHours() <= 23  && sumStartwork.getHours() >= new Date(startwork).getHours() ) {
          // Agregar el tiempo resultante al array en formato "HH:MM"
          timeArray.push(sumStartwork.toTimeString().slice(0, 8));
        } else {
          break;  // Salir del bucle si las horas superan las 24
        }
      }
     
      console.log(timeArray)
      setTimeArray(timeArray)
      
      setMinutes(sumStartwork.getMinutes())

      console.log(sumStartwork,minutes)
      setTimeseccion(currentTime)};

    if (field === 'breakstart') setBreakstart(currentTime);
    if (field === 'timebreak') {
      setTimebreak(currentTime);
      let sumBreakstart= breakstart;
      sumBreakstart.setHours(sumBreakstart.getHours()+currentTime.getHours())
      sumBreakstart.setMinutes(sumBreakstart.getMinutes()+currentTime.getMinutes())

      console.log(sumBreakstart)
    }
    if (field === 'finishwork') {
      let sumfinishwork= breakstart;
      sumfinishwork.setHours(sumfinishwork.getHours()+currentTime.getHours())
      sumfinishwork.setMinutes(sumfinishwork.getMinutes()+currentTime.getMinutes())
      sumfinishwork.setHours(sumfinishwork.getHours()+timeseccion.getHours())
      sumfinishwork.setMinutes(sumfinishwork.getMinutes()+timeseccion.getMinutes())
      setMinutes(sumfinishwork.getMinutes())
      setFinishwork(sumfinishwork)};

    if (field === 'startwork_holi') setStartwork_holi(currentTime);
    if (field === 'finishwork_holi') setFinishwork_holi(currentTime);
    if (field === 'breakstart_holi') setBreakstart_holi(currentTime);
  };


  const showTimepicker = (field) => {
    setShowPicker(prev => ({ ...prev, [field]: true }));
  };


  const create = async()=>{
    await handleCreateTimesTable(
      startwork,
      finishwork,
      timeseccion,
      timebreak,
      breakstart,
      startwork_holi,
      finishwork_holi,
      breakstart_holi,
      isWorkingOnHoliday
    )
  }


  //timeSeccion arrays 
  const seccionTimeshours = ['00','01','02'];
  const seccionTimesSeconds =['00','20','30','40','50']
  const [selectedHour, setSelectedHour] = useState('00');
  const [selectedMinute, setSelectedMinute] = useState('00');

  return (
    <View>
      
      <ScrollView 
      
      pagingEnabled={true}
      contentContainerStyle={{ paddingHorizontal: 20 }}>
      <View>
            {/* Startwork */}
            <Text>Startwork: {startwork.toLocaleTimeString()}</Text>
            <Button onPress={() => showTimepicker('startwork')} title="Select Start Work Time" />
            {showPicker.startwork && (
              <DateTimePicker
                value={startwork}
                mode="time"
                is24Hour={true}
                display="default"
                minuteInterval={10}
                
                onChange={(event, time) => onChange(event, time, 'startwork')}
              />
            )}

            {/* Timeseccion */}
            <Text>Timeseccion</Text>
            <Button onPress={() => setModalVisibleTimeseccion(true) } title="Select Time Section" />
            <Modal
              animationType='slide'
              transparent={true}
              visible={modalVisibleTimeseccion}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setModalVisibleTimeseccion(false); // Cambiado aquí
              }}
            >
              <View style={styles.containerModal}>
                <View style={styles.containerFlatlistTimeseccion}>

                  <View style={styles.containerTimeseccion}>
                    <View>
                      <Text style={styles.timeText}>Horas</Text>
                      <FlatList
                        data={seccionTimeshours}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity style={styles.timeItem}
                            onPress={()=>{
                              setSelectedHour(item)
                            }}
                          >
                            <Text style={styles.timeText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                      <Text style={styles.timeText}>:</Text>
                    <View>

                      <Text style={styles.timeText}>Minutos</Text>
                      <FlatList
                        data={seccionTimesSeconds}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity style={styles.timeItem}
                            onPress={()=>setSelectedMinute(item)}
                          >
                            <Text style={styles.timeText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                        />
                    </View>
                  </View>
                  <Text>Tiempo seleccionado</Text>
                  <Text style={styles.timeText} >{selectedHour}:{selectedMinute}:00</Text>
                  <TouchableOpacity>
                    <Text onPress={(event)=>{
                        const selectedDate = new Date();
                        // Establecer la hora y minutos seleccionados en el objeto Date
                        selectedDate.setHours(parseInt(selectedHour));
                        selectedDate.setMinutes(parseInt(selectedMinute));
                        selectedDate.setSeconds(0)
                        onChange( event ,selectedDate, 'timeseccion');
                      setModalVisibleTimeseccion(false)}}>Seleccionar</Text>
                  </TouchableOpacity>
                </View>
                        
              </View>
            </Modal>
            
            {/* Breakstart */}
            <Text>Breakstart: {breakstart.toLocaleTimeString()}</Text>
            <Button onPress={() => setModalVisibleBreakStart(true)} title="Select Break Start" />
            
              <Modal
                animationType='slide'
                transparent={true}
                visible={modalVisibleBreakStart}
                onRequestClose={() => {
                  Alert.alert('Modal has been closed.');
                  setModalVisibleBreakStart(false); // Cambiado aquí
                }}
              > 
                <View style={styles.containerModal}>

                  <View style={styles.containerFlatlist} >
                    
                    <FlatList
                    data={timeArray}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity 
                        style={styles.timeItem}
                          onPress={(event) => {
                            const selectedTime = item; // Esto será algo como "01:30:00"

                            // Divide la cadena en horas, minutos y segundos
                            const [hours, minutes, seconds] = selectedTime.split(':');

                            // Crea un objeto Date y configura solo la parte de tiempo
                            const selectedDate = new Date();
                            selectedDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
                            
                            console.log(item,'item',selectedDate.getHours()); // Manejo de selección
                            onChange( event ,selectedDate, 'breakstart');
                            setModalVisibleBreakStart(false); // Cierra el modal
                          }}>
                          
                            <Text style={styles.timeText}>{item}</Text>
                          
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                    
                      <TouchableOpacity onPress={()=>setModalVisibleBreakStart(false)}>
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                </View>
              </View>
            
            </Modal>
            
            {/* Timebreak */}
            <Text>Timebreak: {timebreak.toLocaleTimeString()}</Text>
            <Button onPress={() => setModalVisibleTimebreak(true)} title="Select Break Time" />
            <Modal
              animationType='slide'
              transparent={true}
              visible={modalVisibleTimebreak}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setModalVisibleTimebreak(false); // Cambiado aquí
              }}
            >
              <View style={styles.containerModal}>
                <View style={styles.containerFlatlistTimeseccion}>

                  <View style={styles.containerTimeseccion}>
                    <View>
                      <Text style={styles.timeText}>Horas</Text>
                      <FlatList
                        data={seccionTimeshours}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity style={styles.timeItem}
                            onPress={()=>{
                              setSelectedHour(item)
                            }}
                          >
                            <Text style={styles.timeText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                      <Text style={styles.timeText}>:</Text>
                    <View>

                      <Text style={styles.timeText}>Minutos</Text>
                      <FlatList
                        data={seccionTimesSeconds}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity style={styles.timeItem}
                            onPress={()=>setSelectedMinute(item)}
                          >
                            <Text style={styles.timeText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                        />
                    </View>
                  </View>
                  <Text>Tiempo seleccionado</Text>
                  <Text style={styles.timeText} >{selectedHour}:{selectedMinute}:00</Text>
                  <TouchableOpacity>
                    <Text onPress={(event)=>{
                        const selectedDate = new Date();
                        // Establecer la hora y minutos seleccionados en el objeto Date
                        selectedDate.setHours(parseInt(selectedHour));
                        selectedDate.setMinutes(parseInt(selectedMinute));
                        selectedDate.setSeconds(0)
                        onChange( event ,selectedDate, 'timebreak');
                      setModalVisibleTimebreak(false)}}>Seleccionar</Text>
                  </TouchableOpacity>
                </View>
                        
              </View>
            </Modal>
            
            {/* Finishwork */}
            <Text>Finishwork: {finishwork.toLocaleTimeString()}</Text>
            <Button onPress={() => showTimepicker('finishwork')} title="Select Finish Work Time" />
            {showPicker.finishwork && (
              <DateTimePicker
                value={finishwork}
                mode="time"
                is24Hour={true}
                display="default"
                minuteInterval={minutes}
                onChange={(event, time) => onChange(event, time, 'finishwork')}
              />
            )}

           
            

          </View>
            
          <View style={styles.container}>
          <Text>¿Trabajar en días festivos?</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#0ecf2b" }} // Colores cuando está apagado/encendido
            thumbColor={isWorkingOnHoliday ? "#f4f3f4" : "#f4f3f4"} // Color del círculo
            ios_backgroundColor="#3e3e3e" // Color de fondo para iOS
            onValueChange={toggleSwitch} // Cambia el estado cuando el switch se mueve
            value={isWorkingOnHoliday} // El valor actual del switch (true/false)
          />
          {isWorkingOnHoliday ? <View>
            {/*Startwork holi:*/}
            <Text>Startwork holi: {startwork_holi.toLocaleTimeString()}</Text>
            <Button onPress={() => showTimepicker('startwork_holi')} title="Select Break Start" />
            {showPicker.startwork_holi && (
              <DateTimePicker
                value={startwork_holi}
                mode="time"
                is24Hour={true}
                display="default"
                minuteInterval={10}
                onChange={(event, time) => onChange(event, time, 'startwork_holi')}
              />
            )}
            {/* Finishwork_Holy*/}
            <Text>Finishwork holi:: {finishwork_holi.toLocaleTimeString()}</Text>
            <Button onPress={() => showTimepicker('finishwork_holi')} title="Select Break Start" />
            {showPicker.finishwork_holi && (
              <DateTimePicker
                value={finishwork_holi}
                mode="time"
                is24Hour={true}
                display="default"
                minuteInterval={10}
                onChange={(event, time) => onChange(event, time, 'finishwork_holi')}
              />
            )} 
            {/* Breakstart_Holy*/}
            <Text>Breakstart holi: {breakstart_holi.toLocaleTimeString()}</Text>
            <Button onPress={() => showTimepicker('breakstart_holi')} title="Select Break Start" />
            {showPicker.breakstart_holi && (
              <DateTimePicker
                value={breakstart_holi}
                mode="time"
                is24Hour={true}
                display="default"
                minuteInterval={10}
                onChange={(event, time) => onChange(event, time, 'breakstart_holi')}
              />
            )}
             
          </View> :<Text>No trabajo en festivos</Text> } 
        </View>
        <Pressable onPress={()=>create()}>
          <Text>Crear horario</Text>
        </Pressable>
      </ScrollView>
      
      
            

  </View>
    
  );
}

 

const styles = StyleSheet.create({
  container: {
    flexDirection: 'colum', 
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    height: 50,
    width: 100,
  },
  closeButtonText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: 'blue', // Estilo para el botón de cerrar
  },
  containerModal:{
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semi-transparente, ajusta el último valor para mayor o menor transparencia
    justifyContent: 'center',
    alignItems: 'center',  
  },
  containerFlatlist:{
    alignItems:'center',
    width: '80%',
    maxHeight: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Fondo del modal casi transparente
    borderRadius: 10,
    padding: 10,
    elevation: 10, // Para sombras en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: {
      width: 10,
      height: 20, 
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    
  },
  timeText:{
    fontSize: 20,
    textAlign: 'center',
  },
  timeItem:{
    paddingVertical: 10,
    paddingHorizontal:40,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginVertical:10,
    marginHorizontal:20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo del modal casi transparente
    borderRadius: 10,
    elevation: 10, // Para sombras en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: {
      width: 5,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  containerFlatlistTimeseccion:{ 
    
    alignItems:'center',
    width: '90%',
    maxHeight: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Fondo del modal casi transparente
    borderRadius: 10,
    padding: 10,
    elevation: 10, // Para sombras en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: {
      width: 10,
      height: 20, 
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    
  },
  containerTimeseccion:{
    flexDirection:'row',
    maxHeight:90
    
  },

  
 
});