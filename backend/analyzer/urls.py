from django.urls import path
from .views import AnalyzeProductView, ProductHistoryView, ProductDetailView

urlpatterns = [
    path('analyze/', AnalyzeProductView.as_view(), name='analyze-product'),
    path('history/', ProductHistoryView.as_view(), name='product-history'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
]
