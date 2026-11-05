<?php
/**
 * Plugin Name: RankOrbit Capture for Elementor
 * Description: Editable capture-based homepage sections, local assets, and recovered motion scripts. Import the accompanying Elementor JSON after activating.
 * Version: 1.0.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) { exit; }

define('RO_CAPTURE_DIR', plugin_dir_path(__FILE__));
define('RO_CAPTURE_URL', plugin_dir_url(__FILE__));

// Resolve bundled media URLs when Elementor stores imported template data.
add_filter('sanitize_post_meta__elementor_data', function($data) {
    return is_string($data) ? str_replace('__RO_PUBLIC__', untrailingslashit(RO_CAPTURE_URL . 'public'), $data) : $data;
});

function ro_capture_manifest() {
    static $manifest;
    if (!isset($manifest)) { $manifest = json_decode(file_get_contents(RO_CAPTURE_DIR . 'sections.json'), true); }
    return is_array($manifest) ? $manifest : array();
}

function ro_capture_assets() {
    $base = RO_CAPTURE_URL . 'public/';
    $files = array(
        'fonts' => 'assets/captured-fonts.css',
        'inline' => 'assets/capture-inline.css',
        'capture' => 'assets/0079-two_front_page_aggregated_5031697833a1b266bf9fe4d7a52cf38e_delay.min.css',
        'reviews' => 'assets/0084-two_front_page_minified_trustindex-google-widget.min.css',
        'compatibility' => 'compatibility.css',
    );
    $previous = array();
    foreach ($files as $key => $file) {
        wp_enqueue_style('ro-capture-' . $key, $base . $file, $previous, '1.0.0');
        $previous = array('ro-capture-' . $key);
    }
    wp_enqueue_script('ro-capture-gsap', $base . 'gsap.min.js', array(), '3.12.5', true);
    wp_enqueue_script('ro-capture-scrolltrigger', $base . 'ScrollTrigger.min.js', array('ro-capture-gsap'), '3.12.5', true);
    wp_enqueue_script('ro-capture-compatibility', $base . 'compatibility.js', array('ro-capture-scrolltrigger'), '1.0.0', true);
    wp_localize_script('ro-capture-compatibility', 'ROCapture', array(
        'publicUrl' => $base,
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('ro_capture_contact'),
        'preview' => false,
    ));
    wp_enqueue_script('ro-capture-motion', $base . 'captured-motion.js', array('ro-capture-compatibility'), '1.0.0', true);
}

add_action('elementor/widgets/register', function($manager) {
    require_once RO_CAPTURE_DIR . 'widget.php';
    $manager->register(new RO_Capture_Widget());
});

// Enqueue only on pages containing this widget, including the Elementor preview iframe.
add_action('wp_enqueue_scripts', function() {
    $id = get_queried_object_id();
    if (isset($_GET['elementor-preview'])) { $id = absint($_GET['elementor-preview']); }
    $data = get_post_meta($id, '_elementor_data', true);
    if (is_string($data) && strpos($data, 'rankorbit_capture') !== false) { ro_capture_assets(); }
}, 30);
add_action('elementor/preview/enqueue_styles', 'ro_capture_assets');

add_action('admin_notices', function() {
    if (!did_action('elementor/loaded') && current_user_can('activate_plugins')) {
        echo '<div class="notice notice-warning"><p>RankOrbit Capture requires the free Elementor plugin. Activate Elementor, then import rankorbit-homepage-elementor.json under Templates → Saved Templates.</p></div>';
    }
});

// The destination site's administrator receives leads; no original site endpoint is reused.
function ro_capture_contact() {
    check_ajax_referer('ro_capture_contact', 'nonce');
    $fields = wp_unslash($_POST);
    if (!empty($fields['website_check'])) { wp_send_json_error(array('message' => 'Unable to send this request.'), 400); }
    $name = sanitize_text_field($fields['first-name'] ?? '');
    $phone = sanitize_text_field($fields['phone-number'] ?? '');
    $email = sanitize_email($fields['email-address'] ?? '');
    $company = sanitize_text_field($fields['company'] ?? '');
    $service = sanitize_text_field($fields['service'] ?? '');
    $message = sanitize_textarea_field($fields['message'] ?? '');
    if (!$name || !$phone || !is_email($email) || !$service || !$message || strlen($message) > 2000) {
        wp_send_json_error(array('message' => 'Please complete all required fields with a valid email address.'), 400);
    }
    $rate_key = 'ro_lead_' . hash('sha256', sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '') . wp_salt('nonce'));
    if (get_transient($rate_key)) { wp_send_json_error(array('message' => 'Please wait a minute before sending another message.'), 429); }
    set_transient($rate_key, 1, MINUTE_IN_SECONDS);
    $body = "Name: $name\nPhone: $phone\nEmail: $email\nCompany: $company\nService: $service\n\n$message";
    $sent = wp_mail(get_option('admin_email'), 'New website consultation request', $body, array('Reply-To: ' . $email));
    if (!$sent) { wp_send_json_error(array('message' => 'Your message could not be sent. Please use the contact details shown on this page.'), 500); }
    wp_send_json_success(array('message' => 'Thank you. Your consultation request has been sent.'));
}
add_action('wp_ajax_ro_capture_contact', 'ro_capture_contact');
add_action('wp_ajax_nopriv_ro_capture_contact', 'ro_capture_contact');

// Optional one-click draft creation avoids media remapping in template importers.
add_action('admin_menu', function() {
    add_management_page('RankOrbit Homepage', 'RankOrbit Homepage', 'manage_options', 'ro-capture-homepage', function() {
        if (!current_user_can('manage_options')) { return; }
        echo '<div class="wrap"><h1>RankOrbit Homepage</h1><p>Create an editable draft using the captured design and bundled animations. This does not change your current homepage.</p>';
        if (!did_action('elementor/loaded')) { echo '<p>Activate Elementor first.</p></div>'; return; }
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        echo '<input type="hidden" name="action" value="ro_capture_create_page">';
        wp_nonce_field('ro_capture_create_page');
        submit_button('Create / open homepage draft');
        echo '</form><p>After creating the page, select a section in Elementor and edit its Text, Images &amp; videos, and Links controls. Review the captured business details, external links, expired sale banner, and testimonials before publishing.</p></div>';
    });
});
add_action('admin_post_ro_capture_create_page', function() {
    if (!current_user_can('manage_options') || !did_action('elementor/loaded')) { wp_die('Administrator access and Elementor are required.'); }
    check_admin_referer('ro_capture_create_page');
    $page_id = absint(get_option('ro_capture_page_id'));
    if (!$page_id || get_post_status($page_id) === false || get_post_status($page_id) === 'trash') {
        $content = array();
        $index = 0;
        foreach (ro_capture_manifest() as $key => $entry) {
            $content[] = array(
                'id' => sprintf('b%06x', $index), 'elType' => 'container', 'isInner' => false,
                'settings' => array('_title' => $entry['title'], 'content_width' => 'full', 'flex_direction' => 'column',
                    'flex_gap' => array('unit' => 'px', 'column' => '0', 'row' => '0'),
                    'padding' => array('unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'isLinked' => true),
                    'css_classes' => 'ro-capture-container'),
                'elements' => array(array('id' => sprintf('a%06x', $index), 'elType' => 'widget', 'widgetType' => 'rankorbit_capture', 'settings' => $entry['settings'], 'elements' => array())),
            );
            $index++;
        }
        $page_id = wp_insert_post(array('post_title' => 'RankOrbit Homepage', 'post_status' => 'draft', 'post_type' => 'page'), true);
        if (is_wp_error($page_id)) { wp_die(esc_html($page_id->get_error_message())); }
        $json = str_replace('__RO_PUBLIC__', untrailingslashit(RO_CAPTURE_URL . 'public'), wp_json_encode($content));
        update_post_meta($page_id, '_elementor_data', wp_slash($json));
        update_post_meta($page_id, '_elementor_edit_mode', 'builder');
        update_post_meta($page_id, '_elementor_template_type', 'wp-page');
        update_post_meta($page_id, '_elementor_version', ELEMENTOR_VERSION);
        update_post_meta($page_id, '_wp_page_template', 'elementor_canvas');
        update_post_meta($page_id, '_elementor_page_settings', array('hide_title' => 'yes'));
        update_option('ro_capture_page_id', $page_id, false);
    }
    wp_safe_redirect(admin_url('post.php?post=' . $page_id . '&action=elementor'));
    exit;
});
