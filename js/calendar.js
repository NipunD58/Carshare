// calendar.js - Handles calendar display and navigation

const Calendar = {
    // Current date
    currentDate: new Date(),
    
    // Initialize calendar
    initialize: function() {
        this.renderCalendar();
        this.bindEvents();
    },
    
    // Bind calendar events
    bindEvents: function() {
        // Month navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.changeMonth(-1);
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.changeMonth(1);
        });
    },
    
    // Change month (prev/next)
    changeMonth: function(step) {
        this.currentDate.setMonth(this.currentDate.getMonth() + step);
        this.renderCalendar();
    },
    
    // Format date as YYYY-MM-DD
    formatDate: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // Get number of days in a month
    getDaysInMonth: function(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },
    
    // Get first day of month (0 = Sunday, 6 = Saturday)
    getFirstDayOfMonth: function(year, month) {
        return new Date(year, month, 1).getDay();
    },
    
    // Render calendar for current month
    async renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();
        
        // Update month and year display
        document.getElementById('month-year').textContent = 
            new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
        
        // Get all trips for this month
        const monthTrips = await TripData.getTripsForMonth(year, month);
        
        // Calculate calendar grid
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfMonth = this.getFirstDayOfMonth(year, month);
        
        // Get container
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Add days from previous month
        const prevMonthDays = this.getDaysInMonth(year, month - 1);
        for (let i = 0; i < firstDayOfMonth; i++) {
            const dayNumber = prevMonthDays - firstDayOfMonth + i + 1;
            const dayElement = this.createDayElement(dayNumber, 'other-month');
            
            // Create date string for previous month
            const prevMonthYear = month === 0 ? year - 1 : year;
            const prevMonth = month === 0 ? 11 : month - 1;
            const dateString = this.formatDate(new Date(prevMonthYear, prevMonth, dayNumber));
            dayElement.dataset.date = dateString;
            
            calendarDays.appendChild(dayElement);
        }
        
        // Add days from current month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateString = this.formatDate(new Date(year, month, i));
            const daysTrips = monthTrips.filter(trip => trip.date === dateString);
            const hasTrip = daysTrips.length > 0;
            
            let className = '';
            if (hasTrip) className = 'has-trip';
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                className += ' today';
            }
            
            const dayElement = this.createDayElement(i, className);
            dayElement.dataset.date = dateString;
            
            calendarDays.appendChild(dayElement);
        }
        
        // Add days from next month
        const totalDaysDisplayed = firstDayOfMonth + daysInMonth;
        const remainingCells = 42 - totalDaysDisplayed; // 6 rows * 7 days
        
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = this.createDayElement(i, 'other-month');
            
            // Create date string for next month
            const nextMonthYear = month === 11 ? year + 1 : year;
            const nextMonth = month === 11 ? 0 : month + 1;
            const dateString = this.formatDate(new Date(nextMonthYear, nextMonth, i));
            dayElement.dataset.date = dateString;
            
            calendarDays.appendChild(dayElement);
        }
    },
    
    // Create a day element for the calendar
    createDayElement: function(day, className = '') {
        const dayElement = document.createElement('div');
        dayElement.className = `day ${className}`.trim();
        dayElement.textContent = day;
        
        // Create quick-add button
        const quickAddBtn = document.createElement('button');
        quickAddBtn.className = 'quick-add-btn';
        quickAddBtn.textContent = '+';
        quickAddBtn.title = 'Add new trip';
        
        // Add button to day cell
        dayElement.appendChild(quickAddBtn);
        
        // Add separate event listeners to prevent conflicts
        dayElement.addEventListener('click', (e) => {
            // Only trigger if not clicking the add button
            if (e.target !== quickAddBtn) {
                const date = dayElement.dataset.date;
                this.onDayClick(date);
            }
        });
        
        // Add click event to the quick-add button
        quickAddBtn.addEventListener('click', (e) => {
            const date = dayElement.dataset.date;
            e.stopPropagation(); // Prevent the day click event
            console.log("Quick add clicked for date:", date);  // Debug log
            this.onQuickAddClick(date);
        });
        
        return dayElement;
    },
    
    // Handle day click (view trips)
    onDayClick: function(date) {
        console.log("Day clicked:", date);  // Debug log
        TripManager.openTripModal(date, false);
    },
    
    // Handle quick-add button click
    onQuickAddClick: function(date) {
        console.log("Quick-add clicked:", date);  // Debug log
        TripManager.openTripModal(date, true);
    }
};