document.addEventListener('DOMContentLoaded', function() {
    // Variables to track state
    let deleteMode = false;
    let editMode = false;
    let nextAssignmentId = 8; // Start from ID 8 (after the initial 7)
    let nextTopPosition = 539; // Starting position for new assignments
    let currentEditingId = null;
    let fileUploads = {}; // To track uploaded files by assignment ID
    
    // Load saved state from localStorage
    loadStateFromStorage();
    
    // Elements
    const previewPanel = document.getElementById('previewPanel');
    const previewContent = document.getElementById('previewContent');
    const closePreviewBtn = document.getElementById('closePreview');
    const createBtn = document.getElementById('createBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const editBtn = document.getElementById('editBtn');
    const deleteCourseBtn = document.getElementById('deleteCourseBtn');
    const assignmentRows = document.querySelectorAll('.assignment-row');
    const gradeButtons = document.querySelectorAll('[class^="GRADE-button"]');
    const statsButtons = document.querySelectorAll('[class^="STATS-button"]');
    
    // Create modal elements
    const createModal = document.getElementById('createModal');
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    const confirmCreateBtn = document.getElementById('confirmCreateBtn');
    const assignmentNameInput = document.getElementById('assignmentName');
    const createdOnDateInput = document.getElementById('createdOnDate');
    const deadlineDateInput = document.getElementById('deadlineDate');
    const createPdfInput = document.getElementById('createPdfInput');
    const createFileInfo = document.getElementById('createFileInfo');
    const assignmentTypeCheckboxes = document.querySelectorAll('#createModal .checkbox-item input[type="checkbox"]');
    const assignmentList = document.getElementById('assignmentList');
    
    // Edit modal elements
    const editModal = document.getElementById('editModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const confirmEditBtn = document.getElementById('confirmEditBtn');
    const editAssignmentNameInput = document.getElementById('editAssignmentName');
    const editDeadlineDateInput = document.getElementById('editDeadlineDate');
    const previewPdfBtn = document.getElementById('previewPdfBtn');
    const editPdfInput = document.getElementById('editPdfInput');
    const editFileInfo = document.getElementById('editFileInfo');
    const editTypeCheckboxes = document.querySelectorAll('#editModal .checkbox-item input[type="checkbox"]');
    
    // Past assignments elements
    const pastAssignmentsBtn = document.getElementById('pastAssignmentsBtn');
    const pastAssignmentsModal = document.getElementById('pastAssignmentsModal');
    const pastAssignmentsList = document.getElementById('pastAssignmentsList');
    const cancelPastAssignmentsBtn = document.getElementById('cancelPastAssignmentsBtn');
    const restoreAssignmentBtn = document.getElementById('restoreAssignmentBtn');
    const deleteForeverBtn = document.getElementById('deleteForeverBtn');
    
    // State storage
    const storageKey = 'gatorGraderState';
    let pastAssignments = []; // Array to store deleted assignments
    let selectedPastAssignment = null; // Currently selected past assignment
    let deletedCourses = []; // Array to store deleted courses

    // Get CSRF token for AJAX requests
    function getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    // Function to show preview panel when an assignment is clicked
    function showPreview(assignmentId) {
        if (!deleteMode && !editMode) {
            // Get assignment data
            const assignmentRow = document.querySelector(`.assignment-row[data-id="${assignmentId}"]`);
            if (assignmentRow) {
                const assignmentName = assignmentRow.querySelector('.assignment-text').textContent;
                const types = assignmentRow.dataset.types ? assignmentRow.dataset.types.split(',') : [];
                const createdOn = assignmentRow.dataset.createdOn || 'Not specified';
                const deadline = assignmentRow.dataset.deadline || 'Not specified';
                
                // Populate preview content
                let previewHTML = `
                    <div class="preview-header">${assignmentName}</div>
                    <div class="preview-detail"><strong>Types:</strong> ${types.join(', ') || 'None'}</div>
                    <div class="preview-detail"><strong>Created On:</strong> ${createdOn}</div>
                    <div class="preview-detail"><strong>Deadline:</strong> ${deadline}</div>
                `;
                
                // Check if there's a file to preview
                if (fileUploads[assignmentId]) {
                    previewHTML += `
                        <div class="preview-detail">
                            <strong>File:</strong> ${fileUploads[assignmentId].name}
                            <button class="preview-file-btn" data-id="${assignmentId}">Preview File</button>
                        </div>
                    `;
                }
                
                previewContent.innerHTML = previewHTML;
                
                // Add event listener for preview file button if exists
                const previewFileBtn = previewContent.querySelector('.preview-file-btn');
                if (previewFileBtn) {
                    previewFileBtn.addEventListener('click', function() {
                        // In a real app, you'd show the file. This is a placeholder.
                        alert(`Previewing file: ${fileUploads[assignmentId].name}`);
                    });
                }
            }
            
            previewPanel.classList.add('preview-shown');
            previewPanel.dataset.currentAssignment = assignmentId;
        }
    }

    // Function to hide preview panel
    function hidePreview() {
        previewPanel.classList.remove('preview-shown');
        delete previewPanel.dataset.currentAssignment;
        previewContent.innerHTML = '';
    }

    // Function to toggle delete mode
    function toggleDeleteMode() {
        deleteMode = !deleteMode;
        
        if (deleteMode && editMode) {
            // Turn off edit mode if it's on
            toggleEditMode();
        }
        
        // Toggle delete icon visibility
        document.querySelectorAll('.delete-icon-wrapper').forEach(x => {
            x.style.display = deleteMode ? 'inline-block' : 'none';
        });
        
        // Toggle assignment row class
        assignmentRows.forEach(row => {
            if (deleteMode) {
                row.classList.add('delete-mode');
            } else {
                row.classList.remove('delete-mode');
            }
        });
        
        // Change delete button appearance
        if (deleteMode) {
            deleteBtn.style.backgroundColor = '#c695d8';
        } else {
            deleteBtn.style.backgroundColor = '#daacf0';
        }
    }
    
    // Function to toggle edit mode
    function toggleEditMode() {
        editMode = !editMode;
        
        if (editMode && deleteMode) {
            // Turn off delete mode if it's on
            toggleDeleteMode();
        }
        
        // Toggle edit icon visibility
        document.querySelectorAll('.edit-icon-wrapper').forEach(pencil => {
            pencil.style.display = editMode ? 'inline-block' : 'none';
        });
        
        // Toggle assignment row class
        assignmentRows.forEach(row => {
            if (editMode) {
                row.classList.add('edit-mode');
            } else {
                row.classList.remove('edit-mode');
            }
        });
        
        // Change edit button appearance
        if (editMode) {
            editBtn.style.backgroundColor = '#c695d8';
        } else {
            editBtn.style.backgroundColor = '#daacf0';
        }
    }

    // Function to show the create modal
    function showCreateModal() {
        createModal.classList.add('modal-visible');
        assignmentNameInput.value = '';
        
        // Set today's date for creation date
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        createdOnDateInput.value = formattedDate;
        
        // Clear deadline date and file info
        deadlineDateInput.value = '';
        createFileInfo.textContent = '';
        
        // Uncheck all checkboxes
        assignmentTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        assignmentNameInput.focus();
    }

    // Function to hide the create modal
    function hideCreateModal() {
        createModal.classList.remove('modal-visible');
    }
    
    // Function to show the edit modal
    function showEditModal(assignmentId, name, types) {
        editModal.classList.add('modal-visible');
        editAssignmentNameInput.value = name;
        currentEditingId = assignmentId;
        
        // Find the assignment to get date values
        const assignmentRow = document.querySelector(`.assignment-row[data-id="${assignmentId}"]`);
        if (assignmentRow) {
            editDeadlineDateInput.value = assignmentRow.dataset.deadline || '';
        }
        
        // Display file info if exists
        editFileInfo.textContent = '';
        if (fileUploads[assignmentId]) {
            editFileInfo.textContent = `Current file: ${fileUploads[assignmentId].name}`;
        }
        
        // Reset all checkboxes
        editTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the appropriate checkboxes
        if (types) {
            const typeArray = types.split(',');
            typeArray.forEach(type => {
                const checkbox = document.getElementById(`editType${type.charAt(0).toUpperCase() + type.slice(1)}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        editAssignmentNameInput.focus();
    }
    
    // Function to hide the edit modal
    function hideEditModal() {
        editModal.classList.remove('modal-visible');
        currentEditingId = null;
    }

    // Function to create a new assignment
    function createNewAssignment() {
        const assignmentName = assignmentNameInput.value.trim();
        if (!assignmentName) {
            alert('Please enter an assignment name');
            return;
        }

        // Get dates
        const createdOn = createdOnDateInput.value;
        const deadline = deadlineDateInput.value;

        // Get selected assignment types
        const selectedTypes = [];
        assignmentTypeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTypes.push(checkbox.value);
            }
        });

        // Create new assignment row
        const newAssignment = document.createElement('div');
        newAssignment.className = 'new-assignment assignment-row';
        newAssignment.dataset.id = nextAssignmentId;
        newAssignment.dataset.types = selectedTypes.join(',');
        newAssignment.dataset.createdOn = createdOn;
        newAssignment.dataset.deadline = deadline;
        newAssignment.style.top = `${nextTopPosition}px`;
        
        // Create the inner HTML with SVG icons
        newAssignment.innerHTML = `
            <span class="delete-icon-wrapper" style="display: ${deleteMode ? 'inline-block' : 'none'}">
                <svg class="icon-svg"><use xlink:href="#delete-icon-svg"></use></svg>
            </span>
            <span class="edit-icon-wrapper" style="display: ${editMode ? 'inline-block' : 'none'}">
                <svg class="icon-svg"><use xlink:href="#edit-icon-svg"></use></svg>
            </span>
            <span class="assignment-text">${assignmentName}</span>
        `;

        // Create GRADE button for new assignment
        const newGradeBtn = document.createElement('div');
        newGradeBtn.className = `GRADE-button-${nextAssignmentId}`;
        newGradeBtn.dataset.id = nextAssignmentId;
        newGradeBtn.style.top = `${nextTopPosition - 5}px`;
        newGradeBtn.innerHTML = '<div class="text-wrapper-14">GRADE</div>';

        // Create STATS button for new assignment
        const newStatsBtn = document.createElement('div');
        newStatsBtn.className = `STATS-button-${nextAssignmentId}`;
        newStatsBtn.dataset.id = nextAssignmentId;
        newStatsBtn.style.top = `${nextTopPosition - 5}px`;
        newStatsBtn.innerHTML = '<div class="text-wrapper-14">STATS</div>';

        // Append new elements to DOM
        assignmentList.appendChild(newAssignment);
        document.querySelector('.div').appendChild(newGradeBtn);
        document.querySelector('.div').appendChild(newStatsBtn);

        // Store file upload if provided
        if (createPdfInput.files.length > 0) {
            fileUploads[nextAssignmentId] = {
                name: createPdfInput.files[0].name,
                // In a real app, you'd handle the file upload to server here
            };
        }

        // Update state for next assignment
        nextAssignmentId++;
        nextTopPosition += 43; // Increment position for next new assignment

        // Add event listeners to new elements
        setupAssignmentEventListeners(newAssignment, newGradeBtn, newStatsBtn);

        // Hide the modal
        hideCreateModal();
        
        // Save state
        saveStateToStorage();
    }
    
    // Function to setup event listeners for assignment rows
    function setupAssignmentEventListeners(assignmentRow, gradeBtn, statsBtn) {
        assignmentRow.addEventListener('click', function(e) {
            // Don't show preview if clicking on the delete or edit icons
            if (e.target.closest('.delete-icon-wrapper') || e.target.closest('.edit-icon-wrapper')) {
                return;
            }
            
            if (previewPanel.classList.contains('preview-shown') && 
                previewPanel.dataset.currentAssignment === this.dataset.id) {
                hidePreview();
            } else {
                showPreview(this.dataset.id);
            }
        });

        const deleteIcon = assignmentRow.querySelector('.delete-icon-wrapper');
        if (deleteIcon) {
            deleteIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteAssignment(assignmentRow, gradeBtn, statsBtn);
            });
        }
        
        const editIcon = assignmentRow.querySelector('.edit-icon-wrapper');
        if (editIcon) {
            editIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                const assignmentText = assignmentRow.querySelector('.assignment-text').textContent;
                showEditModal(assignmentRow.dataset.id, assignmentText, assignmentRow.dataset.types);
            });
        }

        if (gradeBtn) {
            gradeBtn.addEventListener('click', function() {
                console.log(`Grading assignment ${this.dataset.id}`);
                // In a real app, you'd redirect to grading page
                window.location.href = `/gradeassignment/?assignment_id=${this.dataset.id}`;
            });
        }

        if (statsBtn) {
            statsBtn.addEventListener('click', function() {
                console.log(`Showing stats for assignment ${this.dataset.id}`);
                // In a real app, you'd redirect to stats page or show stats modal
            });
        }
    }
    
    // Function to update an assignment
    function updateAssignment() {
        if (!currentEditingId) return;
        
        const assignmentName = editAssignmentNameInput.value.trim();
        if (!assignmentName) {
            alert('Please enter an assignment name');
            return;
        }
        
        // Get deadline date
        const deadline = editDeadlineDateInput.value;
        
        // Get selected assignment types
        const selectedTypes = [];
        editTypeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTypes.push(checkbox.value);
            }
        });
        
        // Find the assignment row
        const assignmentRow = document.querySelector(`.assignment-row[data-id="${currentEditingId}"]`);
        if (assignmentRow) {
            // Update the assignment data
            assignmentRow.dataset.types = selectedTypes.join(',');
            assignmentRow.dataset.deadline = deadline;
            
            // Update text content while preserving icons
            const assignmentText = assignmentRow.querySelector('.assignment-text');
            if (assignmentText) {
                assignmentText.textContent = assignmentName;
            }
            
            // Store file upload if provided
            if (editPdfInput.files.length > 0) {
                fileUploads[currentEditingId] = {
                    name: editPdfInput.files[0].name,
                    // In a real app, you'd handle the file upload to server here
                };
            }
        }
        
        // Hide the modal
        hideEditModal();
        
        // Save state
        saveStateToStorage();
        
        // Update preview if currently showing this assignment
        if (previewPanel.classList.contains('preview-shown') && 
            previewPanel.dataset.currentAssignment === currentEditingId) {
            showPreview(currentEditingId);
        }
    }

    // Function to delete an assignment
    function deleteAssignment(assignmentRow, gradeBtn, statsBtn) {
        if (!confirm('Are you sure you want to delete this assignment?')) {
            return;
        }

        // Get all assignments after the deleted one to move them up
        const deletedId = assignmentRow.dataset.id;
        const allAssignments = document.querySelectorAll('.assignment-row');
        const allGradeButtons = document.querySelectorAll('[class^="GRADE-button"]');
        const allStatsButtons = document.querySelectorAll('[class^="STATS-button"]');
        
        // Save assignment to past assignments before removing
        const assignmentText = assignmentRow.querySelector('.assignment-text').textContent;
        const assignmentTypes = assignmentRow.dataset.types || '';
        const createdOn = assignmentRow.dataset.createdOn || '';
        const deadline = assignmentRow.dataset.deadline || '';
        
        pastAssignments.push({
            id: deletedId,
            name: assignmentText,
            types: assignmentTypes,
            createdOn: createdOn,
            deadline: deadline,
            fileInfo: fileUploads[deletedId],
            deletedTime: new Date()
        });
        
        // Remove the elements from view
        assignmentRow.remove();
        if (gradeBtn) gradeBtn.remove();
        if (statsBtn) statsBtn.remove();
        
        // Reposition all assignments after the deleted one
        allAssignments.forEach(row => {
            const rowId = parseInt(row.dataset.id);
            if (rowId > parseInt(deletedId)) {
                // Calculate current top position and move up by 43px
                const currentTop = parseInt(row.style.top || getComputedStyle(row).top);
                if (!isNaN(currentTop)) {
                    row.style.top = `${currentTop - 43}px`;
                }
            }
        });
        
        // Reposition grade buttons
        allGradeButtons.forEach(button => {
            const btnId = parseInt(button.dataset.id);
            if (btnId > parseInt(deletedId)) {
                const currentTop = parseInt(button.style.top || getComputedStyle(button).top);
                if (!isNaN(currentTop)) {
                    button.style.top = `${currentTop - 43}px`;
                }
            }
        });
        
        // Reposition stats buttons
        allStatsButtons.forEach(button => {
            const btnId = parseInt(button.dataset.id);
            if (btnId > parseInt(deletedId)) {
                const currentTop = parseInt(button.style.top || getComputedStyle(button).top);
                if (!isNaN(currentTop)) {
                    button.style.top = `${currentTop - 43}px`;
                }
            }
        });
        
        // Update the nextTopPosition for new assignments
        nextTopPosition -= 43;
        
        // Save state
        saveStateToStorage();
        
        // Hide preview if currently showing this assignment
        if (previewPanel.classList.contains('preview-shown') && 
            previewPanel.dataset.currentAssignment === deletedId) {
            hidePreview();
        }
    }

    // Function to delete the course
    function deleteCourse() {
        if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            // Add the current course to deleted courses
            const courseId = deleteCourseBtn.dataset.courseId;
            if (courseId) {
                // Send AJAX request to delete course on server
                fetch(`/delete-course/${courseId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCsrfToken(),
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Course deleted on server');
                        // Redirect to course listing page
                        window.location.href = '/';
                    } else {
                        alert('Error deleting course. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error deleting course:', error);
                    alert('Error deleting course. Please try again.');
                });
            }
        }
    }
    
    // Function to show past assignments modal
    function showPastAssignmentsModal() {
        updatePastAssignmentsList();
        pastAssignmentsModal.classList.add('modal-visible');
    }
    
    // Function to hide past assignments modal
    function hidePastAssignmentsModal() {
        pastAssignmentsModal.classList.remove('modal-visible');
        selectedPastAssignment = null;
        restoreAssignmentBtn.disabled = true;
        deleteForeverBtn.disabled = true;
    }
    
    // Function to update the past assignments list
    function updatePastAssignmentsList() {
        // Clear current list
        pastAssignmentsList.innerHTML = '';
        
        if (pastAssignments.length === 0) {
            pastAssignmentsList.innerHTML = '<div class="no-past-assignments">No past assignments found.</div>';
            return;
        }
        
        // Sort by most recently deleted first
        pastAssignments.sort((a, b) => new Date(b.deletedTime) - new Date(a.deletedTime));
        
        // Add each past assignment to the list
        pastAssignments.forEach((assignment, index) => {
            const item = document.createElement('div');
            item.className = 'past-assignment-item';
            item.dataset.index = index;
            
            // Format the HTML with assignment details
            let assignmentHTML = `
                <div class="past-assignment-name">${assignment.name}</div>
                <div class="past-assignment-details">
                    <span class="past-assignment-type">${assignment.types ? assignment.types.split(',').join(', ') : 'No type'}</span>
            `;
            
            if (assignment.createdOn) {
                assignmentHTML += `<span class="past-assignment-date">Created: ${assignment.createdOn}</span>`;
            }
            
            if (assignment.fileInfo) {
                assignmentHTML += `<span class="past-assignment-file">Has file: ${assignment.fileInfo.name}</span>`;
            }
            
            assignmentHTML += '</div>';
            item.innerHTML = assignmentHTML;
            
            item.addEventListener('click', function() {
                // Deselect any previously selected item
                document.querySelectorAll('.past-assignment-item.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Select this item
                this.classList.add('selected');
                selectedPastAssignment = index;
                
                // Enable action buttons
                restoreAssignmentBtn.disabled = false;
                deleteForeverBtn.disabled = false;
            });
            
            pastAssignmentsList.appendChild(item);
        });
    }
    
    // Function to restore a past assignment
    function restorePastAssignment() {
        if (selectedPastAssignment === null) return;
        
        const assignment = pastAssignments[selectedPastAssignment];
        
        // Create new assignment row
        const newAssignment = document.createElement('div');
        newAssignment.className = 'new-assignment assignment-row';
        newAssignment.dataset.id = nextAssignmentId;
        newAssignment.dataset.types = assignment.types;
        newAssignment.dataset.createdOn = assignment.createdOn;
        newAssignment.dataset.deadline = assignment.deadline;
        newAssignment.style.top = `${nextTopPosition}px`;
        
        // Create the inner HTML with icons
        newAssignment.innerHTML = `
            <span class="delete-icon-wrapper" style="display: ${deleteMode ? 'inline-block' : 'none'}">
                <svg class="icon-svg"><use xlink:href="#delete-icon-svg"></use></svg>
            </span>
            <span class="edit-icon-wrapper" style="display: ${editMode ? 'inline-block' : 'none'}">
                <svg class="icon-svg"><use xlink:href="#edit-icon-svg"></use></svg>
            </span>
            <span class="assignment-text">${assignment.name}</span>
        `;

        // Create GRADE button for new assignment
        const newGradeBtn = document.createElement('div');
        newGradeBtn.className = `GRADE-button-${nextAssignmentId}`;
        newGradeBtn.dataset.id = nextAssignmentId;
        newGradeBtn.style.top = `${nextTopPosition - 5}px`;
        newGradeBtn.innerHTML = '<div class="text-wrapper-14">GRADE</div>';

        // Create STATS button for new assignment
        const newStatsBtn = document.createElement('div');
        newStatsBtn.className = `STATS-button-${nextAssignmentId}`;
        newStatsBtn.dataset.id = nextAssignmentId;
        newStatsBtn.style.top = `${nextTopPosition - 5}px`;
        newStatsBtn.innerHTML = '<div class="text-wrapper-14">STATS</div>';

        // Append new elements to DOM
        assignmentList.appendChild(newAssignment);
        document.querySelector('.div').appendChild(newGradeBtn);
        document.querySelector('.div').appendChild(newStatsBtn);
        
        // Restore file if existed
        if (assignment.fileInfo) {
            fileUploads[nextAssignmentId] = assignment.fileInfo;
        }

        // Update state for next assignment
        nextAssignmentId++;
        nextTopPosition += 43;

        // Add event listeners to new elements
        setupAssignmentEventListeners(newAssignment, newGradeBtn, newStatsBtn);
        
        // Remove from past assignments
        pastAssignments.splice(selectedPastAssignment, 1);
        
        // Update list and close modal
        updatePastAssignmentsList();
        hidePastAssignmentsModal();
        
        // Save state
        saveStateToStorage();
    }
    
    // Function to permanently delete a past assignment
    function deleteForeverPastAssignment() {
        if (selectedPastAssignment === null) return;
        
        if (confirm('Are you sure you want to permanently delete this assignment? This action cannot be undone.')) {
            pastAssignments.splice(selectedPastAssignment, 1);
            updatePastAssignmentsList();
            selectedPastAssignment = null;
            restoreAssignmentBtn.disabled = true;
            deleteForeverBtn.disabled = true;
            
            // Save state
            saveStateToStorage();
        }
    }
    
    // Function to save state to localStorage
    function saveStateToStorage() {
        const state = {
            pastAssignments: pastAssignments,
            fileUploads: fileUploads,
            nextAssignmentId: nextAssignmentId,
            nextTopPosition: nextTopPosition
        };
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }
    
    // Function to load state from localStorage
    function loadStateFromStorage() {
        try {
            const savedState = localStorage.getItem(storageKey);
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Load past assignments
                if (state.pastAssignments) {
                    pastAssignments = state.pastAssignments.map(a => ({
                        ...a,
                        deletedTime: new Date(a.deletedTime)
                    }));
                }
                
                // Load file uploads
                if (state.fileUploads) {
                    fileUploads = state.fileUploads;
                }
                
                // Load next ID and position
                if (state.nextAssignmentId) {
                    nextAssignmentId = state.nextAssignmentId;
                }
                
                if (state.nextTopPosition) {
                    nextTopPosition = state.nextTopPosition;
                }
                
                // Restore dates to assignment rows
                document.querySelectorAll('.assignment-row').forEach(row => {
                    // Find matching assignment data in saved state if exists
                    const assignmentId = row.dataset.id;
                    const savedAssignment = state.assignments ? 
                        state.assignments.find(a => a.id === assignmentId) : null;
                    
                    if (savedAssignment) {
                        row.dataset.createdOn = savedAssignment.createdOn || '';
                        row.dataset.deadline = savedAssignment.deadline || '';
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }

    // File upload event handlers
    createPdfInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            createFileInfo.textContent = `Selected: ${this.files[0].name}`;
        } else {
            createFileInfo.textContent = '';
        }
    });
    
    editPdfInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            editFileInfo.textContent = `Selected: ${this.files[0].name}`;
        } else {
            // Show existing file if there is one
            if (currentEditingId && fileUploads[currentEditingId]) {
                editFileInfo.textContent = `Current file: ${fileUploads[currentEditingId].name}`;
            } else {
                editFileInfo.textContent = '';
            }
        }
    });
    
    // Preview PDF button
    previewPdfBtn.addEventListener('click', function() {
        if (currentEditingId && fileUploads[currentEditingId]) {
            alert(`Previewing file: ${fileUploads[currentEditingId].name}`);
            // In a real app, you'd show the PDF in a modal or iframe
        } else {
            alert('No file available to preview');
        }
    });

    // Set up event listeners for existing assignments
    assignmentRows.forEach(row => {
        setupAssignmentEventListeners(
            row, 
            document.querySelector(`.GRADE-button${row.dataset.id === '1' ? '' : '-' + row.dataset.id}`),
            document.querySelector(`.STATS-button${row.dataset.id === '1' ? '' : '-' + row.dataset.id}`)
        );
    });

    // Close preview button
    closePreviewBtn.addEventListener('click', hidePreview);

    // Create button
    createBtn.addEventListener('click', showCreateModal);

    // Delete button (toggle delete mode)
    deleteBtn.addEventListener('click', toggleDeleteMode);
    
    // Edit button (toggle edit mode)
    editBtn.addEventListener('click', toggleEditMode);

    // Delete course button
    deleteCourseBtn.addEventListener('click', deleteCourse);

    // Create Modal buttons
    cancelCreateBtn.addEventListener('click', hideCreateModal);
    confirmCreateBtn.addEventListener('click', createNewAssignment);
    
    // Edit Modal buttons
    cancelEditBtn.addEventListener('click', hideEditModal);
    confirmEditBtn.addEventListener('click', updateAssignment);

    // Past Assignments button
    pastAssignmentsBtn.addEventListener('click', showPastAssignmentsModal);
    
    // Past Assignments Modal buttons
    cancelPastAssignmentsBtn.addEventListener('click', hidePastAssignmentsModal);
    restoreAssignmentBtn.addEventListener('click', restorePastAssignment);
    deleteForeverBtn.addEventListener('click', deleteForeverPastAssignment);

    // GRADE buttons
    gradeButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log(`Grading assignment ${this.dataset.id}`);
            // In a real app, you'd redirect to grading page
            window.location.href = `/gradeassignment/?assignment_id=${this.dataset.id}`;
        });
    });

    // STATS buttons
    statsButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log(`Showing stats for assignment ${this.dataset.id}`);
            // In a real app, you'd show stats
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === createModal) {
            hideCreateModal();
        }
        if (event.target === editModal) {
            hideEditModal();
        }
        if (event.target === pastAssignmentsModal) {
            hidePastAssignmentsModal();
        }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // ESC key closes modals and preview
        if (e.key === 'Escape') {
            hideCreateModal();
            hideEditModal();
            hidePastAssignmentsModal();
            hidePreview();
        }
        
        // Enter key in create modal confirms creation
        if (e.key === 'Enter' && createModal.classList.contains('modal-visible')) {
            createNewAssignment();
        }
        
        // Enter key in edit modal confirms update
        if (e.key === 'Enter' && editModal.classList.contains('modal-visible')) {
            updateAssignment();
        }
    });
    
    // Close preview when clicking outside the preview panel
    document.addEventListener('click', function(e) {
        // If preview is shown and click is not inside the preview
        if (previewPanel.classList.contains('preview-shown') && 
            !previewPanel.contains(e.target) && 
            !e.target.classList.contains('assignment-row') &&
            !e.target.closest('.assignment-row')) {
            hidePreview();
        }
    });
});

