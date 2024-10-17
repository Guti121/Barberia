import { Stack } from 'expo-router/stack';


export default function Layout() {

  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ title:null, headerShown: false }} />
        <Stack.Screen
            name="createTimesTable"
            options={{
              presentation: 'modal',
              headerShown: true, // Asegúrate de que esto esté aquí
            }}
        />
      </Stack>
  );
}