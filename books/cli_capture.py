import argparse

import amazon_notion_capture


def cli():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("url", type=str, help="Amazon book URL to capture")
    parser.add_argument(
        "-v",
        "--verbose",
        type=str,
        default=True,
        help="Print out status and debug messages",
    )

    args = parser.parse_args().__dict__
    response = amazon_notion_capture.post(args["url"], **args)

    if args.pop("verbose") == "True":
        print(response)


if __name__ == "__main__":
    cli()
