import { Plus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ChatInfoModal = ({ onClose, isGroup, data }) => {
  const { authUser: currentUser, onlineUsers } = useAuthStore();

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isGroup ? "Group Info" : "User Info"}
          </h2>
          <button
            onClick={onClose}
            className="text-base-content/70 hover:text-base-content"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 flex flex-col">
          <button
            className="w-20 h-20 rounded-full mx-auto"
            onClick={
              isGroup
                ? () => alert("Group profile picture not implemented")
                : null
            }
          >
            <img
              src={data?.profilePic || "/avatar.png"}
              alt="Profile"
              className={`w-20 h-20 rounded-full mx-auto ${
                isGroup ? "cursor-pointer" : "cursor-default"
              }`}
            />
          </button>
          <p className="text-center font-medium">
            {data?.name || data?.fullName}
          </p>
        </div>
        {isGroup && (
          <>
            <div className="flex flex-row justify-between">
              <h3 className="mt-4 mb-2 text-sm font-semibold text-base-content/70">
                Members: {data.members.length}/10
              </h3>
              <div className="flex flex-row items-bottom mt-3">
                <button
                  className="flex items-center opacity-70"
                  onClick={() =>
                    alert("Add members functionality not implemented yet")
                  }
                >
                  <Plus />
                  Add Members
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p>Members:</p>
              <ul className="space-y-2">
                <div className="max-h-48 overflow-y-auto pr-1">
                  {data?.members?.map((member) => (
                    <li key={member._id} className="flex items-center gap-3">
                      <img
                        src={member.profilePic || "/avatar.png"}
                        alt={member.fullName || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="relative">
                        {onlineUsers.includes(member._id) && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-2 ring-base-100"></span>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {member.fullName}
                      </span>
                      {member._id === currentUser._id && (
                        <span className="text-xs text-primary ml-2">(You)</span>
                      )}
                    </li>
                  ))}
                </div>
              </ul>
            </div>
          </>
        )}

        <p className="pt-10 text-xs text-center text-gray-500">
          Created on: {new Date(data.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ChatInfoModal;
