import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser && !selectedGroup) return null;

  const isOnline =
    selectedUser && selectedUser._id
      ? onlineUsers.includes(selectedUser._id)
      : false;

  const name = selectedGroup ? selectedGroup.name : selectedUser?.fullName;
  const profilePic =
    selectedGroup?.profilePic || selectedUser?.profilePic || "/avatar.png";

  const handleClose = () => {
    if (selectedUser) setSelectedUser(null);
    if (selectedGroup) setSelectedGroup(null);
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={profilePic} alt={name} />
            </div>
          </div>

          {/* User or Group info */}
          <div>
            <h3 className="font-medium">{name}</h3>
            {!selectedGroup && (
              <p className="text-sm text-base-content/70">
                {isOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button onClick={handleClose}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
