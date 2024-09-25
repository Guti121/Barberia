import React from "react";
import FormLogin from "./user/Login";
import { View, StyleSheet} from "react-native";



export default function Main() {
    return (
     <View style={styles.container}>
      <FormLogin/>
     </View>
    );
  }
  

const styles=StyleSheet.create({
  container:{
    flex:1,
    paddingTop:30,
  }
})
  