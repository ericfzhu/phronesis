import json


class GoodReadBook:
    def __init__(self, book: json, url: str):
        self.name = book['name']
        self.image = book['image']
        self.book_format = book['bookFormat']
        self.num_pages = book['numberOfPages']
        self.language = book['inLanguage']
        self.isbn = book['isbn']
        self.rating = book['aggregateRating']['ratingValue']
        self.rating_count = book['aggregateRating']['ratingCount']
        self.review_count = book['aggregateRating']['reviewCount']
        self.authors = [author['name'] for author in book['author']]
        self.url = url
