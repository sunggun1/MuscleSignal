import { View, Text, SafeAreaView, StyleSheet,TouchableOpacity, Button, ScrollView,Dimensions,Alert} from 'react-native'
import React,{useEffect, useState} from 'react'
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import Spacer from '../components/Spacer';
import { createMusclePositionTable,MusclePosition,musclePositionProp ,musclePositionTableName,db, musclePositionActions} from '../redux/slices/musclePositionSlice';
import { useAppDispatch } from '../hook/hook';
import { RootState } from '../redux/store/store';
import { useNavigation } from '@react-navigation/native';
import { muscleTableName } from '../redux/slices/muscleSlice';

var screenWidth = Dimensions.get('window').width/3;

const MusclePositionScreen = () => {
    const [positionName, setPositionName] = useState(''); 
    const dispatch = useAppDispatch();
    const musclePositionList = useSelector((state:RootState)=> state.musclePos.musclePosition);
    const result = useSelector((state:RootState)=> state.musclePos.result);
    const navigation = useNavigation<any>();

    const getAllMusclePositionList = (returnMessage: string | null) => {
        try{
            var tempResult : musclePositionProp[] = [];
            var tempMessage : string = '';
            db.transaction((tx) => {
                tx.executeSql(
                  `SELECT * FROM ${musclePositionTableName}`,
                  [],
                  (tx, results) => {
                    var temp: musclePositionProp[] = [];
                    console.log('select musclePosition ' + results.rows.length);
                    for (let i = 0; i < results.rows.length; i++){
                        temp.push(results.rows.item(i));
                    }
                    tempResult = temp;
                    tempMessage = 'success';
                    const data: MusclePosition = {musclePosition : tempResult, result : returnMessage? returnMessage : tempMessage} as MusclePosition;
                    dispatch(musclePositionActions.getAllMusclePosition(data));
                  }
                ,(error: any)=>{
                    console.log('error');
                    tempResult = [];
                    tempMessage = error;
                    const data: MusclePosition = {musclePosition : tempResult, result : tempMessage} as MusclePosition;
                    dispatch(musclePositionActions.getAllMusclePosition(data));
                });
            });
            
        }catch(error:any){
            const data: any = {musclePosition : [], result: error} as MusclePosition;
            dispatch(musclePositionActions.getAllMusclePosition(data));
        }
    }

    const createMusclePosition = (positionName: string)=>{
        try{
            var tempMessage:string = '';
            db.transaction((tx) =>{
                tx.executeSql(`SELECT * FROM ${musclePositionTableName} where positionName=(?)`,[positionName],
                (tx,results)=>{
                    if(results.rows.length > 0){
                        getAllMusclePositionList('Data Already exists');
                    }else{
                        tx.executeSql(`INSERT INTO ${musclePositionTableName} (positionName) VALUES (?)`,[positionName],
                        (tx,results)=>{
                            console.log('Results', results.rowsAffected);
                            if (results.rowsAffected > 0) {
                                console.log('Data Inserted Successfully....');
                                tempMessage = 'Data Inserted Success';
                                getAllMusclePositionList(tempMessage);
                            } else {
                                console.log('Data Inserted Failed....');
                                tempMessage = 'Data Inserted Failed';
                                getAllMusclePositionList(tempMessage);
                            }
                            setPositionName('');
                        },(error: any) => {
                            tempMessage = error;
                            getAllMusclePositionList(tempMessage);
                            setPositionName('');
                        })
                    }
                });
            })    
        }catch(error:any){
            getAllMusclePositionList(error);
        }
    };
    
    const deleteMusclePosition = (id: number) =>{
        try{
            var tempMessage:string = '';
            db.transaction((tx) =>{
                tx.executeSql(`DELETE from ${muscleTableName} where musclePositionId = ${id}`,[],(tx2,result2)=>{
                    if(result2.rowsAffected > 0){
                        console.log('DELETE all muscle data');
                    }
                },(error:any)=>{
                    console.log(error);
                })
                tx.executeSql(`DELETE from ${musclePositionTableName} where id = ${id}`,[],
                (tx,results)=>{
                    console.log('Results', results.rowsAffected);
                    if (results.rowsAffected > 0) {
                        console.log('Data deleted Successfully....');
                        tempMessage = 'Data deleted success';
                        getAllMusclePositionList(tempMessage);
                    } else {
                        console.log('Data deleted Failed....');
                        tempMessage = 'Data deleted success';
                        getAllMusclePositionList(tempMessage);
                    }
                },(error: any) => {
                    tempMessage = error;
                })
            })
        }catch(error:any){
            getAllMusclePositionList(error);
        } 
    };

    useEffect(()=>{
        createMusclePositionTable();
        getAllMusclePositionList(null);
    },[]);

    useEffect(()=>{
        console.log(musclePositionList);
    },[musclePositionList]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={{flex: 1}}>
                <Spacer>
                    <Text style={styles.appName}>MusclePositionScreen</Text>
                    <TouchableOpacity onPress={()=>navigation.navigate('Login')}>
                        <Text style={{ textAlign: 'right' }}>Go To Login Page</Text>
                    </TouchableOpacity>
                </Spacer>
            </View>
            <ScrollView style={styles.scrollViewStyle} showsHorizontalScrollIndicator={false} horizontal={true}>
                <View style={styles.viewInScrollView}>
                    <TextInput style={styles.textInputStyle} value={positionName} onChangeText={setPositionName} autoCapitalize="none" autoCorrect={false} placeholder="근육 위치"/>
                </View>
                <View style={styles.viewInScrollView}>
                    <Button color="black" title='근육 위치 추가' onPress={()=>{
                            createMusclePosition(positionName);
                        }
                    }/>
                </View>
                
            </ScrollView>
            <View style={{flex: 5}}>
                {result != 'success' ? <Text>{result}</Text> : null}
                {musclePositionList.length > 0 && 
                <FlatList
                    style={styles.flatListStyle}
                    data={musclePositionList} 
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_item,index) => index.toString()}
                    renderItem={({item})=>{
                        return (
                            <ScrollView horizontal={true} contentContainerStyle={styles.scrollViewContentContainerStyle}>
                                <View style={styles.ScrollContainer}>
                                    <View style = {{flex : 3 }}>
                                        <TouchableOpacity onPress={()=>{navigation.navigate('MuscleDetail',{positionName : item.positionName, musclePositionId : item.id});}} style={styles.touchableOpacityStyle}>
                                            <Text style={{ fontSize: 20 , color: 'black'}}>
                                                {item.positionName}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style = {{flex :1 , borderWidth : 1}}>
                                        <Button title="버튼 삭제" color='red' onPress={()=>{
                                            deleteMusclePosition(item.id);
                                        }}/>
                                    </View>
                                </View>
                            </ScrollView>
                        );
                    }}
                    extraData={musclePositionList}
                />}
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container : {
        flex : 1,
        marginTop: 100,
    },
    appName : {
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize : 30
    },
    scrollViewStyle:{
        flexGrow: 1,
        flex: 1
    },
    scrollViewContentContainerStyle:{
        flexGrow:1, width:'100%'
    },
    viewInScrollView:{
        flexGrow : 1,
        width: 200,
        height : 50,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        textAlign: 'center',
        borderWidth : 1,
        borderColor : 'black'
    },
    textInputStyle:{
        alignItems: 'stretch',
        borderWidth : 1,
        borderColor : 'black',
        flex : 1,
        paddingHorizontal: 0,
        width : '100%',
        fontSize: 20
    },
    buttonStyle:{
        backgroundColor:'black',
        alignSelf: 'flex-start' 
    },
    flatListStyle:{
        flex : 1,
    },
    ScrollContainer: {
        justifyContent: 'space-between',
        backgroundColor: '#cdf1ec',
        flexGrow: 1,
        marginTop: 0,
        width: screenWidth,
        flexDirection: 'row',
        alignItems : 'center'
    },
    textStyle: {
        textAlign: 'left',
    },
    touchableOpacityStyle:{
        borderRadius : 15 , 
        borderWidth : 1, 
        borderColor : 'black' , 
        flexGrow : 1, 
        justifyContent: 'center'
    }
});


export default MusclePositionScreen;