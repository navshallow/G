// State variables
export let deleteMode = false;
export let editMode = false;
export let uploadMode = false;
export let nextAssignmentId = 8; 
export let currentEditingId = null;
export let currentUploadingId = null;
export let currentSortMethod = 'name';
export let previewsEnabled = true;
export let archivedAssignments = [];
export let selectedArchivedAssignment = null;
export let uploadedFiles = {};
export let uploadedPreviews = {};
export let selectedFiles = [];
export let selectedPreviewFile = null;

// Add setter functions for module variables
export function setDeleteMode(value) {
    deleteMode = value;
}

export function setEditMode(value) {
    editMode = value;
}

export function setUploadMode(value) {
    uploadMode = value;
}

export function setCurrentEditingId(value) {
    currentEditingId = value;
}

export function setCurrentUploadingId(value) {
    currentUploadingId = value;
}

export function setCurrentSortMethod(value) {
    currentSortMethod = value;
}

export function setSelectedArchivedAssignment(value) {
    selectedArchivedAssignment = value;
}

export function setSelectedFiles(value) {
    selectedFiles = value;
}

export function setSelectedPreviewFile(value) {
    selectedPreviewFile = value;
}

export function setNextAssignmentId(value) {
    nextAssignmentId = value;
}

export function incrementNextAssignmentId() {
    nextAssignmentId++;
}

export function setPreviewsEnabled(value) {
    previewsEnabled = value;
}

// Storage key for localStorage
export const storageKey = 'gatorGraderState';

// Utility function to get CSRF token
export function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
           document.cookie.split('; ')
                         .find(row => row.startsWith('csrftoken='))
                         ?.split('=')[1] || '';
}

// Helper function to format date for display
export function formatDateForDisplay(dateStr) {
    if (!dateStr) return '';
    
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateStr;
    }
}

// Ensure current date is set correctly
export function ensureCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    return formattedDate;
}

// Helper function to generate type pills HTML
export function generateTypePills(types) {
    if (!types || types.length === 0) return '';
    
    return types.map(type => {
        let displayName = type;
        
        if (type === 'class-assignment') {
            displayName = 'Class';
        } else {
            displayName = type.charAt(0).toUpperCase() + type.slice(1);
        }
        
        return `<span class="type-pill type-${type}">${displayName}</span>`;
    }).join('');
}

export function saveStateToStorage(courseId) {
    // Gather all current assignments
    const currentAssignments = [];
    document.querySelectorAll('.assignment-row').forEach(row => {
        const nameEl = row.querySelector('.assignment-name');
        const uploadsEl = row.querySelector('.assignment-uploads');
        const pendingEl = row.querySelector('.assignment-pending');
        
        currentAssignments.push({
            id: parseInt(row.dataset.id),
            name: nameEl ? nameEl.textContent.trim() : '',
            types: row.dataset.types || '',
            created: row.dataset.created || '',
            deadline: row.dataset.deadline || '',
            uploads: uploadsEl ? uploadsEl.textContent.trim() : '0',
            pending: pendingEl ? pendingEl.textContent.trim() : '0'
        });
    });
    
    const courseHeaderElement = document.querySelector('.course-header');
    const courseSemesterElement = document.querySelector('.course-semester');
    let courseData = {};
    
    if (courseHeaderElement && courseHeaderElement.textContent) {
        const headerText = courseHeaderElement.textContent;
        const match = headerText.match(/^(.+)\s+(.+)\s+-\s+(.+)$/);
        
        if (match && match.length === 4) {
            courseData.abbreviation = match[1].trim();
            courseData.number = match[2].trim();
            courseData.fullName = match[3].trim();
        }
    }
    
    if (courseSemesterElement && courseSemesterElement.textContent) {
        const semesterText = courseSemesterElement.textContent;
        const match = semesterText.match(/^(.+)\s+(.+)$/);
        
        if (match && match.length === 3) {
            courseData.semester = match[1].trim();
            courseData.year = match[2].trim();
        }
    }

    const coursePill = document.querySelector(`.course-pill[href*="${courseId}"] .ENGR`);
    if (coursePill && coursePill.innerHTML) {
        const pillText = coursePill.innerHTML;
        const sectionMatch = pillText.match(/\[(.*?)\]/);
        if (sectionMatch && sectionMatch.length === 2) {
            courseData.sectionNumber = sectionMatch[1];
        }
    }
    
    const savedUploads = {};
    Object.keys(uploadedFiles).forEach(id => {
        if (uploadedFiles[id] && uploadedFiles[id].length > 0) {
            savedUploads[id] = uploadedFiles[id].map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            }));
        }
    });
    
    const savedPreviews = {};
    Object.keys(uploadedPreviews).forEach(id => {
        if (uploadedPreviews[id]) {
            savedPreviews[id] = {
                name: uploadedPreviews[id].name,
                size: uploadedPreviews[id].size,
                type: uploadedPreviews[id].type
            };
        }
    });
    
    const state = {
        currentAssignments: currentAssignments,
        archivedAssignments: archivedAssignments,
        nextAssignmentId: nextAssignmentId,
        courseId: courseId,
        courseData: courseData,
        uploadedFiles: savedUploads,
        uploadedPreviews: savedPreviews,
        previewsEnabled: previewsEnabled
    };
    
    try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        console.log("State saved to localStorage");
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