// This code shows how to integrate local storage with server storage
// Add these functions to your existing assignmentbylist.js file

// Get course ID from the page
function getCourseId() {
    return document.getElementById('deleteCourseBtn').dataset.courseId;
}

// Server integration for course deletion
function deleteCourse() {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        const courseId = getCourseId();
        if (courseId) {
            // Use the API to delete the course on the server
            CourseAPI.deleteCourse(courseId)
                .then(response => {
                    console.log('Course deleted on server');
                    // Redirect to course listing page
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('Error deleting course:', error);
                    alert('Error deleting course. Please try again.');
                });
        }
    }
}

// Server integration for creating a new assignment
function createNewAssignmentWithServer() {
    const assignmentName = assignmentNameInput.value.trim();
    if (!assignmentName) {
        alert('Please enter an assignment name');
        return;
    }

    // Get dates
    const createdOn = createdOnDateInput.value;
    const deadline = deadlineDateInput.value;

    // Get selected assignment types
    const selectedTypes = [];
    assignmentTypeCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedTypes.push(checkbox.value);
        }
    });

    // Create assignment data object
    const assignmentData = {
        name: assignmentName,
        types: selectedTypes.join(','),
        deadline: deadline || null
    };

    // Use the API to create the assignment on the server
    AssignmentAPI.createAssignment(getCourseId(), assignmentData)
        .then(response => {
            console.log('Assignment created on server:', response);
            
            // Create the assignment in the UI with the ID from the server
            createNewAssignmentInUI(response.id, assignmentName, response.types, response.created_on, response.deadline);
            
            // Upload file if provided
            if (createPdfInput.files.length > 0) {
                uploadAssignmentFile(response.id, createPdfInput.files[0]);
            }
            
            // Hide the modal
            hideCreateModal();
        })
        .catch(error => {
            console.error('Error creating assignment:', error);
            alert('Error creating assignment. Please try again.');
        });
}

