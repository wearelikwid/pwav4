document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        
        // Check if we're in edit mode
        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('id');
        
        initializeForm();
        
        if (workoutId) {
            // Load workout data for editing
            loadWorkoutData(workoutId);
        } else {
            // Add initial section for new workout
            addSection();
        }
    });
});

function initializeForm() {
    const form = document.getElementById('create-workout-form');
    form.addEventListener('submit', handleFormSubmit);
}

async function loadWorkoutData(workoutId) {
    try {
        const doc = await firebase.firestore()
            .collection('workouts')
            .doc(workoutId)
            .get();

        if (!doc.exists) {
            alert('Workout not found');
            window.location.href = 'workouts.html';
            return;
        }

        const workout = doc.data();
        
        // Fill in basic workout info
        document.getElementById('workout-name').value = workout.name || '';
        document.getElementById('workout-type').value = workout.type || '';

        // Clear any existing sections
        const sectionsContainer = document.getElementById('workout-sections');
        sectionsContainer.innerHTML = '';

        // Add sections and exercises
        if (workout.sections && workout.sections.length > 0) {
            workout.sections.forEach(section => {
                addSection(section);
            });
        } else {
            addSection(); // Add at least one empty section
        }

    } catch (error) {
        console.error('Error loading workout:', error);
        alert('Error loading workout data');
    }
}

function addSection(sectionData = null) {
    const sectionsContainer = document.getElementById('workout-sections');
    const sectionTemplate = document.getElementById('section-template');
    const sectionElement = document.importNode(sectionTemplate.content, true);

    // If we have section data, fill it in
    if (sectionData) {
        const sectionType = sectionElement.querySelector('.section-type');
        if (sectionType) {
            sectionType.value = sectionData.type || '';
        }

        // Add exercises if they exist
        if (sectionData.exercises && sectionData.exercises.length > 0) {
            const exercisesList = sectionElement.querySelector('.exercises-list');
            sectionData.exercises.forEach(exercise => {
                addExerciseToSection(exercisesList, exercise);
            });
        }
    }

    // Add event listeners
    const removeButton = sectionElement.querySelector('.remove-section');
    if (removeButton) {
        removeButton.addEventListener('click', function(e) {
            const section = e.target.closest('.workout-section');
            if (sectionsContainer.children.length > 1) {
                section.remove();
            } else {
                alert('You must have at least one section');
            }
        });
    }

    const addExerciseButton = sectionElement.querySelector('.add-exercise');
    if (addExerciseButton) {
        addExerciseButton.addEventListener('click', function(e) {
            const exercisesList = e.target.previousElementSibling;
            addExerciseToSection(exercisesList);
        });
    }

    sectionsContainer.appendChild(sectionElement);
}

function addExerciseToSection(exercisesList, exerciseData = null) {
    const exerciseTemplate = document.getElementById('exercise-template');
    const exerciseElement = document.importNode(exerciseTemplate.content, true);

    // If we have exercise data, fill it in
    if (exerciseData) {
        const nameInput = exerciseElement.querySelector('.exercise-name');
        const notesInput = exerciseElement.querySelector('.exercise-notes');
        const setsInput = exerciseElement.querySelector('.exercise-sets');
        const repsInput = exerciseElement.querySelector('.exercise-reps');

        if (nameInput) nameInput.value = exerciseData.name || '';
        if (notesInput) notesInput.value = exerciseData.notes || '';
        if (setsInput) setsInput.value = exerciseData.sets || '';
        if (repsInput) repsInput.value = exerciseData.reps || '';
    }

    // Add remove exercise button functionality
    const removeButton = exerciseElement.querySelector('.remove-exercise');
    if (removeButton) {
        removeButton.addEventListener('click', function(e) {
            e.target.closest('.exercise-item').remove();
        });
    }

    exercisesList.appendChild(exerciseElement);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const workoutId = urlParams.get('id');
    const user = firebase.auth().currentUser;

    if (!user) {
        alert('Please sign in to save the workout');
        return;
    }

    const workoutData = {
        name: document.getElementById('workout-name').value,
        type: document.getElementById('workout-type').value,
        sections: [],
        userId: user.uid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // If it's a new workout, add createdAt
    if (!workoutId) {
        workoutData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    // Collect sections data
    const sections = document.querySelectorAll('.workout-section');
    sections.forEach(section => {
        const sectionData = {
            type: section.querySelector('.section-type')?.value || '',
            exercises: []
        };

        // Collect exercises data
        const exercises = section.querySelectorAll('.exercise-item');
        exercises.forEach(exercise => {
            sectionData.exercises.push({
                name: exercise.querySelector('.exercise-name')?.value || '',
                notes: exercise.querySelector('.exercise-notes')?.value || '',
                sets: exercise.querySelector('.exercise-sets')?.value || '',
                reps: exercise.querySelector('.exercise-reps')?.value || ''
            });
        });

        workoutData.sections.push(sectionData);
    });

    try {
        if (workoutId) {
            // Update existing workout
            await firebase.firestore()
                .collection('workouts')
                .doc(workoutId)
                .update(workoutData);
        } else {
            // Create new workout
            await firebase.firestore()
                .collection('workouts')
                .add(workoutData);
        }

        window.location.href = 'workouts.html';
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('Error saving workout: ' + error.message);
    }
}
