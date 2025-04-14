import * as core from './core.js';
import * as ui from './ui.js';

// Mode toggles
export function toggleDeleteMode(deleteBtn) {
    console.log("Toggle delete mode called. Current state:", core.deleteMode ? "ON" : "OFF");
    
    if (!core.deleteMode) {
        enterDeleteMode(deleteBtn);
    } else {
        exitDeleteMode(deleteBtn);
    }
}

export function enterDeleteMode(deleteBtn) {
    console.log("Entering delete mode");
    
    // Turn off other modes
    if (core.editMode) toggleEditMode(document.getElementById('editBtn'));
    if (core.uploadMode) toggleUploadMode(document.getElementById('uploadBtn'));
    
    // Use setter instead of direct assignment
    core.setDeleteMode(true);
    
    if (deleteBtn) deleteBtn.classList.add('active');
    
    // Add delete-mode class to all assignments
    document.querySelectorAll('.assignment-row').forEach(row => {
        row.classList.add('delete-mode');
        
        row.addEventListener('click', selectForDeletion);
    });
}

export function exitDeleteMode(deleteBtn) {
    console.log("Exiting delete mode");
    
    // Use setter instead of direct assignment
    core.setDeleteMode(false);
    
    if (deleteBtn) deleteBtn.classList.remove('active');
    
    // Remove delete-mode class from all assignments
    document.querySelectorAll('.assignment-row').forEach(row => {
        row.classList.remove('delete-mode');
        row.classList.remove('selected');
        
        row.removeEventListener('click', selectForDeletion);
    });
}

export function toggleEditMode(editBtn) {
    console.log("Toggle edit mode called. Current state:", core.editMode ? "ON" : "OFF");
    
    // Use setter instead of direct assignment
    core.setEditMode(!core.editMode);
    
    if (core.editMode) {
        if (core.deleteMode) toggleDeleteMode(document.getElementById('deleteBtn'));
        if (core.uploadMode) toggleUploadMode(document.getElementById('uploadBtn'));
        
        if (editBtn) editBtn.classList.add('active');
    } else {
        // Change button appearance
        if (editBtn) editBtn.classList.remove('active');
    }
    
    // Toggle assignment row class
    document.querySelectorAll('.assignment-row').forEach(row => {
        if (core.editMode) {
            row.classList.add('edit-mode');
        } else {
            row.classList.remove('edit-mode');
        }
    });
}

export function toggleUploadMode(uploadBtn) {
    console.log("Toggle upload mode called. Current state:", core.uploadMode ? "ON" : "OFF");
    
    // Use setter instead of direct assignment
    core.setUploadMode(!core.uploadMode);
    
    if (core.uploadMode) {
        if (core.deleteMode) toggleDeleteMode(document.getElementById('deleteBtn'));
        if (core.editMode) toggleEditMode(document.getElementById('editBtn'));
        
        if (uploadBtn) uploadBtn.classList.add('active');
    } else {
        if (uploadBtn) uploadBtn.classList.remove('active');
    }
}

// Function to handle selection for deletion
function selectForDeletion(e) {
    if (e.target.tagName === 'BUTTON' || 
        e.target.classList.contains('assignment-name') ||
        e.target.closest('button')) {
        return;
    }
    
    this.classList.add('selected');
    
    // If assignment is selected, prompt user to confirm deletion
    if (confirm('Are you sure you want to delete this assignment? It will be moved to the archive.')) {
        deleteAssignment(this);
    } else {
        this.classList.remove('selected');
    }
}

// Function to delete a single assignment
export function deleteAssignment(assignmentRow) {
    if (!assignmentRow) return;
    
    const assignmentId = assignmentRow.dataset.id;
    const assignmentName = assignmentRow.querySelector('.assignment-name')?.textContent.trim() || '';
    const assignmentTypes = assignmentRow.dataset.types || '';
    const createdDate = assignmentRow.dataset.created || '';
    const deadlineDate = assignmentRow.dataset.deadline || '';
    const uploads = assignmentRow.querySelector('.assignment-uploads')?.textContent.trim() || '0';
    const pending = assignmentRow.querySelector('.assignment-pending')?.textContent.trim() || '0';
    
    console.log(`Moving assignment to archive: ${assignmentName}`);
    
    // Save to archived assignments - safely pushing to the existing array
    core.archivedAssignments.push({
        id: assignmentId,
        name: assignmentName,
        types: assignmentTypes,
        created: createdDate,
        deadline: deadlineDate,
        uploads: uploads,
        pending: pending,
        archivedTime: new Date()
    });
    
    // Also save any uploaded files
    if (core.uploadedFiles[assignmentId]) {
        console.log(`Saved ${core.uploadedFiles[assignmentId].length} files for assignment ${assignmentId} to archive`);
    }
    
    if (core.uploadedPreviews[assignmentId]) {
        console.log(`Saved preview for assignment ${assignmentId} to archive`);
    }
    
    assignmentRow.remove();
}

