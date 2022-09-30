import json
import os
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()
NOTION_API_KEY = os.environ['NOTION_API_KEY']
NOTION_DATABASE_ID = os.environ['NOTION_DATABASE_ID']


# Adds a book into the Notion database
def post_book(image, title, authors, url, verbose: Optional[bool] = None):
    endpoint = "https://api.notion.com/v1/pages/"
    headers = {
        'Content-Type': 'application/json',
        'Notion-Version': '2022-02-22',
        'Authorization': f'Bearer {NOTION_API_KEY}'
    }
    data = json.dumps({
        "parent": {
            "database_id": NOTION_DATABASE_ID
        },
        "properties": {
            "Cover": {
                "type": "files",
                "files": [
                    {
                        "name": "Cover",
                        "type": "external",
                        "external": {
                            "url": image
                        }
                    }
                ]
            },
            "Status": {
                "type": "select",
                "select": None
            },
            "End": {
                "type": "date",
                "date": None
            },
            "Name": {
                "type": "title",
                "title": [
                    {
                        "type": "text",
                        "text": {
                            "content": title
                        }
                    }
                ]
            },
            "Author": {
                "type": "rich_text",
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": authors
                        }
                    }
                ]
            },
            "URL": {
                "type": "url",
                "url": url
            }
        }
    })

    return requests.request("POST", endpoint, headers=headers, data=data)


# Gets a list of currently reading books
def get_currently_reading():
    endpoint = f'https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query'
    headers = {
        'Content-Type': 'application/json',
        'Notion-Version': '2022-02-22',
        'Authorization': f'Bearer {NOTION_API_KEY}'
    }
    data = json.dumps({
        "filter": {
            "property": "Status",
            "select": {
                "equals": "Reading"
            }
        }
    })
    response = requests.request("POST", endpoint, headers=headers, data=data).json()
    # if response is None:
    #     return 'no books'
    # else:
    books = [book['properties']['Name']['title'][0]['plain_text'] for book in response['results']]
    return books


