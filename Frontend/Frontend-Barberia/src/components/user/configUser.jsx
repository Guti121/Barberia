import { useEffect, useState } from "react"
import {  View,Text} from "react-native"
import { listDateUser } from "../axiosRequest/AxiosUserConfig"


const ConfigUser = () =>{
    const [response,setResponse] = useState()

    useEffect(()=>{
        const getResponse= async()=>{
            result = await listDateUser()
            setResponse(result)
        }
        getResponse()
    },[])

    if (!response){
        return <Text>Loading...</Text>;
    }
    return(
        <View>
            <Text>foreinguser: {response.foreinguser}</Text>
            <Text>startwork: {response.startwork}</Text>
            <Text>finishwork: {response.finishwork}</Text>
            <Text>timebreak: {response.timebreak}</Text>
            <Text>timeseccion: {response.timeseccion}</Text>
            <Text>breakstart: {response.breakstart}</Text>
            <Text>is_holidays: {response.is_holidays ? 'No' : 'Yes'}</Text>
            
        </View>
    )
}


export default ConfigUser