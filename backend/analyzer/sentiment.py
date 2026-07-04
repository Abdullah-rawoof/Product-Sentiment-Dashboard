import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import collections
import re

# Ensure VADER lexicon is downloaded
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

class SentimentAnalyzer:
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        
    def analyze_text(self, text):
        if not text or not isinstance(text, str):
            return {
                'label': 'neutral',
                'score': 0.0
            }
        scores = self.sia.polarity_scores(text)
        compound = scores['compound']
        
        if compound >= 0.05:
            label = 'positive'
        elif compound <= -0.05:
            label = 'negative'
        else:
            label = 'neutral'
            
        return {
            'label': label,
            'score': compound
        }

    def get_key_phrases(self, reviews, top_n=25):
        # Clean up text and count key terms (excluding common stop words)
        stop_words = {
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
            'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
            'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
            'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
            'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
            'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
            'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
            'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
            'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
            "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
            'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
            'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
            'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", 'product', 'item', 'get', 'buy',
            'bought', 'got', 'use', 'using', 'used', 'would', 'one', 'like', 'really', 'even', 'amazon', 'flipkart',
            'device', 'good', 'great', 'nice', 'bad', 'worst', 'excellent', 'amazing', 'perfect', 'working', 'work'
        }
        
        words = []
        for r in reviews:
            text = ""
            if isinstance(r, dict):
                text = r.get('text', '')
            else:
                text = getattr(r, 'text', '')
            
            text_cleaned = re.sub(r'[^\w\s]', '', text.lower())
            for word in text_cleaned.split():
                if len(word) > 3 and word not in stop_words:
                    words.append(word)
                    
        counter = collections.Counter(words)
        common = counter.most_common(top_n)
        return [{'text': word, 'value': count} for word, count in common]