// Function to load state from localStorage
export function loadStateFromStorage(courseId, assignmentList, assignmentRowTemplate) {
    try {
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
            const state = JSON.parse(savedState);
            console.log("Loaded state from localStorage", state);
            
            // Only load state if it's for the current course
            if (state.courseId === courseId) {
                // Load course data if available
                if (state.courseData) {
                    const courseHeaderElement = document.querySelector('.course-header');
                    const courseSemesterElement = document.querySelector('.course-semester');
                    
                    if (courseHeaderElement && state.courseData.abbreviation && state.courseData.number && state.courseData.fullName) {
                        courseHeaderElement.textContent = `${state.courseData.abbreviation} ${state.courseData.number} - ${state.courseData.fullName}`;
                    }
                    
                    if (courseSemesterElement && state.courseData.semester && state.courseData.year) {
                        courseSemesterElement.textContent = `${state.courseData.semester} ${state.courseData.year}`;
                    }
                }
                
                // Load preview setting
                if (typeof state.previewsEnabled === 'boolean') {
                    setPreviewsEnabled(state.previewsEnabled);
                }
                
                // Load current assignments
                if (state.currentAssignments && state.currentAssignments.length > 0 && assignmentList && assignmentRowTemplate) {
                    assignmentList.innerHTML = '';
                    
                    state.currentAssignments.forEach(assignment => {
                        const template = assignmentRowTemplate.content.cloneNode(true);
                        const newAssignment = template.querySelector('.assignment-row');
                        
                        newAssignment.dataset.id = assignment.id;
                        newAssignment.dataset.types = assignment.types || '';
                        newAssignment.dataset.created = assignment.created || '';
                        if (assignment.deadline) {
                            newAssignment.dataset.deadline = assignment.deadline;
                        }
                        
                        // Set text content
                        const nameElement = newAssignment.querySelector('.assignment-name');
                        if (nameElement) nameElement.textContent = assignment.name;
                        
                        const createdElement = newAssignment.querySelector('.assignment-created');
                        if (createdElement) createdElement.textContent = formatDateForDisplay(assignment.created) || 'Unknown';
                        
                        const deadlineElement = newAssignment.querySelector('.assignment-deadline');
                        if (deadlineElement) deadlineElement.textContent = formatDateForDisplay(assignment.deadline) || 'Not set';
                        
                        const uploadsElement = newAssignment.querySelector('.assignment-uploads');
                        if (uploadsElement) uploadsElement.textContent = assignment.uploads || '0';
                        
                        const pendingElement = newAssignment.querySelector('.assignment-pending');
                        if (pendingElement) pendingElement.textContent = assignment.pending || '0';
                        
                        // Set button data attributes
                        const gradeBtn = newAssignment.querySelector('.grade-button');
                        if (gradeBtn) gradeBtn.dataset.id = assignment.id;
                        
                        const rubricBtn = newAssignment.querySelector('.rubric-button');
                        if (rubricBtn) rubricBtn.dataset.id = assignment.id;
                        
                        const statsBtn = newAssignment.querySelector('.stats-button');
                        if (statsBtn) statsBtn.dataset.id = assignment.id;
                        
                        const typesContainer = newAssignment.querySelector('.assignment-type');
                        if (typesContainer) typesContainer.innerHTML = generateTypePills(assignment.types ? assignment.types.split(',') : []);
                        
                        
                        // Append to DOM
                        assignmentList.appendChild(newAssignment);
                    });
                } else if (assignmentList) {
                    // For new courses, clear any default assignments
                    assignmentList.innerHTML = '';
                }
                
                if (state.archivedAssignments) {
                    archivedAssignments = state.archivedAssignments.map(a => ({
                        ...a,
                        archivedTime: new Date(a.archivedTime)
                    }));
                }
                
                if (state.nextAssignmentId) {
                    setNextAssignmentId(state.nextAssignmentId);
                }
                
                // Load uploaded files
                if (state.uploadedFiles) {
                    uploadedFiles = state.uploadedFiles;
                }
                
                // Load uploaded previews
                if (state.uploadedPreviews) {
                    uploadedPreviews = state.uploadedPreviews;
                }
                
                return true;
            } else if (assignmentList) {
                // For a new course, ensure we start with empty state
                assignmentList.innerHTML = '';
                return false;
            }
        } else if (assignmentList) {
            assignmentList.innerHTML = '';
            return false;
        }
    } catch (e) {
        console.error('Failed to load state:', e);
        if (assignmentList) {
            assignmentList.innerHTML = '';
        }
        return false;
    }
}