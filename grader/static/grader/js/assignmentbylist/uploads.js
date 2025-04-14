import * as core from './core.js';
import * as ui from './ui.js';

// Handle file selection for student uploads
export function handleStudentFilesSelect(event, studentFilesList) {
    const files = event.target.files || event.dataTransfer.files;
    
    if (!files || files.length === 0 || !studentFilesList) return;
    
    studentFilesList.innerHTML = '';
    core.selectedFiles = [];
    
    // Add each file to the list
    for (let i = 0; i < files.length; i++) {
        if (files[i].type === 'application/pdf') {
            core.selectedFiles.push(files[i]);
            ui.addFileToList(files[i], studentFilesList, true);
        }
    }
}

// Handle file selection for preview upload
export function handlePreviewFileSelect(event, previewFileName, previewFileInput) {
    const files = event.target.files || event.dataTransfer.files;
    
    if (!files || files.length === 0 || !previewFileName) return;
    
    // Only take the first file
    const file = files[0];
    
    if (file.type === 'application/pdf') {
        core.selectedPreviewFile = file;
        previewFileName.textContent = file.name;
        previewFileName.classList.add('has-file');
    } else {
        alert('Please select a PDF file for the preview');
        if (previewFileInput) previewFileInput.value = '';
        previewFileName.textContent = '';
        previewFileName.classList.remove('has-file');
        core.selectedPreviewFile = null;
    }
}

// Save uploaded files
export function saveUploadedFiles(uploadModal, courseId) {
    if (!core.currentUploadingId) return;
    
    if (core.selectedFiles.length > 0) {
        core.uploadedFiles[core.currentUploadingId] = [...core.selectedFiles];
        
        const assignmentRow = document.querySelector(`.assignment-row[data-id="${core.currentUploadingId}"]`);
        if (assignmentRow) {
            const uploadsEl = assignmentRow.querySelector('.assignment-uploads');
            if (uploadsEl) {
                uploadsEl.textContent = core.selectedFiles.length;
            }
            
            //  update pending count if it's empty
            const pendingEl = assignmentRow.querySelector('.assignment-pending');
            if (pendingEl && pendingEl.textContent === '0') {
                pendingEl.textContent = core.selectedFiles.length;
            }
        }
    }
    
    // Save preview file
    if (core.selectedPreviewFile) {
        core.uploadedPreviews[core.currentUploadingId] = core.selectedPreviewFile;
    }
    
    core.saveStateToStorage(courseId);
    
    ui.hideUploadModal(uploadModal);
    
    // Exit upload mode
    if (core.uploadMode) {
        core.uploadMode = false;
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) uploadBtn.classList.remove('active');
    }
    
    alert("Files uploaded successfully!");
}