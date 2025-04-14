from django import forms
from .models import Course

class CourseForm(forms.ModelForm):
    deadline_date = forms.DateField(
        required=False, 
        widget=forms.DateInput(attrs={'type': 'date'}),
        help_text="Optional: Enter the deadline for course completion"
    )
    
    class Meta:
        model = Course
        fields = [
            'full_name', 
            'course_number', 
            'section_number', 
            'abbreviation', 
            'year', 
            'semester', 
            'deadline_date'
        ]
        widgets = {
            'full_name': forms.TextInput(attrs={'placeholder': 'e.g. Introduction to Computer Science'}),
            'course_number': forms.TextInput(attrs={'placeholder': 'e.g. 101'}),
            'section_number': forms.TextInput(attrs={'placeholder': 'e.g. 001'}),
            'abbreviation': forms.TextInput(attrs={'placeholder': 'e.g. CS', 'maxlength': 4}),
        }
        help_texts = {
            'abbreviation': 'Maximum 4 letters, will be converted to uppercase',
            'year': 'Enter the four-digit year',
        }