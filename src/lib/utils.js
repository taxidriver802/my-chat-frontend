import Fuse from "fuse.js";
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

console.log("🧪 RelativeTimeFormat:", rtf);

export const formatTimeAgo = (datestring) => {
  const date = new Date(datestring);
  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return "just now";

  const timeMap = [
    { unit: "minute", value: 60 },
    { unit: "hour", value: 3600 },
    { unit: "day", value: 86400 },
  ];

  for (let { unit, value } of timeMap) {
    if (diffSeconds < value * 2) {
      return rtf.format(-Math.floor(diffSeconds / (value / 60)), unit);
    }
  }

  return rtf.format(-Math.floor(diffSeconds / 86400), "day");
};

export const getLastSeen = (date) => {
  if (!date) return "Offline";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export const sortAndFilterUsers = (
  users = [],
  onlineUsers = [],
  showOnlineOnly = false,
  currentUserId,
  searchTerm = ""
) => {
  let filtered = users.filter(
    (user) => user._id?.toString() !== currentUserId?.toString()
  );

  if (showOnlineOnly) {
    filtered = filtered.filter((user) =>
      onlineUsers.includes(user._id?.toString())
    );
  }

  if (searchTerm.trim()) {
    const fuse = new Fuse(filtered, {
      keys: ["fullName"],
      threshold: 0.3,
    });

    filtered = fuse.search(searchTerm).map((result) => result.item);
  }

  return filtered.sort((a, b) => {
    const aOnline = onlineUsers.includes(a._id?.toString());
    const bOnline = onlineUsers.includes(b._id?.toString());

    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;

    const aTime = new Date(a.lastActivity || a.lastSeen || 0).getTime();
    const bTime = new Date(b.lastActivity || b.lastSeen || 0).getTime();
    return bTime - aTime;
  });
};

export const sortGroupsByName = (groups) => {
  return [...groups].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
};
