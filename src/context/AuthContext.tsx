import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import {
  clearSession, // helper function that is used to  clear the session = log out 
  getSessionUserId, // get the current user who is logged in
  getUsers, // get all the list of users
  saveUsers, // save the users into the save users list
  setSessionUserId, 
} from '../utils/storage';

//Describes what  we get after a person tries to register oe login
type AuthResult = { success: boolean; error?: string };

// This  is everything that is inside the shared box
interface AuthContextType {
  user: User | null;  //This is someone who is logged in
  loading: boolean; //Loading the data
  register: (email: string, username: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (
  currentPassword: string,
  changes: { username?: string; email?: string; newPassword?: string }
) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Checks whether was already logged in before closing the app
  //This will restore your account without asking  a user to log in
  // called RESTORING A SESSION
  useEffect(() => {
    async function restoreSession() {
      //Get the Id of a previously logged in user
      const id = await getSessionUserId();
      if (id) {
        //If id is true


        const users = await getUsers(); // gets all registered users
        //looks for a user that matches the Id that we got from the sessionUser
        const found = users.find((u) => u.id === id);

        //This will update the applictaaio with the logged on user information
        if (found) setUser(found);
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  async function register(email: string, username: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const users = await getUsers();
    //checks if the email already exist or  not
    //some ....if it finds atleast one user that has an email then it will stop checking the remaining users.
    if (users.some((u) => u.email === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
   

    //Create a new user,

    const newUser: User = {
      id: Date.now().toString(),
      email: cleanEmail,
      username: username.trim(),
      password,
    };
    // Add the new user to the list of users
    await saveUsers([...users, newUser]);
    //saves the new user as the current session Id
    await setSessionUserId(newUser.id);
    //updates the swystem with the newly created user
    setUser(newUser);

    return { success: true };
  }

  async function login(email: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    //get all users
    const users = await getUsers();
    //fnd the user using the same email and password
    const found = users.find((u) => u.email === cleanEmail && u.password === password);
    //If the user is not found an error will be printed.
    if (!found) {
      return { success: false, error: 'Incorrect email or password.' };
    }
    //If found  set the user as the current user
    await setSessionUserId(found.id);
    //Update the app with the user's information
    setUser(found);
    return { success: true };
  }
//This loogs the user out by removing the user from
  async function logout() {
    await clearSession();
    setUser(null);
  }
async function updateProfile(
  currentPassword: string,
  changes: { username?: string; email?: string; newPassword?: string }
): Promise<void> {
  if (!user) throw new Error('Not logged in');

  const users = await getUsers();
  const me = users.find((u) => u.id === user.id);
  if (!me) throw new Error('User not found');

  // Re-check the password before allowing any change
  if (me.password !== currentPassword) {
    throw new Error('Current password is incorrect');
  }

  const email = changes.email?.trim().toLowerCase() ?? me.email;
  if (email !== me.email && users.some((u) => u.email === email)) {
    throw new Error('That email is already in use');
  }

  const updated: User = {
    ...me,
    email,
    username: changes.username?.trim() || me.username,
    password: changes.newPassword || me.password,
  };

  await saveUsers(users.map((u) => (u.id === me.id ? updated : u)));
  setUser(updated);
}
  return (
    //AuthContext.Provider shares authentication information
    <AuthContext.Provider value={{ user, loading, register, login, logout,updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
//AuthContext.Provider allows other components to access that information
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}