import sys
import requests
from bs4 import BeautifulSoup

# Creates book entries in a Notion database from listings on Amazon

url = sys.argv[1]

# Cutoff the reference in the URL
if "/ref" in url:
    url = url.split("/ref")[0]

r = requests.get(url)
soup = BeautifulSoup(r.text, 'lxml')

# Get information about the book from the url
title = soup.select_one('span#productTitle').text

authors = soup.select('.contributorNameID')
authors = ', '.join([author.text for author in authors])

image = soup.select_one('img#imgBlkFront, img#ebooksImgBlkFront')['src']

