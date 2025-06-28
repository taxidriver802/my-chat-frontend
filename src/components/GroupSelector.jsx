import { useState } from "react";

const GroupSelector = ({ users, onSubmit, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSubmit = () => {
    if (!groupName || selectedUsers.length === 0) return;
    onSubmit(groupName, selectedUsers);
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-4">Create a Group Chat</h2>

      <input
        type="text"
        placeholder="Group name"
        className="input input-bordered w-full mb-4"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
        {users.map((user) => (
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
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!groupName || selectedUsers.length === 0}
        >
          Create Group
        </button>
      </div>
    </>
  );
};
export default GroupSelector;
