import json
import urllib.parse
from typing import Optional

import validators
from bs4 import BeautifulSoup

from .utils import GoodReadBook
from urllib.parse import urlsplit
from requests_html import HTMLSession, AsyncHTMLSession
import nest_asyncio


async def async_get_book_metadata(url: str, verbose: Optional[bool] = False) -> GoodReadBook:
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

    asession = AsyncHTMLSession()
    r = await asession.get(url)
    await r.html.arender()

    html = r.html.raw_html
    soup = BeautifulSoup(html, "lxml")

    await asession.close()

    script = soup.find('script', {'type': 'application/ld+json'}).text

    # Parse the JSON data and extract the book metadata
    book = GoodReadBook(json.loads(script), url)

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

    nest_asyncio.apply()
    session = HTMLSession()
    r = session.get(url)
    r.html.render()

    html = r.html.raw_html
    soup = BeautifulSoup(html, "lxml")

    session.close()

    script = soup.find('script', {'type': 'application/ld+json'}).text

    # Parse the JSON data and extract the book metadata
    book = GoodReadBook(json.loads(script), url)

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
