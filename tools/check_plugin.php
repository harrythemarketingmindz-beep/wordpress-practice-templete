<?php
// Integration checks for our renderer using real WordPress sanitization functions.
// Elementor's base class and hook registration are stubbed; this is not a live import.
namespace Elementor {
    class Widget_Base {
        public $settings = array();
        public function get_settings_for_display() { return $this->settings; }
        public function output() { ob_start(); $this->render(); return ob_get_clean(); }
    }
}
namespace {
    define('ABSPATH', '/tmp/wordpress/');
    $ro_test_actions = array();
    function add_action($name, $callback, ...$args) { $GLOBALS['ro_test_actions'][$name] = $callback; }
    function add_filter(...$args) {}
    function apply_filters($hook, $value, ...$args) { return $value; }
    function plugin_dir_path($file) { return dirname($file) . '/'; }
    function plugin_dir_url($file) { return 'https://destination.example/wp-content/plugins/rankorbit-elementor/'; }
    function get_option($name, $default = false) { return $name === 'blog_charset' ? 'UTF-8' : ($GLOBALS['ro_test_options'][$name] ?? $default); }
    function wp_allowed_protocols() { return array('http', 'https', 'mailto', 'tel'); }
    function wp_parse_url($url, $component = -1) { return parse_url($url, $component); }
    function wp_is_valid_utf8($value) { return mb_check_encoding($value, 'UTF-8'); }
    function _is_valid_utf8($value) { return mb_check_encoding($value, 'UTF-8'); }
    function _canonical_charset($value) { return $value; }
    require '/wp-check/formatting.php';
    require '/wp-check/kses.php';
    define('ELEMENTOR_VERSION', 'test-version');
    function current_user_can($capability) { return true; }
    function did_action($name) { return 1; }
    function check_admin_referer($action) { return true; }
    function absint($value) { return abs((int)$value); }
    function get_post_status($id) { return isset($GLOBALS['ro_test_posts'][$id]) ? 'draft' : false; }
    function wp_insert_post($post, $error = false) { $GLOBALS['ro_test_inserts'] = ($GLOBALS['ro_test_inserts'] ?? 0) + 1; $GLOBALS['ro_test_posts'][99] = $post; return 99; }
    function is_wp_error($value) { return false; }
    function wp_json_encode($value) { return json_encode($value); }
    function update_post_meta($id, $key, $value) { $GLOBALS['ro_test_meta'][$key] = is_string($value) ? stripslashes($value) : $value; }
    function update_option($name, $value, $autoload = false) { $GLOBALS['ro_test_options'][$name] = $value; }
    function admin_url($path) { return 'https://destination.example/wp-admin/' . $path; }
    function wp_safe_redirect($url) { throw new \RuntimeException('redirect:' . $url); }
    function wp_die($message) { throw new \RuntimeException('error:' . $message); }
    require '/work/rankorbit-elementor/rankorbit-elementor.php';
    require '/work/rankorbit-elementor/widget.php';
    $widget = new \RO_Capture_Widget();
    $sections = ro_capture_manifest();
    $count = 0;
    foreach ($sections as $key => $entry) {
        $widget->settings = $entry['settings'];
        $output = $widget->output();
        if (preg_match('/__RO_(TEXT|LINK|MEDIA|PUBLIC)/', $output)) { throw new \Exception('Unresolved token: ' . $key); }
        if (strpos($output, '<script') !== false) { throw new \Exception('Executable captured script: ' . $key); }
        if (count($entry['settings']['media_items']) && strpos($output, 'https://destination.example/wp-content/plugins/rankorbit-elementor/public/') === false) { throw new \Exception('Local assets not resolved: ' . $key); }
        $count++;
    }
    $widget->settings = $sections['home-01']['settings'];
    $widget->settings['text_items'][0]['copy'] = '<b>Edited copy</b><script>alert(1)</script>';
    $output = $widget->output();
    if (strpos($output, '<b>Edited copy</b>') === false || strpos($output, '<script') !== false) { throw new \Exception('Rich text edit/sanitization failed'); }
    $widget->settings['link_items'][0]['target']['url'] = 'javascript:alert(1)';
    if (strpos($widget->output(), 'javascript:') !== false) { throw new \Exception('Unsafe URL retained'); }
    $widget->settings['section_key'] = '../../outside';
    if ($widget->output() !== '') { throw new \Exception('Section path validation failed'); }
    for ($attempt = 0; $attempt < 2; $attempt++) {
        try { $GLOBALS['ro_test_actions']['admin_post_ro_capture_create_page'](); }
        catch (\RuntimeException $e) { if (strpos($e->getMessage(), 'redirect:') !== 0) { throw $e; } }
    }
    $saved = json_decode($GLOBALS['ro_test_meta']['_elementor_data'], true);
    if (count($saved) !== 18 || $GLOBALS['ro_test_inserts'] !== 1 || $GLOBALS['ro_test_posts'][99]['post_status'] !== 'draft') { throw new \Exception('Draft creation/idempotence failed'); }
    if ($GLOBALS['ro_test_meta']['_wp_page_template'] !== 'elementor_canvas' || strpos($GLOBALS['ro_test_meta']['_elementor_data'], '__RO_PUBLIC__') !== false) { throw new \Exception('Canvas/media preparation failed'); }
    echo "PASS: one-click setup creates 18 sections as a Canvas draft, resolves bundled URLs, and reopens without overwriting on a second call.\n";
    echo "PASS: $count sections rendered; local asset resolution, edited rich text, URL sanitization, token replacement, and section allowlist checked.\n";
}
