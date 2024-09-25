import React, { useEffect, useState } from "react";
import {TextInput,View,StyleSheet,Text,Button, Modal} from 'react-native'
import { handleLogin } from "../axiosRequest/AxiosUser";
import MyComponent from "../calendar/ScheduleList";
import { ListScheduls } from "../calendar/SchedulsPro";
import { Link } from "expo-router";
import { router } from 'expo-router'

export default function FomrLogin (){
    const [number,setNumber]=useState("")
    const [password,setPassword]=useState("")
    const [error, setError] = useState(null)
    const [approved,setApproved] = useState(null)
    const [modal,setModal] = useState(false)
    const [callComponent,setCallComponent]= useState(false)
    
    const handleFormLogin = async()=>{
        try{
            const result= await handleLogin(number,password)
            setError(null)
            setApproved("Sesion Iniciada exitosamente")
            setModal(true)
            setCallComponent(true)        
        }catch(error){
            console.log(error.message || "Error al iniciar sesion")
            setError(error.message)
            setApproved(null)
            setModal(true)
        }
    }
    
    // Apenas inicia sesion este useEffect lo reenvia a la direccion de /search ubicada en app/(tabs)/search
    useEffect(()=>{
        if(callComponent){
            router.replace('/search')
        }
    },[callComponent])

    return(

        <View style={styles.container}>
            <TextInput style={styles.TextInput} value={number} onChangeText={setNumber}/>
            <TextInput style={styles.TextInput} value={password} onChangeText={setPassword}/>
            <Button title="Iniciar sesion" onPress={handleFormLogin}/>
            <Modal
                visible={modal}
                animationType="fade"
                transparent={true}
                onRequestClose={()=>setModal(false)}>
                <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    {error && <Text style = {styles.errorText}>{error}</Text> || approved && <Text  style = {styles.approvedText}>{approved}</Text> }
                    <Button title="Cerrar" onPress={()=> setModal(false)}/>
                </View>
                </View>
            </Modal>
            
            
            
        </View>
        
    )
}

const styles =StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#fff',
        flexDirection:'column'
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fondo semitransparente
      },
    TextInput:{
        margin:12,
        height:40,
        padding:10,
        borderWidth:1,
    },
    approvedText:{
    
        color:'green',
        marginTop:10,
        
    },
    errorText:{
        color:'red',
        marginTop:10,
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        maxHeight: '80%', // Limita la altura del modal
    },
});
