import { Alert, Button, View } from "react-native"
import { handleLogout } from "../../components/axiosRequest/AxiosUser"
import { useRouter } from "expo-router"
import ConfigUser from "../../components/user/configUser";

export default function Profile(){
    const router= useRouter();
    const logoutRedirct= async()=>{
        try{
            await handleLogout()
            router.replace('/login')
        }catch{
            Alert.alert('Erro al Cerrar sesion')
        }
    }

    return(
        <View>
         <ConfigUser/>
         <Button title="Logout" onPress={()=> logoutRedirct()}/>
        </View>
    )
}