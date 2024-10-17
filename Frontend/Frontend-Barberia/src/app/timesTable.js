import { Link, useNavigation } from "expo-router";
import ConfigUser from "../components/user/configUser";
import { useEffect } from "react";
import { View } from "react-native";

export default function TimeTable(){
    const navigation = useNavigation()

    useEffect(()=>{
        if(navigation){
            navigation.setOptions({
                title:'Horarios de Trabajo'
            },[navigation])
        }
    })

    return <ConfigUser /> 
       
    
    
        
}