document.addEventListener('DOMContentLoaded', function() {
    loadWorkout();
    initializeCompleteButton();
});

function loadWorkout() {
    const workout = JSON.parse(localStorage.getItem('currentWorkout'));
    if (!workout) {
        window.location.href = 'workouts.html';
        return;
    }

    document.getElementById('workout-name').textContent = workout.name;
    document.getElementById('workout-type').textContent = workout.type;
    displaySections(workout.sections);
}

function displaySections(sections) {
    const sectionsContainer = document.getElementById('workout-sections');
    sectionsContainer.innerHTML = '';

    sections.forEach((section, index) => {
        const sectionElement = createSectionElement(section, index + 1);
        sectionsContainer.appendChild(sectionElement);
    });
}

function createSectionElement(section, sectionNumber) {
    const sectionTemplate = document.getElementById('section-template');
    const sectionElement = document.importNode(sectionTemplate.content, true);

    const titleElement = sectionElement.querySelector('.section-title');
    titleElement.textContent = `${section.type} ${sectionNumber}`;

    const exercisesList = sectionElement.querySelector('.exercises-list');
    section.exercises.forEach(exercise => {
        const exerciseElement = createExerciseElement(exercise);
        exercisesList.appendChild(exerciseElement);
    });

    return sectionElement;
}

function createExerciseElement(exercise) {
    const exerciseTemplate = document.getElementById('exercise-template');
    const exerciseElement = document.importNode(exerciseTemplate.content, true);

    exerciseElement.querySelector('.exercise-name').textContent = exercise.name;

    const notesElement = exerciseElement.querySelector('.exercise-notes');
    if (exercise.notes) {
        notesElement.textContent = exercise.notes;
    } else {
        notesElement.style.display = 'none';
    }

    const repsElement = exerciseElement.querySelector('.reps');
    const roundsElement = exerciseElement.querySelector('.rounds');

    repsElement.textContent = exercise.reps ? `${exercise.reps} reps` : '';
    roundsElement.textContent = exercise.rounds ? `${exercise.rounds} rounds` : '';

    return exerciseElement;
}

function initializeCompleteButton() {
    const completeButton = document.getElementById('complete-workout');
    completeButton.addEventListener('click', markWorkoutComplete);
}

function markWorkoutComplete() {
    const completeButton = document.getElementById('complete-workout');
    const currentWorkout = JSON.parse(localStorage.getItem('currentWorkout'));
    
    // Prevent double-clicking
    completeButton.disabled = true;
    
    // Update button appearance
    completeButton.classList.add('completed');
    completeButton.textContent = 'Workout Completed!';

    // Update Firestore
    firebase.firestore()
        .collection('workouts')
        .doc(currentWorkout.id)
        .update({
            completed: true,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            // Show success state and redirect
            setTimeout(() => {
                window.location.href = 'workouts.html';
            }, 1500);
        })
        .catch((error) => {
            console.error('Error marking workout complete:', error);
            completeButton.disabled = false;
            completeButton.classList.remove('completed');
            completeButton.textContent = 'Mark as Complete';
        });
}
