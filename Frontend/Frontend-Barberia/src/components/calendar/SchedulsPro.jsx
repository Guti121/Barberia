import React, { useState, useEffect,useRef } from 'react';
import { View, FlatList, Text, StyleSheet,Button,Platform, Alert, RefreshControl, Pressable } from 'react-native';
import { handleListAgendaClie,handleListAgendaPro,handleDestroyAgenda, handleConfirmScheduls } from '../axiosRequest/AxiosCalendar'; // Importa la función para obtener los datos
import DateTimePicker from '@react-native-community/datetimepicker';
import { checkIcon } from '../../icons';

//listar agendas ocupadas de profesionales
export const ListSchedulsPro= (type) => {
    const today = new Date();
    const [response, setResponse] = useState([]);
    const [selectedDay, setSelectedDay] = useState(today); // Fecha actual por defecto
    const [show, setShow] = useState(false);
    const [alertShown, setAlertShown] = useState(false); // Estado para controlar la alerta
    const [refreshing,setRefreshing]= useState(false)
    const flatListRef = useRef(null);
    const ITEM_HEIGHT = 80; // Define la altura que deseas para cada ítem


    // Formatear la fecha seleccionada como 'YYYY-MM-DD'
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const fetchData = async () => {
        try {
            const data = await handleListAgendaPro(selectedDay,type); // Llama a tu función para obtener los datos
            console.log('data return:',data)
            const filterData = data.filter(item => item.day === formatDate(selectedDay));

            // Ordenar los datos por hora de inicio
            const sortedData = filterData.sort((a, b) => {
                const timeA = a.date_start.split(':').join('');
                const timeB = b.date_start.split(':').join('');
                return timeA.localeCompare(timeB);
            });

            setResponse(sortedData);  // Guarda los datos filtrados en el estado

            // Mostrar alerta si no hay reservas
            if (sortedData.length === 0 && !alertShown) {
                Alert.alert('No hay reservas');
                setAlertShown(true); // Asegura que la alerta solo se muestre una vez
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {    
        fetchData();
    }, [selectedDay,]); // Refresca los datos cuando cambia la fecha seleccionada

    useEffect(() => {
        if (response.length === 0 ) {
            return; // Si no hay eventos, no hacemos nada
        } 
        console.log(selectedDay.toLocaleDateString(), today.toLocaleDateString())
        if (selectedDay.toLocaleDateString() === today.toLocaleDateString()) {

                const currentHour =today.getHours();
                const currentMinute =today.getMinutes();
                console.log(currentHour,':',currentMinute)
                const indexToScroll = response.findIndex(item => {
                const [hourStart, minuteStart] = item.date_start.split(':').map(Number);
                const [hourFinish, minuteFinish] = item.date_finish.split(':').map(Number);
                
                // Verificar si el evento está ocurriendo ahora mismo o si es el siguiente evento futuro
                const isCurrentEvent = (hourStart < currentHour || (hourStart === currentHour && minuteStart <= currentMinute)) &&
                (hourFinish > currentHour || (hourFinish === currentHour && minuteFinish >= currentMinute));
                console.log(isCurrentEvent)
                
                return isCurrentEvent || (hourStart > currentHour || (hourStart == currentHour && minuteStart > currentMinute));
            });
            
            console.log(indexToScroll)
            if (indexToScroll !== -1 && flatListRef.current) {
                setTimeout(() => {
                    flatListRef.current.scrollToIndex({ index: indexToScroll, animated: true });
                }, 100)
                
                
            } else{
                Alert.alert('No hay eventos próximos');
            }
        }      
        
    }, [response]); // Este efecto depende de la respuesta para activarse

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || selectedDay;
        setShow(Platform.OS === 'ios'); // En iOS, el DatePicker se queda abierto
        setSelectedDay(currentDate); // Actualiza la fecha seleccionada
        setAlertShown(false); // Resetea el estado de la alerta al cambiar la fecha
    };

    const showDatepicker = () => {
        setShow(true); // Muestra el DatePicker
    };

    
    const confirmDelete = (id) => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar esta reserva?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => handleDelete(id) // Llama a la función de eliminación si se confirma
                }
            ],
            { cancelable: true }
        );
    
        // Función para manejar la eliminación y actualizar la lista
        const handleDelete = async (id) => {
            try {
                await handleDestroyAgenda(id); // Llama a tu API para eliminar
                // Actualiza la lista removiendo el item con el id correspondiente
                setResponse((prevResponse) => prevResponse.filter(item => item.id !== id));
                Alert.alert('Reserva eliminada exitosamente');
            } catch (error) {
                Alert.alert('Error al eliminar la reserva');
                console.log(error);
            }
        };
    };

    
    const isCurrentHour = (start, finish) => {
        if (selectedDay.toLocaleDateString() == today.toLocaleDateString()){
            const currentTime = today.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
            const startTime = start.substring(0, 5); // HH:MM
            const finishTime = finish.substring(0, 5); // HH:MM
            console.log(currentTime)
            return currentTime >= startTime && currentTime <= finishTime;
        }
        else{
            return false
        }
    };


    const onRefresh = async()=>{
        setRefreshing(true);
        await fetchData()
        setRefreshing(false);
    }
    
    const confirmAppointment = (itemId, itemDay, itemDate, itemUser) => {
        Alert.alert(
          'Confirmar Cita',
          `Deseas confirmar la cita para el día ${itemDay}\nHora de inicio: ${itemDate}\nCliente: ${itemUser}`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Confirmar',
              style: 'default',
              onPress: () => onPressCheckIcon(itemId), // Llama a la función para confirmar si el usuario lo desea
            }
          ],
          { cancelable: true }
        );
      
        const onPressCheckIcon = async (itemId) => {
          await handleConfirmScheduls(itemId); // Llama a la función de confirmación
          await onRefresh(); // Actualiza la lista u otra acción que necesites después
        };
      };
      
    
    return (
        <View style={styles.container}>
            <Button onPress={showDatepicker} title="Seleccionar fecha" />
            {show && (
                <DateTimePicker
                    value={selectedDay}
                    mode="date"
                    display="default"
                    onChange={onChange}
                />
            )}
            <FlatList
                ref={flatListRef} // Añade la referencia a FlatList
                data={response}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const isCurrent = isCurrentHour(item.date_start, item.date_finish);
                    return (
                        <View style={[styles.itemContainer,console.log("iscurrent",isCurrent),
                            isCurrent && styles.currentItemContainer]}>
                            <View>
                            <Text style={styles.text}>Hora inicio: {item.date_start}</Text>
                            <Text style={styles.text}>Hora fin: {item.date_finish}</Text>
                            <Text style={styles.text}>Cliente: {item.user_clie}</Text>
                            <Text style={styles.text}>Profesional: {item.user_pro}</Text>
                            <Text style={styles.text}>Día: {item.day}</Text>
                            {type.type === 'pending' && <Text>Estado: {item.state ? 'Confirmada' : 'Pendiente'} </Text>}
                            </View>
                            <View>
                                <Button title='Eliminar' onPress={()=>confirmDelete(item.id)}></Button>
                                {type.type === 'pending' &&
                                <Pressable onPress= {()=>confirmAppointment(item.id,item.day,item.date_start,item.user_clie)} >
                                    {checkIcon()}
                                </Pressable>
                                }
                            </View>
                        </View>
                    );
                }}
                getItemLayout={(data, index) => (
                    { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
            />
        </View>
    );
};

//listar agendas reservadas por los mismos clientes 
export const ListSchedulsClie= () => {
    const [response,setResponse]= useState([])
    const [alertShown, setAlertShown] = useState(false); 
    const [refreshing,setRefreshing]= useState(false)
    const today = new Date().toISOString().split('T')[0];;
    
    const request = async () =>{
        try{
            dates = await handleListAgendaClie(today)
            console.log(dates)
            
            
            //filtar horarios
            const sortedData=dates.sort((a,b)=>{
                const timeA = a.day.split(':').join('');
                const timeB = b.day.split(':').join('');
                return timeA.localeCompare(timeB);
            })
            setResponse(sortedData)

            if (sortedData.length === 0 && !alertShown) {
                Alert.alert('No hay reservas');
                setAlertShown(true); // Asegura que la alerta solo se muestre una vez
            }
        }
        catch(error){
            console.log(error.error)
        }
    }

    useEffect(()=>{
        request()
    },[])

    const confirmDelete = (id) => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar esta reserva?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => handleDelete(id) // Llama a la función de eliminación si se confirma
                }
            ],
            { cancelable: true }
        );
    
        // Función para manejar la eliminación y actualizar la lista
        const handleDelete = async (id) => {
            try {
                await handleDestroyAgenda(id); // Llama a tu API para eliminar
                // Actualiza la lista removiendo el item con el id correspondiente
                setResponse((prevResponse) => prevResponse.filter(item => item.id !== id));
                Alert.alert('Reserva eliminada exitosamente');
            } catch (error) {
                Alert.alert('Error al eliminar la reserva');
                console.log(error);
            }
        };
    };

    const onRefresh =async()=>{
        setRefreshing(true)
        await request()
        setRefreshing(false)
    }

    return(
    <View style={styles.container}>
        <FlatList
            data={response} 
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) =>(
                <View style={styles.itemContainer}>
                    <View>
                    <Text style={styles.text}>Día: {item.day}</Text>
                    <Text style={styles.text}>Hora inicio: {item.date_start}</Text>
                    <Text style={styles.text}>Hora fin: {item.date_finish}</Text>
                    <Text style={styles.text}>Cliente: {item.user_clie}</Text>
                    <Text style={styles.text}>Profesional: {item.user_pro}</Text>
                    <Text style={styles.text}>estado:{item.state ? 'Confirmada' : 'Pendiente'}</Text>
                    
                    </View>
                    <View>
                        <Button title='Eliminar' onPress={()=>confirmDelete(item.id)}></Button>
                    </View>
                </View>)}

                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
                }
        />

    </View>)
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    itemContainer: {
        flexDirection:'row',
        backgroundColor: '#f9f9f9',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        borderColor: '#ccc',
        borderWidth: 1,
        elevation: 3, // Para Android
        shadowColor: '#000', // Para iOS
        shadowOffset: { width: 0, height: 2 }, // Offset de la sombra
        shadowOpacity: 0.3, // Opacidad de la sombra
        shadowRadius: 2, // Radio de la sombra

    },
    currentItemContainer: {
        backgroundColor: '#a8e6cf', // Estilo de fondo en verde si es la hora actual
    },
    text: {
        fontSize: 16,
    },
});



