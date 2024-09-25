import axios from "axios";
import { Alert } from "react-native";

const Baseurl = 'http://192.168.1.8:8000/agenda/';

export async function handleListAgendaProTest(value) {
    date= value.toISOString().split("T")[0]
    console.log(date)
    const url = `${Baseurl}user-agendas/`;
    const data = {date:date};
    const headers = { 'Authorization': 'Token 53f8251581b7e044bb5ea7a4d45e78aae7788f5d' }; 

    try {
        const response = await axios.post(url, data, { headers, withCredentials: true });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Re-throw the error if needed for further handling
    }
}


export async function handleListAgendaClie(){
    const date=new Date().toISOString().split('T')[0]
    console.log(date)
    const url =`${Baseurl}user-agendas-clie/`
    const data={
        date:date
    }
    const headers={'Authorization':'Token 29001d7ae4d670ccfb794ccfa81aa0c7ae55d6c6'}
    try{
        const response = await axios.post(url,data,{headers,withCredentials: true})
        console.log(response.data)
        return response.data;
    }catch(error){
        console.log('Error en la request :',error)
        throw new error;
    }
}

export async function handleDestroyAgenda(value) {
    const itemId= value
    console.log(value)
    const url =`${Baseurl}destroy-agendas/${itemId}/`
    const headers={'Authorization':'Token 29001d7ae4d670ccfb794ccfa81aa0c7ae55d6c6'}
    try{
        const response = await axios.delete(url,{headers, withCredentials:true})
        console.log('resonse : ',response)
        return response.data
    }catch(error){
        console.log('error:',error)
        Alert.alert('Error Desconocido')
    }
}