// Helper function to create assignment in UI
function createNewAssignmentInUI(assignmentId, name, types, createdOn, deadline) {
    // Create new assignment row
    const newAssignment = document.createElement('div');
    newAssignment.className = 'new-assignment assignment-row';
    newAssignment.dataset.id = assignmentId;
    newAssignment.dataset.types = types;
    newAssignment.dataset.createdOn = createdOn;
    newAssignment.dataset.deadline = deadline || '';
    newAssignment.style.top = `${nextTopPosition}px`;
    
    // Create the inner HTML with SVG icons
    newAssignment.innerHTML = `
        <span class="delete-icon-wrapper" style="display: ${deleteMode ? 'inline-block' : 'none'}">
            <svg class="icon-svg"><use xlink:href="#delete-icon-svg"></use></svg>
        </span>
        <span class="edit-icon-wrapper" style="display: ${editMode ? 'inline-block' : 'none'}">
            <svg class="icon-svg"><use xlink:href="#edit-icon-svg"></use></svg>
        </span>
        <span class="assignment-text">${name}</span>
    `;

    // Create GRADE button for new assignment
    const newGradeBtn = document.createElement('div');
    newGradeBtn.className = `GRADE-button-${assignmentId}`;
    newGradeBtn.dataset.id = assignmentId;
    newGradeBtn.style.top = `${nextTopPosition - 5}px`;
    newGradeBtn.innerHTML = '<div class="text-wrapper-14">GRADE</div>';

    // Create STATS button for new assignment
    const newStatsBtn = document.createElement('div');
    newStatsBtn.className = `STATS-button-${assignmentId}`;
    newStatsBtn.dataset.id = assignmentId;
    newStatsBtn.style.top = `${nextTopPosition - 5}px`;
    newStatsBtn.innerHTML = '<div class="text-wrapper-14">STATS</div>';

    // Append new elements to DOM
    assignmentList.appendChild(newAssignment);
    document.querySelector('.div').appendChild(newGradeBtn);
    document.querySelector('.div').appendChild(newStatsBtn);

    // Update state for next assignment
    nextAssignmentId = Math.max(nextAssignmentId, parseInt(assignmentId) + 1);
    nextTopPosition += 43; // Increment position for next new assignment

    // Add event listeners to new elements
    setupAssignmentEventListeners(newAssignment, newGradeBtn, newStatsBtn);
}

