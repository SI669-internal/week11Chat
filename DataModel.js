import { initializeApp, getApps } from 'firebase/app';
import { 
  initializeFirestore, collection,  
  query, orderBy, onSnapshot,
  doc, addDoc, setDoc, updateDoc
} from "firebase/firestore";
import { firebaseConfig } from './Secrets';

let app;
if (getApps().length == 0){
  app = initializeApp(firebaseConfig);
} 
const db = initializeFirestore(app, {
  useFetchStreams: false
});

class DataModel {

  constructor() {
    this.users = [];
    this.userListeners = [];
    this.chatListeners = [];
    this.initUsersOnSnapshot();
  }

  addUserListener(callbackFunction) {
    const listenerId = Date.now();
    const listener = {
      id: listenerId,
      callback: callbackFunction
    }
    this.userListeners.push(listener)
    callbackFunction(); // have the caller check right away
    return listenerId;
  }

  removeUserListener(listenerId) {
    let idx = this.userListeners.findIndex((elem)=>elem.id===listenerId);
    this.userListeners.splice(idx, 1);
  }

  notifyUserListeners() { 
    for (let ul of this.userListeners) {
      ul.callback();
    }
  }

  initUsersOnSnapshot() {
    onSnapshot(collection(db, 'users'), (qSnap) => {
      console.log('snapshot:', qSnap);
      if (qSnap.empty) return;
      let userList = [];
      qSnap.forEach((docSnap) => {
        let user = docSnap.data();
        user.key = docSnap.id;
        userList.push(user);
      });
      this.users = userList;
      this.notifyUserListeners();
    });
  }

  getUsers() {
    return this.users;
  }

  getUserForID(id) {
    for (let u of this.users) {
      if (u.key === id) {
        return u;
      }
    }
    return null;
  }

  async getUserForAuthUser(authUser) {
    console.log('getting User for ', authUser.uid);
    const userAuthId = authUser.uid;
    for (let u of this.users) {
      if (u.authId === userAuthId) {
        return u;
      }
    }
    console.log('user not found, about to create');
    // if we got here, it's a new user
    let newUser = await this.createUser(authUser);
    return newUser;
  }

  async createUser(authUser) {
    let newUser = {
      authId: authUser.uid        
    };
    const userDoc = await addDoc(collection(db, 'users'), newUser);
    return userDoc.id;
  }

  async updateUser(userId, data) {
    const docRef = doc(collection(db, 'users'), userId);
    await updateDoc(docRef, data);
  }

  addChatListener(chatId, callbackFunction) {
    const listenerId = Date.now();
    const listener = {
      id: listenerId,
      chatId: chatId,
      callback: callbackFunction
    }
    this.chatListeners.push(listener);
    let chatDocRef = doc(db, 'chats', chatId);
    let messagesRef = collection(chatDocRef, 'messages');
    let messageQuery = query(messagesRef, orderBy('timestamp', 'desc'));

    onSnapshot(messageQuery, (qSnap) => {
      if (qSnap.empty) return;
      let allMessages = [];
      qSnap.forEach((docSnap) => {
        let message = docSnap.data();
        message.key = docSnap.id;
        message.author = this.getUserForID(message.authorId); // convert Id to user object
        message.timestamp = message.timestamp.toDate(); // convert Firebase timestamp to JS Date
        allMessages.push(message);
      });
      this.notifyChatListeners(chatId, allMessages);
    });

    return listenerId;
  }

  removeChatListener(listenerId) {
    let idx = this.chatListeners.findIndex((elem)=>elem.listenerId===listenerId);
    this.chatListeners.splice(idx, 1);
  }

  notifyChatListeners(chatId, allMessages) {
    for (let cl of this.chatListeners) {
      if (cl.chatId === chatId) {
        cl.callback(allMessages);
      }
    }
  }

  getChatIdForUserIds(user1Id, user2Id) {
    let userPair = [user1Id, user2Id];
    userPair.sort();
    return (userPair[0] + '-' + userPair[1]);
  }

  async addChatMessage(chatId, messageContents) {

    // construct a reference to the chat's Firestore doc
    let chatDocRef = doc(db, 'chats', chatId);

    // create chat doc if it doesn't exist, otherwise update participants
    let participants = [messageContents.authorId, messageContents.otherUserId];
    await setDoc(chatDocRef, {participants: participants});

    // add the message to the chat doc's 'messages' collection
    let messagesRef = collection(chatDocRef, 'messages');
    addDoc(messagesRef, messageContents); // let onSnapshot() do it's work!
  }  
}

let theDataModel = undefined;

export function getDataModel() {
  if (!theDataModel) {
    theDataModel = new DataModel();
  }
  return theDataModel;
}