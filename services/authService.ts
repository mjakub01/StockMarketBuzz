
import { User } from '../types';

const USERS_KEY = 'stockbuzz_users';
const CURRENT_USER_KEY = 'stockbuzz_current_user';

// --- INIT ADMIN USER ---
const initAdmin = () => {
  const usersStr = localStorage.getItem(USERS_KEY);
  let users: any[] = usersStr ? JSON.parse(usersStr) : [];
  
  if (!users.find(u => u.email === 'admin@stockbuzz.com')) {
    const adminUser = {
      id: 'admin_1',
      name: 'Admin',
      email: 'admin@stockbuzz.com',
      password: 'admin123', // In a real app, hash this!
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

initAdmin();

export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...safeUser } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  return safeUser as User;
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find((u: any) => u.email === email)) {
    throw new Error('Email already registered');
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, 
    role: 'user',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const { password: _, ...safeUser } = newUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  
  return safeUser as User;
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
