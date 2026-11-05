<?php
if (!defined('ABSPATH')) { exit; }

class RO_Capture_Widget extends \Elementor\Widget_Base {
    public function get_name() { return 'rankorbit_capture'; }
    public function get_title() { return 'RankOrbit — Animated Section'; }
    public function get_icon() { return 'eicon-animation'; }
    public function get_categories() { return array('general'); }
    public function get_keywords() { return array('rankorbit', 'orbit', 'animated', 'capture'); }
    public function get_style_depends() { return array('ro-capture-compatibility'); }
    public function get_script_depends() { return array('ro-capture-motion'); }

    protected function register_controls() {
        $manifest = ro_capture_manifest();
        $options = array();
        foreach ($manifest as $key => $entry) { $options[$key] = $entry['title']; }
        $this->start_controls_section('ro_section', array('label' => 'Reference section'));
        $this->add_control('section_key', array('label' => 'Section', 'type' => \Elementor\Controls_Manager::SELECT, 'options' => $options, 'default' => 'home-01'));
        $this->add_control('ro_help', array('type' => \Elementor\Controls_Manager::RAW_HTML, 'raw' => 'Use the imported template for prefilled content. Edit Text, Images & Videos, and Links below. Keep each original section once so animation IDs remain unique. For a different section, insert it from the imported template instead of changing this selector.'));
        $this->end_controls_section();

        $this->start_controls_section('ro_text', array('label' => 'Text'));
        $repeater = new \Elementor\Repeater();
        $repeater->add_control('label', array('label' => 'Editor label', 'type' => \Elementor\Controls_Manager::TEXT));
        $repeater->add_control('token', array('type' => \Elementor\Controls_Manager::HIDDEN));
        $repeater->add_control('copy', array('label' => 'Content (basic HTML allowed)', 'type' => \Elementor\Controls_Manager::TEXTAREA, 'rows' => 6, 'description' => 'Preserve span tags to keep gradient words and line breaks.'));
        $this->add_control('text_items', array('type' => \Elementor\Controls_Manager::REPEATER, 'fields' => $repeater->get_controls(), 'title_field' => '{{{ label }}}', 'prevent_empty' => false));
        $this->end_controls_section();

        $this->start_controls_section('ro_media', array('label' => 'Images & videos'));
        $repeater = new \Elementor\Repeater();
        $repeater->add_control('label', array('label' => 'Editor label', 'type' => \Elementor\Controls_Manager::TEXT));
        $repeater->add_control('token', array('type' => \Elementor\Controls_Manager::HIDDEN));
        $repeater->add_control('file', array('label' => 'Image or video', 'type' => \Elementor\Controls_Manager::MEDIA, 'media_types' => array('image', 'video'), 'description' => 'Select an image for an image slot or a video for a video slot. Default captured assets are bundled in the plugin.'));
        $this->add_control('media_items', array('type' => \Elementor\Controls_Manager::REPEATER, 'fields' => $repeater->get_controls(), 'title_field' => '{{{ label }}}', 'prevent_empty' => false));
        $this->end_controls_section();

        $this->start_controls_section('ro_links', array('label' => 'Links & testimonial videos'));
        $repeater = new \Elementor\Repeater();
        $repeater->add_control('label', array('label' => 'Editor label', 'type' => \Elementor\Controls_Manager::TEXT));
        $repeater->add_control('token', array('type' => \Elementor\Controls_Manager::HIDDEN));
        $repeater->add_control('target', array('label' => 'Destination URL', 'type' => \Elementor\Controls_Manager::URL, 'options' => array('url')));
        $this->add_control('link_items', array('type' => \Elementor\Controls_Manager::REPEATER, 'fields' => $repeater->get_controls(), 'title_field' => '{{{ label }}}', 'prevent_empty' => false));
        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        $manifest = ro_capture_manifest();
        $key = $settings['section_key'] ?? 'home-01';
        if (!is_string($key) || !isset($manifest[$key])) { return; }
        $defaults = $manifest[$key]['settings'];
        $markup = file_get_contents(RO_CAPTURE_DIR . 'sections/' . $key . '.html');
        $replacements = array();
        foreach (array('text_items', 'link_items', 'media_items') as $group) {
            $rows = isset($settings[$group]) && is_array($settings[$group]) && count($settings[$group]) ? $settings[$group] : $defaults[$group];
            // Fill deleted controls with captured defaults so no unresolved tokens leak.
            $indexed = array();
            foreach ($defaults[$group] as $row) { $indexed[$row['token']] = $row; }
            foreach ($rows as $row) { if (isset($row['token'], $indexed[$row['token']])) { $indexed[$row['token']] = $row; } }
            foreach ($indexed as $token => $row) {
                if ($group === 'text_items') { $replacements[$token] = wp_kses_post($row['copy'] ?? ''); }
                else {
                    $url = $group === 'link_items' ? ($row['target']['url'] ?? '') : ($row['file']['url'] ?? '');
                    $url = str_replace('__RO_PUBLIC__', untrailingslashit(RO_CAPTURE_URL . 'public'), $url);
                    $replacements[$token] = esc_url($url);
                }
            }
        }
        // Expand rich text before media and links because rich text can contain those tokens.
        $markup = strtr($markup, $replacements);
        $markup = strtr($markup, $replacements);
        $markup = str_replace('__RO_PUBLIC__', esc_url(untrailingslashit(RO_CAPTURE_URL . 'public')), $markup);
        // Markup is bundled local data, not user-provided executable HTML. Edits above are sanitized.
        echo $markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
}
