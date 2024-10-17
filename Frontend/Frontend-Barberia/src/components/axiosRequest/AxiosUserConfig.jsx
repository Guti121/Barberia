import axios from "axios";
import { awaitFunction, refreshGetToken } from "./AxiosCalendar";
import { Alert } from "react-native";

// ESTE ARCHIVO ESTA BASADO EN LA ESTRUCTURA DE AxiosCalendar.jsx
//encontraras funciones como resfresGetToken() y awaitFunction()
const Baseurl='http://192.168.1.1:8000/';


//listar informacion de trabajo usuario

export async function  listDateUser(){
    const url=`${Baseurl}agenda/list_date/`
    const data={}
    token = await refreshGetToken()
    headers={'Authorization':`token ${token}`}
    response=await awaitFunction(url,data,headers)
    console.log(response)
    return response
    
}

export async function handleDeleteTimesTable() {
    
    const url=`${Baseurl}agenda/destroy-date/30/`
    const data={}
    try{
        token = await refreshGetToken()
        headers={'Authorization':`token ${token}`}
        response = await axios.delete(url,{headers, withCredentials: true }) 
        // Si la eliminación fue exitosa (código 200)
        if (response.status === 200) {
            Alert.alert(
            'Eliminación exitosa',
            'El formulario ha sido eliminado correctamente.',
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
        }
    }
    catch(error){
        if (error.response) {
            // El servidor respondió con un código de estado que no es 2xx
            console.error('Error data:', error.response.data);  // Aquí verás el mensaje del servidor
            console.error('Error status:', error.response.status);  // Estado de respuesta (400, 403, etc.)
      
            // Mostrar el mensaje de error en una alerta o en la consola
            Alert.alert('Error', error.response.data.error);  // Cambia 'error' por la clave que envíes en el backend
            
          } else if (error.request) {
            // La solicitud fue enviada, pero no se recibió respuesta
            console.error('Error request:', error.request);
          } else {
            // Otro error durante la configuración de la solicitud
            console.error('Error', error.message);
        }
        
    }
}

export async function handleCreateTimesTable (
    startwork,
    finishwork,
    timeseccion,
    timebreak,
    breakstart,
    startwork_holi,
    finishwork_holi,
    breakstart_holi,
    is_holidays
) {
    console.log(startwork,
        finishwork,
        timeseccion,
        timebreak,
        breakstart,
        startwork_holi,
        finishwork_holi,
        breakstart_holi,
        is_holidays
    )
    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0'); // Asegura que tenga 2 dígitos
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Asegura que tenga 2 dígitos
        const seconds = String(date.getSeconds()).padStart(2, '0'); // Asegura que tenga 2 dígitos
        return `${hours}:${minutes}:${seconds}`; // Retorna el tiempo en formato "HH:MM:SS"
      };

    url=`${Baseurl}agenda/create-date/`
    data={
        local:'BARBER_SHOP',
        startwork:formatTime(startwork),
        finishwork:formatTime(finishwork),
        timeseccion:formatTime(timeseccion),
        timebreak:formatTime(timebreak),
        breakstart:formatTime(breakstart),
       
        startwork_holi:formatTime(startwork_holi),
        finishwork_holi:formatTime(finishwork_holi),
        breakstart_holi:formatTime(breakstart_holi),
    }
    console.log(data)
    token = await refreshGetToken()
    headers={'Authorization':`Token ${token}`}
    console.log(headers)
    return await awaitFunction(url,data,headers)
    
}