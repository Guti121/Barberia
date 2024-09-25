import axios from "axios";
import { getValueFor} from "./TokenUse";
import { expiredTimeToken } from "./AxiosUser";
import { Alert } from "react-native";

//url base 

const Baseurl='http://192.168.1.8:8000/agenda/';

//refresh token 
export async function refreshGetToken(){
    
    await expiredTimeToken()
    const result = await getValueFor()
    console.log(result)

    if(!result){
        throw new Error("No se encontro Token")
    }else{
        return result
    }
}  

//funcion para listar el horario disponible en el calendario 
export async function handleListCalendar(selectedDate,idUserPro) {
    const url= `${Baseurl}listavailable/`
    const data = {
        fecha:selectedDate,
        user_pro :idUserPro,
    }

    return await awaitFunction(url,data);
}

//funcion para crear una agenda
export async function handleCreateAgenda(selectedDate,selectedTime,idUserPro){
    const url = `${Baseurl}create-agendas/`
    const data={
            day:selectedDate,
            date_start:selectedTime,
            user_pro : idUserPro,
        };
    const token = await refreshGetToken(url,data)
    const headers={'Authorization':`token ${token}`}
    return await awaitFunction(url,data,headers);
        
}
export async function handleListAgendaPro(selectedDay){
    date= selectedDay.toISOString().split("T")[0]
    const url= `${Baseurl}user-agendas/`
    const data={date:date}

    const token = await refreshGetToken(url,data)
    const headers={'Authorization':`token ${token}`}
    return await awaitFunction(url,data,headers);
    
}

export async function handleListAgendaClie(){
    const date=new Date().toISOString().split('T')[0]
    console.log('date::',date)
    const url =`${Baseurl}user-agendas-clie/`
    const data={
        date:date
    }
    const token = await refreshGetToken(url,data)
    const headers={'Authorization':`token ${token}`}
    return await awaitFunction(url,data,headers);  
}
//funcion que maneja el try y el catch y retorna el repsonse en caso de que sea una solicitud exitosa 
export async function awaitFunction(url, data, headers) {
    const config = {
        headers: headers || {}
    };

    try {
        // Solo se usa `await` una vez aquí
        const response = await axios.post(url, data, config, { withCredentials: true });
        console.log("¡Procedimiento exitoso!");
        return response.data;
    } catch (error) {
        // Manejo de errores
        let errorMessage = 'Error desconocido';
        
        if (error.response) {
            console.error('Error response:', error.response.data);
            errorMessage = JSON.stringify(error.response.data.error); // Convierte a cadena
        } else if (error.request) {
            console.error('Error request:', error.request);
            errorMessage = 'No response received from server';
        } else {
            console.error('Error:', error.message);
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
}




//delete scheduls 

export async function handleDestroyAgenda(value) {
    const itemId= value
    console.log(value)
    const url =`${Baseurl}destroy-agendas/${itemId}/`
    try{
        const token = await refreshGetToken()
        const headers={'Authorization':`token ${token}`}
        const response = await axios.delete(url,{headers, withCredentials:true})
        console.log('resonse : ',response)
        return response.data
    }catch(error){
        console.log('error:',error)
        Alert.alert('Error Desconocido')
    }
}