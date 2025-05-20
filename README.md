# CarShare Application

A web application for managing car sharing trips with physical JSON file storage.

## Features

- User authentication (login/register)
- Calendar view for trip management
- Add/edit/delete trips
- Add participants
- Database viewer
- JSON file storage for persistence

## Setup Instructions

1. Install Node.js (if not already installed)
2. Clone or download this repository
3. Open a terminal in the project directory
4. Install dependencies:
   ```
   npm install
   ```
5. Start the server:
   ```
   npm start
   ```
6. Open a web browser and navigate to:
   ```
   http://localhost:3000
   ```

## Data Storage

This application stores data in physical JSON files located in the `db` directory:

- `users.json` - User accounts
- `trips.json` - Trip information
- `session.json` - Current user session

The JSON files are automatically created when the server starts if they don't exist.

## Default Login

Username: admin  
Password: admin123

## Technologies Used

- HTML/CSS/JavaScript
- Node.js
- Express.js
- JSON file-based database
