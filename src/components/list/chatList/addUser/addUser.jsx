import React, { useState } from 'react';
import './addUser.css';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface User {
  username: string;
  // Add other user properties as needed
}

const AddUser: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;

    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('username', '==', username));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data() as User);
      } else {
        setUser(null);
        console.log('User not found');
      }
    } catch (err) {
      console.error('Error searching for user:', err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button type="submit">Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src="./avatar.png" alt="User avatar" />
            <span>{user.username}</span>
          </div>
          <button>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;