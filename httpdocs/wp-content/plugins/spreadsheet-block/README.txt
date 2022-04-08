=== Spreadsheet block ===
Contributors: Sjeiti
Tags: block, spreadsheet, csv, xls, xlsx
Requires at least: 5
Tested up to: 5.9.1
Stable tag: 1.0.3
License: MIT

Allows you to use uploaded xlsx files as blocks.

== Description ==

The spreadsheet block reads xlsx files and converts it into a live table.
You can specify what cells should be editable. Editing fields will affect existing cell calculations.

For some reason Wordpress prohibits the upload of `xslx` files. You can workaround this issue by renaming the file to `xls` (for now).


= Usage =

To use simply add a block to a page or post and choose 'Spreadsheet block'. Upload an xls or xlsx spreadsheet file from the sidebar.

From the cell options (in the block) you can set which cells are editable and which cells will be rendered as table head.

Click the eye behind a sheet name to make specific sheets invisible.


== Installation ==

Either use Wordpress' built-in plugin installer.
Or install manually; download and unzip (or clone) the plugin to the /wp-content/plugins/ directory. Then activate the plugin through the Plugins menu in WordPress.


== Versioning and issues ==

The main CVS repo for this plugin [is on Github](https://github.com/Sjeiti/wp-spreadsheet-block). The version up on Wordpress is a distilled build of the major tags.
If you have any issues or suggestions please put them on [Github](https://github.com/Sjeiti/wp-spreadsheet-block/issues).


== Changelog ==
= 1.0.2 =
* initial release
= 1.0.3 =
* fixed empty cell classNames
