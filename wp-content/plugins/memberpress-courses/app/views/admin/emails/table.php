<?php
// Ensure the file is being accessed within the WordPress context.
if (!defined('ABSPATH')) {
    exit;
}

// Check if the table object is set.
if (!isset($table)) {
    return;
}
?>

<div class="wrap">
    <h1 class="wp-heading-inline"><?php esc_html_e('Emails', 'memberpress-courses'); ?></h1>
    <hr class="wp-header-end">

    <form method="post">
        <?php
        // Output the table.
        $table->display();
        ?>
    </form>
</div>
