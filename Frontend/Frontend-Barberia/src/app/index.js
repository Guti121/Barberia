import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

//En esta vista lo que hacemos es verificar si el usuario tiene los elementos necesarios para continar con unas sesion
//en caso de que no, se redirigira a la vista '/login'
export default function Index() {
  const router = useRouter(); // Para redirigir con expo-router

  useEffect(() => {
    const isAuthenticate = async () => {
      try {
        // Obtén los valores de SecureStore
        const myTime = await SecureStore.getItemAsync("MyTime");
        const myCel = await SecureStore.getItemAsync("MyCel");
        const mytoken = await SecureStore.getItemAsync("Mytoken"); // Cambié el segundo MyTime a MyOtherTime asumiendo que fue un error

        // Si todos los valores existen, redirige
        if (myTime && myCel && mytoken) {
          router.replace('/search'); // Redirigir a la URL deseada
        }else{
          router.replace('/login');
        }
      } catch (error) {
        console.log(error)
      }
    };

    isAuthenticate(); // Ejecuta la función
  }, [router]); // El efecto se ejecuta al montar el componente

  return null; // No hay UI en este componente
}
