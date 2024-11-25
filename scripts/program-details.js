// Wait for DOM content to load and Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Get program ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const programId = urlParams.get('id');
            
            if (programId) {
                loadProgramDetails(programId);
            } else {
                window.location.href = 'program.html';
            }
        } else {
            window.location.href = 'auth.html';
        }
    });
});

// Load program details from Firestore
async function loadProgramDetails(programId) {
    try {
        const programDoc = await firebase.firestore()
            .collection('programs')
            .doc(programId)
            .get();

        if (programDoc.exists) {
            const programData = programDoc.data();
            displayProgramDetails(programData);
        } else {
            alert('Program not found');
            window.location.href = 'program.html';
        }
    } catch (error) {
        console.error('Error loading program details:', error);
        alert('Error loading program details. Please try again.');
    }
}

// Display program details in the UI
function displayProgramDetails(program) {
    // Update program stats
    document.getElementById('programName').textContent = program.name;
    document.getElementById('programDuration').textContent = `${program.duration} weeks`;

    // Display weeks
    const programWeeksDiv = document.getElementById('programWeeks');
    let weeksHTML = '';

    if (program.weeks && program.weeks.length > 0) {
        program.weeks.forEach((week, weekIndex) => {
            weeksHTML += `
                <div class="week-card">
                    <h3 class="week-header">Week ${weekIndex + 1}</h3>
                    <div class="week-days">
                        ${week.days.map((day, dayIndex) => `
                            <div class="day-item">
                                <div class="day-info">
                                    <span class="day-name">Day ${dayIndex + 1}</span>
                                    <span class="workout-name">${day.workout?.name || 'Rest Day'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    } else {
        weeksHTML = '<p class="no-content">No workout weeks available</p>';
    }

    programWeeksDiv.innerHTML = weeksHTML;

    // Add event listener for start program button
    document.getElementById('startProgram').addEventListener('click', () => {
        startProgram(program.id);
    });
}

// Handle starting a program
async function startProgram(programId) {
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // Create a user program document in Firestore
        await firebase.firestore().collection('userPrograms').add({
            userId: userId,
            programId: programId,
            startDate: new Date(),
            status: 'active'
        });

        // Redirect to the workout view or dashboard
        window.location.href = 'workout.html';
    } catch (error) {
        console.error('Error starting program:', error);
        alert('Failed to start program. Please try again.');
    }
}
