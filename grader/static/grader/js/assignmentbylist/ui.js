import * as core from './core.js';

// Check for empty state and show/hide elements accordingly
export function checkEmptyState(emptyState, assignmentsContainer, assignmentList) {
    console.log("Checking empty state");
    
    const assignmentCount = assignmentList ? assignmentList.querySelectorAll('.assignment-row').length : 0;
    console.log(`Found ${assignmentCount} assignments`);
    
    if (assignmentCount === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        if (assignmentsContainer) assignmentsContainer.style.display = 'none';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        if (assignmentsContainer) assignmentsContainer.style.display = 'block';
    }
}

// Preview panel functions
export function showPreview(assignmentId, previewPanel, pdfPreviewContainer, uploadedPreviews) {
    if (!core.editMode && !core.uploadMode && !core.deleteMode && core.previewsEnabled) {
        const assignmentRow = document.querySelector(`.assignment-row[data-id="${assignmentId}"]`);
        if (!assignmentRow) return;
        
        const assignmentName = assignmentRow.querySelector('.assignment-name').textContent;
        
        // Check if there's a preview PDF for this assignment
        if (uploadedPreviews[assignmentId]) {
            // Show PDF in preview panel
            pdfPreviewContainer.innerHTML = `<iframe src="${URL.createObjectURL(uploadedPreviews[assignmentId])}" title="PDF Preview"></iframe>`;
            pdfPreviewContainer.classList.add('has-pdf');
            
            // Hide the eye icon when showing a PDF
            const previewEye = previewPanel.querySelector('.preview-eye');
            if (previewEye) {
                previewEye.style.display = 'none';
            }
        } else {
            pdfPreviewContainer.innerHTML = '';
            pdfPreviewContainer.classList.remove('has-pdf');
            
            const previewEye = previewPanel.querySelector('.preview-eye');
            if (previewEye) {
                previewEye.style.display = 'flex';
            }
        }
        
        previewPanel.classList.add('preview-shown');
        previewPanel.dataset.currentAssignment = assignmentId;
    }
}

export function hidePreview(previewPanel, pdfPreviewContainer) {
    if (!previewPanel) return;
    
    previewPanel.classList.remove('preview-shown');
    delete previewPanel.dataset.currentAssignment;
    
    // Clear the PDF container
    setTimeout(() => {
        if (pdfPreviewContainer) {
            pdfPreviewContainer.innerHTML = '';
            pdfPreviewContainer.classList.remove('has-pdf');
        }
        
        const previewEye = previewPanel.querySelector('.preview-eye');
        if (previewEye) {
            previewEye.style.display = 'flex';
        }
    }, 300); // Wait for transition to complete
}

