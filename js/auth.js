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
    const usersRaw = localStorage.getItem(STORAGE_USERS_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    
    // Ensure system administrator account is seeded
    if (!users['admin']) {
      users['admin'] = {
        username: 'admin',
        avatar: 'avatar1.png',
        password: 'password', // Default administration password
        fullName: 'System Administrator',
        email: 'admin@easypl.com',
        role: 'admin',
        subscription: { status: 'unlimited', expiresAt: null }
      };
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    }
    return users;
  },

  // Register a new user
  register(username, password, avatar) {
    username = username.trim();
    if (!username || !password) {
      throw new Error('Username and password are required.');
    }
    
    const normalizedUsername = username.toLowerCase();
    const bannedRaw = localStorage.getItem('easypl_banned_list');
    const bannedList = bannedRaw ? JSON.parse(bannedRaw) : [];
    
    if (bannedList.includes(normalizedUsername)) {
      throw new Error('This account/email has been permanently banned from EasyPL.');
    }
    
    const users = this.getAllUsers();
    if (users[normalizedUsername]) {
      throw new Error('Username already exists.');
    }

    const newUser = {
      username,
      avatar: avatar || 'avatar1.png',
      password: password,
      role: 'user',
      subscription: { status: 'free', expiresAt: null }
    };

    users[normalizedUsername] = newUser;
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
      avatar: user.avatar,
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || 'user',
      subscription: user.subscription || { status: 'free', expiresAt: null }
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
    const sessionData = {
      username: user.username,
      avatar: user.avatar,
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || 'user',
      subscription: user.subscription || { status: 'free', expiresAt: null }
    };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
  },

  // Update user profile details
  updateProfile(username, details) {
    username = username.trim().toLowerCase();
    const users = this.getAllUsers();
    const user = users[username];

    if (!user) {
      throw new Error('User not found.');
    }

    // Update details
    if (details.fullName !== undefined) {
      user.fullName = details.fullName.trim();
    }
    if (details.email !== undefined) {
      user.email = details.email.trim();
    }
    if (details.avatar !== undefined) {
      user.avatar = details.avatar;
    }
    if (details.password) {
      user.password = details.password;
    }

    users[username] = user;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

    // Update the active session details
    this.setCurrentUser(user);
    return user;
  },

  // Administratively toggle or update user subscription
  updateSubscription(username, status, days = 30) {
    username = username.trim().toLowerCase();
    const users = this.getAllUsers();
    const user = users[username];

    if (!user) {
      throw new Error('User not found.');
    }

    user.subscription = {
      status: status,
      expiresAt: status === 'paid' ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null
    };

    users[username] = user;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    return user;
  },

  // Administratively delete pilot account
  deleteUser(username) {
    username = username.trim().toLowerCase();
    if (username === 'admin') {
      throw new Error('Cannot delete the system administrator.');
    }
    const users = this.getAllUsers();
    if (!users[username]) {
      throw new Error('User not found.');
    }
    delete users[username];
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    
    // Purge progress logs as well
    localStorage.removeItem(`easypl_attempts_${username}`);
    return true;
  },

  // Administratively ban pilot account and blacklist username/email
  banUser(username) {
    username = username.trim().toLowerCase();
    if (username === 'admin') {
      throw new Error('Cannot ban the system administrator.');
    }
    const users = this.getAllUsers();
    const user = users[username];
    if (!user) {
      throw new Error('User not found.');
    }
    
    const bannedRaw = localStorage.getItem('easypl_banned_list');
    const bannedList = bannedRaw ? JSON.parse(bannedRaw) : [];
    
    if (!bannedList.includes(username)) {
      bannedList.push(username);
    }
    
    if (user.email) {
      const emailLower = user.email.trim().toLowerCase();
      if (!bannedList.includes(emailLower)) {
        bannedList.push(emailLower);
      }
    }
    
    localStorage.setItem('easypl_banned_list', JSON.stringify(bannedList));
    
    // Purge the account
    this.deleteUser(username);
    return true;
  }
};

