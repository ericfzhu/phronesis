import requests
from bs4 import BeautifulSoup


def get(url):
    if "/ref" in url:
        url = url.split("/ref")[0]

    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'lxml')

    # Get information about the book from the url
    title = soup.select_one('span#productTitle').text
    authors = ', '.join([author.text for author in soup.select('.contributorNameID')])
    image = soup.select_one('img#imgBlkFront, img#ebooksImgBlkFront')['src']

    return title, authors, image
