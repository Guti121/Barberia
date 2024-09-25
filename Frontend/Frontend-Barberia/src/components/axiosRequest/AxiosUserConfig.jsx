import { awaitFunction, refreshGetToken } from "./AxiosCalendar";

// ESTE ARCHIVO ESTA BASADO EN LA ESTRUCTURA DE AxiosCalendar.jsx
//encontraras funciones como resfresGetToken() y awaitFunction()
const Baseurl='http://192.168.1.8:8000/';


//listar informacion de trabajo usuario

export async function  listDateUser(){
    const url=`${Baseurl}agenda/list_date/`
    const data={}
    token = await refreshGetToken()
    headers={'Authorization':`token ${token}`}
    response=await awaitFunction(url,data,headers)
    return response
    
}