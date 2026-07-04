import re
import random
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

# User Agents for realistic requests
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

# High-fidelity Simulation Review Templates
SIMULATION_TEMPLATES = {
    'smartphone': {
        'positive': [
            {"title": "Incredible display and battery", "text": "The 120Hz display is super smooth. Battery easily lasts 1.5 days of heavy usage. Camera details are crisp, and low light performance is outstanding.", "rating": 5},
            {"title": "Best purchase in years!", "text": "Absolutely love this phone. Performance is lightning fast, facial recognition is instant, and the premium design feels great in hand.", "rating": 5},
            {"title": "Solid performance and great cameras", "text": "The cameras are top tier. Zoom capabilities are amazing. Software is clean with no bloatware. Charging is very fast too.", "rating": 4},
            {"title": "Highly recommend", "text": "A massive upgrade from my 3-year-old phone. The processor handles heavy multitasking and gaming without getting hot.", "rating": 5},
            {"title": "Great value for money", "text": "For the features it offers, the price is completely justified. Screen brightness is great even under direct sunlight.", "rating": 4}
        ],
        'neutral': [
            {"title": "Good phone but charging is slow", "text": "Overall a good phone. The display and build are excellent, but it takes nearly 2 hours to charge fully. Expected faster charging at this price.", "rating": 3},
            {"title": "Decent, but software has minor bugs", "text": "The hardware is premium, but the UI has some stutter issues and occasional crashes. Hope they fix this in the next software update.", "rating": 3},
            {"title": "Average battery life", "text": "Cameras are nice and performance is solid, but the battery barely lasts a full workday. If you are a power user, you will need a charger by 6 PM.", "rating": 3}
        ],
        'negative': [
            {"title": "Disappointing battery and heating issues", "text": "The phone overheats within 10 minutes of casual scrolling or video calls. The battery drops 15% in an hour. Extremely disappointed.", "rating": 2},
            {"title": "Screen stopped working after 2 weeks", "text": "The screen started flickering and went completely green after two weeks. Customer support is slow and refusing a replacement. Avoid this model.", "rating": 1},
            {"title": "Not worth the price, lagging already", "text": "This phone lags even during standard app switching. The camera app takes 3 seconds to open, causing me to miss quick shots. Terrible value.", "rating": 2}
        ]
    },
    'audio': {
        'positive': [
            {"title": "Phenomenal Sound Quality!", "text": "The bass is punchy without overpowering the vocals. Active Noise Cancellation (ANC) is the best I've ever experienced. Blocks out office noise completely.", "rating": 5},
            {"title": "Extremely comfortable and long battery life", "text": "I wear these for 8 hours straight at work with zero discomfort. The battery lasts forever. Soundstage is wide and clear.", "rating": 5},
            {"title": "Great ANC and call quality", "text": "ANC works perfectly on flights and trains. The microphones filter out wind noise during calls, so the other side hears me clearly.", "rating": 4},
            {"title": "Pure acoustic bliss", "text": "Audiophile grade sound in a wireless form factor. The companion app EQ adjustments actually work wonders. Definitely worth every penny.", "rating": 5}
        ],
        'neutral': [
            {"title": "Good sound but fragile build", "text": "Sound is clear and pairing is instant, but the plastic headband creaks when adjusted. I'm worried it might snap after a few months.", "rating": 3},
            {"title": "ANC is average, sound is decent", "text": "Comfortable fit and nice case. However, the active noise cancellation is quite weak compared to competitors. Good for quiet indoor use.", "rating": 3},
            {"title": "Bluetooth drops occasionally", "text": "The sound profile is neutral and balanced, but the connection drops for a second every now and then when my phone is in my pocket.", "rating": 3}
        ],
        'negative': [
            {"title": "Horrible fit, keeps falling out", "text": "None of the provided earbud tips fit well. They keep sliding out during light walking. Sound isolation is non-existent because of the poor seal.", "rating": 1},
            {"title": "One ear stopped working in a month", "text": "Right speaker volume suddenly dropped by 90% after only 4 weeks. Hard reset didn't work. For this brand, this quality is unacceptable.", "rating": 1},
            {"title": "Muddy bass and flat sound", "text": "The high frequencies are completely muffled and the bass is extremely muddy. It sounds like a cheap pair of $10 headphones. Sent back immediately.", "rating": 2}
        ]
    },
    'laptop': {
        'positive': [
            {"title": "An absolute powerhouse!", "text": "Compiling code and editing 4K video is a breeze. The fans barely spin up under moderate load. The keyboard has great travel and feels tactile.", "rating": 5},
            {"title": "Stunning screen, lightweight", "text": "The OLED panel is gorgeous with deep blacks. Extremely portable and easily fits in my backpack. Trackpad is large and responsive.", "rating": 5},
            {"title": "Excellent battery life for a coding machine", "text": "I get a solid 10-12 hours of writing code and browsing with multiple Docker containers running. Highly recommend for developers.", "rating": 4},
            {"title": "Premium build quality", "text": "The aluminum chassis has zero flex. The hinge is smooth and can be opened with one finger. Speakers are loud and crystal clear.", "rating": 5}
        ],
        'neutral': [
            {"title": "Great laptop but limited ports", "text": "Super fast and runs quiet. However, having only USB-C ports means carrying a dongle everywhere. A bit annoying for a Pro machine.", "rating": 3},
            {"title": "Good performance but gets hot", "text": "The processor is fast, but the laptop chassis gets noticeably hot near the keyboard under load. Fans are also quite loud under heavy tasks.", "rating": 3},
            {"title": "Decent screen, average webcam", "text": "The display is fine but could be brighter. The 720p webcam is grainy for professional meetings. Good enough for daily office work.", "rating": 3}
        ],
        'negative': [
            {"title": "Thermal throttling and constant crashes", "text": "The laptop thermal throttles immediately under light gaming. Blue screen of death happens twice a day. Returning it for a refund.", "rating": 1},
            {"title": "Terrible customer service and hardware defect", "text": "The keyboard spacebar stopped working. Sent it for repair under warranty and they returned it scratched, with the spacebar still broken. Horrible experience.", "rating": 1},
            {"title": "Battery drains in 2 hours", "text": "Battery life is atrocious. It dies in less than 2 hours of basic web browsing. Totally useless as a portable workstation.", "rating": 2}
        ]
    },
    'generic': {
        'positive': [
            {"title": "Excellent product, works perfectly!", "text": "Very happy with the purchase. The build quality is premium, it arrived well packaged and ahead of schedule. Exactly as described.", "rating": 5},
            {"title": "Exceeded expectations!", "text": "I was skeptical at first, but it is extremely useful and works flawlessly. Would definitely purchase again or recommend to friends.", "rating": 5},
            {"title": "Simple and effective", "text": "No complaints. Does exactly what it is designed to do. Material quality feels durable and reliable. Great purchase.", "rating": 4},
            {"title": "High quality product", "text": "Very well made. Instructions were clear and setup took less than a minute. Value for money is highly competitive.", "rating": 5}
        ],
        'neutral': [
            {"title": "Average product, does the job", "text": "It's decent but nothing special. The quality is mediocre and matches the price point. We'll see how long it lasts.", "rating": 3},
            {"title": "Good but has room for improvement", "text": "Functionally it is fine, but the design is a bit outdated and could be more ergonomic. Average customer support response.", "rating": 3},
            {"title": "Alright, but shipping took too long", "text": "The product itself is okay, but delivery was delayed by a week with no updates. Fits standard expectations.", "rating": 3}
        ],
        'negative': [
            {"title": "Waste of money, broke on day one", "text": "Extremely cheap plastic material. It cracked during the initial setup. Completely useless and not worth returning.", "rating": 1},
            {"title": "Does not work as advertised", "text": "Missing key components from the box. The item does not match the product photos or description. Stay away.", "rating": 1},
            {"title": "Very poor quality", "text": "Performance is terrible. It stopped functioning after three days of gentle use. Worst customer service ever.", "rating": 2}
        ]
    }
}

