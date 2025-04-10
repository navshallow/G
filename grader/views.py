from django.shortcuts import render, redirect
from django.urls import reverse
from .models import Course
from .forms import CourseForm

def home(request):
    return render(request, 'courses/home.html')

def login(request):
    return render(request, 'accounts/login.html')

def create_account(request):
    return render(request, 'accounts/create_account.html')

def assignmentbylist(request):
    return render(request, 'assignments/assignmentbylist.html')

def detailedassignment(request):
    return render(request, 'assignments/detailedassignment.html')

def gradeassignment(request):
    return render(request, 'assignments/gradeassignment.html')

def studentroster(request):
    return render(request, 'roster/studentroster.html')

def add_course(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            # Ensure abbreviation is max 4 letters
            form.instance.abbreviation = form.instance.abbreviation[:4].upper()
            form.save()
            return redirect('home')
    else:
        form = CourseForm()
    
    return render(request, 'courses/add_course.html', {'form': form})

def delete_course(request, course_id):
    course = Course.objects.get(id=course_id)
    
    if request.method == 'POST':
        course.delete()
        return redirect('home')
        
    return render(request, 'courses/delete_course_confirm.html', {'course': course})