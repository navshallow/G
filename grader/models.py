from django.db import models

class Course(models.Model):
    SEMESTER_CHOICES = [
        ('Fall', 'Fall'),
        ('Winter', 'Winter'),
        ('Spring', 'Spring'),
        ('Summer', 'Summer'),
    ]
    
    full_name = models.CharField(max_length=100)
    course_number = models.CharField(max_length=10)
    section_number = models.CharField(max_length=10, blank=True, default='')
    abbreviation = models.CharField(max_length=4)
    year = models.IntegerField()
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    created_on = models.DateField(auto_now_add=True)
    deadline_date = models.DateField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)  # New field for archived courses
    
    def __str__(self):
        section_display = f" [{self.section_number}]" if self.section_number else ""
        return f"{self.abbreviation} {self.course_number}{section_display}"