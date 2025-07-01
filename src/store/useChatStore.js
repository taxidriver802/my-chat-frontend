import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import axios from "axios";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  pendingMessage: {},
  unreadMessageCounts: {},
  groupChats: [],
  selectedGroup: null,
  setSelectedGroup: (group) => set({ selectedGroup: group }),

  getGroups: async () => {
    try {
      const res = await axios.get("/api/groups", { withCredentials: true });
      set({ groupChats: res.data });
    } catch (err) {
      console.error("Failed to fetch group chats", err);
    }
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

  getMessages: async (id, isGroup = false) => {
    set({ isMessagesLoading: true });
    try {
      const endpoint = isGroup ? `/groups/${id}/messages` : `/messages/${id}`;
      const res = await axiosInstance.get(endpoint);

      const messages = res.data;
      set({ messages });

      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        if (isGroup) {
          set((state) => ({
            groupChats: state.groupChats.map((group) =>
              group._id === id
                ? { ...group, lastActivity: lastMessage.createdAt }
                : group
            ),
          }));
        } else {
          set((state) => ({
            users: state.users.map((user) =>
              user._id === id
                ? { ...user, lastActivity: lastMessage.createdAt }
                : user
            ),
          }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  fetchUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get("/messages/unread-counts");
      set({ unreadMessageCounts: res.data });
    } catch (error) {
      console.error("Failed to fetch unread counts", error);
    }
  },

  setUnreadCounts: (counts) =>
    set(() => ({
      unreadMessageCounts: counts,
    })),

  sendMessage: async (messageData) => {
    const { selectedUser, selectedGroup, messages } = get();

    try {
      let endpoint = "";
      if (selectedUser) {
        endpoint = `/messages/send/${selectedUser._id}`;
      } else if (selectedGroup) {
        endpoint = `/groups/${selectedGroup._id}/send`;
      } else {
        throw new Error("No recipient selected");
      }

      const res = await axiosInstance.post(endpoint, messageData);

      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newUser", (user) => {
      set((state) => ({
        users: [...state.users, user],
      }));
    });

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, selectedGroup, messages, incrementUnreadCount } =
        get();

      const isDirect = !!newMessage.senderId && !newMessage.groupId;
      const isGroup = !!newMessage.groupId;

      const isFromActiveDM =
        isDirect && selectedUser && newMessage.senderId === selectedUser._id;

      const isFromActiveGroup =
        isGroup && selectedGroup && newMessage.groupId === selectedGroup._id;

      const messageExists = messages.some((msg) => msg._id === newMessage._id);
      if (messageExists) return;

      if (isFromActiveDM || isFromActiveGroup) {
        const chatId = newMessage.groupId || newMessage.senderId;
        get().clearPendingMessage(chatId);

        set({ messages: [...messages, newMessage] });
      } else {
        if (isDirect) incrementUnreadCount(newMessage.senderId);
        if (isGroup) incrementUnreadCount(newMessage.groupId);

        toast.success("New message received");
      }

      if (!isFromActiveDM && isDirect) {
        set((state) => ({
          users: state.users.map((user) =>
            user._id === newMessage.senderId
              ? { ...user, lastActivity: newMessage.createdAt }
              : user
          ),
        }));
      }

      if (!isFromActiveGroup && isGroup) {
        set((state) => ({
          groupChats: state.groupChats.map((group) =>
            group._id === newMessage.groupId
              ? { ...group, lastActivity: newMessage.createdAt }
              : group
          ),
        }));
      }
    });

    socket.on("userJoined", (newUser) => {
      set((state) => {
        const alreadyExists = state.users.some(
          (u) => u._id.toString() === newUser._id.toString()
        );

        return alreadyExists ? {} : { users: [...state.users, newUser] };
      });
    });

    socket.on("groupCreated", (group) => {
      set((state) => ({
        groupChats: [...state.groupChats, group],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set((state) => ({
      selectedUser,
      selectedGroup: selectedUser ? null : state.selectedGroup,
    }));

    if (selectedUser?._id) {
      get().resetUnreadMessageCount(selectedUser._id);
    }
  },

  setPendingMessage: (chatId, message) =>
    set((state) => ({
      pendingMessages: {
        ...state.pendingMessages,
        [chatId]: message,
      },
    })),

  clearPendingMessage: (chatId) =>
    set((state) => {
      const newPending = { ...state.pendingMessages };
      delete newPending[chatId];
      return { pendingMessages: newPending };
    }),

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

  updateGroupInfo: async (userIds, groupId) => {
    try {
      await fetch(`/api/groups/${groupId}/add-members`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });

      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("group:membersAdded", {
          groupId,
          newUserIds: userIds,
        });
      }

      await get().getGroups();

      const updatedGroup = get().groupChats.find((g) => g._id === groupId);
      if (updatedGroup) {
        set({ selectedGroup: updatedGroup });
      }
    } catch (error) {
      console.error("Failed to update group members:", error);
    }
  },
}));
