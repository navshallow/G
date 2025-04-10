from django.shortcuts import render


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



