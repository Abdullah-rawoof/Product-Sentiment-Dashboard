from django.db import models

class Product(models.Model):
    title = models.CharField(max_length=500)
    url = models.TextField(blank=True, null=True)
    platform = models.CharField(max_length=50, default='Simulator') # Amazon, Flipkart, Simulator
    avg_rating = models.FloatField(default=0.0)
    image_url = models.TextField(blank=True, null=True)
    query = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.platform})"

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    reviewer_name = models.CharField(max_length=255, blank=True, null=True)
    rating = models.IntegerField(default=5)
    title = models.CharField(max_length=500, blank=True, null=True)
    text = models.TextField()
    date = models.CharField(max_length=255, blank=True, null=True)
    sentiment_label = models.CharField(max_length=20) # positive, negative, neutral
    sentiment_score = models.FloatField(default=0.0) # VADER compound score

    def __str__(self):
        return f"Review by {self.reviewer_name or 'Anonymous'} - {self.sentiment_label}"
