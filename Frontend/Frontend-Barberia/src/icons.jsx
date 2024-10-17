import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

export const magnifyingIcon=(color)=>{
    return(
        <FontAwesome6 name="magnifying-glass" size={24} color={color} />
    )
} 

export const agendaCheckIcon=(color)=>{
    return <FontAwesome name="calendar-check-o" size={24} color={color} />
}

export const profileIcon=(color)=>{
    return <Ionicons name="person" size={24} color={color} />
}

export const myDateIcon =(color)=> {
    return <MaterialCommunityIcons name="view-agenda" size={24} color={color} />
}

export const plusIcon =()=>{
    return <AntDesign name="plus" size={24} color='black' />
}

export const checkIcon=()=>{
    return <AntDesign name="check" size={24} color="black" />
}