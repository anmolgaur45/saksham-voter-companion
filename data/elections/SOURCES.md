# Election data sources

Lok Sabha general election results, 2004–2019, sourced from Lok Dhaba
(Trivedi Centre for Political Data, Ashoka University). Available at
https://lokdhaba.ashoka.edu.in.

Coverage: 4 elections (2004, 2009, 2014, 2019), all 543 constituencies,
winners only (filtered Position = 1, Poll_No = 1).

2024 data is not included. Lok Dhaba has not published the cleaned
dataset for the 2024 General Election at time of writing.

The CSV in this directory is a normalized export used for one-time
ingestion into BigQuery. Schema documented in
`apps/backend/services/bigquery.py`.
