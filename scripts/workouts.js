// Check if user is logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        loadWorkouts(user.uid);
    });
});

// Load workouts from Firebase
function loadWorkouts(userId) {
    const workoutsRef = firebase.firestore().collection('workouts');
    
    workoutsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const workouts = [];
            snapshot.forEach((doc) => {
                workouts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            displayWorkouts(workouts);
        });
}

// Display workouts on the page
function displayWorkouts(workouts) {
    const workoutsList = document.getElementById('workouts-list');
    workoutsList.innerHTML = '';

    if (workouts.length === 0) {
        workoutsList.innerHTML = `
            <div class="empty-state">
                <p>No workouts created yet.</p>
                <a href="create-workout.html" class="button primary">Create Your First Workout</a>
            </div>
        `;
        return;
    }

    workouts.forEach(workout => {
        workoutsList.appendChild(createWorkoutCard(workout));
    });
}

// Create workout card HTML
function createWorkoutCard(workout) {
    const div = document.createElement('div');
    div.className = 'workout-card';
    if (workout.completed) {
        div.classList.add('completed');
    }

    div.innerHTML = `
        <h3>${workout.name}</h3>
        <div class="workout-meta">
            <span>${workout.type}</span>
            ${workout.completed ? '<span class="completion-status">Completed</span>' : ''}
        </div>
        <div class="workout-actions">
            <button onclick="startWorkout('${workout.id}')" class="button primary">Start Workout</button>
            <button onclick="editWorkout('${workout.id}')" class="button secondary">Edit</button>
            <button onclick="deleteWorkout('${workout.id}')" class="button delete-btn">Delete</button>
        </div>
    `;
    return div;
}

// Function to start a workout
function startWorkout(workoutId) {
    window.location.href = `start-workout.html?id=${workoutId}`;
}

// Function to edit a workout
function editWorkout(workoutId) {
    window.location.href = `create-workout.html?id=${workoutId}`;
}

// Function to delete a workout
function deleteWorkout(workoutId) {
    if (confirm('Are you sure you want to delete this workout?')) {
        firebase.firestore()
            .collection('workouts')
            .doc(workoutId)
            .delete()
            .catch((error) => {
                console.error('Error deleting workout:', error);
                alert('Error deleting workout. Please try again.');
            });
    }
}
