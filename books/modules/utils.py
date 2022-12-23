import json


class GoodReadBook:
    def __init__(self, book: json, url: str):
        self.name = book.get('name')
        self.image = book.get('image')
        self.book_format = book.get('bookFormat')
        self.num_pages = book.get('numberOfPages')
        self.language = book.get('inLanguage')
        self.isbn = book.get('isbn')
        self.rating = book.get('aggregateRating').get('ratingValue')
        self.rating_count = book.get('aggregateRating').get('ratingCount')
        self.review_count = book.get('aggregateRating').get('reviewCount')
        self.authors = [author['name'] for author in book.get('author')]
        self.url = url
