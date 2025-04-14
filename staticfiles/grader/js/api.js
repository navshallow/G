/**
 * Gator Grader API Integration
 * This file contains functions to communicate with the Django backend API
 */

// Get CSRF token from cookies for secure requests
function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// API functions for course management
const CourseAPI = {
    // Delete a course on the server
    deleteCourse: async function(courseId) {
        try {
            const response = await fetch(`/delete-course/${courseId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }
};

// API functions for assignment management
const AssignmentAPI = {
    // Create a new assignment
    createAssignment: async function(courseId, assignmentData) {
        try {
            const response = await fetch(`/course/${courseId}/create-assignment/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assignmentData)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating assignment:', error);
            throw error;
        }
    },
    
    // Update an existing assignment
    updateAssignment: async function(assignmentId, assignmentData) {
        try {
            const response = await fetch(`/assignment/${assignmentId}/update/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assignmentData)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating assignment:', error);
            throw error;
        }
    },
    
    // Delete an assignment (soft delete)
    deleteAssignment: async function(assignmentId) {
        try {
            const response = await fetch(`/assignment/${assignmentId}/delete/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            throw error;
        }
    },
    
    // Restore a deleted assignment
    restoreAssignment: async function(assignmentId) {
        try {
            const response = await fetch(`/assignment/${assignmentId}/restore/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error restoring assignment:', error);
            throw error;
        }
    },
    
    // Permanently delete an assignment
    permanentDeleteAssignment: async function(assignmentId) {
        try {
            const response = await fetch(`/assignment/${assignmentId}/permanent-delete/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error permanently deleting assignment:', error);
            throw error;
        }
    },
    
    // Upload a file for an assignment
    uploadFile: async function(assignmentId, fileData) {
        try {
            const formData = new FormData();
            formData.append('file', fileData);
            
            const response = await fetch(`/assignment/${assignmentId}/upload-file/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                    // Do not set Content-Type here, it will be set automatically with boundary
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },
    
    // Get URL for previewing an assignment file
    getFilePreviewUrl: function(fileId) {
        return `/assignment-file/${fileId}/preview/`;
    }
};

// Export the API functions
window.CourseAPI = CourseAPI;
window.AssignmentAPI = AssignmentAPI;