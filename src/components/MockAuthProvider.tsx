import { createContext, ReactNode, useContext } from "react";

// Mock user data
const mockUser = {
  id: "mock_user_id",
  username: "testuser",
  firstName: "Test",
  lastName: "User",
  imageUrl: "https://via.placeholder.com/100",
  publicMetadata: {
    bio: "I don't wanna end up like Muqtada\nLive in the moment",
    instagram: "testuser",
    youtube: "TestUserChannel",
    tiktok: "testuser"
  },
  update: async (data: any) => {
    console.log("Mock update user data:", data);
    return Promise.resolve(data);
  }
};

// Mock auth context
type MockAuthContextType = {
  isSignedIn: boolean;
  user: typeof mockUser;
  signOut: () => Promise<void>;
};

const MockAuthContext = createContext<MockAuthContextType>({
  isSignedIn: true,
  user: mockUser,
  signOut: async () => {}
});

// Mock provider component
export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const signOut = async () => {
    console.log("Mock sign out");
    return Promise.resolve();
  };

  const value = {
    isSignedIn: true, // Always signed in for development
    user: mockUser,
    signOut
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

// Hook to use mock auth
export const useMockAuth = () => useContext(MockAuthContext);
export const useMockUser = () => useContext(MockAuthContext).user;
