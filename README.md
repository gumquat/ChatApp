Note to self:
- add readme info about ZuStore, and about Firestore/base
- add unique username verification
- add unique friend code for each user upon creation of their account
- the SEARCH BAR DOESNT WORK FOR FINDING USERS YET (use the little plus button and search by username) MAKE SURE TO CLOSE IT BEFORE SELECTING A USER TO OPEN THEIR CHAT

LEFT OFF AT ____________

# Reactive Chat App
- to start locally: ```npm run dev``` from the root

## Overview

This project leverages Firebase to handle authentication, database storage, and file storage. Below is an overview of the Firebase services used:

## Firebase Services

### 1. Firebase Authentication

Firebase Authentication is used to manage user authentication for this project. It provides easy integration for email/password, Google, Facebook, and other popular providers. With Firebase Authentication, you can easily handle user sign-up, sign-in, and sign-out operations, as well as securely manage user sessions.

### 2. Firestore Database

Firestore is a flexible, scalable database for mobile, web, and server development from Firebase and Google Cloud Platform. In this project, Firestore is used as the primary database to store and sync data in real time. It supports complex data types such as nested objects and provides powerful query capabilities.

### 3. Firebase Storage

Firebase Storage is used to store and serve user-generated content such as images, videos, and other media files. This service provides a robust and secure storage solution with easy integration into your app. You can easily upload, download, and manage files with Firebase Storage.

## Entity Relationships

```
users{
  id string pk
  username string
  email string
  avatar string
  blocked string[]
}
```

```
chats{
  id string pk
  createdAt date
  messages object[]
}
```

```
userChats{
  id string pk
  chats object[]
}
```

```
users.id - userChats.id
userChats < chats
```

- userChats : chats : object[] ->
  {
  chatId: string,
  senderId: string,
  text: string,
  image: string,
  createdAt: date,
  }

- chats : messages : object[] ->
  {
  chatId: string,
  receiverId, string,
  lastMessage: string,
  updatedAt: date,
  isSeen: boolean
  }


### For approved collaborators
-----
please request access to the following:
* firebase.js file containing the configuration settings
* .env file containing the API key to plug into the settings above