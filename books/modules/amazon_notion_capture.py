from typing import Optional

from books.modules import amazon, notion


# Captures a book listing on Amazon into a Notion database


def post(url, verbose: Optional[bool] = None):
    if "/ref" in url:
        url = url.split("/ref")[0]
    title, authors, image = amazon.get_book_metadata(url, verbose)
    return notion.post_book(image, title, authors, url, verbose)
