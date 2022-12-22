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


def search_book(query, search_type="title"):
    if search_type not in search_queries:
        raise ValueError("Invalid search type")

    query_parsed = "%20".join(query.split(" "))
    search_url = f"http://gen.lib.rus.ec/search.php?req={query_parsed}&column={search_type}"
    search_page = requests.get(search_url)

    soup = BeautifulSoup(search_page.text, "lxml")
    data = soup.find_all("table")[2]

    raw_data = [
        [extract_td_data(td) for td in row.find_all("td")]
        for row in data.find_all("tr")[1:]
    ]

    output_data = [dict(zip(col_names, row)) for row in raw_data]

    return output_data


def extract_td_data(td):
    if td.find("a") and td.find("a").has_attr("title") and td.find("a")["title"] != "":
        return td.a["href"]
    else:
        return "".join(td.stripped_strings)
