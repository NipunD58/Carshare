// auth.js - Handles user authentication

// Authentication functions
const Auth = {
    // Current logged in user
    currentUser: null,
    
    // Register a new user
    async register(username, password, name) {
        try {
            if (!username || !password) {
                return {
                    success: false,
                    message: 'Username and password are required'
                };
            }
            
            // Check if username already exists
            const existingUser = await UserData.findUserByUsername(username);
            if (existingUser) {
                return {
                    success: false,
                    message: 'Username already exists'
                };
            }
            
            // Create and save new user
            const newUser = {
                username,
                password,
                name: name || username
            };
            
            const savedUser = await UserData.addUser(newUser);
            if (!savedUser) {
                throw new Error('Failed to save user');
            }
            
            console.log('User registered successfully:', username);
            return {
                success: true,
                message: 'Registration successful'
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed: ' + error.message
            };
        }
    },
    
    // Login user
    async login(username, password) {
        try {
            if (!username || !password) {
                return {
                    success: false,
                    message: 'Username and password are required'
                };
            }
            
            console.log('Attempting login for user:', username);
            const user = await UserData.findUserByUsername(username);
            
            if (!user) {
                console.log('User not found:', username);
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }
            
            if (user.password !== password) {
                console.log('Password mismatch for user:', username);
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }
            
            // Set current user
            this.currentUser = {
                username: user.username,
                name: user.name
            };
            
            // Save session
            await DataStore.save('currentSession', this.currentUser);
            console.log('Login successful for user:', username);
            
            return {
                success: true,
                user: this.currentUser
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed: ' + error.message
            };
        }
    },
    
    // Logout user
    async logout() {
        try {
            this.currentUser = null;
            await DataStore.remove('currentSession');
            console.log('Logout successful');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    },
    
    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },
    
    // Check for existing session
    async checkSession() {
        try {
            const session = await DataStore.get('currentSession');
            if (session && session.username) {
                this.currentUser = session;
                console.log('Session found for user:', session.username);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Session check error:', error);
            return false;
        }
    }
};