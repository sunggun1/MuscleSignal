import { View, Text, StyleSheet,Button, TouchableOpacity ,Alert,Platform,PermissionsAndroid, FlatList } from 'react-native'
import React, { FC, SetStateAction, useLayoutEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native';
import {RootRouteProps} from '../../App';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { createMuscleTable, Muscle, muscleProp,db, muscleTableName,muscleActions } from '../redux/slices/muscleSlice';
import { useAppDispatch } from '../hook/hook';
import {BleError, BleManager, Characteristic} from 'react-native-ble-plx'
import base64 from 'react-native-base64';
import moment from 'moment';
import { Buffer } from "buffer";


interface State {
    [id: string]: string
}

const transactionId ="moniter";
const _BleManager = new BleManager();
let count = 0;

const MuscleDetailScreen: FC<State> = () => {
    const route = useRoute<RootRouteProps<'MuscleDetail'>>();
    const {positionName} = route.params;
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    
    const [deviceid,setDeviceid] = useState('');
    const [serviceUUID,setServiceUUID] = useState('');
    const [characteristicsUUID,setCharacteristicsUUID] = useState('');
    const [text1,setText1] = useState('');
    const [makedata,setMakedata] = useState<any[]>([]);
    const [notificationReceiving,setNotificationReceiving] = useState(false);
    const [dateTime,setDateTime] = useState('');
    const [device, setDevice] = useState<any>(null);

    const getAllMuscleList = (returnMessage: string | null) => {
        try{
            var tempResult : muscleProp[] = [];
            var tempMessage : string = '';
            db.transaction((tx) => {
                tx.executeSql(
                  `SELECT * FROM ${muscleTableName}`,
                  [],
                  (tx, results) => {
                    var temp: muscleProp[] = [];
                    console.log('select muscle' + results.rows.length);
                    for (let i = 0; i < results.rows.length; i++){
                        temp.push(results.rows.item(i));
                    }
                    tempResult = temp;
                    tempMessage = 'success';
                    const data: Muscle = {position : tempResult, result : returnMessage? returnMessage : tempMessage} as Muscle;
                    dispatch(muscleActions.getAllMuscle(data));
                  }
                ,(error: any)=>{
                    console.log('error');
                    tempResult = [];
                    tempMessage = error;
                    const data: Muscle = {position : tempResult, result : tempMessage} as Muscle;
                    dispatch(muscleActions.getAllMuscle(data));
                });
            });
        }catch(error:any){
            const data: Muscle = {position : [], result : error} as Muscle;
            dispatch(muscleActions.getAllMuscle(data));
        }
    }

    const createMuscle = (musclePositionId: string,power:number)=>{
        try{
            var tempMessage:string = '';
            db.transaction((tx) =>{
                tx.executeSql(`INSERT INTO ${muscleTableName} (musclePositionId,power) VALUES (?,?)`,[musclePositionId,power],
                (tx,results)=>{
                    console.log('Results', results.rowsAffected);
                    if (results.rowsAffected > 0) {
                        console.log('Data Inserted Successfully....');
                        tempMessage = 'Data Inserted Success';
                        getAllMuscleList(tempMessage);
                    } else {
                        console.log('Data Inserted Failed....');
                        tempMessage = 'Data Inserted Failed';
                        getAllMuscleList(tempMessage);
                    }
                },(error: any) => {
                    tempMessage = error;
                    getAllMuscleList(tempMessage);
                });
            })    
        }catch(error:any){
            getAllMuscleList(error);
        }
    };
    
    const deleteMuscle = (id: number) =>{
        try{
            var tempMessage:string = '';
            db.transaction((tx) =>{
                tx.executeSql(`DELETE from ${muscleTableName} where id = ${id}`,[],
                (tx,results)=>{
                    console.log('Results', results.rowsAffected);
                    if (results.rowsAffected > 0) {
                        console.log('Data deleted Successfully....');
                        tempMessage = 'Data deleted success';
                        getAllMuscleList(tempMessage);
                    } else {
                        console.log('Data deleted Failed....');
                        tempMessage = 'Data deleted success';
                        getAllMuscleList(tempMessage);
                    }
                },(error: any) => {
                    tempMessage = error;
                })
            })
        }catch(error:any){
            getAllMuscleList(error);
        } 
    };

    useLayoutEffect(() => {
        const _BleManager = new BleManager();
        return () => {
            _BleManager.cancelTransaction(transactionId)
            _BleManager.stopDeviceScan();
            _BleManager.destroy();
        }
    }, []);

    useEffect(()=>{
        const _BleManager = new BleManager();
        createMuscleTable();
        getAllMuscleList(null);
        setDeviceid('');
        setServiceUUID('');
        setCharacteristicsUUID('');
        setText1('');
        setMakedata([]);
        setNotificationReceiving(false);
        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,  
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,  
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION])
            .then((result)=>{
                if (result) {
                    console.log(" ACCESS_FINE_LOCATION  Permission is OK");
                    console.log(" ACCESS_COARSE_LOCATION  Permission is OK");
                    console.log(" ACCESS_BACKGROUND_LOCATION  Permission is OK");
                    // this.retrieveConnected()
                } else {
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION ).then((result) => {
                        if (result) {
                            console.log(" ACCESS_FINE_LOCATION  accept");
                        } else {
                            console.log(" ACCESS_FINE_LOCATION  refuse");
                        }
                    });
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION ).then((result) => {
                        if (result) {
                            console.log(" ACCESS_COARSE_LOCATION  accept");
                        } else {
                            console.log(" ACCESS_COARSE_LOCATION  refuse");
                        }
                    });
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION ).then((result) => {
                        if (result) {
                            console.log(" ACCESS_BACKGROUND_LOCATION  accept");
                        } else {
                            console.log(" ACCESS_BACKGROUND_LOCATION  refuse");
                        }
                    });
                }
            });
        }
    },[]);

    const getServicesAndCharacteristics = (device:any) => {
        return new Promise((resolve, reject) => {
            device.services().then((services: { characteristics: () => Promise<any>; }[]) => {
                const characteristics: any[] = []
                console.log("ashu_1",services)
                services.forEach((service: { characteristics: () => Promise<any>; }, i: number) => {
                    service.characteristics().then(c => {
                      console.log("service.characteristics")
                      
                        characteristics.push(c)
                        console.log(characteristics)
                        if (i === services.length - 1) {
                            const temp = characteristics.reduce(
                                (acc, current) => {
                                    return [...acc, ...current]
                                },
                                []
                            )
                            const dialog = temp.find(
                                (characteristic: { isWritableWithoutResponse: any; }) =>
                                    characteristic.isWritableWithoutResponse
                            )
                            if (!dialog) {
                                reject('No writable characteristic')
                            }
                            resolve(dialog)
                        }
                      
                    })
                })
            })
        })
    }
    
    const stopNotication = () =>{
        _BleManager.cancelTransaction(transactionId)
        setNotificationReceiving(false)
    }


    const disconnect = () =>{
        return new Promise((resolve, reject) => {
            _BleManager.cancelDeviceConnection(deviceid).
            then(rest=>{
                console.log(rest);
                setDeviceid('');
                setServiceUUID('');
                setCharacteristicsUUID('');
                setText1('');
                setMakedata([]);
                setNotificationReceiving(false);
            })
            .catch((err)=>console.log("error on cancel connection",err))
       })
    }

    const readData = async(device:any) => {
        const services : any = await device.services();
        console.log(services);
    
        services.forEach(async (service:any) => {
            const characteristics = await device.characteristicsForService(service.uuid);
            characteristics.forEach((result:any)=>{
                if(result.isNotifiable === true){
                    console.log(result);
                    result.monitor((err: any, update: any) => {
                        console.log(err);
                        console.log(update);
                        if (err) {
                            console.log(`characteristic error: ${err}`);
                            console.log(JSON.stringify(err));
                        } else {
                            console.log("Is Characteristics Readable:",update.isReadable);
                            console.log("Heart Rate Data:",base64.decode(update.value));
                            async () => {
                                const readCharacteristic = await device.readCharacteristicForService(result.serviceUUID,result.uuid);
                                await console.log(readCharacteristic);
                            }
                            // assuming the device is already connected
                            // var data = base64.decode(update.value);
            
                            const heartRateData = Buffer.from(update.value, 'base64').readUInt16LE(0);
                            console.log("Heart Beats:",heartRateData);
                        }
                    });
                }
            });
        });

        // const secondService = await services[2];
        // console.log(secondService);

        // const characteristics = await device.characteristicsForService(secondService.uuid)
        // .then((result:any)=>{
        //     console.log(result);
        //     for(var x =0 ; x<result.length; x++){
        //         if(result[x].isNotifiable === true){
        //             const descriptData = device.descriptorsForService(result[x].serviceUUID,result[x].uuid);
        //             console.log(descriptData);
        //             const data = device.readCharacteristicForService(result[x].serviceUUID,result[x].uuid);
        //             console.log(data);
        //             // device.monitorCharacteristicForService(result[x].serviceUUID,result[x].uuid,async(error:BleError|null, characteristic: Characteristic | null)=>{
        //             //     console.log(characteristic);
        //             //     console.log(error);
        //             //     if (error || !characteristic) {
        //             //         console.log(error);
        //             //         return
        //             //     }

        //             //     if (characteristic) {
        //             //         var raw: any = characteristic.value;
        //             //         var decodeVal = base64.decode(raw);
        //             //         console.log(`${raw}:  ${decodeVal}`);
        //             //     }
        //             // })
                    
        //             // result[x].monitor((err: any, update: any) => {
        //             //     console.log(err);
        //             //     console.log(update);
        //             //     if (err) {
        //             //         console.log(`characteristic error: ${err}`);
        //             //         console.log(JSON.stringify(err));
        //             //     } else {
        //             //         console.log("Is Characteristics Readable:",update.isReadable);
        //             //         console.log("Heart Rate Data:",base64.decode(update.value));
        //             //         async () => {
        //             //             const readCharacteristic = await device.readCharacteristicForService(result[x].serviceUUID,result[x].uuid);
        //             //             await console.log(readCharacteristic);
        //             //         }
        //             //         // assuming the device is already connected
        //             //         // var data = base64.decode(update.value);
            
        //             //         const heartRateData = Buffer.from(update.value, 'base64').readUInt16LE(0);
        //             //         console.log("Heart Beats:",heartRateData);
        //             //     }
        //             // });

                    
        //         }
        //     }
        // });
        // const secondService = await services[2];
        // console.log(secondService);
        // const characteristics = await device.characteristicsForService(services.uuid)
        // .then((result:any)=>{
        //     console.log(result);
        //     for(var x =0 ; x<result.length; x++){
        //         if(result[x].isNotifiable === true){
        //             device.monitorCharacteristicForService(result[x].serviceUUID,result[x].uuid,async(error:BleError|null, characteristic: Characteristic | null)=>{
        //                 console.log(characteristic);
        //                 console.log(error);
        //                 if (error || !characteristic) {
        //                     console.log(error);
        //                     return
        //                 }

        //                 if (characteristic) {
        //                     var raw: any = characteristic.value;
        //                     var decodeVal = base64.decode(raw);
        //                     console.log(`${raw}:  ${decodeVal}`);
        //                 }
        //             })
        //         }
        //     }
        // });

        // services.forEach(async (service:any) => {
        //     console.log(service);
        //     const characteristics = await device.characteristicsForService(service.uuid)
        //     .then((result:any)=>{
        //         console.log(result);
        //         for(var x =0 ; x<result.length; x++){
        //             if(result[x].isNotifiable === true){
        //                 device.monitorCharacteristicForService(result[x].serviceUUID,result[x].uuid,async(error:BleError|null, characteristic: Characteristic | null)=>{
        //                     console.log(characteristic);
        //                     console.log(error);
        //                     if (error || !characteristic) {
        //                         console.log(error);
        //                         return
        //                     }

        //                     if (characteristic) {
        //                         var raw: any = characteristic.value;
        //                         var decodeVal = base64.decode(raw);
        //                         console.log(`${raw}:  ${decodeVal}`);
        //                     }
        //                 })
        //             }
        //         }
        //     });
        //     //characteristics.forEach(console.log);
        // });

        // device.services().then((service:any)=>{
        //     for ( var x = 0; x < service.length; x++){
        //         device.characteristicsForService(service[x].uuid).then((result: any)=>{
        //             for(var x = 0; x<result.length; x++){
        //                 if(result[x].isNotifiable === true){
        //                     device.monitorCharacteristicForService(result[x].serviceUUID, result[x].uuid, async (error:BleError | null, characteristic: Characteristic| null)=>{
        //                         // error handling
        //                         if (error || !characteristic) {
        //                             console.log(error);
        //                             return
        //                         }

        //                         if (characteristic) {
        //                             var raw: any = characteristic.value;
        //                             var decodeVal = base64.decode(raw);
        //                             console.log(`${raw}:  ${decodeVal}`);
        //                         }
        //                     })
        //                 }
        //             }
        //         })
        //     }    
        // });
        
        //const services = device.services();
        // services.forEach(async (service:any) => {
        //     console.log(service);
        //     const characteristics = await device.characteristicsForService(service.uuid);
        //     characteristics.forEach(console.log);
        // });
        
        // const characteristics = await services[1].characteristics();
        // console.log("Characteristics:",characteristics);
        // characteristics[0].monitor((err: any, update: any) => {
        //     console.log(err);
        //     console.log(update);
        //     if (err) {
        //         console.log(`characteristic error: ${err}`);
        //         console.log(JSON.stringify(err));
        //     } else {
        //         console.log("Is Characteristics Readable:",update.isReadable);
        //         console.log("Heart Rate Data:",base64.decode(update.value));
        //         async () => {
        //             const readCharacteristic = await device.readCharacteristicForService(serviceUUID, characteristicsUUID);
        //             await console.log(readCharacteristic);
        //         }
        //         // assuming the device is already connected
        //         // var data = base64.decode(update.value);

        //         const heartRateData = Buffer.from(update.value, 'base64').readUInt16LE(0);
        //         console.log("Heart Beats:",heartRateData);
        //     }
        // });
    }

    const writeMesage = async (code:any, message:any) => {
        _BleManager.cancelTransaction(transactionId)
        var newDevice : any = device;
        const senddata = base64.encode(message);
        if(newDevice)
        {
            newDevice.writeCharacteristicWithResponseForService(serviceUUID, characteristicsUUID, senddata).then((characteristic: any) => {
                
                console.log("write response");
                console.log(characteristic);
                Alert.alert(message,"success")
                
                //Sent message and start receiving data
                console.log("device")
                console.log(serviceUUID,"device",characteristicsUUID)
                console.log(newDevice)
                let snifferService = null
                var SERVICE_SNIFFER_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
                var SNIFFER_VOLTAGE_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
                
                newDevice.services().then((services: any[]) => {
                    let voltageCharacteristic = null
                    snifferService = services.filter(service => service.uuid === serviceUUID)[0]
                    snifferService.characteristics().then((characteristics: any[]) => {
                        console.log("characteristics characteristics")
                        console.log(characteristics)
                        setNotificationReceiving(true);
                        // voltageCharacteristic is retrieved correctly and data is also seems correct
                        voltageCharacteristic = characteristics.filter(c => c.uuid === characteristics[0].uuid)[0]
                        voltageCharacteristic.monitor((error:any, c:any) => {
                            // RECEIVED THE ERROR HERE (voltageCharacteristic.notifiable === true)
                            if(error){
                                console.log("error in monitering",error)  
                                return;
                            }
                            else{
                                // console.log("c",base64.decode(c.value))  
                                const data1 = base64.decode(c.value);
                                var s = data1.split(" ");
                                var s1 = parseInt(s[1]);
                                if(isNaN(s1)) {count++;}
                                else{
                                    if(count == 1){
                                        setMakedata([...makedata,<Text key={moment().valueOf()}>{s[0]} : {s1/1000} {"\n"} </Text>]);
                                        setDateTime("Data Received at : "+moment().format("MMMM Do, h:mm:ss a"));
                                    }
                                    if(count == 3){count = 0; setMakedata([])}
                                }
                            }
                        },transactionId)
                    }).catch((error: any) => console.log(error))
                })
                return 
            }).catch((error:any) => {
                Alert.alert("error in writing"+JSON.stringify(error))
            })
        }
        else{
            Alert.alert("No device is connected")
        }
    }

    const scanAndConnect = async () =>{
        setText1("Scanning...");
        _BleManager.startDeviceScan(null, null, (error, device:any) => {
            console.log("Scanning... start Device Scanning...");
            console.log(device);
            if (null) {
                console.log('null')
            }
            if (error) {
                Alert.alert("Error in scan=> "+error)
                console.log(error);
                setText1("");
                _BleManager.stopDeviceScan();
                return
            }
            if( /[HMSoft]/g.test( device.name ) ) 
            {
                if(device.name == 'HMSoft'){ //T3X1 //TAPP
                    const serviceUUIDs= device.serviceUUIDs[0]
                    setText1(`Connecting to ${device.name}`);
                    _BleManager.stopDeviceScan();
                    //listener for disconnection
                   /* this.manager.onDeviceDisconnected(device.id, (error, device) => {
                        console.log(error);
                        console.log("errordddd",device);
                        // if(this.props.device.isConnected) {
                        //     this.scanAndConnect()
                        // }
                        
                    });*/
                    _BleManager.connectToDevice(device.id, {autoConnect:true}).then((device) => {
                        (async () => {
                            const services = await device.discoverAllServicesAndCharacteristics()
                            const characteristic:any = await getServicesAndCharacteristics(services)
                            console.log("characteristic")
                            console.log(characteristic)
                            console.log("Discovering services and characteristics",characteristic.uuid);
                            setDeviceid(device.id);
                            setServiceUUID(serviceUUIDs);
                            setCharacteristicsUUID(characteristic.uuid);
                            setDevice(device);
                            setText1(`Connected to ${device.name}`);
                        })();
                        setDevice(device);
                        console.log(device);
                        return device.discoverAllServicesAndCharacteristics()
                    }).then((device) => {
                        // return this.setupNotifications(device)
                    }).then(() => {
                        console.log("Listening...")
                    }, (error) => {
                        Alert.alert("Connection error"+JSON.stringify(error))
                    })
                }
            }
       });
    }

  return (
    <SafeAreaView style={styles.container}>
        <View style={{flex : 10}}>
            <Text style={styles.positionNameStyle}> {positionName}</Text>
            <Text style={styles.appName}>MuscleDetailScreen </Text>
            <View>
                {deviceid ? 
                    (
                        <TouchableOpacity onPress={()=>disconnect()}>
                            <Text>Disconnect</Text>
                        </TouchableOpacity>
                        
                    ) : (
                        <TouchableOpacity  onPress={()=>scanAndConnect()}>
                            <Text>Scan for a device</Text>
                        </TouchableOpacity>
                    )
                }
                {
                    deviceid ? 
                    (
                        <TouchableOpacity onPress={()=>readData(device)}>
                            <Text>Read Data</Text>
                        </TouchableOpacity>
                    )
                    : (
                        null
                    )
                }
            </View>
            <View style={{alignItems:'center',marginVertical : 10}}>
                <Text>{text1}</Text>
                <Text>{dateTime}{'\n'}{makedata}</Text>
            </View>
            {notificationReceiving==true ? (
                <TouchableOpacity  onPress={()=>stopNotication()}>
                    <Text>Stop Notification</Text>
                </TouchableOpacity>
            ) : null}

            <TouchableOpacity  onPress={()=>writeMesage("ACK","ACK Writted")}>
                <Text>ACK</Text>
            </TouchableOpacity>
            <TouchableOpacity  onPress={()=>writeMesage("ris 0","ris 0 Writted")}>
                <Text>RIS 0</Text>
            </TouchableOpacity>
            <TouchableOpacity  onPress={()=>writeMesage("ris 1","ris 1 Writted")}>
                <Text>RIS 1</Text>
            </TouchableOpacity>
        </View>
        <View style={{flex : 1, flexWrap:'wrap', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignContent:'center'}}>
            <TouchableOpacity onPress={()=>{}} style={styles.touchableOpacityButton}>
                <Text style={styles.textStyle}>테스트 시작</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.touchableOpacityButton}>
                <Text style={styles.textStyle}>종료</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
    },
    positionNameStyle:{
        margin: 15,
    },
    appName : {
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize : 30
    },
    touchableOpacityButton:{
        backgroundColor: '#68a0cf',
        borderRadius: 10,
        borderWidth: 1,
        width: 100,
        height : 100,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent:'center',
        textAlign: 'center',
        flex : 1
    },
    textStyle:{
        textAlign:'center',
        fontWeight : 'bold'
    }
});

export default MuscleDetailScreen