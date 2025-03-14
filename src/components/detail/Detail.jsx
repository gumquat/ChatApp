import React from 'react';
import './detail.css';
import { auth } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, 'users', currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || 'images/avatar.png'} alt="" />
        <h2>{user?.username}</h2>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi,
          dolores?
        </p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="images/arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="images/arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <img src="images/arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="images/img.png" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="images/download.png" alt="" className="icon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="images/arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? 'You are blocked'
            : isReceiverBlocked
              ? 'User blocked'
              : 'Block user'}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
