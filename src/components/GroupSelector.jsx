import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { getLastSeen } from "../lib/utils";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const GroupSelector = ({ onClose }) => {
  const { getUsers, users, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const toggleUserSelection = (user) => {
    setSelectedUsers((prevSelected) => {
      const alreadySelected = prevSelected.find((u) => u._id === user._id);
      if (alreadySelected) {
        return prevSelected.filter((u) => u._id !== user._id);
      } else {
        return [...prevSelected, user];
      }
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-row gap-16">
        <h2 className="text-lg font-bold mb-4">Select users for group chat</h2>
        <button className="btn btn-sm btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>

      {isUsersLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {users.map((user) => {
            const isSelected = selectedUsers.some((u) => u._id === user._id);
            return (
              <div
                key={user._id}
                onClick={() => toggleUserSelection(user)}
                className={`flex items-center p-2 rounded cursor-pointer transition 
                  ${isSelected ? "bg-blue-100" : "hover:bg-base-300"}`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-2 bg-green-500 rounded-full ring-1 ring-white" />
                  )}
                </div>

                <div className="ml-3 flex-1">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-xs text-zinc-500">
                    {onlineUsers.includes(user._id)
                      ? "Online"
                      : getLastSeen(user.lastSeen)}
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle className="text-blue-500 size-5 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedUsers.length > 0 && (
        <button
          className="btn btn-primary mt-4 w-full"
          onClick={() => {
            console.log("Create group with:", selectedUsers);
            toast.success("Group created!"); // Temporary feedback
            onClose();
          }}
        >
          Create Group ({selectedUsers.length})
        </button>
      )}
    </div>
  );
};

export default GroupSelector;
