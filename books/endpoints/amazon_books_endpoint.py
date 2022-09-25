import requests
from bs4 import BeautifulSoup


def get(url):
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'lxml')

    # Get information about the book from the url
    title = soup.select_one('span#productTitle').text
    authors1 = [author.text for author in soup.select('div:is(._follow-the-author-card_style_authorNameColumn__1YFry)')]
    authors2 = [author.text for author in soup.select('a:is(.contributorNameID)')]
    authors = ', '.join(list(set(authors1 + authors2)))
    # authors = re.search(r'.*?\[(.*)].*', soup.select_one('img#ebooksImgBlkFront')['alt'])
    # authors = authors.group(1)
    image = soup.select_one('img#imgBlkFront, img#ebooksImgBlkFront')['src']

    return title, authors, image
