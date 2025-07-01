import { useChatStore } from "../store/useChatStore";
import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = ({ isGroupSelectorOpen, setIsGroupSelectorOpen }) => {
  const messages = useChatStore((state) => state.messages);
  const getMessages = useChatStore((state) => state.getMessages);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const selectedGroup = useChatStore((state) => state.selectedGroup);
  const pendingMessages = useChatStore((state) => state.pendingMessages);
  const chatId = selectedGroup?._id || selectedUser?._id;
  const pendingMessage = pendingMessages?.[chatId];

  const { authUser, socket } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!socket || (!selectedUser && !selectedGroup)) return;

    if (selectedUser) {
      const handleTyping = (senderId) => {
        if (senderId === selectedUser._id) setIsTyping(true);
      };

      const handleStopTyping = (senderId) => {
        if (senderId === selectedUser._id) setIsTyping(false);
      };

      socket.on("userTyping", handleTyping);
      socket.on("userStopTyping", handleStopTyping);

      return () => {
        socket.off("userTyping", handleTyping);
        socket.off("userStopTyping", handleStopTyping);
      };
    } else if (selectedGroup) {
      const handleGroupTyping = (data) => {
        if (!data || !data.groupId) return;
        if (data.groupId === selectedGroup?._id)
          setIsTyping(data.user?.fullName || "Someone");
      };

      const handleGroupStopTyping = (data) => {
        if (!data || !data.groupId) return;
        if (data.groupId === selectedGroup?._id) setIsTyping(false);
      };

      socket.on("groupTyping", handleGroupTyping);
      socket.on("groupStopTyping", handleGroupStopTyping);

      return () => {
        socket.off("groupTyping", handleGroupTyping);
        socket.off("groupStopTyping", handleGroupStopTyping);
      };
    }
  }, [socket, selectedUser, selectedGroup]);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    } else if (selectedGroup?._id) {
      getMessages(selectedGroup._id, true);
    }
  }, [selectedUser, selectedGroup, getMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader
          isGroupSelectorOpen={isGroupSelectorOpen}
          setIsGroupSelectorOpen={setIsGroupSelectorOpen}
        />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader
        isGroupSelectorOpen={isGroupSelectorOpen}
        setIsGroupSelectorOpen={setIsGroupSelectorOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedGroup
                      ? "/group-icon.png"
                      : selectedUser?.profilePic || "/avatar.png"
                  }
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        {pendingMessage && (
          <div className="chat chat-end opacity-50 italic">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={authUser.profilePic || "/avatar.png"}
                  alt="Your profile"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <span className="text-xs opacity-50 ml-1">Sending...</span>
            </div>
            <div className="chat-bubble flex flex-col">
              {pendingMessage.image && (
                <img
                  src={pendingMessage.image}
                  alt="Preview"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {pendingMessage.text && <p>{pendingMessage.text}</p>}
              <span className="loading loading-spinner loading-xs text-primary mt-2 self-end" />
            </div>
          </div>
        )}
      </div>
      {isTyping && (
        <div className="px-4 py-1 pl-8 text-sm text-base-content flex items-center gap-2">
          {typeof isTyping === "string" ? (
            <span>{isTyping} is typing</span>
          ) : (
            selectedUser && <span>{selectedUser.fullName} is typing</span>
          )}

          <div className="flex space-x-1">
            <span className="block w-2 h-2 bg-base-content/60 rounded-full animate-bounce [animation-delay:0s]" />
            <span className="block w-2 h-2 bg-base-content/60 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="block w-2 h-2 bg-base-content/60 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        </div>
      )}
      <MessageInput />
    </div>
  );
};
export default ChatContainer;
