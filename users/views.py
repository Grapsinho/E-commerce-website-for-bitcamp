import bleach
from .forms import UsersForm, VendorForm

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .serializers import UserSerializer, VendorSerializer
from rest_framework import generics, status, mixins
from rest_framework.request import Request
from rest_framework.response import Response
from .models import Consumer, Vendor
from rest_framework.views import APIView
from .tokens import create_jwt_for_user

def sanitize_input(user_input):
    cleaned_input = bleach.clean(user_input, tags=['p', 'strong', 'em'], attributes={'*': ['class']})
    return cleaned_input

def registration(request):
    form = UsersForm()

    context = {"form": form}
    return render(request, 'users/registration.html', context)

def loginView(request):
    return render(request, 'users/login.html')

class SignUpView(generics.GenericAPIView):

    """
    View for user registration.
    """

    serializer_class = UserSerializer
    permission_classes = []

    def post(self, request: Request):
        data = request.data
        serializer = self.serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()

            response = {"message": "User Created", "data": serializer.data}

            return Response(data=response, status=status.HTTP_201_CREATED)

        print(serializer)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    View for user login and JWT token generation.
    """
    def post(self, request: Request):
        email = sanitize_input(request.data.get("email"))
        password = sanitize_input(request.data.get('password')) 

        user = authenticate(request, password=password, email=email)

        if user is not None:
            login(request, user)
            # When the user logs in, create tokens
            tokens = create_jwt_for_user(user)
            response = {
                "message": "User login successful",
                "user": email,
                "tokens": tokens,
            }

            return Response(data=response, status=status.HTTP_200_OK)
        else:
            return Response(
                data={"message": "Email or password is invalid"},
            )

def logoutForm(request):
    logout(request)
    return redirect('login')


# /////////////////////////////////////////////////////////////////
# down here everything is for vendors

def vendor_registration(request):
    form = VendorForm()

    context = {"form": form}
    return render(request, 'users/vendor_registration.html', context)

class SignUpView_vendor(generics.GenericAPIView):

    """
    View for user registration.
    """

    serializer_class = VendorSerializer
    permission_classes = []

    def post(self, request: Request):
        data = request.data
        serializer = self.serializer_class(data=data)

        try:
            if serializer.is_valid():
                serializer.save()

                response = {"message": "Vendor Created", "data": serializer.data}

                return Response(data=response, status=status.HTTP_201_CREATED)
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            context = {
                "error23": str(e),
            }

            return Response(data=context, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import status
from .serializers import VendorUpdateSerializer
from .permissions import VendorUpdatePermission

class VendorUpdateView(APIView):
    permission_classes = [VendorUpdatePermission]
    def put(self, request, email):
        vendor = Vendor.objects.get(email=email)
        serializer = VendorUpdateSerializer(vendor, data=request.data)
        try:
            if serializer.is_valid():
                serializer.save()

                response = {"message": "Vendor Update", "data": serializer.data}

                return Response(data=response, status=status.HTTP_200_OK)
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            context = {
                "error23": str(e),
            }

            return Response(data=context, status=status.HTTP_400_BAD_REQUEST)