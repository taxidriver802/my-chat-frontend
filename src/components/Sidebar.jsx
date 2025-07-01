import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  Users,
  Search,
  Circle,
  CirclePlus,
  Eye,
  EyeClosed,
} from "lucide-react";
import {
  getLastSeen,
  sortAndFilterUsers,
  sortGroupsByName,
} from "../lib/utils";

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

  useEffect(() => {
    if (!socket) return;

    socket.on("group:membersAdded", ({ groupId }) => {
      getGroups(); // refetch when notified
    });

    return () => socket.off("group:membersAdded");
  }, [socket]);

  if (!users || !Array.isArray(users)) return <SidebarSkeleton />;
  if (!currentUser) return null;
  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-32 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}

      {/* Scrollable Group & User Lists */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Group Chats Section */}
        <div className="border-b border-base-300 px-3 py-3">
          <div
            className={`flex justify-between items-center mb-2 ${
              !groupVisible ? "" : "border-b border-base-300"
            }`}
          >
            <h3 className="text-sm mb-2 font-semibold text-zinc-400 flex items-center gap-2">
              <Users className="size-4 text-zinc-400" />
              Group Chats
            </h3>
            <div className="flex flex-row space-x-2 relative">
              {/* Toggle Group Visibility Button */}
              <div className="relative group">
                <button
                  onClick={() => setGroupVisible((prev) => !prev)}
                  className="text-zinc-400 hover:text-zinc-200 transition "
                  aria-label={groupVisible ? "Hide groups" : "Show groups"}
                >
                  {groupVisible ? (
                    <Eye className="w-5 h-5 opacity-70" />
                  ) : (
                    <EyeClosed className="w-5 h-5 opacity-70" />
                  )}
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-max px-2 py-1 rounded bg-base-200 text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  {groupVisible ? "Hide groups" : "Show groups"}
                </div>
              </div>

              {/* Create Group Button */}
              <div className="relative group">
                <button
                  className="opacity-80"
                  onClick={() => setIsGroupSelectorOpen(!isGroupSelectorOpen)}
                  type="button"
                >
                  <CirclePlus className="ml-1 w-4 h-4 text-zinc-400" />
                </button>
                <div className="absolute -right-0.5 mt-1 w-max px-2 py-1 rounded bg-base-200 text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  Create group
                </div>
              </div>
            </div>
          </div>

          {groupVisible && (
            <div className="max-h-[200px] p-1 overflow-y-auto scrollbar-hide transition-all">
              {groupChats.length === 0 ? (
                <p className=" mb-2 text-xs text-zinc-500">
                  You haven't joined any groups.
                </p>
              ) : (
                sortGroupsByName(groupChats).map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleGroupClick(group)}
                    className={`w-full text-left mb-1 py-2 px-3 rounded-[100px] hover:bg-base-300 ${
                      selectedGroup?._id === group._id
                        ? "bg-base-300 ring-1"
                        : ""
                    }`}
                  >
                    <div className="relative mx-auto lg:mx-0 flex flex-row items-center gap-2">
                      <img
                        src={group.groupPic || "/avatar.png"}
                        alt={group.name}
                        className="size-12 object-cover rounded-full"
                      />
                      <div className="font-medium truncate">{group.name}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex flex-row mx-3 pb-1 border-b border-base-300">
          <div className="relative w-full">
            <input
              type="text"
              className="input input-sm w-full mt-1 pl-7 pr-0 md:pl-9 md:pr-4 lg:pl-10 lg:pr-8"
              placeholder="Friends"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Group wrapper for icon and tooltip */}
          <div className="relative group">
            <button
              className="mt-2 ml-2 p-1 text-zinc-400 hover:text-zinc-200 transition"
              onClick={() => setShowOnlineOnly((prev) => !prev)}
              type="button"
              aria-label={
                showOnlineOnly ? "Hide offline users" : "Show all users"
              }
            >
              {showOnlineOnly ? (
                <Circle className="w-5 h-5 opacity-75 bg-primary rounded-full" />
              ) : (
                <Circle className="w-5 h-5 opacity-75" />
              )}
            </button>
            <div className="absolute -right-2.5 top-full mt-1 w-max px-2 py-1 rounded bg-base-200 text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              {showOnlineOnly ? "Show all users" : "Hide offline users"}
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3">
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
                  className={`w-full p-3 flex items-center gap-3 relative hover:bg-base-300 transition-colors mb-1 rounded-[100px] ${
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