// Server integration for updating an assignment
function updateAssignmentWithServer() {
    if (!currentEditingId) return;
    
    const assignmentName = editAssignmentNameInput.value.trim();
    if (!assignmentName) {
        alert('Please enter an assignment name');
        return;
    }
    
    // Get deadline date
    const deadline = editDeadlineDateInput.value;
    
    // Get selected assignment types
    const selectedTypes = [];
    editTypeCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedTypes.push(checkbox.value);
        }
    });
    
    // Create assignment data object
    const assignmentData = {
        name: assignmentName,
        types: selectedTypes.join(','),
        deadline: deadline || null
    };
    
    // Use the API to update the assignment on the server
    AssignmentAPI.updateAssignment(currentEditingId, assignmentData)
        .then(response => {
            console.log('Assignment updated on server:', response);
            
            // Update the assignment in the UI
            updateAssignmentInUI(response.id, response.name, response.types, response.created_on, response.deadline);
            
            // Upload file if provided
            if (editPdfInput.files.length > 0) {
                uploadAssignmentFile(response.id, editPdfInput.files[0]);
            }
            
            // Hide the modal
            hideEditModal();
        })
        .catch(error => {
            console.error('Error updating assignment:', error);
            alert('Error updating assignment. Please try again.');
        });
}

// Helper function to update assignment in UI
function updateAssignmentInUI(assignmentId, name, types, createdOn, deadline) {
    // Find the assignment row
    const assignmentRow = document.querySelector(`.assignment-row[data-id="${assignmentId}"]`);
    if (assignmentRow) {
        // Update the assignment data
        assignmentRow.dataset.types = types;
        assignmentRow.dataset.createdOn = createdOn;
        assignmentRow.dataset.deadline = deadline || '';
        
        // Update text content while preserving icons
        const assignmentText = assignmentRow.querySelector('.assignment-text');
        if (assignmentText) {
            assignmentText.textContent = name;
        }
    }
    
    // Update preview if currently showing this assignment
    if (previewPanel.classList.contains('preview-shown') && 
        previewPanel.dataset.currentAssignment === assignmentId) {
        showPreview(assignmentId);
    }
}

