import { useChatStore } from "../store/useChatStore";
import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    pendingMessage,
  } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !selectedUser) return;

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
  }, [socket, selectedUser]);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

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
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
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
          <span>{selectedUser.fullName} is typing</span>
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
