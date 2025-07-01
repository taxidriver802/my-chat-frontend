import { Plus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";

import GroupSelector from "./GroupSelector";
import { useChatStore } from "../store/useChatStore";

const ChatInfoModal = ({
  onClose,
  isGroup,
  data,
  isGroupSelectorOpen,
  setIsGroupSelectorOpen,
}) => {
  const { users, authUser: currentUser, onlineUsers } = useAuthStore();

  const groupSelectorRef = useRef(null);

  const modalRef = useRef(null);

  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don’t close ChatInfoModal if GroupSelector is open
      if (isGroupSelectorOpen) return;

      const clickedOutside =
        modalRef.current && !modalRef.current.contains(event.target);

      if (clickedOutside) {
        onClose();
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape" && !isGroupSelectorOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose, isGroupSelectorOpen]);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-sm"
      >
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
            className={`w-20 h-20 rounded-full mx-auto ${
              isGroup ? "cursor-pointer" : "cursor-default"
            }`}
            disabled={!isGroup}
            onClick={() => {
              if (isGroup) alert("Group profile picture not implemented");
            }}
            aria-label={isGroup ? "Edit group profile picture" : undefined}
          >
            <img
              src={data?.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-20 h-20 rounded-full mx-auto"
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
              <div className="flex flex-row mt-3">
                <button
                  className="flex items-center opacity-70"
                  onClick={() => setIsGroupSelectorOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Members
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p>Members:</p>
              <div className="max-h-48 overflow-y-auto pr-1">
                <ul className="space-y-2">
                  {data?.members?.map((member) => (
                    <li key={member._id} className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={member.profilePic || "/avatar.png"}
                          alt={member.fullName || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />

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
                </ul>
              </div>
            </div>
          </>
        )}

        <p className="pt-10 text-xs text-center text-gray-500">
          {isGroup ? "Created on: " : "Joined on: "}
          {formattedDate}
        </p>
      </div>
      {isGroupSelectorOpen && (
        <GroupSelector
          users={users}
          onClose={() => setIsGroupSelectorOpen(false)}
          groupId={data._id}
          existingGroup={data}
        />
      )}
    </div>
  );
};

export default ChatInfoModal;
