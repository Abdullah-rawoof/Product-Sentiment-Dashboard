from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Review
from .serializers import ProductSerializer
from .scraper import ProductScraper
from .sentiment import SentimentAnalyzer
from django.utils import timezone
from datetime import timedelta

class AnalyzeProductView(APIView):
    def post(self, request):
        target = request.data.get('target', '').strip()
        if not target:
            return Response({'error': 'URL or search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check cache: if same query/URL was analyzed in the last 15 minutes, return it
        is_url = target.startswith("http://") or target.startswith("https://")
        cache_time = timezone.now() - timedelta(minutes=15)
        
        if is_url:
            cached_product = Product.objects.filter(url=target, created_at__gte=cache_time).first()
        else:
            cached_product = Product.objects.filter(query__iexact=target, created_at__gte=cache_time).first()
            
        if cached_product:
            serializer = ProductSerializer(cached_product)
            # Return cached data with a header or flag
            data = serializer.data
            data['cached'] = True
            return Response(data, status=status.HTTP_200_OK)
            
        # Run scraper
        scraper = ProductScraper()
        sentiment_analyzer = SentimentAnalyzer()
        
        try:
            data = scraper.scrape_product(target)
            
            # Create product
            product = Product.objects.create(
                title=data['title'],
                url=data['url'],
                platform=data['platform'],
                avg_rating=data['avg_rating'],
                image_url=data['image_url'],
                query=data['query']
            )
            
            # Save reviews and calculate scores
            reviews_to_create = []
            for r in data['reviews']:
                sentiment = sentiment_analyzer.analyze_text(r['text'])
                reviews_to_create.append(Review(
                    product=product,
                    reviewer_name=r.get('reviewer_name', 'Anonymous'),
                    rating=r.get('rating', 5),
                    title=r.get('title', ''),
                    text=r['text'],
                    date=r.get('date', ''),
                    sentiment_label=sentiment['label'],
                    sentiment_score=sentiment['score']
                ))
                
            Review.objects.bulk_create(reviews_to_create)
            
            # Recalculate average rating from generated list
            if reviews_to_create:
                product.avg_rating = round(sum(r.rating for r in reviews_to_create) / len(reviews_to_create), 1)
                product.save()
                
            serializer = ProductSerializer(product)
            res_data = serializer.data
            res_data['cached'] = False
            return Response(res_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': f'Analysis failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProductHistoryView(APIView):
    def get(self, request):
        products = Product.objects.all().order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductDetailView(APIView):
    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product analysis not found'}, status=status.HTTP_404_NOT_FOUND)
            
    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            product.delete()
            return Response({'message': 'Product history item deleted successfully'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product analysis not found'}, status=status.HTTP_404_NOT_FOUND)
