import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";

const GroupSelector = ({
  onClose,
  groupId = null,
  existingGroup = null,
  users = [],
}) => {
  const modalRef = useRef(null);
  const updateGroupInfo = useChatStore((state) => state.updateGroupInfo);

  const [groupName, setGroupName] = useState(existingGroup?.name || "");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const currentMemberIds = existingGroup?.members?.map((u) => u._id) || [];

  useEffect(() => {
    const handleClick = (e) => {
      if (e.target === modalRef.current) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleSubmit = async () => {
    if (groupId) {
      const newUserIds = selectedUsers.filter(
        (id) => !currentMemberIds.includes(id)
      );
      if (newUserIds.length === 0) return;

      try {
        await updateGroupInfo(newUserIds, groupId);
        onClose?.();
      } catch (error) {
        console.error("Failed to add members:", error);
      }
      return;
    }
  };

  const availableUsers = groupId
    ? users.filter((user) => !currentMemberIds.includes(user._id))
    : users;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-base-100 rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {groupId ? "Add Members to Group" : "Create a Group Chat"}
        </h2>

        {!groupId && (
          <input
            type="text"
            placeholder="Group name"
            className="input input-bordered w-full mb-4"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        )}

        <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
          {availableUsers.length > 0 ? (
            availableUsers.map((user) => (
              <label key={user._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() =>
                    setSelectedUsers((prev) =>
                      prev.includes(user._id)
                        ? prev.filter((id) => id !== user._id)
                        : [...prev, user._id]
                    )
                  }
                />
                <span>{user.fullName}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">No users available to add.</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={
              groupId
                ? selectedUsers.length === 0
                : !groupName || selectedUsers.length === 0
            }
          >
            {groupId ? "Add Members" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupSelector;
