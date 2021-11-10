import React, { useState, useEffect } from 'react';
import { Text, View, 
  FlatList, TouchableOpacity, StyleSheet, Button } 
  from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { getDataModel } from './DataModel';

export function PeopleScreen ({navigation, route}) {

  const dataModel = getDataModel();
  const initUsers = dataModel.getUsers();
  const [users, setUsers] = useState(initUsers);

  const { currentUserId } = route.params;
  const currentUser = dataModel.getUserForID(currentUserId);

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
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, {fontSize: 32}]}>
            Hi, {currentUser.displayName}! 
          </Text>
          <Icon 
            name='log-out'
            color='black'
            size={24}
            onPress={()=>{
              navigation.navigate('Login');
            }}
          />
        </View>
        <View style={[styles.headerRow, {justifyContent: 'flex-start'}]}>
          <Text style={styles.headerText}>
            Who would you like to chat with?
          </Text>
        </View>
      </View>

      <View style={styles.userListContainer}>
        <FlatList
          data={users}
          renderItem={({item}) => {
            if (item.key === currentUser.key) {
              return <View/>
            } else {
              return (
                <TouchableOpacity
                  style={styles.userListItem}
                  onPress={()=>{
                    navigation.navigate('Chat', {
                      currentUserId: currentUser.key,
                      otherUserId: item.key
                    });
                  }}
                >
                  <Text style={styles.userListItemText}>{item.displayName}</Text>
                </TouchableOpacity>
              );
            }
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

  header: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: '5%'
  },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: '5%'
  },
  headerText: {
    fontSize: 18,
    //padding: '3%'
  },

  userListContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%'
  },
  userListItem: {
    flex: 1,
    width: '100%',
    padding: '5%'
  },
  userListItemText: {
    fontSize: 18
  },  

});

