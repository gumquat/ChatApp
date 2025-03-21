import React, { useEffect, useState } from 'react';
import './chatList.css';
import AddUser from './addUser/addUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState('');

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, 'userChats', currentUser.id),
      async res => {
        const items = res.data().chats;

        const promises = items.map(async item => {
          const userDocRef = doc(db, 'users', item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async chat => {
    const userChats = chats.map(item => {
      const { user, ...rest } = item;
    });

    console.log('handleSelect called with chat:', chat);
    changeChat(chat.chatId, chat.user);
    console.log('changeChat called with:', chat.chatId, chat.user);
  };

  const filteredChats = chats.filter(c =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="images/search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? 'images/minus.png' : 'images/plus.png'}
          alt=""
          className="add"
          onClick={() => setAddMode(prev => !prev)}
        />
      </div>
      {filteredChats.map(chat => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{ backgroundColor: chat?.isSeen ? 'transparent' : '#66ff71' }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? 'images/avatar.png'
                : chat.user.avatar || 'images/avatar.png'
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? 'User'
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
