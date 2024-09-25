import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet,Button,Platform, Alert } from 'react-native';
import { handleListAgendaClie,handleListAgendaPro,handleDestroyAgenda } from '../axiosRequest/AxiosCalendar'; // Importa la función para obtener los datos
import DateTimePicker from '@react-native-community/datetimepicker';

//listar agendas ocupadas de profesionales
export const ListSchedulsPro= () => {
    const today = new Date();
    const [response, setResponse] = useState([]);
    const [selectedDay, setSelectedDay] = useState(today); // Fecha actual por defecto
    const [show, setShow] = useState(false);
    const [alertShown, setAlertShown] = useState(false); // Estado para controlar la alerta

    // Formatear la fecha seleccionada como 'YYYY-MM-DD'
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await handleListAgendaPro(selectedDay); // Llama a tu función para obtener los datos
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

        fetchData();
    }, [selectedDay]); // Refresca los datos cuando cambia la fecha seleccionada

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || selectedDay;
        setShow(Platform.OS === 'ios'); // En iOS, el DatePicker se queda abierto
        setSelectedDay(currentDate); // Actualiza la fecha seleccionada
        setAlertShown(false); // Resetea el estado de la alerta al cambiar la fecha
    };

    const showDatepicker = () => {
        setShow(true); // Muestra el DatePicker
    };

    // Función para colorear la hora actual
    const isCurrentHour = (start, finish) => {
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
        const startTime = start.substring(0, 5); // HH:MM
        const finishTime = finish.substring(0, 5); // HH:MM

        return currentTime >= startTime && currentTime <= finishTime;
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
                data={response}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const isCurrent = isCurrentHour(item.date_start, item.date_finish);
                    return (
                        <View style={[styles.itemContainer,
                            isCurrent && styles.currentItemContainer]}>
                            <View>
                            <Text style={styles.text}>Hora inicio: {item.date_start}</Text>
                            <Text style={styles.text}>Hora fin: {item.date_finish}</Text>
                            <Text style={styles.text}>Cliente: {item.user_clie}</Text>
                            <Text style={styles.text}>Profesional: {item.user_pro}</Text>
                            <Text style={styles.text}>Día: {item.day}</Text>
                            </View>
                            <View>
                                <Button title='Eliminar' onPress={()=>confirmDelete(item.id)}></Button>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
};

//listar agendas reservadas por los mismos clientes 
export const ListSchedulsClie= () => {
    const [response,setResponse]= useState([])
    const [alertShown, setAlertShown] = useState(false); 
    const today = new Date().toISOString().split('T')[0];;
    console.log('entre en list clie')
    useEffect(()=>{
        const resquest = async () =>{
            try{
                dates = await handleListAgendaClie(today)
                console.log(dates)
                
                
                //filtar horarios
                sortedData=dates.sort((a,b)=>{
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
        resquest()
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
                    </View>
                    <View>
                        <Button title='Eliminar' onPress={()=>confirmDelete(item.id)}></Button>
                    </View>
                </View>)}
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
    },
    currentItemContainer: {
        backgroundColor: '#a8e6cf', // Estilo de fondo en verde si es la hora actual
    },
    text: {
        fontSize: 16,
    },
});



