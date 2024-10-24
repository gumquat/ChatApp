import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust the path as necessary

const createUserChatsData = async () => {
const userChatsData = [
{
    userId: "0Yrp5wbSq2ZmCoOe2WEMYOWDlri2", // Karis
    chats: [
    {
        chatId: "chatId_1", // Replace with actual chat ID
        receiverId: "b0L2R4j64Ueqigw2eP4rYMFrViH3",
        lastMessage: "Hello from Karis!",
        isSeen: false,
        updatedAt: Date.now(),
    }
    // Add more chats if needed
    ]
},
{
    userId: "ZHVF8DQd6xPYPwiaKg44oWroK0z1", // Cason
    chats: [
    {
        chatId: "chatId_2", // Replace with actual chat ID
        receiverId: "b0L2R4j64Ueqigw2eP4rYMFrViH3",
        lastMessage: "Hello from Cason!",
        isSeen: false,
        updatedAt: Date.now(),
    }
    // Add more chats if needed
    ]
}
];

for (const userChat of userChatsData) {
await setDoc(doc(db, 'userChats', userChat.userId), {
    chats: userChat.chats
});
}
};

createUserChatsData().catch(console.error);
