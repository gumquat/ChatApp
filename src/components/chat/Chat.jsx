import { arrayUnion, doc, onSnapshot, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { db } from '../../lib/firebase';
import './chat.css';

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const { currentUser } = useUserStore();
  const { chatId, user } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'chats', chatId), res => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = e => {
    setText(prev => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text.trim() === "") return;

    try {
      // Add message to chat
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: Date.now(),
        })
      });

      // Update userChats for both users
      const userIDs = [currentUser.id, user.id];
      const currentTime = Date.now();

      for (const id of userIDs) {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        
        if (userChatsSnapshot.exists()) {
          // Update existing chat entry
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          
          if (chatIndex !== -1) {
            // Update existing chat
            userChatsData.chats[chatIndex] = {
              ...userChatsData.chats[chatIndex],
              lastMessage: text,
              isSeen: id === currentUser.id,
              updatedAt: currentTime,
            };

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          } else {
            // Create new chat entry if it doesn't exist
            const newChatEntry = {
              chatId,
              receiverId: id === currentUser.id ? user.id : currentUser.id,
              lastMessage: text,
              isSeen: id === currentUser.id,
              updatedAt: currentTime,
            };

            if (userChatsData.chats) {
              await updateDoc(userChatsRef, {
                chats: arrayUnion(newChatEntry)
              });
            } else {
              // Initialize chats array if it doesn't exist
              await setDoc(userChatsRef, {
                chats: [newChatEntry]
              });
            }
          }
        } else {
          // Create new userChats document if it doesn't exist
          await setDoc(userChatsRef, {
            chats: [{
              chatId,
              receiverId: id === currentUser.id ? user.id : currentUser.id,
              lastMessage: text,
              isSeen: id === currentUser.id,
              updatedAt: currentTime,
            }]
          });
        }
      }

      // Clear input after sending
      setText('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username || "User"}</span>
          </div>
        </div>

        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map(message => (
          <div 
            className={`message ${message.senderId === currentUser.id ? 'own' : ''}`} 
            key={message.createdAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder="type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen(prev => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;