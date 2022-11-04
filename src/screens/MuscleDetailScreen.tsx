import { View, Text, StyleSheet, TouchableOpacity ,Alert,Platform,PermissionsAndroid } from 'react-native'
import React, { FC, useLayoutEffect, useState,useEffect,useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native';
import {RootRouteProps} from '../../App';
import { useNavigation } from '@react-navigation/native';
import { createMuscleTable, Muscle, muscleProp, muscleTableName,muscleActions,muscleSelector,musclePowerSelector, muscleTimeSelector } from '../redux/slices/muscleSlice';
import { useAppDispatch } from '../hook/hook';
import {BleManager} from 'react-native-ble-plx'
import base64 from 'react-native-base64';
import { useSelector } from 'react-redux';
import LineChartMade from '../components/LineChart';
import {LineChart, YAxis,XAxis} from 'react-native-svg-charts';
import { PricingButton } from 'react-native-elements/dist/pricing/PricingCard';
import { ScrollView } from 'react-native-gesture-handler';
import {fftSelector,fftActions, fftInterface, fftProp, createFftTable,fftTableName,createFft, deleteFftByPosition,dropFftTable,fftFrequencySelector,fftMagnitudeSelector, fftMagnitudePowerSelector,fftMagnitudeLessThanAThousandSelector } from '../redux/slices/fftSlice';
import { db } from '../redux/slices/databaseSlice';
import { insertMuscleApi } from '../api/muscleApi';
import { insertMusclePositionApi } from '../api/musclePositionApi';
const transactionId ="moniter";

const MuscleDetailScreen: FC = () => {
    const route = useRoute<RootRouteProps<'MuscleDetail'>>();
    const _BleManager = useRef((null as unknown) as BleManager);
    const {positionName,musclePositionId} = route.params;
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    
    const [deviceid,setDeviceid] = useState('');
    const [serviceUUID,setServiceUUID] = useState('');
    const [characteristicsUUID,setCharacteristicsUUID] = useState('');
    const [characteristicArray, setCharacteristicArrays] = useState<any>([]);
    const [text1,setText1] = useState('');
    const [device, setDevice] = useState<any>(null);
    const [musclePowers,setMusclePower] = useState<any>([]);
    const [startTime,setStartTime] = useState<any>(null);
    const [endTime,setEndTime] = useState<any>(null);

    const muscle = useSelector(muscleSelector);
    const musclePowerList = useSelector(musclePowerSelector);
    const muscelTimePowerList = useSelector(muscleTimeSelector);

    const fftList = useSelector(fftSelector);
    const fftFrequnecy:any = useSelector(fftFrequencySelector);
    const fftMagnitude:any = useSelector(fftMagnitudeSelector);
    const fftMagnitudePower:any = useSelector(fftMagnitudePowerSelector);
    const fftMagnitudeLessThanAThousand:any = useSelector(fftMagnitudeLessThanAThousandSelector);

    useEffect(()=>{
        // console.log(fftMagnitudePower);
        // console.log(fftMagnitudeLessThanAThousand);
        // var fft = require('fft-js').fft,
        // fftUtil = require('fft-js').util,

        // signal = [1,0.5,0,0.5,1,0,1,0];

        // var phasors = fft(signal);

        // console.log(phasors);
        
        // var frequencies = fftUtil.fftFreq(phasors, 4), // Sample rate and coef is just used for length, and frequency step
        // magnitudes = fftUtil.fftMag(phasors);

        // console.log(frequencies);
        // var both = frequencies.map(function (f:any, ix:any) {
        //     return {frequency: f, magnitude: magnitudes[ix]};
        // });
        // console.log(both);
    },[]);

   

    useEffect(()=>{
        const init = async() => {
            await createMuscleTable();
            await getAllMuscleList(null);
            await createFftTable();
            await getAllFftList(null);
        }
        init();
        
        _BleManager.current = new BleManager();
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

    useEffect(()=>{
        // console.log(muscle.position);
        if(musclePowerList.length > 0 ){
            if(musclePowerList.length == 512){
                var fft = require('fft-js').fft;
                var fftUtil = require('fft-js').util;
                
                const divide = 16
                if (fftList.array.length == 0){
                    for(var i = 0; i < musclePowerList.length / divide; i++){
                        var temp = musclePowerList.slice(divide*i, divide*(i+1))
                        // console.log(temp);
                        var phasors = fft(temp);
                        var frequencies = fftUtil.fftFreq(phasors, 16), // Sample rate and coef is just used for length, and frequency step
                        magnitudes = fftUtil.fftMag(phasors);
                        
                        // console.log(frequencies);
                        var both = frequencies.map(function (f:any, ix:any) {
                            return {frequency: f, magnitude: magnitudes[ix]};
                        });
                        const removefirst = both.shift();

                        var freq = both.map(function(element:any) {
                            return element['frequency'];
                        });

                        var mag = both.map(function(element:any) {
                            return element['magnitude'];
                        });
                        
                        freq.map((item:any,index:any)=>{
                            createFft(musclePositionId, item, i,index, 1);
                        });

                        mag.map((item:any,index:any)=>{
                            createFft(musclePositionId, item, i,index, 0);
                        });
                    }
                }   
                getAllFftList(null);
            }
        }
    },[fftList.result]);

    // 종료 시 발동, 뒤로가기 누르거나, 리로드 하면 발동
    useEffect(() => {
        return () => {
            console.log('BleManager destroy');
            _BleManager.current.destroy();
         };
    }, []);

    

    const getAllMuscleList = (returnMessage: string | null) => {
        try{
            var tempResult : muscleProp[] = [];
            var tempMessage : string = '';
            db.transaction((tx) => {
                tx.executeSql(
                  `SELECT strftime("%Y-%m-%d %H:%M:%f", created) as created,musclePositionId,power,id FROM ${muscleTableName} where musclePositionId = ${musclePositionId}`,
                  [],
                  (tx, results) => {
                    var temp: muscleProp[] = [];
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

    const getAllFftList = (returnMessage: string | null) => {
        try{
            var tempResult : fftProp[] = [];
            var tempMessage : string = '';
            db.transaction((tx) => {
                tx.executeSql(
                  `SELECT strftime("%Y-%m-%d %H:%M:%f", created) as created,id,musclePositionId,power,arrIndex,arrInsideIndex,isFrequency FROM ${fftTableName} where musclePositionId = ${musclePositionId}`,
                  [],
                  (tx, results) => {
                    console.log('getAllFftList success');
                    tempMessage = 'success';
                    if(results.rows.length > 0 ){
                        var temp: fftProp[] = [];
                        for (let i = 0; i < results.rows.length; i++){
                            temp.push(results.rows.item(i));
                        }
                        tempResult = temp;
                        const data: fftInterface = {array : tempResult, result : returnMessage? returnMessage : tempMessage} as fftInterface;
                        dispatch(fftActions.getfft(data));
                    }else{
                        const data: fftInterface = {array : tempResult, result : returnMessage? returnMessage : tempMessage} as fftInterface;
                        dispatch(fftActions.getfft(data));    
                    }
                  }
                ,(error: any)=>{
                    console.log('getAllFftList error')
                    console.log(error);
                    tempResult = [];
                    tempMessage = error;
                    const data: fftInterface = {array : tempResult, result : tempMessage} as fftInterface;
                    dispatch(fftActions.getfft(data));
                });
            });
        }catch(error:any){
            const data: fftInterface = {array : [], result : error} as fftInterface;
            dispatch(fftActions.getfft(data));
        }
    }

    const createMuscle = (musclePositionId: number,power:number)=>{
        try{
            var tempMessage:string = '';
            db.transaction((tx) =>{
                tx.executeSql(
                    `SELECT * FROM ${muscleTableName} where musclePositionId = ${musclePositionId}`,
                    [],
                    (tx, results) => {
                      if (results.rows.length < 512){
                        tx.executeSql(`INSERT INTO ${muscleTableName} (musclePositionId,power) VALUES (?,?)`,[musclePositionId,power],
                            (tx,results)=>{
                                if (results.rowsAffected > 0) {
                                    tempMessage = 'Data Inserted Success';
                                    // getAllMuscleList(tempMessage);
                                } else {
                                    console.log('Data Inserted Failed....');
                                    tempMessage = 'Data Inserted Failed';
                                    // getAllMuscleList(tempMessage);
                                }
                            },(error: any) => {
                                console.log(error);
                                tempMessage = error;
                                // getAllMuscleList(tempMessage);
                            });
                      }else{
                        getAllMuscleList(null)
                        disconnect();
                        getAllFftList(null);
                        insertMuscleApi(muscle.position,positionName);
                      }
                    }
                )  
            })    
        }catch(error:any){
            getAllMuscleList(error);
        }
    };
    
    const deleteMuscleByPosition = (musclePositionId: number) =>{
        try{
            var tempMessage:string = '';
            db.transaction((tx) =>{
                tx.executeSql(`DELETE from ${muscleTableName} where musclePositionId = ${musclePositionId}`,[],
                (tx,results)=>{
                    if (results.rowsAffected > 0) {
                        tempMessage = 'Data deleted success';
                        getAllMuscleList(tempMessage);
                        deleteFftByPosition(musclePositionId);
                        getAllFftList(null);
                    } else {
                        console.log('Data deleted Failed....');
                        tempMessage = 'Data deleted success';
                        getAllMuscleList(tempMessage);
                    }
                },(error: any) => {
                    tempMessage = error;
                    getAllMuscleList(error);
                })
            })
        }catch(error:any){
            getAllMuscleList(error);
        } 
    };

    const getNotifyServicesAndCharacteristics = (device:any) => {
        return new Promise((resolve, reject) => {
            device.services().then((services: { characteristics: () => Promise<any>; }[]) => {
                const characteristics: any[] = []
                console.log("service : ",services)
                services.forEach((service: { characteristics: () => Promise<any>; }, i: number) => {
                    service.characteristics().then(c => {
                      console.log("service.notifiable.characteristics")
                      
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
                                (characteristic: { isNotifiable: any; }) =>
                                    characteristic.isNotifiable
                            )
                            if (!dialog) {
                                reject('No notifiable characteristic')
                              }
                            resolve(dialog)
                        }
                      
                    })
                })
            })
        })
    }

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


    const disconnect = () =>{
        return new Promise((resolve, reject) => {
            _BleManager.current.cancelDeviceConnection(deviceid).
            then(rest=>{
                console.log(rest);
                setDeviceid('');
                setServiceUUID('');
                setCharacteristicsUUID('');
                setText1('');
                setCharacteristicArrays([]);
            })
            .catch((err)=>console.log("error on cancel connection",err))
       })
    }

    const readData = async(device:any) => {
        setText1('saving Datas...');
        if(characteristicArray.isNotifiable === true){
            characteristicArray.monitor((err: any, update: any) => {
                if (err) {
                    console.log(`characteristic error: ${err}`);
                    console.log(JSON.stringify(err));
                } else {
                    // console.log(update.value);
                    var data = parseInt(base64.decode(update.value));
                    console.log(data);
                    if(data != null && typeof data == "number"){
                        createMuscle(musclePositionId,data);
                    }
                }
            });
        }
    }


    const scanAndConnect = async () =>{
        setText1("Scanning...");
        _BleManager.current.startDeviceScan(null, null, (error, device:any) => {
            console.log("Scanning... start Device Scanning...");
            if (null) {
                console.log('null')
            }
            if (error) {
                Alert.alert("Error in scan=> "+error)
                console.log(error);
                setText1("");
                _BleManager.current.stopDeviceScan();
                return
            }
            console.log(device.name)
            if( /[HC]/g.test( device.name ) ) 
            {
                if(device.name == 'HC-06'){
                    const serviceUUIDs= device.serviceUUIDs[0]
                    setText1(`Connecting to ${device.name}`);
                    _BleManager.current.stopDeviceScan();
                    _BleManager.current.connectToDevice(device.id, {autoConnect:true,requestMTU:50}).then((device) => {
                        (async () => {
                            const services = await device.discoverAllServicesAndCharacteristics()
                            console.log(services);
                            const characteristic:any = await getServicesAndCharacteristics(services)
                            const notifiableCharacteristic:any = await getNotifyServicesAndCharacteristics(device)
                            setDeviceid(device.id);
                            setServiceUUID(serviceUUIDs);
                            setCharacteristicsUUID(characteristic.uuid);
                            setDevice(device);
                            setCharacteristicArrays(notifiableCharacteristic);
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
                        console.log(error);
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
                            <Text>테스트 종료하기</Text>
                        </TouchableOpacity>
                        
                    ) : (
                        null
                    )
                }
                {deviceid ? 
                    (
                        <TouchableOpacity onPress={()=>readData(device)} style={{marginTop: 50}}>
                            <Text>데이터 읽기</Text>
                        </TouchableOpacity>
                    )
                    : (
                        null
                    )
                }
                <TouchableOpacity onPress={()=>deleteMuscleByPosition(musclePositionId)} style={
                {
                    position:'absolute',
                    borderColor: '#000000',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderRadius: 5,
                    alignSelf: 'flex-end', 
                }}>
                    <Text>근육 데이터 삭제</Text>
                </TouchableOpacity> 
                <TouchableOpacity onPress={()=>{deleteFftByPosition(musclePositionId); getAllFftList(null);}} style={
                {
                    position:'absolute',
                    borderColor: '#000000',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderRadius: 5,
                    alignSelf: 'center', 
                }}>
                    <Text>fft 데이터 삭제</Text>
                </TouchableOpacity>
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
                            <LineChartMade
                                data={musclePowerList}
                                containerStyle={{ width: "100%", height: 250 }}
                            />
                        </View>
                    </View>
                :
                    null
                }
            </View>
            <View style={{padding: 10, flex: 1}}>
                <ScrollView style={{flex: 1}} key={null} >
                {
                    (fftFrequnecy != undefined && fftFrequnecy.length > 0) && (fftMagnitude != undefined && fftMagnitude.length > 0)
                    ? 
                        fftFrequnecy.length > 0 && musclePowerList.length == 512?
                            fftMagnitude && fftMagnitude.map((item:any,index:number)=>{
                                return(                        
                                <View style={{
                                    height: 300,
                                    padding: 30,
                                    flexDirection: "row"
                                }}>
                                    <View style={{flex: 1}}>
                                        <LineChartMade
                                            data={item}
                                            containerStyle={{ width: "95%", height: 250 }}
                                        />
                                        
                                        <XAxis
                                            data={ fftFrequnecy[index] }
                                            style={{ marginTop: 10 }}
                                            formatLabel={(value, index2) => fftFrequnecy[index2][value] }
                                            contentInset={{ left:40, right: 2 }}
                                            svg={{ fontSize: 10, fill: '#3A8F98' }}
                                            key = {index}
                                        />
                                    </View>
                                </View>
                                );
                            })
                            :
                            null
                    : null
                }
                </ScrollView>
            </View>
        </View>
        <View style={{flex : 1, flexWrap:'wrap', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignContent:'center'}}>
            <TouchableOpacity onPress={()=>scanAndConnect()} style={styles.touchableOpacityButton}>
                <Text style={styles.textStyle}>테스트 시작</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.touchableOpacityButton}>
                <Text style={styles.textStyle}>뒤로가기</Text>
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