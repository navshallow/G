document.addEventListener('DOMContentLoaded', function() {
    console.log("Archive script loaded");

    // DOM Elements
    const archivedCoursesBtn = document.getElementById('archivedCoursesBtn');
    const archivedCoursesModal = document.getElementById('archivedCoursesModal');
    const archivedCoursesList = document.getElementById('archivedCoursesList');
    const cancelArchivedCoursesBtn = document.getElementById('cancelArchivedCoursesBtn');
    const restoreCourseBtn = document.getElementById('restoreCourseBtn');
    const deleteForeverCourseBtn = document.getElementById('deleteForeverCourseBtn');

    // State tracking
    let selectedArchivedCourse = null;

    // Function to get CSRF token
    function getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
               document.cookie.split('; ')
                             .find(row => row.startsWith('csrftoken='))?.split('=')[1] || '';
    }

  // modern CSS styles for the archive modal
    function injectModernModalStyles() {
        if (!document.getElementById('modernModalStyles')) {
            const style = document.createElement('style');
            style.id = 'modernModalStyles';
            style.innerHTML = `
            /* Modern modal container */
            #archivedCoursesModal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            /* When active, show the modal */
            #archivedCoursesModal.modal-visible {
                display: block;
                opacity: 1;
            }
            /* Style for each archived course item */
            .archive-course-item {
                padding: 10px;
                margin: 5px 0;
                border-bottom: 1px solid #ddd;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            .archive-course-item:hover,
            .archive-course-item.selected {
                background-color: #f0f0f0;
            }
            /* Message style when no items exist or error occurs */
            .no-archive-items {
                padding: 20px;
                text-align: center;
                color: #888;
            }
            `;
            document.head.appendChild(style);
        }
    }

    // Function to show the archived courses modal
    function showArchivedCoursesModal() {
        if (!archivedCoursesModal) {
            console.error("Archived courses modal not found");
            return;
        }

        injectModernModalStyles();

        fetchArchivedCourses();
        archivedCoursesModal.classList.add('modal-visible');
    }

    // Function to hide the archived courses modal
    function hideArchivedCoursesModal() {
        if (!archivedCoursesModal) return;
        archivedCoursesModal.classList.remove('modal-visible');
        selectedArchivedCourse = null;
        if (restoreCourseBtn) restoreCourseBtn.disabled = true;
        if (deleteForeverCourseBtn) deleteForeverCourseBtn.disabled = true;
    }

    // Function to fetch archived courses from   server
    function fetchArchivedCourses() {
        fetch('/archived-courses/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Archived courses data received:", data);
            if (archivedCoursesList) {
                archivedCoursesList.innerHTML = '';
                if (!data.archived_courses || data.archived_courses.length === 0) {
                    archivedCoursesList.innerHTML = '<div class="no-archive-items">No archived courses found.</div>';
                    return;
                }
                data.archived_courses.forEach(course => {
                    const courseItem = document.createElement('div');
                    courseItem.className = 'archive-course-item';
                    courseItem.dataset.id = course.id;
                    courseItem.innerHTML = `
                        <div class="archive-course-name">${course.name}</div>
                        <div class="archive-course-info">
                            <div>${course.full_name}</div>
                            <div>${course.semester} ${course.year}</div>
                            <div>Archived on: ${course.archived_date}</div>
                        </div>
                    `;
                    courseItem.addEventListener('click', function() {
                        // Deselect any previously selected item
                        document.querySelectorAll('.archive-course-item.selected').forEach(el => {
                            el.classList.remove('selected');
                        });
                        // Mark this course as selected
                        this.classList.add('selected');
                        selectedArchivedCourse = course.id;
                        if (restoreCourseBtn) restoreCourseBtn.disabled = false;
                        if (deleteForeverCourseBtn) deleteForeverCourseBtn.disabled = false;
                    });
                    archivedCoursesList.appendChild(courseItem);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching archived courses:', error);
            if (archivedCoursesList) {
                archivedCoursesList.innerHTML = '<div class="no-archive-items">Error loading archived courses.</div>';
            }
        });
    }

    // Function to restore an archived course
    function restoreArchivedCourse() {
        if (!selectedArchivedCourse) return;
        if (confirm('Are you sure you want to restore this course?')) {
            fetch(`/restore-course/${selectedArchivedCourse}/`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCsrfToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Course restored successfully.');
                    // update the UI dynamically.
                    fetchArchivedCourses();
                    selectedArchivedCourse = null;
                    if (restoreCourseBtn) restoreCourseBtn.disabled = true;
                    if (deleteForeverCourseBtn) deleteForeverCourseBtn.disabled = true;
                } else {
                    alert('Error restoring course: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error restoring the course. Please try again.');
            });
        }
    }

    // Function will   permanently delete an archived course
    function permanentDeleteArchivedCourse() {
        if (!selectedArchivedCourse) return;
        if (confirm('Are you sure you want to PERMANENTLY DELETE this course? This action CANNOT be undone!')) {
            fetch(`/permanent-delete-course/${selectedArchivedCourse}/`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCsrfToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Course permanently deleted.');
                    fetchArchivedCourses();
                    selectedArchivedCourse = null;
                    if (restoreCourseBtn) restoreCourseBtn.disabled = true;
                    if (deleteForeverCourseBtn) deleteForeverCourseBtn.disabled = true;
                } else {
                    alert('Error deleting course: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error deleting the course. Please try again.');
            });
        }
    }

    // EVENT LISTENERS
    if (archivedCoursesBtn) {
        archivedCoursesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Archived courses button clicked");
            showArchivedCoursesModal();
        });
    } else {
        console.warn("Archived courses button not found in DOM");
    }

    if (cancelArchivedCoursesBtn) {
        cancelArchivedCoursesBtn.addEventListener('click', function() {
            console.log("Cancel archived courses clicked");
            hideArchivedCoursesModal();
        });
    }

    if (restoreCourseBtn) {
        restoreCourseBtn.addEventListener('click', function() {
            console.log("Restore course clicked");
            restoreArchivedCourse();
        });
    }

    if (deleteForeverCourseBtn) {
        deleteForeverCourseBtn.addEventListener('click', function() {
            console.log("Delete forever course clicked");
            permanentDeleteArchivedCourse();
        });
    }

    // Hide modal if user clicks outside of it or presses ESC
    window.addEventListener('click', function(event) {
        if (archivedCoursesModal && event.target === archivedCoursesModal) {
            hideArchivedCoursesModal();
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && archivedCoursesModal) {
            hideArchivedCoursesModal();
        }
    });
});
