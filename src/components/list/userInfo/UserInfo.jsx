import React from 'react';
import './userInfo.css';
import { useUserStore } from '../../../lib/userStore';

const UserInfo = () => {
  const { currentUser } = useUserStore();

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || 'images/avatar.png'} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="images/more.png" alt="" />
        <img src="images/video.png" alt="" />
        <img src="images/edit.png" alt="" />
      </div>
    </div>
  );
};

export default UserInfo;
