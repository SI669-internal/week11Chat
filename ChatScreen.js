import React, { useEffect, useState } from 'react';
import { TextInput, Text, View, 
  FlatList, StyleSheet } 
  from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { getDataModel } from './DataModel';

export function ChatScreen ({navigation, route}) {

  const dataModel = getDataModel();
  const { currentUserId, otherUserId } = route.params;
  const currentUser = dataModel.getUserForID(currentUserId);
  const otherUser = dataModel.getUserForID(otherUserId);
  const chatId = dataModel.getChatIdForUserIds(currentUserId, otherUserId);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    function handleChatUpdate(newMessages) {
      setMessages(newMessages);
    }
    const listenerId = dataModel.addChatListener(chatId, handleChatUpdate);
    return (() => {
      dataModel.removeChatListener(listenerId);
    })
  }, []);

  return (
    <View style={styles.body}>
      
      <View style={styles.header}>
        <Icon
          name='arrow-left'
          size={32}
          onPress={()=>navigation.goBack()}
        />
        <Text style={styles.headerText}>
          {currentUser.displayName}, meet {otherUser.displayName}! 
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputBoxContainer}>
          <TextInput 
            style={styles.inputBox}
            placeholder='Type your message'
            value={messageInput}
            onChangeText={(text)=>setMessageInput(text)}
          />
        </View>
        <View style={styles.inputButtonContainer}>
          <Icon
            name='send'
            color='black'
            size={18}
            onPress={()=>{
              let messageContents = {
                text: messageInput,
                authorId: currentUserId,
                recipients: [otherUserId],
                timestamp: new Date()
              };
              dataModel.addChatMessage(chatId, messageContents);
              setMessageInput('');
            }}
          />
        </View>
      </View>

      <View style={styles.messageListContainer}>
        <FlatList
          data={messages}
          renderItem={({item}) => {
            return (
              <View style={[
                styles.messageContainer,
                item.authorId===currentUserId?{}:{alignItems: 'flex-end'}
              ]}>
                <Text style={styles.messageText}>
                  {item.authorId===currentUserId?'Me':item.author.displayName}: {item.text}
                </Text>
              </View>
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
  headerText: {
    fontSize: 32
  },
  header: {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%'
  },

  inputContainer: {
    flex: 0.1,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  inputBoxContainer: {
    flex: 0.8,
    paddingHorizontal: '5%',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  inputButtonContainer: {
    flex: 0.2,
    paddingHorizontal: '5%',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  inputBox: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 6,
    fontSize: 18,
    padding: '3%'
  },

  messageListContainer: {
    flex: 0.6,
    width: '100%',
    paddingHorizontal: '5%',
  },
  messageContainer: {
    flex: 1,
    width: '100%',
    padding: '5%',
    justifyContent: 'center',
    alignItems: 'flex-start',    
  },
  messageText: {
    fontSize: 18
  },
});



