import json
import os

import requests
from dotenv import load_dotenv

load_dotenv()
NOTION_API_KEY = os.environ['NOTION_API_KEY']
NOTION_DATABASE_ID = os.environ['NOTION_DATABASE_ID']


def post(image, title, authors, url):
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

    print(requests.request("POST", endpoint, headers=headers, data=data))
