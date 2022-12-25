import json
import re
import unicodedata


def slugify(value):
    """
    Normalizes string, converts to lowercase, removes non-alpha characters,
    and converts spaces to hyphens.
    """
    value = unicodedata.normalize('NFKD', str(value)).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')


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


class LibGenBook:
    def __init__(self, book):
        length = len(book)
        self.ID = book[0]
        self.author = book[1]
        self.title = book[2]
        self.publisher = book[3]
        self.year = book[4]
        self.pages = book[5]
        self.language = book[6]
        self.size = book[7]
        self.extension = book[8]
        self.mirror_1 = book[9] if length > 9 else None
        self.mirror_2 = book[10] if length > 10 else None
        self.mirror_3 = book[11] if length > 11 else None
        self.mirror_4 = book[12] if length > 12 else None
        self.mirror_5 = book[13] if length > 13 else None

    def get_download_links(self):
        return [self.mirror_1, self.mirror_2, self.mirror_3, self.mirror_4, self.mirror_5]