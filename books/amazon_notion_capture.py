from typing import Optional

from endpoints import amazon_books_endpoint, notion_endpoint


# Captures a book listing on Amazon into a Notion database

def post(url, verbose: Optional[bool] = None):
    if "/ref" in url:
        url = url.split("/ref")[0]
    title, authors, image = amazon_books_endpoint.get(url, verbose)
    return notion_endpoint.post_book(image, title, authors, url, verbose)
