from typing import Literal, List

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
    @staticmethod
    def search_book(query: str, search_type: Literal["identifier", "title", "author"] = "title") -> list[LibGenBook]:
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

        return output_data

    @staticmethod
    def get_download_links(results: list[LibGenBook]) -> list[str]:
        """
        Resolves the download links for the given results
        :param results: Results generated from search_book()
        :return: List of download links
        """
        download_links = []
        for result in results:
            for link in result.get_download_links():
                if link is not None:
                    download_links.append(link)

        return download_links

    @staticmethod
    def resolve_download_link(links: list[str]) -> dict[str: str]:
        """
        Resolves the first download link from get_download_links()
        :param links:
        :return:
        """
        mirrors = ["GET", "Cloudflare", "IPFS.io", "Infura"]
        page = requests.get(links[0])
        soup = BeautifulSoup(page.text, "html.parser")
        links = soup.find_all("a", string=mirrors)
        download_links = {link.string: link["href"] for link in links}

        return download_links

