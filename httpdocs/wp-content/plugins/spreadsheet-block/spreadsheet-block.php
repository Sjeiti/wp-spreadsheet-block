<?php

/**
 * @wordpress-plugin
 * Plugin Name:       Spreadsheet block
 * Plugin URI:        https://github.com/Sjeiti/wp-spreadsheet-block
 * Description:       Display interactive spreadsheets
 * Version:           1.0.2
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

function ssb_init() {
    register_block_type( __DIR__ );
}
add_action( 'init', 'ssb_init' );

// block.json script and viewScript do not seem to work
function ssb_enqueue_scripts() {
    wp_enqueue_script( 'dds-js', plugins_url( '/public/js/index.js', __FILE__ ));
}
add_action('wp_enqueue_scripts','ssb_enqueue_scripts');

//function ssb_admin_enqueue_scripts() {
//    wp_enqueue_style( 'ssb_style', plugin_dir_url( __FILE__ ) . '/admin/css/style.css', false, '1.0.0' );
//}
//add_action( 'admin_enqueue_scripts', 'ssb_admin_enqueue_scripts' );

function ssb_upload_mimes( $mimes ) {
		return array_merge($mimes, array (
			'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'xls' => 'application/vnd.ms-excel',
			'csv' => 'text/csv'
		));
}
add_filter( 'upload_mimes', 'ssb_upload_mimes' );

