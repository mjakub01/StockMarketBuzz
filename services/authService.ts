
import { User } from '../types';

const USERS_KEY = 'stockbuzz_users';
const CURRENT_USER_KEY = 'stockbuzz_current_user';

// --- HELPER: HASH PASSWORD ---
const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// --- INIT ADMIN USER ---
const initAdmin = async () => {
  const usersStr = localStorage.getItem(USERS_KEY);
  let users: any[] = usersStr ? JSON.parse(usersStr) : [];
  
  if (!users.find(u => u.email === 'admin@stockbuzz.com')) {
    const hashedPass = await hashPassword('admin123');
    const adminUser = {
      id: 'admin_1',
      name: 'Admin',
      email: 'admin@stockbuzz.com',
      password: hashedPass, 
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

// Initialize admin on load (async IIFE)
(async () => { await initAdmin(); })();

export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const hashedInput = await hashPassword(password);
  
  const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedInput);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...safeUser } = user;
  // Create session
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  return safeUser as User;
};

export const registerUser = async (name: string, email: string, password: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered');
  }

  const hashedPass = await hashPassword(password);

  const newUser = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password: hashedPass, 
    role: 'user',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // NOTE: We do NOT auto-login here. User must log in explicitly.
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// --- ADMIN FUNCTIONS ---

export const getAllUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  return users.map((u: any) => {
    const { password, ...safe } = u;
    return safe;
  });
};

export const deleteUser = async (userId: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  users = users.filter((u: any) => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
