import sys
import amazon_notion_capture

url = sys.argv[1]

print(amazon_notion_capture.post(url))
