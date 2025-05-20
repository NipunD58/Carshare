// data.js - Handles data storage and retrieval

// API service for database operations
const ApiService = {
    // Base URL for the API
    baseUrl: 'http://localhost:3000/api',
    
    // Generic GET request
    async get(endpoint) {
        try {
            console.log(`API GET request to ${endpoint}`);
            const response = await fetch(`${this.baseUrl}/${endpoint}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log(`API GET response from ${endpoint}:`, data);
            return data;
        } catch (error) {
            console.error('API GET error:', error);
            return null;
        }
    },
    
    // Generic PUT request
    async put(endpoint, data) {
        try {
            console.log(`API PUT request to ${endpoint}:`, data);
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error: ${response.status} - ${errorText}`);
            }
            const result = await response.json();
            console.log(`API PUT response from ${endpoint}:`, result);
            return result;
        } catch (error) {
            console.error('API PUT error:', error);
            return null;
        }
    },
    
    // Generic DELETE request
    async delete(endpoint) {
        try {
            console.log(`API DELETE request to ${endpoint}`);
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const result = await response.json();
            console.log(`API DELETE response from ${endpoint}:`, result);
            return result;
        } catch (error) {
            console.error('API DELETE error:', error);
            return null;
        }
    }
};

// DataStore for data management with file storage
const DataStore = {
    // Cache for data to avoid frequent server requests
    cache: {},
    
    // Initialize the data
    async initializeData() {
        try {
            console.log("Initializing data from JSON files");
            // Check connection to server and initialize data if needed
            const users = await ApiService.get('users');
            const trips = await ApiService.get('trips');
            
            if (users) this.cache.users = users;
            if (trips) this.cache.trips = trips;
            
            console.log("Data initialized successfully");
        } catch (error) {
            console.error('Failed to initialize data from server:', error);
            // Fallback to localStorage if server is unavailable
            this.initializeLocalData();
        }
    },
    
    // Initialize localStorage data (fallback)
    initializeLocalData() {
        console.log("Falling back to localStorage initialization");
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([
                { username: 'admin', password: 'admin123', name: 'Admin User' }
            ]));
        }
        
        if (!localStorage.getItem('trips')) {
            localStorage.setItem('trips', JSON.stringify([]));
        }
    },
    
    // Save data to file storage
    async save(key, data) {
        try {
            console.log(`Saving ${key} data:`, data);
            // Update cache
            this.cache[key] = data;
            
            // Send to server to save in JSON file
            const result = await ApiService.put(key, data);
            
            if (!result || !result.success) {
                throw new Error(`Server returned unsuccessful result: ${JSON.stringify(result)}`);
            }
            
            console.log(`Saved ${key} data successfully`);
            return true;
        } catch (error) {
            console.error(`Failed to save ${key} to server:`, error);
            // Fallback to localStorage
            console.log(`Falling back to localStorage for ${key}`);
            localStorage.setItem(key, JSON.stringify(data));
            return false;
        }
    },
    
    // Get data from file storage
    async get(key) {
        try {
            // Try to get from cache first for performance
            if (this.cache[key]) {
                console.log(`Using cached ${key} data`);
                return this.cache[key];
            }
            
            console.log(`Fetching ${key} data from server`);
            // Get from server
            const data = await ApiService.get(key);
            
            if (data !== null) {
                console.log(`Retrieved ${key} data from server:`, data);
                this.cache[key] = data;
                return data;
            }
            
            throw new Error(`Server returned null for ${key}`);
        } catch (error) {
            console.error(`Failed to get ${key} from server:`, error);
            
            // Fallback to localStorage
            console.log(`Falling back to localStorage for ${key}`);
            const localData = localStorage.getItem(key);
            return localData ? JSON.parse(localData) : null;
        }
    },
    
    // Remove data
    async remove(key) {
        try {
            console.log(`Removing ${key} data`);
            // Remove from cache
            delete this.cache[key];
            
            // Remove from server
            const result = await ApiService.delete(key);
            
            if (!result || !result.success) {
                throw new Error(`Server returned unsuccessful result: ${JSON.stringify(result)}`);
            }
            
            console.log(`Removed ${key} data successfully`);
            
            // Also remove from localStorage for consistency
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Failed to remove ${key} from server:`, error);
            // Still remove from localStorage as fallback
            localStorage.removeItem(key);
            return false;
        }
    }
};

// User related data functions
const UserData = {
    // Get all users
    getAllUsers: async function() {
        try {
            console.log("Getting all users");
            const users = await DataStore.get('users');
            return users || [];
        } catch (error) {
            console.error("Error getting users:", error);
            return [];
        }
    },
    
    // Add a new user
    addUser: async function(user) {
        try {
            console.log("Adding new user:", user.username);
            const users = await this.getAllUsers();
            
            // Check if user already exists
            const existingUser = users.find(u => u.username === user.username);
            if (existingUser) {
                console.error("User already exists:", user.username);
                return null;
            }
            
            users.push(user);
            const success = await DataStore.save('users', users);
            
            if (!success && typeof success !== 'boolean') {
                throw new Error("Failed to save user data");
            }
            
            console.log("User added successfully:", user.username);
            return user;
        } catch (error) {
            console.error("Error adding user:", error);
            return null;
        }
    },
    
    // Find a user by username
    findUserByUsername: async function(username) {
        try {
            console.log(`Finding user with username: ${username}`);
            const users = await this.getAllUsers();
            const user = users.find(user => user.username === username);
            console.log("Found user:", user);
            return user;
        } catch (error) {
            console.error(`Error finding user ${username}:`, error);
            return null;
        }
    },
    
    // Update a user
    updateUser: async function(updatedUser) {
        const users = await this.getAllUsers();
        const index = users.findIndex(user => user.username === updatedUser.username);
        
        if (index !== -1) {
            users[index] = updatedUser;
            await DataStore.save('users', users);
            return true;
        }
        return false;
    }
};

// Trip related data functions
const TripData = {
    // Get all trips
    getAllTrips: async function() {
        try {
            console.log("Getting all trips");
            const trips = await DataStore.get('trips');
            return trips || [];
        } catch (error) {
            console.error("Error getting trips:", error);
            return [];
        }
    },
    
    // Add a new trip
    addTrip: async function(trip) {
        try {
            console.log("Adding new trip:", trip);
            const trips = await this.getAllTrips();
            
            // Create an ID for the trip
            trip.id = Date.now().toString();
            trips.push(trip);
            
            await DataStore.save('trips', trips);
            console.log("Trip saved successfully");
            return trip;
        } catch (error) {
            console.error("Error adding trip:", error);
            return null;
        }
    },
    
    // Get trips by date
    getTripsByDate: async function(date) {
        try {
            console.log(`Getting trips for date: ${date}`);
            const trips = await this.getAllTrips();
            const dateTrips = trips.filter(trip => trip.date === date);
            console.log("Found trips:", dateTrips);
            return dateTrips;
        } catch (error) {
            console.error(`Error getting trips for date ${date}:`, error);
            return [];
        }
    },
    
    // Get trip by ID
    getTripById: async function(id) {
        const trips = await this.getAllTrips();
        return trips.find(trip => trip.id === id);
    },
    
    // Update a trip
    updateTrip: async function(updatedTrip) {
        const trips = await this.getAllTrips();
        const index = trips.findIndex(trip => trip.id === updatedTrip.id);
        
        if (index !== -1) {
            trips[index] = updatedTrip;
            await DataStore.save('trips', trips);
            return true;
        }
        return false;
    },
    
    // Delete a trip
    deleteTrip: async function(tripId) {
        const trips = await this.getAllTrips();
        const filteredTrips = trips.filter(trip => trip.id !== tripId);
        
        if (filteredTrips.length < trips.length) {
            await DataStore.save('trips', filteredTrips);
            return true;
        }
        return false;
    },
    
    // Get trips for a specific month
    getTripsForMonth: async function(year, month) {
        const trips = await this.getAllTrips();
        return trips.filter(trip => {
            const tripDate = new Date(trip.date);
            return tripDate.getFullYear() === year && tripDate.getMonth() === month;
        });
    }
};

// Initialize data when the app starts
DataStore.initializeData();