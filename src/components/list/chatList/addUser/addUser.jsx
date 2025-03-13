import React, { useState } from 'react';
import './addUser.css';
import { db } from '../../../../lib/firebase';
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { useUserStore } from '../../../../lib/userStore';

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUser({
          ...querySnapshot.docs[0].data(),
          id: querySnapshot.docs[0].id,
        });
      } else {
        console.log('User not found');
        setUser(null);
      }
    } catch (err) {
      console.error('Error searching for user:', err);
    }
  };

  const createOrUpdateUserChat = async (userId, chatData) => {
    const userChatRef = doc(db, 'userChats', userId);
    const userChatDoc = await getDoc(userChatRef);

    if (!userChatDoc.exists()) {
      await setDoc(userChatRef, { chats: [chatData] });
    } else {
      await updateDoc(userChatRef, {
        chats: arrayUnion(chatData),
      });
    }
  };

  const handleAdd = async () => {
    try {
      const chatRef = collection(db, 'chats');
      const newChatRef = doc(chatRef);
      const now = Timestamp.now();

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const chatData = {
        chatId: newChatRef.id,
        lastMessage: '',
        updatedAt: now,
      };

      await createOrUpdateUserChat(user.id, {
        ...chatData,
        receiverId: currentUser.id,
      });

      await createOrUpdateUserChat(currentUser.id, {
        ...chatData,
        receiverId: user.id,
      });

      console.log('New chat created with ID:', newChatRef.id);
    } catch (err) {
      console.error('Error adding user to chat:', err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" required />
        <button type="submit">Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img
              src={user.avatar || 'images/avatar.png'}
              alt={`${user.username}'s avatar`}
            />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
