// app.js - Main application entry point

// DOM elements
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const mainContainer = document.getElementById('main-container');
const dbViewerContainer = document.getElementById('db-viewer-container');

// Login form elements
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const showRegisterBtn = document.getElementById('show-register-btn');
const loginMessage = document.getElementById('login-message');

// Registration form elements
const regUsernameInput = document.getElementById('reg-username');
const regPasswordInput = document.getElementById('reg-password');
const regNameInput = document.getElementById('reg-name');
const registerBtn = document.getElementById('register-btn');
const showLoginBtn = document.getElementById('show-login-btn');
const registerMessage = document.getElementById('register-message');

// Main app elements
const logoutBtn = document.getElementById('logout-btn');
const viewDbBtn = document.getElementById('view-db-btn');
const backToAppBtn = document.getElementById('back-to-app-btn');
const currentUserSpan = document.getElementById('current-user');

// Database viewer elements
const tabButtons = document.querySelectorAll('.tab-btn');
const usersTableBody = document.getElementById('users-table-body');
const tripsTableBody = document.getElementById('trips-table-body');

// Error handling for debugging
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.message, 'at', e.filename, 'line', e.lineno);
    alert('An error occurred: ' + e.message);
});

// Initialize application
async function initApp() {
    // Check for existing session
    if (await Auth.checkSession()) {
        showMainApp();
    } else {
        showLoginForm();
    }
    
    // Bind events
    bindEvents();
    
    // Initialize components
    Calendar.initialize();
    TripManager.initialize();
    DbViewer.initialize();
}

// Bind application events
function bindEvents() {
    // Form toggle buttons
    showRegisterBtn.addEventListener('click', showRegisterForm);
    showLoginBtn.addEventListener('click', showLoginForm);
    
    // Login form events
    loginBtn.addEventListener('click', handleLogin);
    
    // Register form events
    registerBtn.addEventListener('click', handleRegister);
    
    // Main app events
    logoutBtn.addEventListener('click', handleLogout);
    viewDbBtn.addEventListener('click', showDbViewer);
    backToAppBtn.addEventListener('click', showMainApp);
    
    // Database viewer events
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabId = e.target.dataset.tab;
            DbViewer.switchTab(tabId);
        });
    });
    
    // Enable enter key on login form
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    // Enable enter key on register form
    regPasswordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleRegister();
        }
    });
}

// Show login form
function showLoginForm() {
    loginContainer.classList.remove('hidden');
    registerContainer.classList.add('hidden');
    mainContainer.classList.add('hidden');
    dbViewerContainer.classList.add('hidden');
    
    // Clear form
    usernameInput.value = '';
    passwordInput.value = '';
    loginMessage.textContent = '';
}

// Show registration form
function showRegisterForm() {
    loginContainer.classList.add('hidden');
    registerContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    dbViewerContainer.classList.add('hidden');
    
    // Clear form
    regUsernameInput.value = '';
    regPasswordInput.value = '';
    regNameInput.value = '';
    registerMessage.textContent = '';
}

// Show main application
function showMainApp() {
    loginContainer.classList.add('hidden');
    registerContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    dbViewerContainer.classList.add('hidden');
    
    // Update user info
    const currentUser = Auth.getCurrentUser();
    currentUserSpan.textContent = `Welcome, ${currentUser.name}`;
    
    // Reset form states
    usernameInput.value = '';
    passwordInput.value = '';
    loginMessage.textContent = '';
    loginMessage.classList.remove('success-message');
    
    regUsernameInput.value = '';
    regPasswordInput.value = '';
    regNameInput.value = '';
    registerMessage.textContent = '';
    registerMessage.classList.remove('success-message');
}

// Show database viewer
function showDbViewer() {
    loginContainer.classList.add('hidden');
    registerContainer.classList.add('hidden');
    mainContainer.classList.add('hidden');
    dbViewerContainer.classList.remove('hidden');
    
    // Refresh the data in the database viewer
    DbViewer.refreshData();
}

// Handle login
async function handleLogin() {
    try {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            loginMessage.textContent = 'Please enter username and password';
            loginMessage.classList.remove('success-message');
            return;
        }
        
        // Show loading indicator
        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Logging in...';
        loginMessage.textContent = '';
        
        console.log("Attempting login with username:", username);
        const result = await Auth.login(username, password);
        
        // Reset button
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Login';
        
        if (result.success) {
            loginMessage.textContent = 'Login successful!';
            loginMessage.classList.add('success-message');
            
            setTimeout(() => {
                showMainApp();
            }, 1000);
        } else {
            loginMessage.textContent = result.message || 'Login failed';
            loginMessage.classList.remove('success-message');
        }
    } catch (error) {
        console.error("Login error:", error);
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Login';
        loginMessage.textContent = 'An error occurred during login';
        loginMessage.classList.remove('success-message');
    }
}

// Handle register
async function handleRegister() {
    try {
        const username = regUsernameInput.value.trim();
        const password = regPasswordInput.value.trim();
        const name = regNameInput.value.trim();
        
        if (!username || !password) {
            registerMessage.textContent = 'Please enter username and password';
            registerMessage.classList.remove('success-message');
            return;
        }
        
        // Show loading indicator
        registerBtn.disabled = true;
        registerBtn.innerHTML = 'Registering...';
        registerMessage.textContent = '';
        
        console.log("Attempting registration with username:", username);
        const result = await Auth.register(username, password, name);
        
        // Reset button
        registerBtn.disabled = false;
        registerBtn.innerHTML = 'Register';
        
        if (result.success) {
            registerMessage.textContent = 'Registration successful. You can now log in.';
            registerMessage.classList.add('success-message');
            
            // Automatically switch to login form after 2 seconds
            setTimeout(() => {
                showLoginForm();
                loginMessage.textContent = 'Registration successful. Please log in.';
                loginMessage.classList.add('success-message');
            }, 2000);
        } else {
            registerMessage.textContent = result.message || 'Registration failed';
            registerMessage.classList.remove('success-message');
        }
    } catch (error) {
        console.error("Registration error:", error);
        registerBtn.disabled = false;
        registerBtn.innerHTML = 'Register';
        registerMessage.textContent = 'An error occurred during registration';
        registerMessage.classList.remove('success-message');
    }
}

