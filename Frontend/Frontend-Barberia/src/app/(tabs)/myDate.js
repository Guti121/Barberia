import { useNavigation } from "expo-router";
import { handleLogout } from "../../components/axiosRequest/AxiosUser";
import { useEffect } from "react";
import { ListSchedulsClie } from "../../components/calendar/SchedulsPro";

export default function Mydate(){
    const navigation =useNavigation()
    
    useEffect(()=>{
        if(navigation){
            navigation.setOptions({
                title:`My date`
            })
        }   
        },[navigation])
    return <ListSchedulsClie/>
}


