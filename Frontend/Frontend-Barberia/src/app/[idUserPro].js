
import { useLocalSearchParams, useNavigation } from "expo-router";
import MyComponent from "../components/calendar/ScheduleList";
import { useEffect } from "react";


export default function Calendar(){
    const {idUserPro,phonenumber} =  useLocalSearchParams();
    const navigation =useNavigation()
    
    useEffect(()=>{
        if(idUserPro){
            navigation.setOptions({
                title:`Professional ${phonenumber}`
            })
        }   
        },[idUserPro,phonenumber,navigation])

        return (<MyComponent idUserPro={idUserPro} />)
}
