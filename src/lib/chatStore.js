import { create } from 'zustand';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId, user) => {
    console.log('changeChat called in store with:', chatId, user);
    const currentUser = useUserStore.getState().currentUser;

    // CHECK IF CURRENT USER IS BLOCKED
    if (user.blocked.includes(currentUser.id)) {
      console.log('Current user is blocked');
      return set({
        chatId,
        user, // Allow the user to view the conversation
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }
    // CHECK IF RECEIVER IS BLOCKED
    else if (currentUser.blocked.includes(user.id)) {
      console.log('Receiver is blocked');
      return set({
        chatId,
        user, // Allow the user to view the conversation
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      console.log('No blocking, updating state');
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));