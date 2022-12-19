import json
import urllib.parse
from typing import Optional

import requests
import validators
from bs4 import BeautifulSoup


def get_book_metadata(url: str, verbose: Optional[bool] = None):
    """
    Get the book metadata from the URL
    :param url:
    :param verbose:
    :return:
    """
    # Validate and fetch data from given URL
    domain = 'goodreads.com'
    stripped_url = '.'.join(urllib.parse.urlparse(url).hostname.split('.')[-2:])
    assert(stripped_url == domain)
    assert(validators.url(url))

    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    script = soup.find('script', {'type': 'application/ld+json'}).text

    # Parse the JSON data
    data = json.loads(script)

    # Extract the metadata for the book from the JSON data
    name = data['name']
    image = data['image']
    book_format = data['bookFormat']
    num_pages = data['numberOfPages']
    language = data['inLanguage']
    isbn = data['isbn']
    rating = data['aggregateRating']['ratingValue']
    rating_count = data['aggregateRating']['ratingCount']
    review_count = data['aggregateRating']['reviewCount']
    authors = [author['name'] for author in data['author']]

    if verbose:
        # Print the metadata for the book
        print(f'Name: {name}')
        print(f'Image: {image}')
        print(f'Format: {book_format}')
        print(f'Number of pages: {num_pages}')
        print(f'Language: {language}')
        print(f'ISBN: {isbn}')
        print(f'Rating: {rating}')
        print(f'Number of ratings: {rating_count}')
        print(f'Number of reviews: {review_count}')
        print(f'Authors: {authors}')
