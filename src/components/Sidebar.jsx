import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import {
  getLastSeen,
  sortAndFilterUsers,
  sortGroupsByName,
} from "../lib/utils";

import HiddenIcon from "../assets/hidden.svg";
import ShownIcon from "../assets/shown.svg";

const Sidebar = ({ isGroupSelectorOpen, setIsGroupSelectorOpen }) => {
  const getUsers = useChatStore((state) => state.getUsers);
  const users = useChatStore((state) => state.users);
  const getGroups = useChatStore((state) => state.getGroups);
  const groupChats = useChatStore((state) => state.groupChats);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const selectedGroup = useChatStore((state) => state.selectedGroup);
  const setSelectedGroup = useChatStore((state) => state.setSelectedGroup);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);
  const unreadMessageCounts = useChatStore(
    (state) => state.unreadMessageCounts
  );
  const updateUserLastSeen = useChatStore((state) => state.updateUserLastSeen);
  const getMessages = useChatStore((state) => state.getMessages);

  const { onlineUsers, socket, authUser: currentUser } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const [groupVisible, setGroupVisible] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  useEffect(() => {
    if (!socket) return;
    const handleUserLastSeen = ({ userId, lastSeen }) => {
      updateUserLastSeen(userId, lastSeen);
    };
    socket.on("userLastSeen", handleUserLastSeen);
    return () => socket.off("userLastSeen", handleUserLastSeen);
  }, [socket, updateUserLastSeen]);

  const filteredUsers = sortAndFilterUsers(
    users,
    onlineUsers,
    showOnlineOnly,
    currentUser?._id,
    searchTerm
  );

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    getMessages(group._id, true);
  };

  if (!users || !Array.isArray(users)) return <SidebarSkeleton />;
  if (!currentUser) return null;
  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-32 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
          {/* <button
            className="btn btn-sm ml-2 hidden lg:inline-block"
            onClick={() => setIsGroupSelectorOpen(!isGroupSelectorOpen)}
            type="button"
          >
            Create group
          </button> */}
          <button
            className="btn btn-sm ml-2"
            onClick={() => setIsGroupSelectorOpen(!isGroupSelectorOpen)}
            type="button"
          >
            {/* Show only on lg+ screens */}
            <span className="hidden lg:inline">Create group</span>

            {/* Show only below lg */}
            <span className="inline lg:hidden text-xl leading-none">＋</span>
          </button>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers ? onlineUsers.length - 1 : 0} online)
          </span>
        </div>
      </div>

      {/* Scrollable Group & User Lists */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Group Chats Section */}
        <div className="border-b border-base-300 px-3 pt-3">
          <div
            className={`flex justify-between items-center mb-2 ${
              !groupVisible ? "" : "border-b border-base-300"
            }`}
          >
            <h3 className="text-sm font-semibold text-zinc-400">Group Chats</h3>
            <button
              onClick={() => setGroupVisible((prev) => !prev)}
              className="text-zinc-400 hover:text-zinc-200 transition"
              aria-label={groupVisible ? "Hide groups" : "Show groups"}
            >
              {groupVisible ? (
                <img
                  src={ShownIcon}
                  alt="Show group chats"
                  className="w-4 h-4 opacity-35"
                />
              ) : (
                <img
                  src={HiddenIcon}
                  alt="Hide group chats"
                  className="w-4 h-4 opacity-35"
                />
              )}
            </button>
          </div>

          {groupVisible && (
            <div className="max-h-[200px] overflow-y-auto scrollbar-hide transition-all">
              {groupChats.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  You haven't joined any groups.
                </p>
              ) : (
                sortGroupsByName(groupChats).map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleGroupClick(group)}
                    className={`w-full text-left py-2 px-3 rounded hover:bg-base-300 ${
                      selectedGroup?._id === group._id
                        ? "bg-base-300 ring-1"
                        : ""
                    }`}
                  >
                    <div className="font-medium truncate">{group.name}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="mx-3 mb-2 border-b border-base-300">
          <div className="relative w-full">
            <input
              type="text"
              className="input input-sm w-full pl-9 pr-4 lg:pl-10 lg:pr-8"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-zinc-500 py-4">
              No online users
            </div>
          ) : (
            filteredUsers.map((user) => {
              const unread = unreadMessageCounts[user._id] || 0;
              return (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedGroup(null);
                    getMessages(user._id);
                  }}
                  className={`w-full p-3 flex items-center gap-3 relative hover:bg-base-300 transition-colors ${
                    selectedUser?._id === user._id ? "bg-base-300 ring-1" : ""
                  }`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id)
                        ? "Online"
                        : getLastSeen(user.lastSeen) !== "offline"
                        ? `Last seen: ${getLastSeen(user.lastSeen)}`
                        : "Offline"}
                    </div>
                  </div>
                  {unread > 0 && (
                    <span className="badge badge-sm badge-primary absolute right-4 top-4 lg:right-5 lg:top-4">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
