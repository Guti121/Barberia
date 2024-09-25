import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { agendaCheckIcon, magnifyingIcon, myDateIcon, profileIcon } from '../../icons';

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
          title:'MyScheduls',
          tabBarIcon:({color})=>agendaCheckIcon(color)
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
