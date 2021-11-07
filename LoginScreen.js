import React, { useEffect, useState } from 'react';
import { TextInput, Text, View, 
  FlatList, TouchableOpacity, StyleSheet } 
  from 'react-native';
import { getDataModel } from './DataModel';

export function LoginScreen ({navigation, route}) {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const dataModel = getDataModel();
    const listenerId = dataModel.addUserListener(() => {
      let newUsers = Array.from(dataModel.getUsers());
      setUsers(newUsers);
    });
    return(() => {
      dataModel.removeUserListener(listenerId);
    });
  }, []);

  return (
    <View style={styles.body}>
      
      <View style={styles.header}>
        <Text style={styles.mediumText}>Who are you?</Text>
      </View>

      <View style={styles.userListContainer}>
        <FlatList
          data={users}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                style={styles.userListItem}
                onPress={()=>{
                  navigation.navigate('People', {currentUserId: item.key})
                }}
              >
                <Text style={styles.mediumText}>{item.displayName}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: '15%',
    paddingHorizontal: '2%'
  },
  mediumText: {
    fontSize: 18
  },
  header: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  userListContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%'
  },
  userListItem: {
    flex: 1,
    width: '100%',
    padding: '5%'
  },
});