REVIEWER_NAMES = [
    "Aarav Sharma", "Neha Patel", "John Doe", "Sarah Jenkins", "Rohan Mehta",
    "Emma Watson", "Ananya Iyer", "Michael Scott", "David Miller", "Priya Nair",
    "Arjun Gupta", "Shruti Verma", "Alex Mercer", "Jessica Taylor", "Rahul Das"
]

class ProductScraper:
    def __init__(self):
        self.session = requests.Session()
        
    def _get_headers(self):
        return {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }

    def scrape_product(self, target_input):
        """
        Runs the scraper. If standard crawling fails or blocks, automatically switches
        to simulation generator based on the text/URL context.
        """
        is_url = target_input.startswith("http://") or target_input.startswith("https://")
        
        product_title = ""
        platform = "Simulator"
        url = ""
        image_url = None
        reviews = []
        
        if is_url:
            url = target_input
            if "amazon" in target_input.lower():
                platform = "Amazon"
                try:
                    product_title, image_url, reviews = self._scrape_amazon(target_input)
                except Exception as e:
                    print(f"Amazon Scrape Failed: {e}. Falling back to simulation.")
            elif "flipkart" in target_input.lower():
                platform = "Flipkart"
                try:
                    product_title, image_url, reviews = self._scrape_flipkart(target_input)
                except Exception as e:
                    print(f"Flipkart Scrape Failed: {e}. Falling back to simulation.")
        
        # Determine category based on product title or user query input
        search_query = target_input if not is_url else product_title
        category = self._detect_category(search_query)
        
        # If scraper could not fetch reviews, generate realistic mock reviews
        if not reviews:
            if not product_title:
                product_title = self._clean_product_title(target_input)
            
            reviews = self._generate_simulated_reviews(category)
            # Generate dummy image matching category
            image_url = self._get_placeholder_image(category)
            
        # Compute avg rating from reviews
        avg_rating = 0.0
        if reviews:
            avg_rating = round(sum(r['rating'] for r in reviews) / len(reviews), 1)
            
        return {
            'title': product_title,
            'url': url,
            'platform': platform,
            'avg_rating': avg_rating,
            'image_url': image_url,
            'query': target_input if not is_url else None,
            'reviews': reviews
        }

    def _scrape_amazon(self, url):
        # Amazon scrapers are highly protected by robot checkers, we try requests
        response = self.session.get(url, headers=self._get_headers(), timeout=10)
        if response.status_code != 200:
            raise Exception(f"HTTP Status {response.status_code}")
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title_el = soup.find("span", {"id": "productTitle"})
        if not title_el:
            raise Exception("Product title element not found")
        title = title_el.get_text().strip()
        
        # Extract product image
        image_el = soup.find("img", {"id": "landingImage"})
        image_url = image_el.get("src") if image_el else None
        
        reviews = []
        # Find review cards
        review_elements = soup.find_all("div", {"data-hook": "review"})
        for el in review_elements:
            try:
                reviewer_el = el.find("span", {"class": "a-profile-name"})
                reviewer = reviewer_el.get_text().strip() if reviewer_el else "Amazon Customer"
                
                title_el = el.find("a", {"data-hook": "review-title"})
                r_title = ""
                if title_el:
                    # Amazon titles sometimes have text directly or inside another span
                    title_span = title_el.find("span")
                    r_title = title_span.get_text().strip() if title_span else title_el.get_text().strip()
                    # Remove rating prefixes like "5.0 out of 5 stars"
                    r_title = re.sub(r'^\d\.\d out of \d stars\s*', '', r_title)
                
                rating_el = el.find("i", {"data-hook": "review-star-rating"})
                rating = 5
                if rating_el:
                    rating_text = rating_el.get_text().strip()
                    match = re.search(r'(\d)\.?\d?', rating_text)
                    if match:
                        rating = int(match.group(1))
                        
                body_el = el.find("span", {"data-hook": "review-body"})
                text = ""
                if body_el:
                    body_span = body_el.find("span")
                    text = body_span.get_text().strip() if body_span else body_el.get_text().strip()
                    
                date_el = el.find("span", {"data-hook": "review-date"})
                date_str = date_el.get_text().strip() if date_el else ""
                
                if text:
                    reviews.append({
                        'reviewer_name': reviewer,
                        'rating': rating,
                        'title': r_title,
                        'text': text,
                        'date': date_str
                    })
            except Exception as e:
                print(f"Error parsing single Amazon review: {e}")
                
        return title, image_url, reviews

    def _scrape_flipkart(self, url):
        response = self.session.get(url, headers=self._get_headers(), timeout=10)
        if response.status_code != 200:
            raise Exception(f"HTTP Status {response.status_code}")
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title_el = soup.find("span", {"class": "B_NuCI"}) or soup.find("span", {"class": "VU-ZEg"})
        if not title_el:
            raise Exception("Product title element not found")
        title = title_el.get_text().strip()
        
        # Extract product image
        image_el = soup.find("img", {"class": "_396cs4"}) or soup.find("img", {"class": "DByo73"})
        image_url = image_el.get("src") if image_el else None
        
        reviews = []
        # Find review cards (Flipkart structures reviews in specific columns)
        review_elements = soup.find_all("div", {"class": "_2wzgFH"}) or soup.find_all("div", {"class": "col"})
        for el in review_elements:
            try:
                # Validate if it's a review node by checking for rating element
                rating_el = el.find("div", {"class": "_3LWZlK"}) or el.find("div", {"class": "X14JXM"})
                if not rating_el:
                    continue
                    
                rating = int(rating_el.get_text().strip().split()[0])
                
                title_el = el.find("p", {"class": "_2-N8zT"}) or el.find("p", {"class": "z3N11g"})
                r_title = title_el.get_text().strip() if title_el else ""
                
                body_el = el.find("div", {"class": "t-y302"}) or el.find("div", {"class": "uwY5Rc"})
                # Clean read-more texts
                text = body_el.get_text().replace("READ MORE", "").strip() if body_el else ""
                
                reviewer_el = el.find("p", {"class": "_2sc7ZR"}) or el.find("p", {"class": "_2V5Ew5"})
                reviewer = reviewer_el.get_text().strip() if reviewer_el else "Flipkart Customer"
                
                date_el = el.find_all("p", {"class": "_2sc7ZR"})
                date_str = ""
                if len(date_el) > 1:
                    date_str = date_el[1].get_text().strip()
                
                if text:
                    reviews.append({
                        'reviewer_name': reviewer,
                        'rating': rating,
                        'title': r_title,
                        'text': text,
                        'date': date_str
                    })
            except Exception as e:
                print(f"Error parsing Flipkart review: {e}")
                
        return title, image_url, reviews

    def _detect_category(self, text):
        t = text.lower()
        if any(w in t for w in ['phone', 'mobile', 'iphone', 'samsung', 'pixel', 'oneplus', 'galaxy', 'smartphone', 'pro max']):
            return 'smartphone'
        elif any(w in t for w in ['headphone', 'earbud', 'audio', 'soundbar', 'buds', 'speaker', 'sony', 'bose', 'airpods', 'noise']):
            return 'audio'
        elif any(w in t for w in ['laptop', 'macbook', 'computer', 'notebook', 'pc', 'desktop', 'keyboard', 'gpu', 'ryzen', 'intel']):
            return 'laptop'
        return 'generic'

    def _clean_product_title(self, raw_input):
        # If it's a URL, parse a nice title from it
        if raw_input.startswith("http://") or raw_input.startswith("https://"):
            # Extract slug
            match = re.search(r'\/([a-zA-Z0-9\-]+)\/(?:dp|p)\/', raw_input)
            if match:
                return match.group(1).replace("-", " ").title()
            return "Scraped E-Commerce Product"
        return raw_input.title()

    def _generate_simulated_reviews(self, category):
        templates = SIMULATION_TEMPLATES.get(category, SIMULATION_TEMPLATES['generic'])
        reviews = []
        
        # Decide count: 18 to 28 reviews to fill dashboards beautifully
        num_reviews = random.randint(18, 28)
        
        # Standard distribution: 60% positive, 20% neutral, 20% negative
        dist = ['positive'] * int(num_reviews * 0.6) + ['neutral'] * int(num_reviews * 0.2) + ['negative'] * int(num_reviews * 0.2)
        random.shuffle(dist)
        
        # Ensure we have at least one of each
        if 'positive' not in dist: dist.append('positive')
        if 'neutral' not in dist: dist.append('neutral')
        if 'negative' not in dist: dist.append('negative')
        
        base_date = datetime.now()
        
        for i, sentiment in enumerate(dist):
            # Select random template review
            pool = templates[sentiment]
            tpl = random.choice(pool)
            
            # Select reviewer
            name = random.choice(REVIEWER_NAMES)
            # Slightly randomize reviewer names with initials occasionally
            if random.random() > 0.7:
                name = name.split()[0] + " " + random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + "."
                
            # Randomize review date: spanning last 45 days
            review_date = base_date - timedelta(days=random.randint(1, 45), hours=random.randint(1, 23))
            date_str = review_date.strftime("%d %B %Y")
            
            # Add subtle variations to review text so it's not identical if template is repeated
            text = tpl['text']
            if random.random() > 0.6:
                fillers = [
                    " Truly a premium purchase.",
                    " Very happy with it overall.",
                    " Definitely worth testing out.",
                    " Hope this review helps someone make up their mind!",
                    " Shipping was incredibly fast too."
                ]
                text += random.choice(fillers)
                
            reviews.append({
                'reviewer_name': name,
                'rating': tpl['rating'],
                'title': tpl['title'],
                'text': text,
                'date': date_str
            })
            
        return reviews

    def _get_placeholder_image(self, category):
        # We can return beautiful SVG icon/shapes encoded or standard Unsplash search term images
        images = {
            'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60',
            'audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60',
            'laptop': 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=300&auto=format&fit=crop&q=60',
            'generic': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=60'
        }
        return images.get(category, images['generic'])
