from typing import Literal

import requests
from bs4 import BeautifulSoup

from .utils import LibGenBook


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


class LibGen:
    def __init__(self, query: str, search_type: Literal["identifier", "title", "author"] = "title") -> None:
        """
        Returns a list of results that match the given filter criteria and query
        :param query: Search query
        :param search_type: Search by ISBN, Title, or Author of book
        :return: List of results that match the given filter criteria and query
        """
        search_queries = [
            "identifier",
            "title",
            "author",
        ]
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
        output_data = [LibGenBook(row[:-1]) for row in raw_data]

        self.data = output_data

    def book_results(self) -> list[LibGenBook]:
        """
        Returns the list of books
        :return: List of books
        """
        return self.data

    def download_links(self) -> list[str]:
        """
        Resolves the download links for the given results
        :return: List of download links
        """
        download_links = []
        for result in self.data:
            for link in result.get_download_links():
                if link is not None:
                    download_links.append(link)

        return download_links

    def download_first(self) -> requests.models.Response:
        """
        Downloads the first result from LibGen
        :return:
        """
        # Get mirror links for the first result
        download_links = self.download_links()
        mirrors = ["GET", "Cloudflare", "IPFS.io", "Infura"]
        page = requests.get(download_links[0])
        soup = BeautifulSoup(page.text, "html.parser")
        mirror_links = soup.find_all("a", string=mirrors)
        download_links = {link.string: link["href"] for link in mirror_links}

        # Download the first result
        response = requests.get(download_links["GET"])

        return response

