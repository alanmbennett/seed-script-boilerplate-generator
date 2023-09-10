# Seed Script Boilerplate Generator
This extension generates boilerplate for taking existing database records and converting them into seed scripts. This is particularly useful for generating seed scripts to seed local and integration test databases.

Currently, this extension only supports MSSQL connections.

![Visual of script boilerplate](https://raw.githubusercontent.com/alanmbennett/seed-script-boilerplate-generator/master/images/getting-started/step4.png)

## Installation
This extension is currently in pre-release status. Once stable, releases can be found by searching the extensions marketplace underneath the "Extensions" section of Azure Data Studio.

Current and pre-releases are be available from the [Releases](https://github.com/alanmbennett/seed-script-boilerplate-generator/releases) page of this project's repository. Found the desired release, download its VSIX file, and use the ***Install from VSIX*** option in Azure Data Studio.

## Changelog
The changelog of changes for each release can be found [here](https://github.com/alanmbennett/seed-script-boilerplate-generator/blob/master/CHANGELOG.md).

## Getting Started
1. Connect to an existing connection in Azure Data Studio's Object Explorer.
1. Find a table and right-click to bring up the context menu.
1. Select the ``Generate Seed Script Boilerplate`` option.
![Select a table](https://raw.githubusercontent.com/alanmbennett/seed-script-boilerplate-generator/master/images/getting-started/step1.png)
1. Two scripts will be opened up side-by-side based on the table selected.
![Side-by-side scripts](https://raw.githubusercontent.com/alanmbennett/seed-script-boilerplate-generator/master/images/getting-started/step2.png)
1. Run the SELECT query script to generate SQL syntax for the INSERT script. Copy the results.
![Run the query](https://raw.githubusercontent.com/alanmbennett/seed-script-boilerplate-generator/master/images/getting-started/step3.png)
1. Paste the results where the comment is on the INSERT script.
![Paste the results](https://raw.githubusercontent.com/alanmbennett/seed-script-boilerplate-generator/master/images/getting-started/step4.png)
1. Now you have seed scripts based off of existing data that you can use for your PostDeployment scripts, etc. 
   - Be sure to save a copy of the SELECT script for later use

## Settings
There are a few settings you can override to help customize your scripts. You can easily change your settings at anything by navigating to the Gear icon for Azure Data Studio and searching using the following setting IDs. The setting change(s) will take effect on your next usage of the extension without requiring an app restart.

- `seed-script-boilerplate-generator.enableColumnLabels`
    - `boolean`, default: `true`
    - `true` generates column labels in the form of comments preceding each column value in your script, e.g.:
    ![Comment label example](https://raw.githubusercontent.com/alanmbennett/seed-script-boilerplate-generator/master/images/settings/enableColumnLabels.png)
    - `false` leaves the column labels off
- `seed-script-boilerplate-generator.useTabs`
    - `boolean`, default: `false`
    - `true` uses one `\t` character for indents instead of spaces
    - `false` uses spaces for indents instead of the tab character
- `seed-script-boilerplate-generator.indentSpaces`
    - `number`, default: `4`
    - Number provided by user determines how many spaces define an indent, e.g. the default is `4` meaning each indent is made up of 4 spaces.

## License

This extension is released under the [MIT License](https://raw.githubusercontent.com/alanmbennett/seed-script-boilerplate-generator/master/LICENSE).
