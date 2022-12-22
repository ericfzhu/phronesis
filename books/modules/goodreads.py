import json
import urllib.parse
from typing import Optional
from urllib.parse import urlsplit

import requests
import validators
from bs4 import BeautifulSoup

from .utils import GoodReadBook

max_retries = 5


def get_book_metadata(url: str, verbose: Optional[bool] = False) -> GoodReadBook:
    """
    Get the book metadata from the URL
    :param url:
    :param verbose:
    :return data:
    """
    # Strip URL of query parameters
    # noinspection PyProtectedMember
    url = urlsplit(url)._replace(query="", fragment="").geturl()

    # Validate and fetch data from given URL
    domain = '.'.join(urllib.parse.urlparse(url).hostname.split('.')[-2:])
    assert (domain == 'goodreads.com'), 'Invalid Domain'
    assert (validators.url(url)), 'Invalid URL'

    for _ in range(max_retries):
        # Send request to the URL and parse the response
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        json_ld = None
        for script in soup.find_all('script'):
            if script.get('type') == 'application/ld+json':
                json_ld = json.loads(script.text)
                break

        if json_ld:
            # Parse the JSON data and extract the book metadata
            book = GoodReadBook(json_ld, url)

            if verbose:
                # Print the metadata for the book
                print(f'Name: {book.name}')
                print(f'Image: {book.image}')
                print(f'Format: {book.book_format}')
                print(f'Number of pages: {book.num_pages}')
                print(f'Language: {book.language}')
                print(f'ISBN: {book.isbn}')
                print(f'Rating: {book.rating}')
                print(f'Number of ratings: {book.rating_count}')
                print(f'Number of reviews: {book.review_count}')
                print(f'Authors: {book.authors}')

            return book

    raise Exception(f'Failed to fetch book metadata after {max_retries} retries')
