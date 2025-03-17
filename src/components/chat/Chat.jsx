import {
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { db } from '../../lib/firebase';
import './chat.css';
import upload from '../../lib/upload';

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState({ file: null, url: '' });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

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

  const handleImage = e => {
    if (e.target.files[0]) {
      setImage({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text.trim() === '' && !image.file) return;

    let imageUrl = null;

    try {
      if (image.file) {
        console.log('Uploading image:', image.file.name);
        imageUrl = await upload(image.file);
        console.log('Image uploaded successfully. URL:', imageUrl);
      }

      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: Date.now(),
          ...(imageUrl && { img: imageUrl }),
        }),
      });

      console.log('Message sent successfully');

      // Clear input after sending
      setText('');
      setImage({ file: null, url: '' });
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
          <img src={user?.avatar || 'images/avatar.png'} alt="" />
          <div className="texts">
            <span>{user?.username || 'User'}</span>
          </div>
        </div>

        <div className="icons">
          <img src="images/phone.png" alt="" />
          <img src="images/video.png" alt="" />
          <img src="images/info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map(message => (
          <div
            className={`message ${
              message.senderId === currentUser.id ? 'own' : ''
            }`}
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
          <label htmlFor="file">
            <img src="images/img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: 'none' }}
            onChange={handleImage}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
          <img src="images/camera.png" alt="" />
          <img src="images/mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? 'You cannot send messages to this user'
              : 'type a message...'
          }
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="images/emoji.png"
            alt=""
            onClick={() => setOpen(prev => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
