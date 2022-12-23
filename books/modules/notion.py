import json
import os
from typing import Optional

import requests
from dotenv import load_dotenv

from .utils import GoodReadBook

load_dotenv()
NOTION_API_KEY = os.environ["NOTION_API_KEY"]
NOTION_DATABASE_ID = os.environ["NOTION_DATABASE_ID"]


class Notion:
    @staticmethod
    def post_book_from_goodreads(book: GoodReadBook, verbose: Optional[bool] = False):
        endpoint = "https://api.notion.com/v1/pages/"
        headers = {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
            "Authorization": f"Bearer {NOTION_API_KEY}",
        }
        data = json.dumps(
            {
                "parent": {"database_id": NOTION_DATABASE_ID},
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

    @staticmethod
    def get_currently_reading():
        endpoint = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"
        headers = {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
            "Authorization": f"Bearer {NOTION_API_KEY}",
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
