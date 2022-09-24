# One off database migration

import pandas as pd
import amazon_notion_capture_module

data = pd.read_csv('database.csv')
data = data[data['URL'].notna()]

for i, r in data.iterrows():
    # if r["URL"] == 'nan':
    #     print('yes')
    amazon_notion_capture_module.capture(r["URL"])

# print(data['URL'].isna().sum())