document.addEventListener('DOMContentLoaded', function() {
    initializeEditForm();
});

function initializeEditForm() {
    const programId = localStorage.getItem('editProgramId');
    if (!programId) {
        window.location.href = 'program.html';
        return;
    }

    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const program = programs.find(p => p.id === parseInt(programId));
    
    if (!program) {
        window.location.href = 'program.html';
        return;
    }

    // Fill form with existing data
    document.getElementById('program-name').value = program.name;
    document.getElementById('program-duration').value = program.duration;
    
    // Initialize form events
    const form = document.getElementById('edit-program-form');
    const durationInput = document.getElementById('program-duration');

    // Handle duration changes
    durationInput.addEventListener('change', function() {
        updateWeeks(parseInt(this.value), program.weeks);
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveEditedProgram(programId);
    });

    // Initial weeks display
    updateWeeks(program.duration, program.weeks);
}

function updateWeeks(numWeeks, existingWeeks = []) {
    const programWeeks = document.getElementById('program-weeks');
    programWeeks.innerHTML = '';

    for (let i = 1; i <= numWeeks; i++) {
        const existingWeek = existingWeeks.find(w => w.weekNumber === i);
        const weekElement = createWeekElement(i, existingWeek);
        programWeeks.appendChild(weekElement);
        
        // If there's existing data, populate days
        if (existingWeek) {
            existingWeek.days.forEach(day => {
                const daysContainer = weekElement.querySelector('.week-days');
                const dayElement = createDayElement(i, day.dayNumber);
                daysContainer.appendChild(dayElement);
                
                // Populate workout data
                if (day.workout) {
                    const workoutInput = dayElement.querySelector('.workout-name');
                    if (workoutInput) {
                        workoutInput.value = day.workout.name || '';
                    }
                }
            });
        }
    }
}

function createWeekElement(weekNumber, existingWeek = null) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'program-week';
    weekDiv.innerHTML = `
        <div class='week-header'>
            <h2 class='week-title'>Week ${weekNumber}</h2>
        </div>
        <div class='week-days'></div>
        <button type='button' class='button secondary' onclick='addDay(${weekNumber})'>
            Add Day
        </button>
    `;
    return weekDiv;
}

function createDayElement(weekNumber, dayNumber) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'program-day';
    dayDiv.innerHTML = `
        <div class='day-header'>
            <h3>Day ${dayNumber}</h3>
            <button type='button' class='button secondary remove-day' onclick='removeDay(this)'>-</button>
        </div>
        <form class='workout-form'>
            <div class='form-group'>
                <input type='text' class='workout-name' placeholder='Workout name'>
            </div>
            <div id='workout-sections-w${weekNumber}d${dayNumber}' class='workout-sections'></div>
            <div class='form-group'>
                <button type='button' class='button secondary' onclick='addSection(${weekNumber}, ${dayNumber})'>
                    Add Section
                </button>
            </div>
        </form>
    `;
    return dayDiv;
}

function addDay(weekNumber) {
    const weekElement = document.querySelector(`.program-week:nth-child(${weekNumber})`);
    const daysContainer = weekElement.querySelector('.week-days');
    const dayNumber = daysContainer.children.length + 1;
    
    const dayElement = createDayElement(weekNumber, dayNumber);
    daysContainer.appendChild(dayElement);
}

function removeDay(button) {
    const dayElement = button.closest('.program-day');
    dayElement.remove();
}

function saveEditedProgram(programId) {
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const programData = {
        name: document.getElementById('program-name').value,
        duration: parseInt(document.getElementById('program-duration').value),
        weeks: collectWeeksData()
    };

    // Find and update the existing program
    const programIndex = programs.findIndex(p => p.id === parseInt(programId));
    if (programIndex !== -1) {
        programs[programIndex] = {
            ...programs[programIndex],
            ...programData,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('programs', JSON.stringify(programs));
        localStorage.removeItem('editProgramId'); // Clear the edit ID
        window.location.href = 'program.html';
    }
}

function collectWeeksData() {
    const weeks = [];
    const weekElements = document.querySelectorAll('.program-week');
    
    weekElements.forEach((weekElement, weekIndex) => {
        const days = [];
        const dayElements = weekElement.querySelectorAll('.program-day');
        
        dayElements.forEach((dayElement, dayIndex) => {
            const workoutName = dayElement.querySelector('.workout-name').value;
            days.push({
                dayNumber: dayIndex + 1,
                workout: {
                    name: workoutName,
                    sections: [] // You can expand this to include more workout details
                }
            });
        });

        weeks.push({
            weekNumber: weekIndex + 1,
            days: days
        });
    });

    return weeks;
}
