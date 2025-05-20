const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Create database directory if it doesn't exist
const DB_DIR = path.join(__dirname, 'db');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
    console.log('Created database directory: ' + DB_DIR);
}

// Define file paths for data storage
const FILES = {
    users: path.join(DB_DIR, 'users.json'),
    trips: path.join(DB_DIR, 'trips.json'),
    currentSession: path.join(DB_DIR, 'session.json')
};

// Initialize files if they don't exist
Object.entries(FILES).forEach(([key, filePath]) => {
    if (!fs.existsSync(filePath)) {
        let initialData = [];
        
        // Add admin user to users file
        if (key === 'users') {
            initialData = [{ username: 'admin', password: 'admin123', name: 'Admin User' }];
        }
        
        // Initialize empty session
        if (key === 'currentSession') {
            initialData = {};
        }
        
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
        console.log(`Initialized ${key} file at ${filePath}`);
    }
});

// Helper functions for file operations
function readFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return null;
    }
}

function writeFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        return false;
    }
}

// API Routes

// GET all data for a specific type
app.get('/api/:type', (req, res) => {
    const { type } = req.params;
    const filePath = FILES[type];
    
    if (!filePath) {
        return res.status(404).json({ error: `Invalid type: ${type}` });
    }
    
    const data = readFile(filePath);
    if (data === null) {
        return res.status(500).json({ error: `Error reading ${type} data` });
    }
    
    // Add delay to simulate network latency (helpful for testing)
    setTimeout(() => {
        res.json(data);
    }, 200);
});

// PUT (update) data for a specific type
app.put('/api/:type', (req, res) => {
    const { type } = req.params;
    const filePath = FILES[type];
    
    if (!filePath) {
        return res.status(404).json({ error: `Invalid type: ${type}` });
    }
    
    // Validate request body
    if (!req.body) {
        return res.status(400).json({ error: 'Request body is required' });
    }
    
    // For users, ensure we maintain at least the admin user
    if (type === 'users') {
        const users = req.body;
        if (!Array.isArray(users)) {
            return res.status(400).json({ error: 'Users data must be an array' });
        }
        
        // Ensure admin user is preserved
        const hasAdmin = users.some(user => user.username === 'admin');
        if (!hasAdmin) {
            users.push({ username: 'admin', password: 'admin123', name: 'Admin User' });
        }
    }
    
    const success = writeFile(filePath, req.body);
    if (!success) {
        return res.status(500).json({ error: `Error updating ${type} data` });
    }
    
    res.json({ success: true, message: `${type} data updated successfully` });
});

// DELETE data for a specific type
app.delete('/api/:type', (req, res) => {
    const { type } = req.params;
    const filePath = FILES[type];
    
    if (!filePath) {
        return res.status(404).json({ error: `Invalid type: ${type}` });
    }
    
    // For delete, we don't actually delete the file, just reset its contents
    let emptyData = [];
    if (type === 'currentSession') {
        emptyData = {};
    }
    
    const success = writeFile(filePath, emptyData);
    if (!success) {
        return res.status(500).json({ error: `Error resetting ${type} data` });
    }
    
    res.json({ success: true, message: `${type} data reset successfully` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`JSON files stored in: ${DB_DIR}`);
});
