from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.http import JsonResponse, HttpResponse
from .models import Course
from .forms import CourseForm
import os
import json
from django.conf import settings
from django.core.files.storage import FileSystemStorage

def home(request):
    # Only show non-archived courses in the context
    courses = Course.objects.filter(is_archived=False).order_by('-created_at')
    return render(request, 'courses/home.html', {'courses': courses})

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
    course = get_object_or_404(Course, id=course_id)
    
    # Check if this is an AJAX request
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # Mark as archived instead of deleting
        course.is_archived = True
        course.save()
        return JsonResponse({'success': True})
    
    if request.method == 'POST':
        course.is_archived = True
        course.save()
        return redirect('home')
    
    # If it's a GET request without AJAX
    course.is_archived = True
    course.save()
    return redirect('home')

def course_assignments(request, course_id):
    # Getthe specific course
    course = get_object_or_404(Course, id=course_id)
    
    # Get all non-archived courses for the sidebar
    courses = Course.objects.filter(is_archived=False).order_by('-created_at')
    
    return render(request, 'assignments/assignmentbylist.html', {'course': course, 'courses': courses})

def get_archived_courses(request):
    archived_courses = Course.objects.filter(is_archived=True).order_by('-created_at')
    courses_data = []
    
    for course in archived_courses:
        courses_data.append({
            'id': course.id,
            'name': f"{course.abbreviation} {course.course_number}{' [' + course.section_number + ']' if course.section_number else ''}",
            'full_name': course.full_name,
            'semester': course.semester,
            'year': course.year,
            'archived_date': course.created_at.strftime('%b %d, %Y')
        })
    
    return JsonResponse({'archived_courses': courses_data})

def restore_course(request, course_id):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        course = get_object_or_404(Course, id=course_id)
        course.is_archived = False
        course.save()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

def permanent_delete_course(request, course_id):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        course = get_object_or_404(Course, id=course_id)
        course.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

def delete_assignment(request, assignment_id):
    return JsonResponse({'success': True})

def restore_assignment(request, assignment_id):
   
    return JsonResponse({'success': True})

def upload_assignment_pdf(request, assignment_id):
    if request.method == 'POST' and request.FILES.get('pdf'):
        pdf_file = request.FILES['pdf']
        fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'assignments', str(assignment_id)))
        filename = fs.save(pdf_file.name, pdf_file)
        uploaded_file_url = fs.url(filename)
        return JsonResponse({'success': True, 'url': uploaded_file_url})
    return JsonResponse({'success': False, 'error': 'No PDF file uploaded'}, status=400)

def update_course(request, course_id):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            course = Course.objects.get(id=course_id)
            course.abbreviation = request.POST.get('abbreviation')[:4].upper()
            course.course_number = request.POST.get('course_number')
            course.full_name = request.POST.get('full_name')
            course.semester = request.POST.get('semester')
            course.year = request.POST.get('year')
            if 'section_number' in request.POST:
                course.section_number = request.POST.get('section_number')
            course.save()
            return JsonResponse({'success': True})
        except Course.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Course not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

def refresh_sidebar(request):
    courses = Course.objects.filter(is_archived=False).order_by('-created_at')
    courses_data = []
    
    for course in courses:
        courses_data.append({
            'id': course.id,
            'name': f"{course.abbreviation} {course.course_number}{' [' + course.section_number + ']' if course.section_number else ''}",
            'url': reverse('course_assignments', args=[course.id])
        })
    
    return JsonResponse({'courses': courses_data})