
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';


const key='Mytoken'
const time='MyTime'
const cel='MyCel'
//Se almacena el token que proporciona el servidor
export async function save(value,phonenumber) {
    console.log('celilar',phonenumber)
    try{
      let current_time=Date.now().toString()
      await Promise.all([
        SecureStore.setItemAsync(key, value),
        SecureStore.setItemAsync(time,current_time),
        SecureStore.setItemAsync(cel,phonenumber),
      ])
    }
    catch(error){
        console.log(error)
    }
    
}

//Se obtiene token con la clave "Mytoken"
export async function getValueFor() {
  try{
    let result = await SecureStore.getItemAsync(key);
    return result 
  }catch{
    return ""
  }
}

//Se elimina el token almacenado 
export async function deleteItem(){
  try{
    await Promise.all([
      SecureStore.deleteItemAsync(key),
      SecureStore.deleteItemAsync(time),
      SecureStore.deleteItemAsync(cel)
  ]);
  
  }catch(error){
    console.log("Error con llamado de la funcion",error)
    Alert.alert("Algo salio mal")
  }
}


//Se verifica que el token no halla expirado y en caso de ser asi se renueva 