// Search function
export function searchAssignments(query) {
    query = query.toLowerCase().trim();
    
    document.querySelectorAll('.assignment-row').forEach(row => {
        const name = row.querySelector('.assignment-name')?.textContent.toLowerCase() || '';
        const createdDate = row.querySelector('.assignment-created')?.textContent.toLowerCase() || '';
        
        if (query === '' || name.includes(query) || createdDate.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Sort function
export function sortAssignments(method, assignmentList) {
    if (!assignmentList) return;
    
    const rows = Array.from(document.querySelectorAll('.assignment-row'));
    if (rows.length === 0) return;
    
    core.setCurrentSortMethod(method);
    
    rows.sort((a, b) => {
        switch (method) {
            case 'name':
                const nameA = a.querySelector('.assignment-name')?.textContent.toLowerCase() || '';
                const nameB = b.querySelector('.assignment-name')?.textContent.toLowerCase() || '';
                return nameA.localeCompare(nameB);
                
            case 'created':
                const createdA = new Date(a.dataset.created || '');
                const createdB = new Date(b.dataset.created || '');
                return createdB - createdA; // Newest first
                
            case 'deadline':
                const deadlineA = a.dataset.deadline ? new Date(a.dataset.deadline) : new Date(9999, 11, 31);
                const deadlineB = b.dataset.deadline ? new Date(b.dataset.deadline) : new Date(9999, 11, 31);
                return deadlineA - deadlineB; // Soonest first
                
            case 'type':
                const typeA = a.dataset.types || '';
                const typeB = b.dataset.types || '';
                return typeA.localeCompare(typeB);
                
            case 'pending':
                const pendingA = parseInt(a.querySelector('.assignment-pending')?.textContent) || 0;
                const pendingB = parseInt(b.querySelector('.assignment-pending')?.textContent) || 0;
                return pendingB - pendingA; // Most pending first
                
            default:
                return 0;
        }
    });
    
    rows.forEach(row => {
        assignmentList.appendChild(row);
    });
}

// Function to create a new assignment
export function createNewAssignment(assignmentNameInput, assignmentList, assignmentRowTemplate, assignmentTypeCheckboxes, deadlineDateInput, createdOnDateInput, emptyState, assignmentsContainer) {
    if (!assignmentNameInput || !assignmentList || !assignmentRowTemplate) return;
    
    const assignmentName = assignmentNameInput.value.trim();
    if (!assignmentName) {
        alert('Please enter an assignment name');
        return;
    }

    const selectedTypes = [];
    assignmentTypeCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedTypes.push(checkbox.value);
        }
    });
    
    if (selectedTypes.length === 0) {
        alert('Please select at least one assignment type');
        return;
    }
    
    // makea sure created date is today
    const createdDate = core.ensureCurrentDate();
    const deadlineDate = deadlineDateInput ? deadlineDateInput.value : '';
    
    const displayCreatedDate = core.formatDateForDisplay(createdDate);
    const displayDeadlineDate = core.formatDateForDisplay(deadlineDate);

    const template = assignmentRowTemplate.content.cloneNode(true);
    const newAssignment = template.querySelector('.assignment-row');
    
    //  data attributes
    newAssignment.dataset.id = core.nextAssignmentId;
    newAssignment.dataset.types = selectedTypes.join(',');
    newAssignment.dataset.created = createdDate;
    if (deadlineDate) {
        newAssignment.dataset.deadline = deadlineDate;
    }
    
    //  text content
    const nameElement = newAssignment.querySelector('.assignment-name');
    if (nameElement) nameElement.textContent = assignmentName;
    
    const createdElement = newAssignment.querySelector('.assignment-created');
    if (createdElement) createdElement.textContent = displayCreatedDate;
    
    const deadlineElement = newAssignment.querySelector('.assignment-deadline');
    if (deadlineElement) deadlineElement.textContent = displayDeadlineDate || 'Not set';
    
    const uploadsElement = newAssignment.querySelector('.assignment-uploads');
    if (uploadsElement) uploadsElement.textContent = '0';
    
    const pendingElement = newAssignment.querySelector('.assignment-pending');
    if (pendingElement) pendingElement.textContent = '0';
    
    // button data attributes
    const gradeBtn = newAssignment.querySelector('.grade-button');
    if (gradeBtn) gradeBtn.dataset.id = core.nextAssignmentId;
    
    const rubricBtn = newAssignment.querySelector('.rubric-button');
    if (rubricBtn) rubricBtn.dataset.id = core.nextAssignmentId;
    
    const statsBtn = newAssignment.querySelector('.stats-button');
    if (statsBtn) statsBtn.dataset.id = core.nextAssignmentId;
    
    const typesContainer = newAssignment.querySelector('.assignment-type');
    if (typesContainer) typesContainer.innerHTML = core.generateTypePills(selectedTypes);

    // Append new element to DOM
    assignmentList.appendChild(newAssignment);

    core.incrementNextAssignmentId();

    // Check empty state
    ui.checkEmptyState(emptyState, assignmentsContainer, assignmentList);
    
    // Sort based on current method
    sortAssignments(core.currentSortMethod, assignmentList);
    
    return newAssignment;
}

// Function to update an assignment
export function updateAssignment(editAssignmentNameInput, editTypeCheckboxes, editCreatedOnDateInput, editDeadlineDateInput, assignmentList) {
    if (!core.currentEditingId) return;
    
    if (!editAssignmentNameInput) {
        console.error("Edit assignment name input not found");
        return;
    }
    
    const assignmentName = editAssignmentNameInput.value.trim();
    if (!assignmentName) {
        alert('Please enter an assignment name');
        return;
    }
    
    const selectedTypes = [];
    editTypeCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedTypes.push(checkbox.value);
        }
    });
    
    if (selectedTypes.length === 0) {
        alert('Please select at least one assignment type');
        return;
    }
    
    // Get created date and deadline date (don't change created date)
    const createdDate = editCreatedOnDateInput ? editCreatedOnDateInput.value : '';
    const deadlineDate = editDeadlineDateInput ? editDeadlineDateInput.value : '';
    
    const displayCreatedDate = core.formatDateForDisplay(createdDate);
    const displayDeadlineDate = core.formatDateForDisplay(deadlineDate);
    
    // Find the assignment row
    const assignmentRow = document.querySelector(`.assignment-row[data-id="${core.currentEditingId}"]`);
    if (assignmentRow) {
        assignmentRow.dataset.types = selectedTypes.join(',');
        if (deadlineDate) {
            assignmentRow.dataset.deadline = deadlineDate;
        } else {
            delete assignmentRow.dataset.deadline;
        }
        
        // Update the content
        const nameElement = assignmentRow.querySelector('.assignment-name');
        if (nameElement) nameElement.textContent = assignmentName;
        
        const deadlineElement = assignmentRow.querySelector('.assignment-deadline');
        if (deadlineElement) deadlineElement.textContent = displayDeadlineDate || 'Not set';
        
        const typeElement = assignmentRow.querySelector('.assignment-type');
        if (typeElement) typeElement.innerHTML = core.generateTypePills(selectedTypes);
    }
    
    // Sort based on current method
    sortAssignments(core.currentSortMethod, assignmentList);
}

