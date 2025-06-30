import "./ChatInfoModal.css";

const ChatInfoModal = ({ onClose, isGroup, data }) => {
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

        <div className="space-y-2">
          <img
            src={data?.profilePic || "/avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full mx-auto"
          />
          <p className="text-center font-medium">
            {data?.name || data?.fullName}
          </p>
          {/* Add more details here: email, actions, group members, etc */}
        </div>
      </div>
    </div>
  );
};

export default ChatInfoModal;
