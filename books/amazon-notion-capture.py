import sys
import requests
from bs4 import BeautifulSoup

# Creates book entries in a Notion database from listings on Amazon

url = sys.argv[1]

r = requests.get(url)
soup = BeautifulSoup(r.text, 'lxml')

print(soup.select('span[.author]'))

# Cutoff the reference in the URL
if "/ref" in url:
    url = url.split("/ref")[0]
