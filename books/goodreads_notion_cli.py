import argparse
import logging as log

from modules import goodreads, notion


def cli():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("url", type=str, help="Goodreads book URL to capture")
    parser.add_argument(
        "-v",
        "--verbose",
        type=str,
        default="False",
        help="Print out status and debug messages",
    )

    args = parser.parse_args().__dict__
    verbose = args.pop("verbose") == "True"
    if verbose:
        log.basicConfig(format="%(levelname)s: %(message)s", level=log.DEBUG)
        log.info("Verbose output.")
    else:
        log.basicConfig(format="%(levelname)s: %(message)s")

    url = args.pop("url")
    data = goodreads.get_book_metadata(url, verbose=verbose)
    notion.post_book_from_goodreads(data, verbose=verbose)


if __name__ == "__main__":
    cli()
