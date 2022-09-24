import sys
import os
import requests
import json
from dotenv import load_dotenv
from bs4 import BeautifulSoup


# Creates book entries in a Notion database from listings on Amazon

def capture(url):
    load_dotenv()
    NOTION_API_KEY = os.environ['NOTION_API_KEY']
    NOTION_DATABASE_ID = os.environ['NOTION_DATABASE_ID']

    # Cutoff the reference in the URL
    if "/ref" in url:
        url = url.split("/ref")[0]

    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'lxml')

    # Get information about the book from the url
    title = soup.select_one('span#productTitle').text
    authors = ', '.join([author.text for author in soup.select('.contributorNameID')])
    image = soup.select_one('img#imgBlkFront, img#ebooksImgBlkFront')['src']

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
