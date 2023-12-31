# Change Log

All notable changes to the "seed-script-boilerplate-generator" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Initial release

## v0.2.0 - 2023-09-29
- Changed "Generating seed script boilerplate" notification message to notification with progress
- Refactored underlying code to be more agnostic with connection provider (e.g. MSSQL, etc.)
- Added support for some missing data types:
   - TEXT / NTEXT
   - IMAGE
   - BINARY / VARBINARY
   - HIERARCHYID
- Added skip for TIMESTAMP / ROWVERSION columns

## v0.1.0 - 2023-09-10
- Initial pre-release