import json
from typing import Optional

import requests

from .utils import GoodReadBook


class Notion:
    def __init__(self, api_key: str, database_id: str):
        self.api_key = api_key
        self.database_id = database_id

    def post_book_from_goodreads(self, book: GoodReadBook, verbose: Optional[bool] = False):
        endpoint = "https://api.notion.com/v1/pages/"
        headers = {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
            "Authorization": f"Bearer {self.api_key}",
        }
        data = json.dumps(
            {
                "parent": {"database_id": self.database_id},
                "properties": {
                    "Cover": {
                        "type": "files",
                        "files": [
                            {
                                "name": "Cover",
                                "type": "external",
                                "external": {"url": book.image},
                            }
                        ],
                    },
                    "Status": {"type": "select", "select": None},
                    "End": {"type": "date", "date": None},
                    "Name": {
                        "type": "title",
                        "title": [{"type": "text", "text": {"content": book.name}}],
                    },
                    "Num Pages": {
                        "type": "number",
                        "number": book.num_pages,
                    },
                    "ISBN": {
                        "type": "rich_text",
                        "rich_text": [{"type": "text", "text": {"content": book.isbn}}],
                    },
                    "Author": {
                        "type": "rich_text",
                        "rich_text": [{"type": "text", "text": {"content": ", ".join(book.authors)}}],
                    },
                    "URL": {"type": "url", "url": book.url},
                },
            }
        )

        return requests.request("POST", endpoint, headers=headers, data=data)

    def get_currently_reading(self):
        endpoint = f"https://api.notion.com/v1/databases/{self.database_id}/query"
        headers = {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
            "Authorization": f"Bearer {self.api_key}",
        }
        data = json.dumps(
            {"filter": {"property": "Status", "select": {"equals": "Reading"}}}
        )
        response = requests.request("POST", endpoint, headers=headers, data=data).json()
        books = [
            book["properties"]["Name"]["title"][0]["plain_text"]
            for book in response["results"]
        ]
        return books
