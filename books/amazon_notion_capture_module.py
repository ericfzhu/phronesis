import sys
import os
import requests
import json
from dotenv import load_dotenv
from bs4 import BeautifulSoup

import notion_endpoint

# Creates book entries in a Notion database from listings on Amazon


def post(url):
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

    notion_endpoint.post(image, title, authors, url)
