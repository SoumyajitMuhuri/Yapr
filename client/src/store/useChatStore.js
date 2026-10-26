import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import {
  playNotificationSound,
  playReceivedSound,
  playSentSound,
} from "../hooks/useEventSound";
import toast from "react-hot-toast";

const MESSAGE_PAGE_SIZE = 50;

function mergeMessages(existing, incoming) {
  const messagesById = new Map(existing.map((message) => [String(message._id), message]));
  for (const message of incoming) messagesById.set(String(message._id), message);
  return [...messagesById.values()].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt) ||
      String(a._id).localeCompare(String(b._id)),
  );
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      hasMoreMessages: false,
      nextMessageCursor: null,
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      isLoadingOlderMessages: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("Error in get Users", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId, { preserveExisting = false } = {}) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`, {
            params: { limit: MESSAGE_PAGE_SIZE },
          });
          if (String(get().activeConversationId) === String(userId)) {
            set((state) => ({
              messages: preserveExisting
                ? mergeMessages(state.messages, res.data.messages)
                : res.data.messages,
              ...(preserveExisting
                ? {}
                : {
                    hasMoreMessages: res.data.hasMore,
                    nextMessageCursor: res.data.nextCursor,
                  }),
            }));
          }
          get().getConversations();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      loadOlderMessages: async () => {
        const { activeConversationId, nextMessageCursor, isLoadingOlderMessages } = get();
        if (!activeConversationId || !nextMessageCursor || isLoadingOlderMessages) return false;

        set({ isLoadingOlderMessages: true });
        try {
          const res = await axiosInstance.get(`/messages/${activeConversationId}`, {
            params: { limit: MESSAGE_PAGE_SIZE, cursor: nextMessageCursor },
          });
          if (String(get().activeConversationId) !== String(activeConversationId)) return false;

          set((state) => ({
            messages: mergeMessages(state.messages, res.data.messages),
            hasMoreMessages: res.data.hasMore,
            nextMessageCursor: res.data.nextCursor,
          }));
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load earlier messages");
          return false;
        } finally {
          set({ isLoadingOlderMessages: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser } = get();
        if (!selectedUser) return false;

        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData
          );

          if (get().isSoundEnabled) playSentSound();

          set((state) => ({
            messages: mergeMessages(state.messages, [res.data.newMessage]),
            composerText: "",
          }));

          get().getConversations();
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
          return false;
        }
      },

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.on("newMessage", (newMessage) => {
          const senderId = String(newMessage.senderId);
          const state = get();
          const isActiveConversation = senderId === String(state.activeConversationId);

          if (isActiveConversation) {
            if (state.isSoundEnabled) playReceivedSound();
            get().getMessages(senderId, { preserveExisting: true });
          } else {
            const sender = [...state.users, ...state.conversations].find(
              (user) => String(user._id) === senderId,
            );
            const preview =
              newMessage.text ||
              (newMessage.image ? "Photo" : newMessage.video ? "Video" : "New message");
            if (state.isSoundEnabled) playNotificationSound();
            toast(`${sender?.fullName || "New message"}: ${preview}`);
          }

          if (!isActiveConversation) get().getConversations();
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),

      setActiveConversationId: (activeConversationId) => {
        set((state) => {
          const changedConversation =
            String(activeConversationId ?? "") !== String(state.activeConversationId ?? "");

          return {
            activeConversationId,
            selectedUser:
              state.users.find((user) => user._id === activeConversationId) ||
              state.conversations.find((user) => user._id === activeConversationId) ||
              null,
            messages: changedConversation ? [] : state.messages,
            hasMoreMessages: changedConversation ? false : state.hasMoreMessages,
            nextMessageCursor: changedConversation ? null : state.nextMessageCursor,
          };
        });
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        return get().sendMessage({ text: messageText });
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);

        set({ isSendingMedia: true });
        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "yapr-cache",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);
