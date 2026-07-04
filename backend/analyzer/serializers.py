from rest_framework import serializers
from .models import Product, Review

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'reviewer_name', 'rating', 'title', 'text', 'date', 'sentiment_label', 'sentiment_score']

class ProductSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    review_count = serializers.SerializerMethodField()
    sentiment_distribution = serializers.SerializerMethodField()
    key_phrases = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'url', 'platform', 'avg_rating', 'image_url', 
            'query', 'created_at', 'reviews', 'review_count', 
            'sentiment_distribution', 'key_phrases'
        ]

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_sentiment_distribution(self, obj):
        # Calculate positive, neutral, negative counts/percentages
        total = obj.reviews.count()
        if total == 0:
            return {'positive': 0, 'neutral': 0, 'negative': 0}
        
        pos = obj.reviews.filter(sentiment_label='positive').count()
        neu = obj.reviews.filter(sentiment_label='neutral').count()
        neg = obj.reviews.filter(sentiment_label='negative').count()
        
        return {
            'positive': pos,
            'neutral': neu,
            'negative': neg,
            'positive_pct': round((pos / total) * 100, 1),
            'neutral_pct': round((neu / total) * 100, 1),
            'negative_pct': round((neg / total) * 100, 1),
        }

    def get_key_phrases(self, obj):
        from .sentiment import SentimentAnalyzer
        analyzer = SentimentAnalyzer()
        reviews = obj.reviews.all()
        return analyzer.get_key_phrases(reviews, top_n=25)
