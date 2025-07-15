<?php
/**
 * Plugin Name:       Financial Terms Dictionary
 * Plugin URI:        https://example.com/
 * Description:       Displays financial terms from a custom post type 'dictionary' as an A-Z list of links to their individual pages.
 * Version:           1.1.0
 * Author:            Your Name
 * Author URI:        https://example.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       financial-dictionary
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Enqueue plugin stylesheet.
 */
function fd_enqueue_assets_v1_1() { // Renamed function to avoid conflicts if old version is around
    // Register the style first
    wp_register_style(
        'fd-style-v1-1', // Renamed handle
        plugin_dir_url( __FILE__ ) . 'css/fd-style.css', // Assuming CSS file is updated or replaced
        array(),
        '1.1.0' // Updated version
    );
}
add_action( 'wp_enqueue_scripts', 'fd_enqueue_assets_v1_1' );

/**
 * Register the shortcode [financial_dictionary].
 */
function fd_register_shortcode_v1_1() { // Renamed function
    add_shortcode( 'financial_dictionary', 'fd_display_dictionary_v1_1' );
}
add_action( 'init', 'fd_register_shortcode_v1_1' );

/**
 * Callback function for the [financial_dictionary] shortcode.
 *
 * @return string HTML output for the dictionary.
 */
function fd_display_dictionary_v1_1() { // Renamed function
    // Enqueue the stylesheet only when the shortcode is used.
    if ( ! wp_style_is( 'fd-style-v1-1', 'enqueued' ) ) {
        wp_enqueue_style( 'fd-style-v1-1' );
    }

    $args = array(
        'post_type'      => 'dictionary', // Your custom post type slug
        'posts_per_page' => -1,           // Retrieve all posts
        'orderby'        => 'title',
        'order'          => 'ASC',
    );

    $query = new WP_Query( $args );

    // Initialize groups for '#' and A-Z
    $alphabet = array_merge( ['#'], range( 'A', 'Z' ) );
    $grouped_terms = array_fill_keys( $alphabet, [] );
    $active_letters = []; // To track which letters actually have terms

    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            $title = get_the_title();
            $first_letter = strtoupper( mb_substr( $title, 0, 1 ) );

            if ( ! ctype_alpha( $first_letter ) ) {
                $first_letter = '#';
            }
            
            if (array_key_exists($first_letter, $grouped_terms)) {
                $grouped_terms[$first_letter][] = array(
                    'title'      => $title,
                    'permalink'  => get_permalink(),
                );
                if (!in_array($first_letter, $active_letters)) {
                    $active_letters[] = $first_letter;
                }
            }
        }
        wp_reset_postdata();
    }
    // Sort active letters to ensure '#' appears before A, B, C... if present
    // Custom sort to place '#' first, then alphabetically
    usort($active_letters, function($a, $b) {
        if ($a == '#') return -1;
        if ($b == '#') return 1;
        return strcmp($a, $b);
    });


    // Start output buffering
    ob_start();
    ?>
    <div class="financial-dictionary-container">
        <nav id="financial-dictionary-nav" class="financial-dictionary-nav">
            <div class="fd-nav-inner"> <?php // Added inner wrapper for scrolling on fixed nav ?>
                <?php
                foreach ( $alphabet as $letter ) {
                    $is_active = in_array($letter, $active_letters);
                    // Link is active if terms exist, otherwise it's styled as disabled but still links to the section
                    $class = $is_active ? 'active' : 'disabled';
                    echo '<a href="#fd-section-' . esc_attr( strtolower( $letter === '#' ? 'hash' : $letter ) ) . '" class="' . esc_attr($class) . '">' . esc_html( $letter ) . '</a>';
                }
                ?>
            </div>
        </nav>

        <div id="financial-dictionary-content" class="financial-dictionary-content">
            <?php
            foreach ( $alphabet as $letter ) :
                $section_id_char = strtolower( $letter === '#' ? 'hash' : $letter );
            ?>
                <section id="fd-section-<?php echo esc_attr( $section_id_char ); ?>" class="fd-term-section">
                    <h2><?php echo esc_html( $letter ); ?></h2>
                    <?php if ( ! empty( $grouped_terms[$letter] ) ) : ?>
                        <ul class="fd-term-list">
                            <?php foreach ( $grouped_terms[$letter] as $term ) : ?>
                                <li class="fd-term-list-item">
                                    <a href="<?php echo esc_url( $term['permalink'] ); ?>"><?php echo esc_html( $term['title'] ); ?></a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php else : ?>
                        <p class="no-terms-message">There are no terms starting with '<?php echo esc_html( $letter ); ?>'.</p>
                    <?php endif; ?>
                </section>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean(); // Return buffered content
}
?>
