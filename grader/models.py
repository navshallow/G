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
    section_number = models.CharField(max_length=10)
    abbreviation = models.CharField(max_length=4)
    year = models.IntegerField()
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.abbreviation} {self.course_number} [{self.section_number}]"