// Modal functions
export function showCreateModal(createModal, assignmentNameInput, deadlineDateInput, createdOnDateInput, assignmentTypeCheckboxes) {
    if (!createModal) {
        console.error("Create modal not found");
        return;
    }
    
    createModal.classList.add('modal-visible');
    if (assignmentNameInput) assignmentNameInput.value = '';
    if (deadlineDateInput) deadlineDateInput.value = '';
    
    // Always set today's date and make it read-only
    const today = core.ensureCurrentDate();
    if (createdOnDateInput) {
        createdOnDateInput.value = today;
        createdOnDateInput.setAttribute('readonly', 'readonly');
    }
    
    if (assignmentTypeCheckboxes) {
        assignmentTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    if (assignmentNameInput) assignmentNameInput.focus();
}

export function hideCreateModal(createModal) {
    if (!createModal) return;
    createModal.classList.remove('modal-visible');
}

export function showEditModal(editModal, assignmentId, editAssignmentNameInput, editCreatedOnDateInput, editDeadlineDateInput, editTypeCheckboxes) {
    if (!editModal) {
        console.error("Edit modal not found");
        return;
    }
    
    const assignmentRow = document.querySelector(`.assignment-row[data-id="${assignmentId}"]`);
    if (!assignmentRow) {
        console.error(`Assignment row with ID ${assignmentId} not found`);
        return;
    }
    
    const name = assignmentRow.querySelector('.assignment-name')?.textContent.trim() || '';
    const types = assignmentRow.dataset.types || '';
    const createdDate = assignmentRow.dataset.created || '';
    const deadline = assignmentRow.dataset.deadline || '';
    
    console.log("Showing edit modal for assignment:", {
        id: assignmentId,
        name,
        types,
        createdDate,
        deadline
    });
    
    editModal.classList.add('modal-visible');
    if (editAssignmentNameInput) editAssignmentNameInput.value = name;
    if (editCreatedOnDateInput) {
        editCreatedOnDateInput.value = createdDate;
        editCreatedOnDateInput.setAttribute('readonly', 'readonly');
    }
    if (editDeadlineDateInput) editDeadlineDateInput.value = deadline;
    
    // Use setter instead of direct assignment
    core.setCurrentEditingId(assignmentId);
    
    // Reset all checkboxes
    if (editTypeCheckboxes) {
        editTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    // Check the appropriate checkboxes
    if (types && editTypeCheckboxes) {
        const typeArray = types.split(',');
        typeArray.forEach(type => {
            // Convert type to match checkbox ID pattern
            const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
            const checkboxId = `editType${formattedType.replace('-', '')}`;
            // Try normal ID first
            let checkbox = document.getElementById(`editType${formattedType}`);
            if (!checkbox) {
                if (type === 'class-assignment') {
                    checkbox = document.getElementById('editTypeClassAssignment');
                }
            }
            
            if (checkbox) {
                checkbox.checked = true;
            } else {
                console.warn(`Checkbox for type '${type}' not found with ID: editType${formattedType}`);
            }
        });
    }
    
    if (editAssignmentNameInput) editAssignmentNameInput.focus();
}

export function hideEditModal(editModal) {
    if (!editModal) return;
    editModal.classList.remove('modal-visible');
    
    // Use setter instead of direct assignment
    core.setCurrentEditingId(null);
}

export function showUploadModal(uploadModal, assignmentId, uploadAssignmentName, studentFilesInput, previewFileInput, studentFilesList, previewFileName, previewTabBtn, uploadedFiles, uploadedPreviews) {
    if (!uploadModal) {
        console.error("Upload modal not found");
        return;
    }
    
    const assignmentRow = document.querySelector(`.assignment-row[data-id="${assignmentId}"]`);
    if (!assignmentRow) {
        console.error(`Assignment row with ID ${assignmentId} not found`);
        return;
    }
    
    const name = assignmentRow.querySelector('.assignment-name')?.textContent.trim() || '';
    
    console.log("Showing upload modal for assignment:", {
        id: assignmentId,
        name
    });
    
    uploadModal.classList.add('modal-visible');
    if (uploadAssignmentName) uploadAssignmentName.textContent = name;
    
    // Use setter instead of direct assignment
    core.setCurrentUploadingId(assignmentId);
    
    // Clear file selections
    if (studentFilesInput) studentFilesInput.value = '';
    if (previewFileInput) previewFileInput.value = '';
    if (studentFilesList) studentFilesList.innerHTML = '';
    if (previewFileName) {
        previewFileName.innerHTML = '';
        previewFileName.classList.remove('has-file');
    }
    
    // Use empty arrays instead of direct assignment
    core.setSelectedFiles([]);
    core.setSelectedPreviewFile(null);
    
    // Show/hide preview tab based on settings
    if (previewTabBtn) {
        if (core.previewsEnabled) {
            previewTabBtn.style.display = 'inline-block';
        } else {
            previewTabBtn.style.display = 'none';
            toggleUploadTab('student-uploads', 
                document.querySelectorAll('.upload-tab-content'), 
                document.querySelectorAll('.upload-tab-btn'));
        }
    }
    
    // Show existing files if any
    if (uploadedFiles && uploadedFiles[assignmentId] && uploadedFiles[assignmentId].length > 0 && studentFilesList) {
        uploadedFiles[assignmentId].forEach(file => {
            addFileToList(file, studentFilesList, false);
        });
    }
    
    // Show existing preview if any
    if (uploadedPreviews && uploadedPreviews[assignmentId] && previewFileName) {
        previewFileName.textContent = uploadedPreviews[assignmentId].name;
        previewFileName.classList.add('has-file');
    }
}

export function hideUploadModal(uploadModal) {
    if (!uploadModal) return;
    uploadModal.classList.remove('modal-visible');
    
    // Use setters instead of direct assignment
    core.setCurrentUploadingId(null);
    core.setSelectedFiles([]);
    core.setSelectedPreviewFile(null);
}

export function toggleUploadTab(tabId, uploadTabContents, uploadTabBtns) {
    if (!uploadTabContents || !uploadTabBtns) {
        console.error("Upload tab elements not found");
        return;
    }
    
    // Hide all tab contents
    uploadTabContents.forEach(content => {
        if (content) content.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    uploadTabBtns.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    } else {
        console.error(`Upload tab with ID ${tabId} not found`);
    }
    
    // Activate selected tab button
    const selectedBtn = document.querySelector(`.upload-tab-btn[data-tab="${tabId}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    } else {
        console.error(`Upload tab button for ${tabId} not found`);
    }
}

export function toggleSortDropdown(sortDropdown) {
    if (!sortDropdown) return;
    sortDropdown.classList.toggle('show');
}

export function addFileToList(file, listElement, removable = true) {
    if (!listElement || !file) return;
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    // Format file size
    const size = file.size / 1024; // KB
    const sizeDisplay = size < 1024 ? `${Math.round(size)} KB` : `${(size / 1024).toFixed(1)} MB`;
    
    fileItem.innerHTML = `
        <div class="file-name">${file.name}</div>
        <div class="file-size">${sizeDisplay}</div>
        ${removable ? '<div class="remove-file">×</div>' : ''}
    `;
    
    // Add remove functionality if needed
    if (removable) {
        const removeBtn = fileItem.querySelector('.remove-file');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                // Remove from display
                fileItem.remove();
                
                // Use a safer approach to modify the selectedFiles array
                const currentFiles = [...core.selectedFiles];
                const index = currentFiles.findIndex(f => f.name === file.name && f.size === file.size);
                if (index !== -1) {
                    currentFiles.splice(index, 1);
                    core.setSelectedFiles(currentFiles);
                }
            });
        }
    }
    
    listElement.appendChild(fileItem);
}

// Show/hide archive modal
export function showArchiveModal(archiveModal, archiveList, archivedAssignments) {
    if (!archiveModal) {
        console.error("Archive modal not found");
        return;
    }
    
    updateArchiveList(archiveList, archivedAssignments);
    archiveModal.classList.add('modal-visible');
}

export function hideArchiveModal(archiveModal, restoreAssignmentBtn, deleteForeverBtn) {
    if (!archiveModal) return;
    archiveModal.classList.remove('modal-visible');
    
    // Use setter instead of direct assignment
    core.setSelectedArchivedAssignment(null);
    
    if (restoreAssignmentBtn) restoreAssignmentBtn.disabled = true;
    if (deleteForeverBtn) deleteForeverBtn.disabled = true;
}

export function updateArchiveList(archiveList, archivedAssignments) {
    if (!archiveList) {
        console.error("Archive list not found");
        return;
    }
    
    // Clear current list
    archiveList.innerHTML = '';
    
    if (!archivedAssignments || archivedAssignments.length === 0) {
        archiveList.innerHTML = '<div class="no-archive-items">No archived assignments found.</div>';
        return;
    }
    
    // Sort by most recently archived first
    archivedAssignments.sort((a, b) => new Date(b.archivedTime) - new Date(a.archivedTime));
    
    archivedAssignments.forEach((assignment, index) => {
        const item = document.createElement('div');
        item.className = 'archive-list-item';
        item.dataset.index = index;
        
        // Format display date
        const archivedDate = new Date(assignment.archivedTime);
        const formattedArchivedDate = archivedDate.toLocaleString();
        
        const displayCreatedDate = assignment.created ? core.formatDateForDisplay(assignment.created) : '';
        const displayDeadlineDate = assignment.deadline ? core.formatDateForDisplay(assignment.deadline) : '';
        
        item.innerHTML = `
            <div class="archive-item-name">${assignment.name}</div>
            <div class="archive-item-info">
                <div class="archive-item-types">${core.generateTypePills(assignment.types ? assignment.types.split(',') : [])}</div>
                <div>Created: ${displayCreatedDate || 'Not specified'}</div>
                ${displayDeadlineDate ? `<div>Deadline: ${displayDeadlineDate}</div>` : ''}
                <div>Archived: ${formattedArchivedDate}</div>
            </div>
        `;
        
        item.addEventListener('click', function() {
            // Deselect any previously selected item
            document.querySelectorAll('.archive-list-item.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Select this item
            this.classList.add('selected');
            
            // Use setter instead of direct assignment
            core.setSelectedArchivedAssignment(index);
            
            // Enable action buttons
            const restoreBtn = document.getElementById('restoreAssignmentBtn');
            const deleteForeverBtn = document.getElementById('deleteForeverBtn');
            
            if (restoreBtn) restoreBtn.disabled = false;
            if (deleteForeverBtn) deleteForeverBtn.disabled = false;
        });
        
        archiveList.appendChild(item);
    });
}

// Show settings modal
export function showSettingsModal(settingsModal, courseSectionNumber) {
    if (!settingsModal) {
        console.error("Settings modal not found");
        return;
    }
    
    settingsModal.classList.add('modal-visible');
}

export function hideSettingsModal(settingsModal) {
    if (!settingsModal) return;
    settingsModal.classList.remove('modal-visible');
}