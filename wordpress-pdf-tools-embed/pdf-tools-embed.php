<?php
/**
 * Plugin Name: PDF Tools Embed
 * Plugin URI: https://allaboutpdfediting.xyz/embed
 * Description: Embed 30+ free PDF tools (compress, merge, split, edit, sign, OCR, and more) on your WordPress site. Zero setup, zero API keys — all processing happens in the user's browser.
 * Version: 1.0.0
 * Requires at least: 5.0
 * Requires PHP: 7.0
 * Author: PDFTools
 * Author URI: https://allaboutpdfediting.xyz
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: pdf-tools-embed
 */

defined('ABSPATH') or die('No direct access');

define('PDF_TOOLS_EMBED_VERSION', '1.0.0');
define('PDF_TOOLS_EMBED_BASE', 'https://allaboutpdfediting.xyz');

function pdf_tools_embed_enqueue_script() {
    wp_enqueue_script('pdf-tools-embed', PDF_TOOLS_EMBED_BASE . '/embed.js', array(), PDF_TOOLS_EMBED_VERSION, true);
}
add_action('wp_enqueue_scripts', 'pdf_tools_embed_enqueue_script');

function pdf_tools_embed_shortcode($atts) {
    $atts = shortcode_atts(array(
        'tool' => 'compress',
        'theme' => 'light',
        'height' => '',
    ), $atts, 'pdf_tool');

    $tool = sanitize_title($atts['tool']);
    $theme = in_array($atts['theme'], array('light', 'dark')) ? $atts['theme'] : 'light';
    $height = !empty($atts['height']) ? ' height="' . esc_attr($atts['height']) . '"' : '';

    $allowed = array(
        'compress', 'merge', 'split', 'image-to-pdf', 'edit-pdf',
        'unlock', 'protect', 'rotate', 'delete-pages', 'organize',
        'sign', 'ocr-pdf', 'extract-text', 'pdf-to-word', 'word-to-pdf',
        'repair-pdf', 'watermark', 'add-page-numbers', 'annotate', 'fill-form',
        'flatten-pdf', 'reverse-pdf', 'resize', 'crop', 'html-to-pdf',
        'text-to-pdf', 'scan-to-pdf', 'batch', 'chat-pdf', 'metadata'
    );

    if (!in_array($tool, $allowed)) {
        return '<p style="color:#ef4444;font-size:14px;">Unknown PDF tool: "' . esc_html($tool) . '". <a href="' . esc_url(PDF_TOOLS_EMBED_BASE . '/embed') . '" target="_blank">See available tools</a>.</p>';
    }

    return '<pdf-tool tool="' . esc_attr($tool) . '" theme="' . esc_attr($theme) . '"' . $height . '></pdf-tool>';
}
add_shortcode('pdf_tool', 'pdf_tools_embed_shortcode');

function pdf_tools_embed_register_block() {
    if (!function_exists('register_block_type')) return;

    wp_register_script(
        'pdf-tools-embed-block',
        plugins_url('block.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor'),
        PDF_TOOLS_EMBED_VERSION
    );

    register_block_type('pdf-tools/embed', array(
        'editor_script' => 'pdf-tools-embed-block',
        'render_callback' => 'pdf_tools_embed_shortcode',
        'attributes' => array(
            'tool' => array('type' => 'string', 'default' => 'compress'),
            'theme' => array('type' => 'string', 'default' => 'light'),
            'height' => array('type' => 'string', 'default' => ''),
        ),
    ));
}
add_action('init', 'pdf_tools_embed_register_block');

function pdf_tools_embed_widget() {
    register_widget('PDF_Tools_Embed_Widget');
}
add_action('widgets_init', 'pdf_tools_embed_widget');

class PDF_Tools_Embed_Widget extends WP_Widget {
    public function __construct() {
        parent::__construct(
            'pdf_tools_embed_widget',
            __('PDF Tools Embed', 'pdf-tools-embed'),
            array('description' => __('Display a free PDF tool on your sidebar.', 'pdf-tools-embed'))
        );
    }

    public function widget($args, $instance) {
        echo $args['before_widget'];
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        $tool = isset($instance['tool']) ? $instance['tool'] : 'compress';
        echo do_shortcode('[pdf_tool tool="' . esc_attr($tool) . '"]');
        echo $args['after_widget'];
    }

    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : '';
        $tool = !empty($instance['tool']) ? $instance['tool'] : 'compress';
        $tools = array(
            'compress' => 'Compress PDF', 'merge' => 'Merge PDF', 'split' => 'Split PDF',
            'image-to-pdf' => 'Image to PDF', 'edit-pdf' => 'Edit PDF', 'sign' => 'Sign PDF',
            'fill-form' => 'Fill Form', 'ocr-pdf' => 'OCR PDF', 'unlock' => 'Unlock PDF',
            'protect' => 'Protect PDF', 'rotate' => 'Rotate PDF',
        );
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php esc_html_e('Title:', 'pdf-tools-embed'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('tool')); ?>"><?php esc_html_e('Tool:', 'pdf-tools-embed'); ?></label>
            <select class="widefat" id="<?php echo esc_attr($this->get_field_id('tool')); ?>" name="<?php echo esc_attr($this->get_field_name('tool')); ?>">
                <?php foreach ($tools as $id => $label): ?>
                    <option value="<?php echo esc_attr($id); ?>" <?php selected($tool, $id); ?>><?php echo esc_html($label); ?></option>
                <?php endforeach; ?>
            </select>
        </p>
        <?php
    }

    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = !empty($new_instance['title']) ? sanitize_text_field($new_instance['title']) : '';
        $instance['tool'] = !empty($new_instance['tool']) ? sanitize_title($new_instance['tool']) : 'compress';
        return $instance;
    }
}