// Server integration for deleting an assignment
function deleteAssignmentWithServer(assignmentRow, gradeBtn, statsBtn) {
    if (!confirm('Are you sure you want to delete this assignment?')) {
        return;
    }

    const assignmentId = assignmentRow.dataset.id;
    
    // Use the API to delete the assignment on the server
    AssignmentAPI.deleteAssignment(assignmentId)
        .then(response => {
            console.log('Assignment deleted on server:', response);
            
            // Delete the assignment from the UI
            deleteAssignmentFromUI(assignmentRow, gradeBtn, statsBtn);
        })
        .catch(error => {
            console.error('Error deleting assignment:', error);
            alert('Error deleting assignment. Please try again.');
        });
}

// Helper function to delete assignment from UI
function deleteAssignmentFromUI(assignmentRow, gradeBtn, statsBtn) {
    // Get all assignments after the deleted one to move them up
    const deletedId = assignmentRow.dataset.id;
    const allAssignments = document.querySelectorAll('.assignment-row');
    const allGradeButtons = document.querySelectorAll('[class^="GRADE-button"]');
    const allStatsButtons = document.querySelectorAll('[class^="STATS-button"]');
    
    // Save assignment to past assignments before removing
    const assignmentText = assignmentRow.querySelector('.assignment-text').textContent;
    const assignmentTypes = assignmentRow.dataset.types || '';
    const createdOn = assignmentRow.dataset.createdOn || '';
    const deadline = assignmentRow.dataset.deadline || '';
    
    pastAssignments.push({
        id: deletedId,
        name: assignmentText,
        types: assignmentTypes,
        createdOn: createdOn,
        deadline: deadline,
        fileInfo: fileUploads[deletedId],
        deletedTime: new Date()
    });
    
    // Remove the elements from view
    assignmentRow.remove();
    if (gradeBtn) gradeBtn.remove();
    if (statsBtn) statsBtn.remove();
    
    // Reposition all assignments after the deleted one
    allAssignments.forEach(row => {
        const rowId = parseInt(row.dataset.id);
        if (rowId > parseInt(deletedId)) {
            // Calculate current top position and move up by 43px
            const currentTop = parseInt(row.style.top || getComputedStyle(row).top);
            if (!isNaN(currentTop)) {
                row.style.top = `${currentTop - 43}px`;
            }
        }
    });
    
    // Reposition grade buttons
    allGradeButtons.forEach(button => {
        const btnId = parseInt(button.dataset.id);
        if (btnId > parseInt(deletedId)) {
            const currentTop = parseInt(button.style.top || getComputedStyle(button).top);
            if (!isNaN(currentTop)) {
                button.style.top = `${currentTop - 43}px`;
            }
        }
    });
    
    // Reposition stats buttons
    allStatsButtons.forEach(button => {
        const btnId = parseInt(button.dataset.id);
        if (btnId > parseInt(deletedId)) {
            const currentTop = parseInt(button.style.top || getComputedStyle(button).top);
            if (!isNaN(currentTop)) {
                button.style.top = `${currentTop - 43}px`;
            }
        }
    });
    
    // Update the nextTopPosition for new assignments
    nextTopPosition -= 43;
    
    // Save state
    saveStateToStorage();
    
    // Hide preview if currently showing this assignment
    if (previewPanel.classList.contains('preview-shown') && 
        previewPanel.dataset.currentAssignment === deletedId) {
        hidePreview();
    }
}

