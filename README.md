# Seed Script Boilerplate Generator
This extension generates boilerplate for taking existing database records and converting them into seed scripts. This is particularly useful for generating seed scripts to seed local and integration test databases.

Currently, this extension only supports MSSQL tables.

## Getting Started
1. Connect to an existing connection in Azure Data Studio's Object Explorer.
1. Find a table and right-click to bring up the context menu.
1. Select the ``Generate Seed Script Boilerplate`` option.
![Select a table](/images/getting-started/step1.png)
1. Two scripts will be opened up side-by-side based on the table selected.
![Side-by-side scripts](/images/getting-started/step2.png)
1. Run the SELECT query script to generate SQL syntax for the INSERT script. Copy the results.
![Run the query](/images/getting-started/step3.png)
1. Paste the results where the comment is on the INSERT script.
![Paste the results](/images/getting-started/step4.png)
1. Now you have seed scripts based off of existing data that you can use for your PostDeployment scripts, etc. 
   - Be sure to save a copy of the SELECT script for later use