// Handle logout
async function handleLogout() {
    await Auth.logout();
    showLoginForm();
}

// Database Viewer Module
const DbViewer = {
    // Initialize database viewer
    initialize: function() {
        console.log("Initializing DbViewer"); // Debug log
    },
    
    // Switch between tabs
    switchTab: function(tabId) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab content
        document.getElementById(tabId).classList.remove('hidden');
        
        // Add active class to clicked button
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Refresh data when switching tabs
        this.refreshData();
    },
    
    // Refresh data in tables
    async refreshData() {
        try {
            console.log("Refreshing database data"); // Debug log
            await this.populateUsersTable();
            await this.populateTripsTable();
        } catch (error) {
            console.error("Error refreshing data:", error);
            alert("There was a problem loading data. Please try again.");
        }
    },
    
    // Populate users table
    async populateUsersTable() {
        try {
            console.log("Populating users table"); // Debug log
            const users = await UserData.getAllUsers();
            console.log("Users fetched:", users); // Debug log
            
            if (!users || !Array.isArray(users)) {
                console.error("Invalid users data:", users);
                return;
            }
            
            usersTableBody.innerHTML = '';
            
            if (users.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 2;
                cell.textContent = 'No users found';
                cell.style.textAlign = 'center';
                row.appendChild(cell);
                usersTableBody.appendChild(row);
                return;
            }
            
            users.forEach(user => {
                const row = document.createElement('tr');
                
                const usernameCell = document.createElement('td');
                usernameCell.textContent = user.username;
                
                const nameCell = document.createElement('td');
                nameCell.textContent = user.name;
                
                row.appendChild(usernameCell);
                row.appendChild(nameCell);
                
                usersTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error populating users table:", error);
            usersTableBody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: red;">Error loading user data</td></tr>';
        }
    },
    
    // Populate trips table
    async populateTripsTable() {
        try {
            console.log("Populating trips table"); // Debug log
            const trips = await TripData.getAllTrips();
            console.log("Trips fetched:", trips); // Debug log
            
            if (!trips || !Array.isArray(trips)) {
                console.error("Invalid trips data:", trips);
                return;
            }
            
            tripsTableBody.innerHTML = '';
            
            if (trips.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 6;
                cell.textContent = 'No trips found';
                cell.style.textAlign = 'center';
                row.appendChild(cell);
                tripsTableBody.appendChild(row);
                return;
            }
            
            trips.forEach(trip => {
                const row = document.createElement('tr');
                
                // Format date
                const tripDate = new Date(trip.date);
                const dateCell = document.createElement('td');
                dateCell.textContent = tripDate.toLocaleDateString();
                
                // Driver
                const driverCell = document.createElement('td');
                driverCell.textContent = trip.driver;
                
                // Direction and payer
                const payerCell = document.createElement('td');
                const directionText = trip.direction === 'going' ? 'Going' : 'Coming Back';
                payerCell.innerHTML = `<strong>${directionText}:</strong> ${trip.payer.name}`;
                
                // Fare with direction
                const fareCell = document.createElement('td');
                fareCell.innerHTML = `<strong>${directionText}:</strong> $${parseFloat(trip.fare).toFixed(2)}`;
                
                // Participants (only show those who attended)
                const participantsCell = document.createElement('td');
                const attendingParticipants = trip.participants.filter(p => p.attended);
                
                if (attendingParticipants.length > 0) {
                    const participantsList = document.createElement('ul');
                    participantsList.style.listStyle = 'none';
                    participantsList.style.padding = '0';
                    participantsList.style.margin = '0';
                    
                    attendingParticipants.forEach(participant => {
                        const listItem = document.createElement('li');
                        listItem.textContent = participant.name;
                        participantsList.appendChild(listItem);
                    });
                    
                    participantsCell.appendChild(participantsList);
                } else {
                    participantsCell.textContent = 'No participants attended';
                }
                
                // Actions Cell - Add delete button
                const actionsCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn-danger btn-small';
                deleteButton.textContent = 'Delete';
                deleteButton.dataset.tripId = trip.id;
                deleteButton.addEventListener('click', (e) => {
                    this.deleteTrip(trip.id);
                    e.stopPropagation(); // Prevent row click event
                });
                
                actionsCell.appendChild(deleteButton);
                
                row.appendChild(dateCell);
                row.appendChild(driverCell);
                row.appendChild(payerCell);
                row.appendChild(fareCell);
                row.appendChild(participantsCell);
                row.appendChild(actionsCell);
                
                tripsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error populating trips table:", error);
            tripsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading trip data</td></tr>';
        }
    },
    
    // Delete trip from database viewer
    async deleteTrip(tripId) {
        try {
            if (confirm('Are you sure you want to delete this trip?')) {
                console.log("Deleting trip:", tripId); // Debug log
                const result = await TripData.deleteTrip(tripId);
                
                if (!result) {
                    throw new Error("Failed to delete trip");
                }
                
                alert("Trip deleted successfully");
                await this.refreshData();
                await Calendar.renderCalendar();
            }
        } catch (error) {
            console.error("Error deleting trip:", error);
            alert("There was a problem deleting the trip. Please try again.");
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);