<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://ronvalstar.nl
 * @since             1.0.0
 * @package           Spreadsheet_Block
 *
 * @wordpress-plugin
 * Plugin Name:       Spreadsheet block
 * Plugin URI:        https://github.com/Sjeiti/circularyarnlabel_csvplugin
 * Description:       Display interactive spreadsheets
 * Version:           1.0.0
 * Author:            Ron Valstar
 * Author URI:        https://ronvalstar.nl
 * License:           MIT
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       spreadsheet-block
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// echo 'foofofofofof';

function ssb_init() {
    register_block_type( __DIR__ );
}
add_action( 'init', 'ssb_init' );

// block.json script and viewScript do not seem to work
function ssb_enqueue_scripts() {
    wp_enqueue_script( 'dds-js', plugins_url( '/public/js/index.js', __FILE__ ));
}
add_action('wp_enqueue_scripts','ssb_enqueue_scripts');

