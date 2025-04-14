import * as core from './core.js';
import * as ui from './ui.js';
import * as assignments from './assignments.js';
import * as uploads from './uploads.js';
import * as settings from './settings.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log("JavaScript loaded and running!"); // Debug message to confirm script is running
    
    const previewPanel = document.getElementById('previewPanel');
    const pdfPreviewContainer = document.getElementById('pdfPreviewContainer');
    const closePreviewBtn = document.getElementById('closePreview');
    
    // Action buttons
    const createBtn = document.getElementById('createBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const editBtn = document.getElementById('editBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const deleteCourseBtn = document.getElementById('deleteCourseBtn');
    
    // Log button existence for debugging
    console.log("Action buttons found:", {
        createBtn: !!createBtn,
        uploadBtn: !!uploadBtn,
        deleteBtn: !!deleteBtn,
        editBtn: !!editBtn,
        settingsBtn: !!settingsBtn
    });
    
    const assignmentRows = document.querySelectorAll('.assignment-row');
    const emptyState = document.getElementById('emptyState');
    const assignmentsContainer = document.getElementById('assignmentsContainer');
    const searchInput = document.getElementById('searchInput');
    const assignmentRowTemplate = document.getElementById('assignmentRowTemplate');
    
    // Sort elements
    const sortBtn = document.getElementById('sortBtn');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortOptions = document.getElementById('sortOptions');
    
    // Create modal elements
    const createModal = document.getElementById('createModal');
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    const confirmCreateBtn = document.getElementById('confirmCreateBtn');
    const assignmentNameInput = document.getElementById('assignmentName');
    const deadlineDateInput = document.getElementById('deadlineDate');
    const createdOnDateInput = document.getElementById('createdOnDate');
    const assignmentTypeCheckboxes = document.querySelectorAll('#createModal .checkbox-item input[type="checkbox"]');
    const assignmentList = document.getElementById('assignmentList');
    
    // Edit modal elements
    const editModal = document.getElementById('editModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const confirmEditBtn = document.getElementById('confirmEditBtn');
    const editAssignmentNameInput = document.getElementById('editAssignmentName');
    const editDeadlineDateInput = document.getElementById('editDeadlineDate');
    const editCreatedOnDateInput = document.getElementById('editCreatedOnDate');
    const editTypeCheckboxes = document.querySelectorAll('#editModal .checkbox-item input[type="checkbox"]');
    
    // Upload modal elements
    const uploadModal = document.getElementById('uploadModal');
    const uploadAssignmentName = document.getElementById('uploadAssignmentName');
    const uploadTabBtns = document.querySelectorAll('.upload-tab-btn');
    const uploadTabContents = document.querySelectorAll('.upload-tab-content');
    const previewTabBtn = document.getElementById('previewTabBtn');
    const studentFilesInput = document.getElementById('studentFilesInput');
    const studentDropzone = document.getElementById('studentDropzone');
    const studentFilesList = document.getElementById('studentFilesList');
    const previewFileInput = document.getElementById('previewFileInput');
    const previewDropzone = document.getElementById('previewDropzone');
    const previewFileName = document.getElementById('previewFileName');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const confirmUploadBtn = document.getElementById('confirmUploadBtn');
    
    // Settings modal elements
    const settingsModal = document.getElementById('settingsModal');
    const courseAbbreviation = document.getElementById('courseAbbreviation');
    const courseNumber = document.getElementById('courseNumber');
    const courseFullName = document.getElementById('courseFullName');
    const courseSemester = document.getElementById('courseSemester');
    const courseYear = document.getElementById('courseYear');
    const courseSectionNumber = document.getElementById('courseSectionNumber');
    const disablePreviews = document.getElementById('disablePreviews');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // Archive elements
    const archiveBtn = document.getElementById('archiveBtn');
    const archiveModal = document.getElementById('archiveModal');
    const archiveList = document.getElementById('archiveList');
    const cancelArchiveBtn = document.getElementById('cancelArchiveBtn');
    const restoreAssignmentBtn = document.getElementById('restoreAssignmentBtn');
    const deleteForeverBtn = document.getElementById('deleteForeverBtn');
    
    // Current course ID from the URL or data attribute
    const courseId = deleteCourseBtn ? deleteCourseBtn.dataset.courseId : 
                    window.location.pathname.split('/').filter(Boolean).pop();
    
    // Initialize date
    const formattedDate = core.ensureCurrentDate();
    if (createdOnDateInput) {
        createdOnDateInput.value = formattedDate;
        createdOnDateInput.setAttribute('readonly', 'readonly');
    }
    
    // Load state from localStorage
    try {
        core.loadStateFromStorage(courseId, assignmentList, assignmentRowTemplate);
    } catch (error) {
        console.error("Error loading state:", error);
    }
    
    // Initial course settings load
    try {
        if (courseAbbreviation && courseNumber && courseFullName && courseSemester && courseYear) {
            settings.loadCourseSettings(courseId, courseAbbreviation, courseNumber, courseFullName, courseSemester, courseYear, courseSectionNumber, disablePreviews);
        }
    } catch (error) {
        console.error("Error loading course settings:", error);
    }
    
    // Check empty state
    if (emptyState && assignmentsContainer && assignmentList) {
        ui.checkEmptyState(emptyState, assignmentsContainer, assignmentList);
    }
    
    if (assignmentRows && assignmentRows.length > 0) {
        assignmentRows.forEach(row => {
            try {
                assignments.addAssignmentEventListeners(row, previewPanel, pdfPreviewContainer);
            } catch (error) {
                console.error("Error adding event listeners to row:", error);
            }
        });
    }
    
    // Also add event listeners to dynamically loaded assignment rows
    if (assignmentList) {
        const dynamicRows = assignmentList.querySelectorAll('.assignment-row');
        if (dynamicRows && dynamicRows.length > 0) {
            dynamicRows.forEach(row => {
                try {
                    assignments.addAssignmentEventListeners(row, previewPanel, pdfPreviewContainer);
                } catch (error) {
                    console.error("Error adding event listeners to dynamic row:", error);
                }
            });
        }
    }

    // EVENT LISTENERS
    
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', function() {
            console.log("Close preview clicked");
            ui.hidePreview(previewPanel, pdfPreviewContainer);
        });
    } else {
        console.error("Close preview button not found");
    }

    if (createBtn) {
        createBtn.addEventListener('click', function() {
            console.log("Create button clicked");
            ui.showCreateModal(createModal, assignmentNameInput, deadlineDateInput, createdOnDateInput, assignmentTypeCheckboxes);
        });
    } else {
        console.error("Create button not found");
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            console.log("Upload button clicked");
            assignments.toggleUploadMode(uploadBtn);
        });
    } else {
        console.error("Upload button not found");
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            console.log("Delete button clicked");
            assignments.toggleDeleteMode(deleteBtn);
        });
    } else {
        console.error("Delete button not found");
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            console.log("Edit button clicked");
            assignments.toggleEditMode(editBtn);
        });
    } else {
        console.error("Edit button not found");
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            console.log("Settings button clicked");
            ui.showSettingsModal(settingsModal, courseSectionNumber);
        });
    } else {
        console.error("Settings button not found");
    }

    if (deleteCourseBtn) {
        deleteCourseBtn.addEventListener('click', function() {
            console.log("Delete course button clicked");
            settings.deleteCourse(deleteCourseBtn);
        });
    } else {
        console.error("Delete course button not found");
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            console.log("Search input:", this.value);
            assignments.searchAssignments(this.value);
        });
    } else {
        console.error("Search input not found");
    }
    
    if (sortBtn) {
        sortBtn.addEventListener('click', function() {
            console.log("Sort button clicked");
            ui.toggleSortDropdown(sortDropdown);
        });
    } else {
        console.error("Sort button not found");
    }
    
    if (sortOptions) {
        const sortLinks = sortOptions.querySelectorAll('a');
        if (sortLinks && sortLinks.length > 0) {
            sortLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const sortMethod = this.dataset.sort;
                    console.log("Sort method selected:", sortMethod);
                    assignments.sortAssignments(sortMethod, assignmentList);
                    if (sortDropdown) sortDropdown.classList.remove('show');
                });
            });
        }
    } else {
        console.error("Sort options not found");
    }
    
    // Upload tab buttons
    if (uploadTabBtns && uploadTabBtns.length > 0) {
        uploadTabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                console.log("Upload tab clicked:", this.dataset.tab);
                ui.toggleUploadTab(this.dataset.tab, uploadTabContents, uploadTabBtns);
            });
        });
    } else {
        console.error("Upload tab buttons not found or empty");
    }
    
    // File input for student uploads
    if (studentFilesInput) {
        studentFilesInput.addEventListener('change', function(e) {
            console.log("Student files selected");
            uploads.handleStudentFilesSelect(e, studentFilesList);
        });
    } else {
        console.error("Student files input not found");
    }
    
    // File input for preview upload
    if (previewFileInput) {
        previewFileInput.addEventListener('change', function(e) {
            console.log("Preview file selected");
            uploads.handlePreviewFileSelect(e, previewFileName, previewFileInput);
        });
    } else {
        console.error("Preview file input not found");
    }
    
    // Drag and drop for student uploads
    if (studentDropzone) {
        studentDropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        studentDropzone.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        studentDropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            console.log("Files dropped on student dropzone");
            uploads.handleStudentFilesSelect(e, studentFilesList);
        });
    } else {
        console.error("Student dropzone not found");
    }
    
    // Drag and drop for preview upload
    if (previewDropzone) {
        previewDropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        previewDropzone.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        previewDropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            console.log("File dropped on preview dropzone");
            uploads.handlePreviewFileSelect(e, previewFileName, previewFileInput);
        });
    } else {
        console.error("Preview dropzone not found");
    }

    // Create Modal buttons
    if (cancelCreateBtn) {
        cancelCreateBtn.addEventListener('click', function() {
            console.log("Cancel create clicked");
            ui.hideCreateModal(createModal);
        });
    } else {
        console.error("Cancel create button not found");
    }
    
    if (confirmCreateBtn) {
        confirmCreateBtn.addEventListener('click', function() {
            console.log("Confirm create clicked");
            const newAssignment = assignments.createNewAssignment(
                assignmentNameInput, assignmentList, assignmentRowTemplate, 
                assignmentTypeCheckboxes, deadlineDateInput, createdOnDateInput,
                emptyState, assignmentsContainer
            );
            ui.hideCreateModal(createModal);
            if (newAssignment) {
                assignments.addAssignmentEventListeners(newAssignment, previewPanel, pdfPreviewContainer);
                core.saveStateToStorage(courseId);
            }
        });
    } else {
        console.error("Confirm create button not found");
    }
    
    // Edit Modal buttons
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            console.log("Cancel edit clicked");
            ui.hideEditModal(editModal);
        });
    } else {
        console.error("Cancel edit button not found");
    }
    
    if (confirmEditBtn) {
        confirmEditBtn.addEventListener('click', function() {
            console.log("Confirm edit clicked");
            assignments.updateAssignment(
                editAssignmentNameInput, editTypeCheckboxes, 
                editCreatedOnDateInput, editDeadlineDateInput, assignmentList
            );
            ui.hideEditModal(editModal);
            core.saveStateToStorage(courseId);
            // Turn off edit mode
            if (core.editMode) {
                assignments.toggleEditMode(editBtn);
            }
        });
    } else {
        console.error("Confirm edit button not found");
    }
    
    // Upload Modal buttons
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', function() {
            console.log("Cancel upload clicked");
            ui.hideUploadModal(uploadModal);
        });
    } else {
        console.error("Cancel upload button not found");
    }
    
    if (confirmUploadBtn) {
        confirmUploadBtn.addEventListener('click', function() {
            console.log("Confirm upload clicked");
            uploads.saveUploadedFiles(uploadModal, courseId);
        });
    } else {
        console.error("Confirm upload button not found");
    }
    
    // Settings Modal buttons
    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', function() {
            console.log("Cancel settings clicked");
            ui.hideSettingsModal(settingsModal);
        });
    } else {
        console.error("Cancel settings button not found");
    }
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            console.log("Save settings clicked");
            settings.updateCourseSettings(
                courseId, courseAbbreviation, courseNumber, courseFullName,
                courseSemester, courseYear, courseSectionNumber, disablePreviews, settingsModal
            );
        });
    } else {
        console.error("Save settings button not found");
    }

    // Archive button
    if (archiveBtn) {
        archiveBtn.addEventListener('click', function() {
            console.log("Archive button clicked");
            ui.showArchiveModal(archiveModal, archiveList, core.archivedAssignments);
        });
    } else {
        console.error("Archive button not found");
    }
    
    // Archive Modal buttons
    if (cancelArchiveBtn) {
        cancelArchiveBtn.addEventListener('click', function() {
            console.log("Cancel archive clicked");
            ui.hideArchiveModal(archiveModal, restoreAssignmentBtn, deleteForeverBtn);
        });
    } else {
        console.error("Cancel archive button not found");
    }
    
    if (restoreAssignmentBtn) {
        restoreAssignmentBtn.addEventListener('click', function() {
            console.log("Restore assignment clicked");
            const newAssignment = assignments.restoreArchivedAssignment(
                assignmentList, assignmentRowTemplate, restoreAssignmentBtn, 
                deleteForeverBtn, emptyState, assignmentsContainer, archiveList
            );
            if (newAssignment) {
                assignments.addAssignmentEventListeners(newAssignment, previewPanel, pdfPreviewContainer);
                core.saveStateToStorage(courseId);
            }
        });
    } else {
        console.error("Restore assignment button not found");
    }
    
    if (deleteForeverBtn) {
        deleteForeverBtn.addEventListener('click', function() {
            console.log("Delete forever clicked");
            assignments.deleteForeverArchivedAssignment(restoreAssignmentBtn, deleteForeverBtn, archiveList);
            core.saveStateToStorage(courseId);
        });
    } else {
        console.error("Delete forever button not found");
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (createModal && event.target === createModal) {
            ui.hideCreateModal(createModal);
        }
        if (editModal && event.target === editModal) {
            ui.hideEditModal(editModal);
        }
        if (uploadModal && event.target === uploadModal) {
            ui.hideUploadModal(uploadModal);
        }
        if (settingsModal && event.target === settingsModal) {
            ui.hideSettingsModal(settingsModal);
        }
        if (archiveModal && event.target === archiveModal) {
            ui.hideArchiveModal(archiveModal, restoreAssignmentBtn, deleteForeverBtn);
        }
        if (sortBtn && sortDropdown && !sortBtn.contains(event.target)) {
            sortDropdown.classList.remove('show');
        }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // ESC key closes modals and preview
        if (e.key === 'Escape') {
            if (createModal) ui.hideCreateModal(createModal);
            if (editModal) ui.hideEditModal(editModal);
            if (uploadModal) ui.hideUploadModal(uploadModal);
            if (settingsModal) ui.hideSettingsModal(settingsModal);
            if (archiveModal) ui.hideArchiveModal(archiveModal, restoreAssignmentBtn, deleteForeverBtn);
            if (previewPanel) ui.hidePreview(previewPanel, pdfPreviewContainer);
            
            if (core.deleteMode) {
                // Exit delete mode
                core.deleteMode = false;
                if (deleteBtn) {
                    deleteBtn.classList.remove('active');
                }
                document.querySelectorAll('.assignment-row').forEach(row => {
                    row.classList.remove('delete-mode');
                    row.classList.remove('selected');
                    row.removeEventListener('click', assignments.selectForDeletion);
                });
            }
            if (sortDropdown) sortDropdown.classList.remove('show');
        }
        
        // Enter key in create modal confirms creation
        if (e.key === 'Enter' && createModal && createModal.classList.contains('modal-visible') && 
            document.activeElement !== deadlineDateInput) {
            const newAssignment = assignments.createNewAssignment(
                assignmentNameInput, assignmentList, assignmentRowTemplate, 
                assignmentTypeCheckboxes, deadlineDateInput, createdOnDateInput,
                emptyState, assignmentsContainer
            );
            ui.hideCreateModal(createModal);
            if (newAssignment) {
                assignments.addAssignmentEventListeners(newAssignment, previewPanel, pdfPreviewContainer);
                core.saveStateToStorage(courseId);
            }
        }
        
        // Enter key in edit modal confirms update
        if (e.key === 'Enter' && editModal && editModal.classList.contains('modal-visible') && 
            document.activeElement !== editDeadlineDateInput) {
            assignments.updateAssignment(
                editAssignmentNameInput, editTypeCheckboxes, 
                editCreatedOnDateInput, editDeadlineDateInput, assignmentList
            );
            ui.hideEditModal(editModal);
            core.saveStateToStorage(courseId);
            // Turn off edit mode
            if (core.editMode) {
                assignments.toggleEditMode(editBtn);
            }
        }
        
        // Enter key in settings modal saves settings
        if (e.key === 'Enter' && settingsModal && settingsModal.classList.contains('modal-visible')) {
            settings.updateCourseSettings(
                courseId, courseAbbreviation, courseNumber, courseFullName,
                courseSemester, courseYear, courseSectionNumber, disablePreviews, settingsModal
            );
        }
    });
    
    // Close preview when clicking outside the preview panel
    document.addEventListener('click', function(e) {
        if (previewPanel && previewPanel.classList.contains('preview-shown') && 
            !previewPanel.contains(e.target) && 
            !e.target.classList.contains('assignment-name')) {
            ui.hidePreview(previewPanel, pdfPreviewContainer);
        }
    });
    
    // Confirm script loaded fully
    console.log("Script initialized successfully");
});