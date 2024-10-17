import { useEffect, useState } from "react"
import { View, Text, Pressable, ScrollView, RefreshControl,StyleSheet } from "react-native"
import { handleDeleteTimesTable, listDateUser } from "../axiosRequest/AxiosUserConfig"
import { Link } from "expo-router"

const ConfigUser = () => {
  const [response, setResponse] = useState(null)  // Inicializamos con null
  const [refreshing, setRefreshing] = useState(false)

  const getResponse = async () => {
    const result = await listDateUser()
    setResponse(result)  // Directamente asignamos el objeto a response
  }

  useEffect(() => {
    getResponse()
  }, [])

  if (!response) {
    return <Text>Loading...</Text>;
  }

  const deleteTimesTable = async () => {
    await handleDeleteTimesTable()
    onRefresh()
}

  const onRefresh = async () => {
    setRefreshing(true)
    await getResponse()
    setRefreshing(false)
  }

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View>
        {/* Asegúrate de que todo el texto esté envuelto en <Text> */}
        <Text>foreinguser: {response.foreinguser}</Text>  
        <Text>startwork: {response.startwork}</Text>
        <Text>finishwork: {response.finishwork}</Text>
        <Text>timebreak: {response.timebreak}</Text>
        <Text>timeseccion: {response.timeseccion}</Text>
        <Text>breakstart: {response.breakstart}</Text>
        <Text>is_holidays: {response["is holidays"] ? 'Yes' : 'No'}</Text>  
        
        <Pressable onPress={() => deleteTimesTable(response.id)}>
          {/* Aquí estamos asegurando que el texto esté dentro de <Text> */}
          <Text>Eliminar Horarios</Text>
        </Pressable>
        
        <Link href="/createTimesTable" style={styles.link} > 
            Create Horario
        </Link>

      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    link: {
      paddingTop: 20,
      fontSize: 20,
    },
  });

export default ConfigUser
