/**
 * Authentication Module
 * Manages client-side user sessions and registration using LocalStorage
 */

const STORAGE_USERS_KEY = 'easypl_users';
const STORAGE_SESSION_KEY = 'easypl_current_user';

export const auth = {
  // Get currently logged-in user
  getCurrentUser() {
    const session = localStorage.getItem(STORAGE_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Get all registered users
  getAllUsers() {
    const users = localStorage.getItem(STORAGE_USERS_KEY);
    return users ? JSON.parse(users) : {};
  },

  // Register a new user
  register(username, password, avatar) {
    username = username.trim();
    if (!username || !password) {
      throw new Error('Username and password are required.');
    }
    
    const users = this.getAllUsers();
    if (users[username.toLowerCase()]) {
      throw new Error('Username already exists.');
    }

    const newUser = {
      username,
      avatar: avatar || 'avatar1.png',
      // Store a simple hash or just plain password for local demo
      password: password 
    };

    users[username.toLowerCase()] = newUser;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    
    // Log the user in immediately
    this.setCurrentUser(newUser);
    return newUser;
  },

  // Log in an existing user
  login(username, password) {
    username = username.trim().toLowerCase();
    const users = this.getAllUsers();
    const user = users[username];

    if (!user || user.password !== password) {
      throw new Error('Invalid username or password.');
    }

    const sessionUser = {
      username: user.username,
      avatar: user.avatar
    };

    this.setCurrentUser(sessionUser);
    return sessionUser;
  },

  // Log out the user
  logout() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  },

  // Set the current user session
  setCurrentUser(user) {
    // We don't want to store the password in the active session
    const sessionData = {
      username: user.username,
      avatar: user.avatar
    };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
  }
};
