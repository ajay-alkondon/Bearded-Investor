<?php
// Ensure $records is defined
if (!isset($records) || !is_array($records)) {
    return;
}

foreach ($records as $email) : ?>
    <tr>
        <td class="title column-title has-row-actions column-primary page-title">
            <strong><a href="<?php echo esc_url($email->admin_url) ?>"><?php echo wp_kses_post($email->title); ?></a></strong>
            <div class="row-actions">
                <span class="edit"><a href="<?php echo esc_url($email->admin_url) ?>"><?php echo esc_html('Edit', 'memberpress-courses' ) ?></a></span>
            </div>
        </td>
        <td><?php echo esc_html($email->type); ?></td>
        <td><?php echo esc_html($email->subject); ?></td>
        <td>
            <label class="mpcs-switch">
                <input class="mpcs_emails_enable_single_email" data-id="<?php echo esc_attr($email->id); ?>" data-key="<?php echo esc_attr($email->key); ?>" type="checkbox" <?php checked(1, $email->status); ?> />
                <span class="mpcs-slider round"></span>
            </label>
        </td>
    </tr>
<?php endforeach; ?>