// Function to restore an archived assignment
export function restoreArchivedAssignment(assignmentList, assignmentRowTemplate, restoreAssignmentBtn, deleteForeverBtn, emptyState, assignmentsContainer, archiveList) {
    if (core.selectedArchivedAssignment === null || !assignmentList || !assignmentRowTemplate) return;
    
    const assignment = core.archivedAssignments[core.selectedArchivedAssignment];
    
    // Create assignment row using the template
    const template = assignmentRowTemplate.content.cloneNode(true);
    const newAssignment = template.querySelector('.assignment-row');
    
    // Set data attributes
    newAssignment.dataset.id = core.nextAssignmentId;
    newAssignment.dataset.types = assignment.types || '';
    newAssignment.dataset.created = assignment.created || '';
    if (assignment.deadline) {
        newAssignment.dataset.deadline = assignment.deadline;
    }
    
    const nameElement = newAssignment.querySelector('.assignment-name');
    if (nameElement) nameElement.textContent = assignment.name;
    
    const createdElement = newAssignment.querySelector('.assignment-created');
    if (createdElement) createdElement.textContent = core.formatDateForDisplay(assignment.created) || 'Unknown';
    
    const deadlineElement = newAssignment.querySelector('.assignment-deadline');
    if (deadlineElement) deadlineElement.textContent = core.formatDateForDisplay(assignment.deadline) || 'Not set';
    
    const uploadsElement = newAssignment.querySelector('.assignment-uploads');
    if (uploadsElement) uploadsElement.textContent = assignment.uploads || '0';
    
    const pendingElement = newAssignment.querySelector('.assignment-pending');
    if (pendingElement) pendingElement.textContent = assignment.pending || '0';
    
    // Set button data attributes
    const gradeBtn = newAssignment.querySelector('.grade-button');
    if (gradeBtn) gradeBtn.dataset.id = core.nextAssignmentId;
    
    const rubricBtn = newAssignment.querySelector('.rubric-button');
    if (rubricBtn) rubricBtn.dataset.id = core.nextAssignmentId;
    
    const statsBtn = newAssignment.querySelector('.stats-button');
    if (statsBtn) statsBtn.dataset.id = core.nextAssignmentId;
    
    // Add type pills
    const typesContainer = newAssignment.querySelector('.assignment-type');
    if (typesContainer) typesContainer.innerHTML = core.generateTypePills(assignment.types ? assignment.types.split(',') : []);
    
    assignmentList.appendChild(newAssignment);
    
    // Check empty state
    ui.checkEmptyState(emptyState, assignmentsContainer, assignmentList);
    
    sortAssignments(core.currentSortMethod, assignmentList);
    
    core.incrementNextAssignmentId();
    
    core.archivedAssignments.splice(core.selectedArchivedAssignment, 1);
    
    // Update list and reset selection
    ui.updateArchiveList(archiveList, core.archivedAssignments);
    core.setSelectedArchivedAssignment(null);
    
    if (restoreAssignmentBtn) restoreAssignmentBtn.disabled = true;
    if (deleteForeverBtn) deleteForeverBtn.disabled = true;
    
    return newAssignment;
}

