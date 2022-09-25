# One off database migration

import pandas as pd

import amazon_notion_capture

data = pd.read_csv('database.csv')

for i, r in data.iterrows():
    print(amazon_notion_capture.post(r["URL"]))
