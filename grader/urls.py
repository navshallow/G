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
]