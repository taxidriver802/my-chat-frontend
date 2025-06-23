import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  pendingMessage: null,
  unreadMessageCounts: {},
  groupChats: [],

  getGroups: async () => {
    const res = await axiosInstance.get("/groups");
    set({ groupChats: res.data });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);

      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  fetchUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get("/messages/unread-counts");
      set({ unreadMessageCounts: res.data });
    } catch (error) {
      console.log("Failed to fetch unread counts", error);
    }
  },

  setUnreadCounts: (counts) =>
    set(() => ({
      unreadMessageCounts: counts,
    })),

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, incrementUnreadCount } = get();

      const isFromActiveChat =
        selectedUser && newMessage.senderId === selectedUser._id;

      if (isFromActiveChat) {
        // Add the message to the open chat
        set({ messages: [...messages, newMessage] });
      } else {
        // User is either in another chat or has none selected
        incrementUnreadCount(newMessage.senderId);
        if (!selectedUser) {
          toast.success("New message received");
        }
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });

    if (selectedUser?._id) {
      get().resetUnreadMessageCount(selectedUser._id);
    }
  },

  setPendingMessage: (message) => set({ pendingMessage: message }),

  incrementUnreadCount: (userId) =>
    set((state) => ({
      unreadMessageCounts: {
        ...state.unreadMessageCounts,
        [userId]: (state.unreadMessageCounts[userId] || 0) + 1,
      },
    })),

  resetUnreadMessageCount: (userId) =>
    set((state) => ({
      unreadMessageCounts: {
        ...state.unreadMessageCounts,
        [userId]: 0,
      },
    })),

  updateUserLastSeen: (userId, lastSeen) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id === userId ? { ...user, lastSeen } : user
      ),
    })),
}));
