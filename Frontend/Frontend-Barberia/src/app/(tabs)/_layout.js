import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { agendaCheckIcon, magnifyingIcon, myDateIcon, plusIcon, profileIcon } from '../../icons';
import { Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => magnifyingIcon(color),
        }}
      />
      <Tabs.Screen
        name='myScheduls'
        options={{
          title: 'MyScheduls',
          tabBarIcon: ({ color }) => agendaCheckIcon(color),
          headerRight: () => {const router = useRouter(); // Llama al hook de router dentro del componente
            const onPress = () =>{
              router.push('/mySchedulsPending')
            }
            return ( 
            <Pressable onPress={()=>onPress()}>
              {plusIcon()}
            </Pressable>
          );
        },
            
        }}
      />
      <Tabs.Screen
        name='myDate'
        options={{
          title:'MyDate',
          tabBarIcon:({color})=>myDateIcon(color)
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:'Profile',
          tabBarIcon:({color})=>profileIcon(color)
        }}
      />
     
    </Tabs>
  );
}
