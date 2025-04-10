from django import forms
from .models import Course

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['full_name', 'course_number', 'section_number', 'abbreviation', 'year', 'semester']
        widgets = {
            'full_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. Introduction to Engineering'}),
            'course_number': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. 101'}),
            'section_number': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. 02'}),
            'abbreviation': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Max 4 letters (e.g. ENGR)'}),
            'year': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'e.g. 2025'}),
            'semester': forms.Select(attrs={'class': 'form-select'}),
        }