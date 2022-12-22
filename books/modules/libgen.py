import requests
from bs4 import BeautifulSoup

search_queries = [
    "identifier",
    "title",
    "author",
]


def search_book(query, search_type="title"):
    if search_type not in search_queries:
        raise ValueError("Invalid search type")

    query_parsed = "%20".join(query.split(" "))
    search_url = f"http://gen.lib.rus.ec/search.php?req={query_parsed}&column={search_type}"
    search_page = requests.get(search_url)

    soup = BeautifulSoup(search_page.text, "lxml")
    data = soup.find_all("table")[2]

    return soup
