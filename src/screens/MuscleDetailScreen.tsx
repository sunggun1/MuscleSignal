import { View, Text, StyleSheet,Button, TouchableOpacity ,Alert,Platform,PermissionsAndroid, FlatList } from 'react-native'
import React, { FC, SetStateAction, useLayoutEffect, useState,useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native';
import {RootRouteProps} from '../../App';
import { useNavigation } from '@react-navigation/native';
import { createMuscleTable, Muscle, muscleProp,db, muscleTableName,muscleActions,muscleSelector,musclePowerSelector } from '../redux/slices/muscleSlice';
import { useAppDispatch } from '../hook/hook';
import {BleManager} from 'react-native-ble-plx'
import base64 from 'react-native-base64';
import { Buffer } from "buffer";
import { XAxis,YAxis} from 'react-native-svg-charts';
import { useSelector } from 'react-redux';
import { Circle, Rect } from 'react-native-svg';
import LineChart from '../components/LineChart';


const transactionId ="moniter";
const _BleManager = new BleManager();
let count = 0;


const MuscleDetailScreen: FC = () => {
    const route = useRoute<RootRouteProps<'MuscleDetail'>>();
    const {positionName,musclePositionId} = route.params;
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    
    const [deviceid,setDeviceid] = useState('');
    const [serviceUUID,setServiceUUID] = useState('');
    const [characteristicsUUID,setCharacteristicsUUID] = useState('');
    const [text1,setText1] = useState('');
    const [makedata,setMakedata] = useState<any[]>([]);
    const [notificationReceiving,setNotificationReceiving] = useState(false);
    const [device, setDevice] = useState<any>(null);
    const [phasor, setPhasor] = useState([]);

    const muscle = useSelector(muscleSelector);
    const musclePowerList = useSelector(musclePowerSelector);

    useEffect(()=>{
        console.log(musclePowerList);
        if(musclePowerList.length > 0 ){
            var musclePower = musclePowerList.map(function(item) {
                return parseInt(item, 10);
            });
            console.log(musclePowerList.length);
            if(musclePowerList.length == 128){
                var fft = require('fft-js').fft;
                var phasors = fft(musclePower);
                console.log(phasors);
                setPhasor(phasors);
            }
        }
    },[muscle]);

    const getAllMuscleList = (returnMessage: string | null) => {
        try{
            var tempResult : muscleProp[] = [];
            var tempMessage : string = '';
            db.transaction((tx) => {
                tx.executeSql(
                  `SELECT * FROM ${muscleTableName} where musclePositionId = ${musclePositionId}`,
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
                    console.log(error);
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
                tx.executeSql(
                    `SELECT * FROM ${muscleTableName} where musclePositionId = ${musclePositionId}`,
                    [],
                    (tx, results) => {
                      console.log('select muscle' + results.rows.length);
                      if (results.rows.length < 128){
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
                                console.log(error);
                                tempMessage = error;
                                getAllMuscleList(tempMessage);
                            });
                      }
                    }
                )
                
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
        const a = async() => {
            await createMuscleTable();
            await getAllMuscleList(null);
        }
        a();
        const _BleManager = new BleManager();
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
                console.log("service : ",services)
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
        console.log('read data device Service: ' +services);
    
        services.forEach(async (service:any) => {
            const characteristics = await device.characteristicsForService(service.uuid);
            characteristics.forEach((result:any)=>{
                if(result.isNotifiable === true){
                    console.log("characteristic foreach start")
                    console.log(result);
                    result.monitor((err: any, update: any) => {
                        if (err) {
                            console.log(`characteristic error: ${err}`);
                            console.log(JSON.stringify(err));
                        } else {
                            console.log("Is Characteristics Readable:",update.isReadable);
                            console.log("Heart Rate Data:",base64.decode(update.value));
                            // assuming the device is already connected
                            var data = parseInt(base64.decode(update.value));
                            console.log(typeof data);
                            if(data != null && typeof data == "number" ){
                                createMuscle(musclePositionId,data)
                            }
                            // const heartRateData = Buffer.from(update.value, 'base64').readUInt16LE(0);
                            // console.log("Heart Beats:",heartRateData);
                        }
                    });
                }
            });
        });
    }

    const scanAndConnect = async () =>{
        setText1("Scanning...");
        _BleManager.startDeviceScan(null, null, (error, device:any) => {
            console.log("Scanning... start Device Scanning...");
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
                            setDeviceid(device.id);
                            setServiceUUID(serviceUUIDs);
                            setCharacteristicsUUID(characteristic.uuid);
                            setDevice(device);
                            setText1(`Connected to ${device.name}`);
                        })();
                        setDevice(device);
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

                {musclePowerList.length > 0 ? 
                    <View style={{
                        height: 300,
                        padding: 20,
                        flexDirection: "row"
                    }}>
                        <View style={{flex: 1}}>
                            <LineChart
                                data={musclePowerList}
                                containerStyle={{ width: "100%", height: 250 }}
                            />
                        </View>
                    </View>
                : 
                    null
                }
            </View>
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