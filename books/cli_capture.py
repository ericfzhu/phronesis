import argparse

import amazon_notion_capture


def cli():
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("url", type=str, help="Amazon book URL to capture")

    args = parser.parse_args().__dict__
    response = amazon_notion_capture.post(args['url'])
    print(response)


if __name__ == '__main__':
    cli()
