from typing import Literal

import requests
from bs4 import BeautifulSoup

search_queries = [
    "identifier",
    "title",
    "author",
]

col_names = [
    "ID",
    "Author",
    "Title",
    "Publisher",
    "Year",
    "Pages",
    "Language",
    "Size",
    "Extension",
    "Mirror_1",
    "Mirror_2",
    "Mirror_3",
    "Mirror_4",
    "Mirror_5",
    "Edit",
]


def search_book(query: str, search_type: Literal["identifier", "title", "author"] = "title") -> list[dict]:
    """
    Returns a list of results that match the given filter criteria and query
    :param query: Search query
    :param search_type: Search by ISBN, Title, or Author of book
    :return: List of results that match the given filter criteria and query
    """
    if search_type not in search_queries:
        raise ValueError("Invalid search type")

    # Parse the given query and fetch data from given URL
    query_parsed = "%20".join(query.split(" "))
    url = f"http://gen.lib.rus.ec/search.php?req={query_parsed}&column={search_type}"
    response = requests.get(url)

    soup = BeautifulSoup(response.text, "lxml")
    data = soup.find_all("table")[2]

    # Extract data from the table
    raw_data = [
        [extract_td_data(td) for td in row.find_all("td")]
        for row in data.find_all("tr")[1:]
    ]

    # Format raw data into a dictionary
    output_data = [dict(zip(col_names, row)) for row in raw_data]

    return output_data


def extract_td_data(td):
    """
    Extracts data from a table cell
    :param td: Row of an HTML table
    :return: Data from the table cell
    """
    if td.find("a") and td.find("a").has_attr("title") and td.find("a")["title"] != "":
        return td.a["href"]
    else:
        return "".join(td.stripped_strings)
