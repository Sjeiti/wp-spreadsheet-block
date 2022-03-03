# Wordpress spreadsheet block plugin

This is a Worpress plugin that adds a spreadsheets block from a spreadsheet file.
For installation and usage see the `README.txt` from the plugin folder.

## Development

This plugin consists of a vanilla part and a React part. The latter from the `@wordpress/*` packages for [building a Gutenberg block](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/).
The vanilla part is the responsible for parsing the spreadsheet and drawing the table(s).

### Installation

With Yarn installed run `yarn` (optionally add `--ignore-engines`).

### Scripts

Running `yarn start` will run both the vanilla Webpack as well as the @wordpress build with watchers.
...
The vanilla version will run on [localhost:9000](http://localhost:9000/)

### Workings

The main dependencies are two spreadsheet parsers: `xlsx` and `hyperformula`. The former parses the spreadsheet binary, the latter is responsible for recalculating formula values.

Initialisation of a spreadheet component is done by checking for parent elements matching `[data-spreadsheet-block]`. The attribute value should be a JSON configuration of the type `SpreadsheetData` (see type definition in source).

### Deployment

Wordpress still uses SVN for their plugin directory. For deployment to that directory some helper scripts are created. With `yarn distribute` you copy the current state of the plugin to `trunk`. With `yarn distribute --tag` you copy the current version to `tag`. Note that keeping SVN trunk and tags up to date with GIT tags is a manual process.