// Function to permanently delete an archived assignment
export function deleteForeverArchivedAssignment(restoreAssignmentBtn, deleteForeverBtn, archiveList) {
    if (core.selectedArchivedAssignment === null) return;
    
    if (confirm('Are you sure you want to permanently delete this assignment? This action cannot be undone.')) {
        const assignmentName = core.archivedAssignments[core.selectedArchivedAssignment].name;
        core.archivedAssignments.splice(core.selectedArchivedAssignment, 1);
        ui.updateArchiveList(archiveList, core.archivedAssignments);
        
        core.setSelectedArchivedAssignment(null);
        if (restoreAssignmentBtn) restoreAssignmentBtn.disabled = true;
        if (deleteForeverBtn) deleteForeverBtn.disabled = true;
    }
}

// Add event listeners to assignment
export function addAssignmentEventListeners(assignmentRow, previewPanel, pdfPreviewContainer) {
    const assignmentName = assignmentRow.querySelector('.assignment-name');
    if (assignmentName) {
        assignmentName.addEventListener('click', function(e) {
            if (!core.editMode && !core.uploadMode && !core.deleteMode) {
                const rowId = assignmentRow.dataset.id;
                ui.showPreview(rowId, previewPanel, pdfPreviewContainer, core.uploadedPreviews);
            }
        });
    }
    
    // Grade button click
    const gradeBtn = assignmentRow.querySelector('.grade-button');
    if (gradeBtn) {
        gradeBtn.addEventListener('click', function() {
            const assignmentId = this.dataset.id;
            console.log(`Grading assignment ${assignmentId}`);
            alert(`This would redirect to the grading page for assignment ${assignmentId}`);
            
        });
    }
    
    // Rubric button click
    const rubricBtn = assignmentRow.querySelector('.rubric-button');
    if (rubricBtn) {
        rubricBtn.addEventListener('click', function() {
            const assignmentId = this.dataset.id;
            console.log(`Opening rubric for assignment ${assignmentId}`);
            alert(`This would redirect to the rubric page for assignment ${assignmentId}`);
            
        });
    }
    
    // Stats button click
    const statsBtn = assignmentRow.querySelector('.stats-button');
    if (statsBtn) {
        statsBtn.addEventListener('click', function() {
            const assignmentId = this.dataset.id;
            console.log(`Showing stats for assignment ${assignmentId}`);
            alert(`This would redirect to the stats page for assignment ${assignmentId}`);
            // Eventually this is gonna do somthing like: window.location.href = `/stats/${assignmentId}/`;
        });
    }
    
    // Row click for edit and upload modes
    assignmentRow.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || 
            e.target.classList.contains('assignment-name') ||
            e.target.closest('button')) {
            return;
        }
        
        if (core.editMode) {
            // In edit mode: clicking row opens edit modal
            ui.showEditModal(document.getElementById('editModal'), this.dataset.id, 
                         document.getElementById('editAssignmentName'),
                         document.getElementById('editCreatedOnDate'),
                         document.getElementById('editDeadlineDate'),
                         document.querySelectorAll('#editModal .checkbox-item input[type="checkbox"]'));
        } else if (core.uploadMode) {
            // In upload mode: clicking row opens upload modal
            ui.showUploadModal(document.getElementById('uploadModal'), this.dataset.id,
                           document.getElementById('uploadAssignmentName'),
                           document.getElementById('studentFilesInput'),
                           document.getElementById('previewFileInput'),
                           document.getElementById('studentFilesList'),
                           document.getElementById('previewFileName'),
                           document.getElementById('previewTabBtn'),
                           core.uploadedFiles,
                           core.uploadedPreviews);
        }
    });
}