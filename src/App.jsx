import Navbar from "./components/Navbar";
import GroupSelector from "./components/GroupSelector";

import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";

import { Loader } from "lucide-react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import axios from "axios";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const {
    subscribeToMessages,
    unsubscribeFromMessages,
    fetchUnreadCounts,
    users,
    getGroups,
    selectedGroup,
  } = useChatStore();
  const { theme } = useThemeStore();

  const [isGroupSelectorOpen, setIsGroupSelectorOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      fetchUnreadCounts();
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [authUser, subscribeToMessages, unsubscribeFromMessages]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  const handleCreateGroupSubmit = async (groupName, selectedUserIds) => {
    try {
      const response = await axios.post(
        "/api/groups",
        {
          name: groupName,
          userIds: selectedUserIds,
        },
        { withCredentials: true }
      );
      await getGroups();

      setIsGroupSelectorOpen(false);
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <div data-theme={theme}>
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={
              authUser ? (
                <HomePage
                  isGroupSelectorOpen={isGroupSelectorOpen}
                  setIsGroupSelectorOpen={setIsGroupSelectorOpen}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/signup"
            element={!authUser ? <SignupPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>

        {isGroupSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-base-100 rounded-xl shadow-lg p-6 w-[90%] max-w-md">
              <GroupSelector
                onClose={() => setIsGroupSelectorOpen(false)}
                onSubmit={handleCreateGroupSubmit}
                users={users}
                groupId={selectedGroup?._id}
                existingGroup={selectedGroup}
              />
            </div>
          </div>
        )}

        <Toaster />
      </div>
    </div>
  );
};
export default App;
