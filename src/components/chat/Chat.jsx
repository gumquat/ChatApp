import {
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import upload from '../../lib/upload'; // uneeded?
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
  const [image, setImage] = useState({ file: null, url: '' });

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

    // Update isSeen status when chat is opened
    const updateSeenStatus = async () => {
      const userChatsRef = doc(db, 'userChats', currentUser.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chats.findIndex(
          c => c.chatId === chatId
        );

        if (chatIndex !== -1) {
          userChatsData.chats[chatIndex].isSeen = true;
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      }
    };

    updateSeenStatus();

    return () => {
      unSub();
    };
  }, [chatId, currentUser.id]);

  const handleEmoji = e => {
    setText(prev => prev + e.emoji);
    setOpen(false);
  };

  const handleImage = e => {
    if (e.target.files[0]) {
      setImage({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text.trim() === '' && !image.file) return; // Don't send empty messages

    let imageUrl = null;

    try {
      if (image.file) {
        // Upload image to Firebase Storage
        console.log('Uploading image:', image.file.name);
        imageUrl = await upload(image.file);
        console.log('Image uploaded successfully. URL:', imageUrl);
      }

      // Add message or image to chat
      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: Date.now(),
          ...(imageUrl && { img: imageUrl }), // Add image URL if it exists
        }),
      });

      console.log('Message sent successfully');

      // Update userChats for both users
      const userIDs = [currentUser.id, user.id];
      const currentTime = Date.now();

      for (const id of userIDs) {
        const userChatsRef = doc(db, 'userChats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            c => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            // Update existing chat
            userChatsData.chats[chatIndex] = {
              ...userChatsData.chats[chatIndex],
              lastMessage: text || 'Image', // Use 'Image' if no text
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
              lastMessage: text || 'Image',
              isSeen: id === currentUser.id,
              updatedAt: currentTime,
            };

            await updateDoc(userChatsRef, {
              chats: arrayUnion(newChatEntry),
            });
          }
        } else {
          // Create new userChats document if it doesn't exist
          await setDoc(userChatsRef, {
            chats: [
              {
                chatId,
                receiverId: id === currentUser.id ? user.id : currentUser.id,
                lastMessage: text || 'Image',
                isSeen: id === currentUser.id,
                updatedAt: currentTime,
              },
            ],
          });
        }
      }

      // Clear input after sending
      setText('');
      setImage({ file: null, url: '' }); // Reset image state
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || './avatar.png'} alt="" />
          <div className="texts">
            <span>{user?.username || 'User'}</span>
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
        {image.url && (
          <div className="message own">
            <div className="texts">
              <img src={image.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: 'none' }}
            onChange={handleImage}
          />
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
        <button className="sendButton" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
