import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
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
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'chats', chatId), res => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  console.log(chat);

  const handleEmoji = e => {
    setText(prev => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if(!text === "") return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages:arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        })
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async(id)=>{
        
        const userChatsRef = doc(db, "userChats", id)
        const userChatsSnapshot = await getDoc(userChatsRef)
        
        if(userChatsSnapshot.exists()){
          const userChatsData = userChatsSnapshot.data();
          
          const chatIndex = userChatsData.chats.findIndex(c=>c.chat.id === chatId);
          userChatsData[chatIndex].lastMessage = text;
          userChatsData[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData[chatIndex].updatedAt = Date.now();
          
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>Jane Doe</span>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Est,
              eligendi?
            </p>
          </div>
        </div>

        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map(message=>(

          <div className="message own" key={message?.createdAt}>
          <div className="texts">
          {message.img && <img src={message.img}/>}
            <p>{message.text}</p>
            <span>{/*message.createdAt*/}</span>
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
