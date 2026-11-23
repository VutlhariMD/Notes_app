import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, User } from '../types';

const KEYS = {
  users: 'users', // Key for all the users
  notes: 'notes', // key for all the notes
  session: 'currentUserId', // key for the current users
};


export async function getUsers(): Promise<User[]> {
  const json = await AsyncStorage.getItem(KEYS.users);
  return json ? JSON.parse(json) : [];
}

export async function saveUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.users, JSON.stringify(users));
}


export async function getNotes(): Promise<Note[]> {
  const json = await AsyncStorage.getItem(KEYS.notes);
  return json ? JSON.parse(json) : [];
}

export async function saveNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.notes, JSON.stringify(notes));
}
//edit notes

export async function getSessionUserId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.session);
}

export async function setSessionUserId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.session, id);
}
//Clear session is used for logging out the logged in person
export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.session);
}