import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Notification = () => {
  return (
    <div>
      <ToastContainer position="bottom-left"/>
    </div>
  )
}

export default Notification;