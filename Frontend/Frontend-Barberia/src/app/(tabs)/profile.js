import { Alert, Button, Pressable, View,Text } from "react-native"
import { handleLogout } from "../../components/axiosRequest/AxiosUser"
import { Link, useRouter } from "expo-router"
import ConfigUser from "../../components/user/configUser";

export default function Profile(){
    const router= useRouter();
    const logoutRedirct= async()=>{
        try{
            await handleLogout()
            router.replace('/login')
        }catch{
            Alert.alert('Error al Cerrar sesion')
        }
    }


    return(
        <View>
            <Link href='/timesTable' >
                <Text>Horario</Text>
            </Link>
            
            <Button title="Logout" onPress={()=> logoutRedirct()}/>
        </View>
    )
}