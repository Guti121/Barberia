import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { deleteItem, getValueFor, save } from "./TokenUse";
import { Alert } from "react-native";


const Baseurl='http://192.168.1.1:8000/';

//funcion para listar usuarios pro filtrandolos 
export async function handleListUserPro(value) {
    console.log('value:',value)
    const url=`${Baseurl}user/userpro/search/?search=${value}`
   
    
    await expiredTimeToken()
    const result = await getValueFor()
    console.log(result)

    if(!result){
        throw new Error("No se encontro Token")
    }else{
        
        const headers = {'Authorization':`token ${result}`}; 
        response= await axios.get(url,{ headers,withCredentials: true });
        console.log(response.data)
        return response 
    }
}

//Request para login
export async function handleLogin(phonenumber,password){
    
    const url=`${Baseurl}`
    const data={
        phonenumber:phonenumber,
        password:password
    };

    try{
        const response = await axios.post(url,data,{ withCredentials: true });
        await save(response.data.token,phonenumber)
        return response.data
        
    }catch(error){
        let errorMessage='Error Desconocido'
        
        if(error.response.data){
            errorMessage=JSON.stringify(error.response.data.error)
            console.log(errorMessage)
        }
        else if(error.request){
            errorMessage='Conexion con el servidor erronea!'
        }else{
            errorMessage=error.errorMessage
        }
        throw new Error(errorMessage);
    }
}
//Request para logout
export async function handleLogout() {
    const url = `${Baseurl}logout/`;

    try {
        await expiredTimeToken()
        const token = await getValueFor();
        if (!token) {
            throw new Error("No se encontró el token");
        }
 
        const data = { token: token };
        const resultRequestAxios = await axios.post(url, data, { withCredentials: true });

        await deleteItem(); // Elimina el token solo si el logout es exitoso
        Alert.alert("Acabas de cerrar Sesión!!")
        console.log(resultRequestAxios.data);
        
    } catch (error) {
        console.log("Error al cerrar sesión:", error);
        Alert.alert("No se pudo cerrar sesión"); // Solo si estás en React Native
    }
}


//Resquest para Resfresh-Token

export async function expiredTimeToken (){
    try{
        
        let result  =  await SecureStore.getItemAsync("MyTime") 
        console.log(result)
        //Convierto el result en el valor original
        if (result){ 
            console.log(result)
            result= parseInt(result,10)
            const elapseTime =  Date.now()- result 
            // Define el período de expiración en milisegundos (por ejemplo, 15 minutos)
            const expirationPeriod = 1* 60 * 1000; // 15 minutos en milisegundo
    
            if(elapseTime >= expirationPeriod){
                
            //renovar 
                let phonenumber = await SecureStore.getItemAsync("MyCel")
                await refreshToken(phonenumber)
            }
        }
    }
    catch(error){
      Alert.alert('no se pudo verificar el tiempo')
      console.log(error)
    }
  }

  
async function refreshToken(phonenumber){
    const url = `${Baseurl}refresh-token/`
    const data = {
        phonenumber:phonenumber
    }
    console.log('Phone:',phonenumber)
    try{
        response = await axios.post(url,data, { withCredentials: true })
        if (response.status === 200 && response.data.token) {
            console.log("Se realiza el guradado exitoso")
            await save(response.data.token,phonenumber);
        }
    }
    catch(error){
        console.log(error)
        Alert.alert('Error al refrescar Token')
    }
}
  
  