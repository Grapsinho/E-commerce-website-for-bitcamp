from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
import debug_toolbar

urlpatterns = [
    path('admin/', admin.site.urls),

    # main urls
    path('', include('mainApp.urls')),

    # dashboard urls
    path('', include('dashboard.urls')),

    # auth urls
    path('auth/', include('users.urls')),

    # api urls
    path('api/', include('api.urls')),

    #for development
    path("__debug__/", include(debug_toolbar.urls)),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)