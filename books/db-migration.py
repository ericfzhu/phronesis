# One off database migration

import pandas as pd
import amazon_notion_capture

data = pd.read_csv('database.csv')
data = data[data['URL'].notna()]

for i, r in data.iterrows():
    amazon_notion_capture.post(r["URL"])

# print(data['URL'].isna().sum())
