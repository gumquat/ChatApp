import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust the path as necessary

const createChatData = async () => {
const chats = [
{
    chatId: "chatId_1", // Replace with actual chat ID
    messages: [
    {
        senderId: "b0L2R4j64Ueqigw2eP4rYMFrViH3",
        text: "Hi Karis!",
        createdAt: new Date(),
    },
    {
        senderId: "0Yrp5wbSq2ZmCoOe2WEMYOWDlri2",
        text: "Hello!",
        createdAt: new Date(),
    },
    ]
},
{
    chatId: "chatId_2", // Replace with actual chat ID
    messages: [
    {
        senderId: "b0L2R4j64Ueqigw2eP4rYMFrViH3",
        text: "Hey Cason!",
        createdAt: new Date(),
    },
    {
        senderId: "ZHVF8DQd6xPYPwiaKg44oWroK0z1",
        text: "What's up?",
        createdAt: new Date(),
    },
    ]
}
];

for (const chat of chats) {
await setDoc(doc(db, 'chats', chat.chatId), chat);
}
};

createChatData().catch(console.error);
