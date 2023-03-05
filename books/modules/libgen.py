from typing import Literal, Optional

import requests
from bs4 import BeautifulSoup
import tqdm
import io

from requests import Response

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

    def get_book_results(self) -> list[LibGenBook]:
        """
        Returns the list of books
        :return: List of books
        """
        return self.data

    def get_download_links(self) -> list[str]:
        """
        Resolves the download links for the given results
        :return: List of download links
        """
        download_links = []
        for result in self.data:
            for link in result.download_links():
                if link is not None:
                    download_links.append(link)

        return download_links

    def download_first(self, verbose=False) -> Optional[bytes]:
        """
        Downloads the first result from LibGen
        :return:
        """
        # Get mirror links for the first result
        download_links = self.get_download_links()
        mirrors = ["GET", "Cloudflare", "IPFS.io", "Infura"]
        page = requests.get(download_links[0])
        soup = BeautifulSoup(page.text, "html.parser")
        mirror_links = soup.find_all("a", string=mirrors)
        download_links = {link.string: link["href"] for link in mirror_links}

        # Download the first result
        if verbose:
            print("Downloading the first result...")
            print(download_links)

        # Use Cloudflare link if available, else GET
        if download_links["Cloudflare"]:
            response = requests.get(download_links["Cloudflare"], stream=True)
        else:
            response = requests.get(download_links["GET"], stream=True)

        if response.status_code == 200:
            content = io.BytesIO()
            total_length = response.headers.get('content-length')

            if verbose:
                progress_bar = tqdm.tqdm(total=int(total_length), unit='B', unit_scale=True)

            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    content.write(chunk)

                    if verbose:
                        progress_bar.update(len(chunk))

            if verbose:
                progress_bar.close()
                print("Download complete!")

            return content.getvalue()
        else:
            print("Download failed with status code {}".format(response.status_code))
            return None

