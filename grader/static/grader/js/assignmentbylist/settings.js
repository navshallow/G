import * as core from './core.js';

export function loadCourseSettings(courseId, courseAbbreviation, courseNumber, courseFullName, courseSemester, courseYear, courseSectionNumber, disablePreviews) {
    console.log("Loading course settings");
    
    const courseHeaderElement = document.querySelector('.course-header');
    const courseSemesterElement = document.querySelector('.course-semester');
    
    if (courseHeaderElement && courseHeaderElement.textContent) {
        // Parse course information from the header
        const headerText = courseHeaderElement.textContent;
        console.log("Header text:", headerText);
        
        const match = headerText.match(/^(.+)\s+(.+)\s+-\s+(.+)$/);
        
        if (match && match.length === 4) {
            const abbr = match[1].trim();
            const num = match[2].trim();
            const name = match[3].trim();
            
            console.log("Parsed course info:", abbr, num, name);
            
            // Set values in settings form
            if (courseAbbreviation) courseAbbreviation.value = abbr;
            if (courseNumber) courseNumber.value = num;
            if (courseFullName) courseFullName.value = name;
        }
    }
    
    if (courseSemesterElement && courseSemesterElement.textContent) {
        // Parse semester and year
        const semesterText = courseSemesterElement.textContent;
        console.log("Semester text:", semesterText);
        
        const match = semesterText.match(/^(.+)\s+(.+)$/);
        
        if (match && match.length === 3) {
            const semester = match[1].trim();
            const year = match[2].trim();
            
            console.log("Parsed semester info:", semester, year);
            
            // Set values in settings form
            if (courseSemester) {
                const options = Array.from(courseSemester.options);
                const option = options.find(opt => opt.value === semester);
                if (option) {
                    courseSemester.value = semester;
                }
            }
            
            if (courseYear) courseYear.value = year;
        }
    }
    
    // Try to parse section number from the course pill
    const coursePill = document.querySelector(`.course-pill[href*="${courseId}"] .ENGR`);
    if (coursePill && coursePill.innerHTML) {
        const pillText = coursePill.innerHTML;
        const sectionMatch = pillText.match(/\[(.*?)\]/);
        if (sectionMatch && sectionMatch.length === 2 && courseSectionNumber) {
            courseSectionNumber.value = sectionMatch[1];
        }
    }
    
    // Set preview toggle based on saved setting
    if (disablePreviews) {
        disablePreviews.checked = !core.previewsEnabled;
    }
}

// Function to update course settings
export function updateCourseSettings(courseId, courseAbbreviation, courseNumber, courseFullName, courseSemester, courseYear, courseSectionNumber, disablePreviews, settingsModal) {
    if (!courseAbbreviation || !courseNumber || !courseFullName || 
        !courseSemester || !courseYear) {
        console.error("Required settings fields not found");
        return;
    }
    
    const abbr = courseAbbreviation.value.trim();
    const num = courseNumber.value.trim();
    const name = courseFullName.value.trim();
    const semester = courseSemester.value;
    const year = courseYear.value.trim();
    const sectionNumber = courseSectionNumber ? courseSectionNumber.value.trim() : '';
    
    if (!abbr || !num || !name || !semester || !year) {
        alert('Please fill in all required fields');
        return;
    }
    
    console.log("Updating course settings:", abbr, num, name, semester, year, sectionNumber);
    
    const courseHeaderElement = document.querySelector('.course-header');
    const courseSemesterElement = document.querySelector('.course-semester');
    
    if (courseHeaderElement) {
        courseHeaderElement.textContent = `${abbr} ${num} - ${name}`;
    }
    
    if (courseSemesterElement) {
        courseSemesterElement.textContent = `${semester} ${year}`;
    }
    
    // Update preview setting
    core.previewsEnabled = !disablePreviews.checked;
    
    // Save settings to localStorage
    core.saveStateToStorage(courseId);
    
    // Close modal
    if (settingsModal) settingsModal.classList.remove('modal-visible');
    

    // Need to make an AJAX request to update the course in the database
    updateCourseInDatabase(courseId, abbr, num, name, semester, year, sectionNumber);
}

// Function to update course in database via AJAX
export function updateCourseInDatabase(courseId, abbr, num, name, semester, year, sectionNumber) {
    // Create form data
    const formData = new FormData();
    formData.append('abbreviation', abbr);
    formData.append('course_number', num);
    formData.append('full_name', name);
    formData.append('semester', semester);
    formData.append('year', year);
    if (sectionNumber) formData.append('section_number', sectionNumber);
    formData.append('csrfmiddlewaretoken', core.getCsrfToken());
    
    // Send AJAX request
    fetch(`/update-course/${courseId}/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (response.ok) {
            // Refresh sidebar instead of reloading the page
            refreshSidebar();
            alert("Course settings updated successfully.");
        } else {
            alert('There was an error updating the course. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error updating the course. Please refresh the page and try again.');
    });
}

// Function to refresh the sidebar after course changes
export function refreshSidebar() {
    fetch('/refresh-sidebar/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.courses) {
            // Find the course pills container
            const pillsContainer = document.querySelector('.course-pills-container');
            if (pillsContainer) {
                // Clear existing pills
                pillsContainer.innerHTML = '';
                
                // Add updated course pills
                if (data.courses.length === 0) {
                    pillsContainer.innerHTML = `
                        <div class="course-pill empty-course">
                            <div class="ENGR">No<br />Courses</div>
                        </div>
                    `;
                } else {
                    data.courses.forEach(course => {
                        const pill = document.createElement('a');
                        pill.href = course.url;
                        pill.className = 'course-pill';
                        pill.innerHTML = `<div class="ENGR">${course.name.replace(' ', '<br />')}</div>`;
                        pillsContainer.appendChild(pill);
                    });
                }
            }
        }
    })
    .catch(error => {
        console.error('Error refreshing sidebar:', error);
    });
}

// Function to delete the course
export function deleteCourse(deleteCourseBtn) {
    const courseId = deleteCourseBtn ? deleteCourseBtn.dataset.courseId : null;
    if (!courseId) return;
    
    // Disable the button to prevent multiple clicks
    if (deleteCourseBtn) {
        deleteCourseBtn.disabled = true;
    }
    
    const confirmed = confirm('Are you sure you want to delete this course? It will be moved to the archive.');
    if (!confirmed) {
        if (deleteCourseBtn) {
            deleteCourseBtn.disabled = false;
        }
        return;
    }
    
    // Send AJAX request to archive the course
    fetch(`/delete-course/${courseId}/`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': core.getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to home page
            window.location.href = '/';
        } else {
            alert('Error deleting course: ' + (data.error || 'Unknown error'));
            // Re-enable the button on error
            if (deleteCourseBtn) {
                deleteCourseBtn.disabled = false;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error deleting the course. Please try again.');
        // Re-enable the button on error
        if (deleteCourseBtn) {
            deleteCourseBtn.disabled = false;
        }
    });
}