// Server integration for restoring an assignment
function restorePastAssignmentWithServer() {
    if (selectedPastAssignment === null) return;
    
    const assignment = pastAssignments[selectedPastAssignment];
    
    // Use the API to restore the assignment on the server
    AssignmentAPI.restoreAssignment(assignment.id)
        .then(response => {
            console.log('Assignment restored on server:', response);
            
            // Restore the assignment in the UI
            // You can reuse the createNewAssignmentInUI function
            createNewAssignmentInUI(
                assignment.id, 
                assignment.name, 
                assignment.types, 
                assignment.createdOn, 
                assignment.deadline
            );
            
            // Restore file if existed
            if (assignment.fileInfo) {
                fileUploads[assignment.id] = assignment.fileInfo;
            }
            
            // Remove from past assignments
            pastAssignments.splice(selectedPastAssignment, 1);
            
            // Update list and close modal
            updatePastAssignmentsList();
            hidePastAssignmentsModal();
        })
        .catch(error => {
            console.error('Error restoring assignment:', error);
            alert('Error restoring assignment. Please try again.');
        });
}

// Server integration for permanently deleting an assignment
function deleteForeverPastAssignmentWithServer() {
    if (selectedPastAssignment === null) return;
    
    if (confirm('Are you sure you want to permanently delete this assignment? This action cannot be undone.')) {
        const assignment = pastAssignments[selectedPastAssignment];
        
        // Use the API to permanently delete the assignment on the server
        AssignmentAPI.permanentDeleteAssignment(assignment.id)
            .then(response => {
                console.log('Assignment permanently deleted on server:', response);
                
                // Remove from past assignments
                pastAssignments.splice(selectedPastAssignment, 1);
                
                // Update list
                updatePastAssignmentsList();
                selectedPastAssignment = null;
                restoreAssignmentBtn.disabled = true;
                deleteForeverBtn.disabled = true;
            })
            .catch(error => {
                console.error('Error permanently deleting assignment:', error);
                alert('Error permanently deleting assignment. Please try again.');
            });
    }
}

// Function to upload a file for an assignment
function uploadAssignmentFile(assignmentId, file) {
    AssignmentAPI.uploadFile(assignmentId, file)
        .then(response => {
            console.log('File uploaded:', response);
            
            // Store file info
            fileUploads[assignmentId] = {
                id: response.file_id,
                name: response.file_name,
                url: response.file_url
            };
            
            // Save state
            saveStateToStorage();
            
            // Update preview if currently showing this assignment
            if (previewPanel.classList.contains('preview-shown') && 
                previewPanel.dataset.currentAssignment === assignmentId) {
                showPreview(assignmentId);
            }
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        });
}