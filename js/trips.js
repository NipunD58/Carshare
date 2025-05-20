// trips.js - Handles trip management

const TripManager = {
    // Current trip date and selected trip ID
    currentTripDate: null,
    currentTripId: null,
    
    // Initialize trips functionality
    initialize: function() {
        this.bindEvents();
    },
    
    // Bind trip-related events
    bindEvents: function() {
        // Close modal
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Save trip
        document.getElementById('save-trip-btn').addEventListener('click', () => {
            this.saveTrip();
        });
        
        // Delete trip
        document.getElementById('delete-trip-btn').addEventListener('click', () => {
            this.deleteTrip();
        });
        
        // Add new trip
        document.getElementById('add-trip-btn').addEventListener('click', () => {
            this.showNewTripForm();
        });
        
        // Back to list
        document.getElementById('back-to-list-btn').addEventListener('click', () => {
            this.showTripList();
        });
        
        // Cancel trip creation
        document.getElementById('cancel-trip-btn').addEventListener('click', () => {
            this.showTripList();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
        
        // Add participant button
        document.getElementById('add-participant-btn').addEventListener('click', () => {
            this.showAddParticipantForm();
        });
        
        // Submit new participant
        document.getElementById('save-participant-btn').addEventListener('click', () => {
            this.saveNewParticipant();
        });
        
        // Cancel add participant
        document.getElementById('cancel-participant-btn').addEventListener('click', () => {
            this.hideAddParticipantForm();
        });
    },
    
    // Open trip modal for a specific date
    async openTripModal(date, directAdd = false) {
        console.log("Opening trip modal for date:", date, "directAdd:", directAdd);  // Debug log
        this.currentTripDate = date;
        this.currentTripId = null;
        
        // Format date for display
        const displayDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('trip-date').textContent = displayDate;
        
        if (directAdd) {
            // Skip checking for trips and show new trip form directly
            this.showNewTripForm();
        } else {
            // Check if trips exist for this date
            const trips = await TripData.getTripsByDate(date);
            
            if (!trips || trips.length === 0) {
                // No trips found, show new trip form
                this.showNewTripForm();
            } else {
                // Trips found, show trip list
                await this.showTripList();
            }
        }
        
        // Show modal
        document.getElementById('trip-modal').classList.remove('hidden');
    },
    
    // Close trip modal
    closeModal: function() {
        document.getElementById('trip-modal').classList.add('hidden');
        this.currentTripDate = null;
        this.currentTripId = null;
    },
    
    // Show trip list
    showTripList: function() {
        // Hide other views
        document.getElementById('trip-details').classList.add('hidden');
        document.getElementById('new-trip-form').classList.add('hidden');
        
        // Show trip list
        const tripList = document.getElementById('trip-list');
        tripList.classList.remove('hidden');
        
        // Populate trip list
        this.populateTripList();
    },
    
    // Populate trip list for the current date
    async populateTripList() {
        const trips = await TripData.getTripsByDate(this.currentTripDate);
        const listContainer = document.getElementById('trip-list-container');
        listContainer.innerHTML = '';
        
        if (trips && trips.length > 0) {
            trips.forEach(trip => {
                const listItem = document.createElement('div');
                listItem.className = `trip-list-item ${trip.direction}`;
                listItem.dataset.tripId = trip.id;
                
                const directionText = trip.direction === 'going' ? 'Going' : 'Coming Back';
                
                const content = `
                    <div>
                        <span class="trip-direction ${trip.direction}">${directionText}</span>
                        <p>Paid by: ${trip.payer.name}</p>
                    </div>
                    <div class="trip-fare">$${parseFloat(trip.fare).toFixed(2)}</div>
                `;
                
                listItem.innerHTML = content;
                
                // Add click event
                listItem.addEventListener('click', () => {
                    this.showTripDetails(trip.id);
                });
                
                listContainer.appendChild(listItem);
            });
        } else {
            listContainer.innerHTML = '<p>No trips found for this date.</p>';
        }
    },
    
    // Show trip details
    async showTripDetails(tripId) {
        this.currentTripId = tripId;
        const trip = await TripData.getTripById(tripId);
        
        if (!trip) {
            alert('Trip not found');
            return;
        }
        
        // Hide other views
        document.getElementById('trip-list').classList.add('hidden');
        document.getElementById('new-trip-form').classList.add('hidden');
        
        // Show trip details
        const tripDetails = document.getElementById('trip-details');
        tripDetails.classList.remove('hidden');
        
        // Set trip details
        document.getElementById('trip-driver').textContent = trip.driver || Auth.getCurrentUser().name;
        document.getElementById('trip-direction').textContent = trip.direction === 'going' ? 'Going' : 'Coming Back';
        document.getElementById('trip-fare').textContent = trip.fare.toFixed(2);
        document.getElementById('trip-payer').textContent = trip.payer.name;
        
        // Show participants
        const participantsList = document.getElementById('trip-participants');
        participantsList.innerHTML = '';
        
        trip.participants.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = participant.name + (participant.attended ? '' : ' (Did not attend)');
            participantsList.appendChild(li);
        });
        
        // Show bill details
        const billDetails = document.getElementById('trip-bill-details');
        billDetails.innerHTML = '';
        
        // Calculate per-person costs
        const attendeeCount = trip.participants.filter(p => p.attended).length;
        const costPerPerson = attendeeCount > 0 ? parseFloat(trip.fare) / attendeeCount : 0;
        
        trip.participants.forEach(participant => {
            const li = document.createElement('li');
            if (participant.attended) {
                if (participant.username === trip.payer.username) {
                    const amountPaid = parseFloat(trip.fare);
                    const amountOwed = costPerPerson;
                    const balance = amountPaid - amountOwed;
                    li.textContent = `${participant.name}: Paid $${amountPaid.toFixed(2)}, Owes $${amountOwed.toFixed(2)} (Balance: +$${balance.toFixed(2)})`;
                } else {
                    li.textContent = `${participant.name}: Owes $${costPerPerson.toFixed(2)} to ${trip.payer.name}`;
                }
            } else {
                li.textContent = `${participant.name}: $0.00 (Did not attend)`;
            }
            billDetails.appendChild(li);
        });
    },
    
    // Show new trip form
    async showNewTripForm() {
        // Hide other views
        document.getElementById('trip-list').classList.add('hidden');
        document.getElementById('trip-details').classList.add('hidden');
        
        // Show new trip form
        document.getElementById('new-trip-form').classList.remove('hidden');
        
        // Reset form
        document.getElementById('fare-input').value = '';
        document.getElementById('direction-select').value = 'going';
        
        // Populate payer dropdown
        await this.populatePayerDropdown();
        
        // Generate participant checkboxes
        await this.generateParticipantCheckboxes();
        
        // Hide add participant form initially
        document.getElementById('add-participant-form').classList.add('hidden');
    },
    
    // Populate payer dropdown
    async populatePayerDropdown() {
        const payerSelect = document.getElementById('payer-select');
        payerSelect.innerHTML = '';
        
        // Get all users
        const users = await UserData.getAllUsers();
        
        // Add current user as first option
        const currentUser = Auth.getCurrentUser();
        const defaultOption = document.createElement('option');
        defaultOption.value = currentUser.username;
        defaultOption.textContent = currentUser.name + ' (You)';
        defaultOption.selected = true;
        payerSelect.appendChild(defaultOption);
        
        // Add other users
        users.forEach(user => {
            if (user.username !== currentUser.username) {
                const option = document.createElement('option');
                option.value = user.username;
                option.textContent = user.name;
                payerSelect.appendChild(option);
            }
        });
    },
    
    // Generate participant checkboxes
    async generateParticipantCheckboxes() {
        const container = document.getElementById('participants-checkboxes');
        container.innerHTML = '';
        
        // Get all users
        const users = await UserData.getAllUsers();
        
        users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'participant-checkbox';
            
            // Create participant checkbox
            const participantCheckbox = document.createElement('input');
            participantCheckbox.type = 'checkbox';
            participantCheckbox.id = `participant-${user.username}`;
            participantCheckbox.dataset.username = user.username;
            participantCheckbox.dataset.name = user.name;
            participantCheckbox.checked = true;
            
            // Create attendance checkbox
            const attendanceCheckbox = document.createElement('input');
            attendanceCheckbox.type = 'checkbox';
            attendanceCheckbox.id = `attendance-${user.username}`;
            attendanceCheckbox.dataset.username = user.username;
            attendanceCheckbox.checked = true;
            
            // Create labels
            const participantLabel = document.createElement('label');
            participantLabel.htmlFor = `participant-${user.username}`;
            participantLabel.textContent = user.name;
            
            const attendanceLabel = document.createElement('label');
            attendanceLabel.htmlFor = `attendance-${user.username}`;
            attendanceLabel.textContent = 'Attended';
            
            // Append to container
            div.appendChild(participantCheckbox);
            div.appendChild(participantLabel);
            div.appendChild(attendanceCheckbox);
            div.appendChild(attendanceLabel);
            
            container.appendChild(div);
        });
    },
    
    // Show add participant form
    showAddParticipantForm: function() {
        // Show the form
        document.getElementById('add-participant-form').classList.remove('hidden');
        
        // Clear previous input
        document.getElementById('new-participant-username').value = '';
        document.getElementById('new-participant-password').value = '';
        document.getElementById('new-participant-name').value = '';
    },
    
    // Hide add participant form
    hideAddParticipantForm: function() {
        document.getElementById('add-participant-form').classList.add('hidden');
    },
    
    // Save new participant
    async saveNewParticipant() {
        const username = document.getElementById('new-participant-username').value.trim();
        const password = document.getElementById('new-participant-password').value.trim();
        const name = document.getElementById('new-participant-name').value.trim();
        
        if (!username || !password || !name) {
            alert('Please fill in all fields for the new participant');
            return;
        }
        
        try {
            // Register the new user through Auth
            const result = await Auth.register(username, password, name);
            
            if (result.success) {
                // Hide the form
                this.hideAddParticipantForm();
                
                // Refresh participants
                await this.generateParticipantCheckboxes();
                
                // Also refresh payer dropdown
                await this.populatePayerDropdown();
                
                // Show success message
                alert(`Participant "${name}" added successfully`);
            } else {
                alert(`Error adding participant: ${result.message}`);
            }
        } catch (error) {
            console.error('Error saving participant:', error);
            alert('An error occurred while saving the participant');
        }
    },
    
    // Save trip
    async saveTrip() {
        try {
            const fare = parseFloat(document.getElementById('fare-input').value) || 0;
            const direction = document.getElementById('direction-select').value;
            const payerUsername = document.getElementById('payer-select').value;
            
            if (fare <= 0) {
                alert('Please enter a valid fare amount');
                return;
            }
            
            // Get payer details - IMPORTANT: await the async function
            const payer = await UserData.findUserByUsername(payerUsername);
            if (!payer) {
                alert('Selected payer is invalid');
                return;
            }
            
            // Get selected participants
            const participants = [];
            const participantCheckboxes = document.querySelectorAll('#participants-checkboxes input[type="checkbox"]');
            
            for (let i = 0; i < participantCheckboxes.length; i += 2) {
                const participantCheckbox = participantCheckboxes[i];
                const attendanceCheckbox = participantCheckboxes[i + 1];
                
                if (participantCheckbox.checked) {
                    participants.push({
                        username: participantCheckbox.dataset.username,
                        name: participantCheckbox.dataset.name,
                        attended: attendanceCheckbox.checked
                    });
                }
            }
            
            if (participants.length === 0) {
                alert('Please select at least one participant');
                return;
            }
            
            // Ensure payer is included as a participant if not already
            if (!participants.some(p => p.username === payerUsername)) {
                participants.push({
                    username: payer.username,
                    name: payer.name,
                    attended: true  // Payer must have attended
                });
            }
            
            // Check if a trip with the same direction already exists for this date
            // IMPORTANT: await the async function
            const existingTrips = await TripData.getTripsByDate(this.currentTripDate);
            const directionExists = existingTrips && existingTrips.some(trip => trip.direction === direction);
            
            if (directionExists) {
                if (!confirm(`A "${direction === 'going' ? 'Going' : 'Coming Back'}" trip already exists for this date. Do you want to create another one?`)) {
                    return;
                }
            }
            
            // Create trip object
            const trip = {
                date: this.currentTripDate,
                direction: direction,
                driver: Auth.getCurrentUser().name,
                fare: fare,
                payer: {
                    username: payer.username,
                    name: payer.name
                },
                participants: participants
            };
            
            console.log("Saving trip:", trip); // Debug log
            
            // Save trip
            const savedTrip = await TripData.addTrip(trip);
            if (!savedTrip) {
                throw new Error("Failed to save trip");
            }
            
            // Show success message
            alert("Trip saved successfully!");
            
            // Show trip list
            await this.showTripList();
            
            // Update calendar
            await Calendar.renderCalendar();
        } catch (error) {
            console.error("Error saving trip:", error);
            alert("An error occurred while saving the trip. Please try again.");
        }
    },
    
    // Delete trip
    async deleteTrip() {
        if (!this.currentTripId) {
            alert('No trip selected');
            return;
        }
        
        const trip = await TripData.getTripById(this.currentTripId);
        
        if (trip && confirm('Are you sure you want to delete this trip?')) {
            await TripData.deleteTrip(this.currentTripId);
            await this.showTripList();
            await Calendar.renderCalendar();
        }
    }
};