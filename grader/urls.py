from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login, name='login'),
    path('create-account/', views.create_account, name='create_account'),
    path('assignmentbylist/', views.assignmentbylist, name='assignmentbylist'),
    path('detailedassignment/', views.detailedassignment, name='detailedassignment'),
    path('gradeassignment/', views.gradeassignment, name='gradeassignment'),
    path('studentroster/', views.studentroster, name='studentroster'),
    path('add-course/', views.add_course, name='add_course'),
    path('delete-course/<int:course_id>/', views.delete_course, name='delete_course'),
    path('course/<int:course_id>/assignments/', views.course_assignments, name='course_assignments'),
    
    path('assignment/delete/<int:assignment_id>/', views.delete_assignment, name='delete_assignment'),
    path('assignment/restore/<int:assignment_id>/', views.restore_assignment, name='restore_assignment'),
    path('assignment/upload-pdf/<int:assignment_id>/', views.upload_assignment_pdf, name='upload_assignment_pdf'),
    path('update-course/<int:course_id>/', views.update_course, name='update_course'),
    
    path('archived-courses/', views.get_archived_courses, name='get_archived_courses'),
    path('restore-course/<int:course_id>/', views.restore_course, name='restore_course'),
    path('permanent-delete-course/<int:course_id>/', views.permanent_delete_course, name='permanent_delete_course'),
    path('refresh-sidebar/', views.refresh_sidebar, name='refresh_sidebar'),
]