<?php

namespace memberpress\courses\lib;

if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

use memberpress\courses\helpers;
use memberpress\courses\lib;
use memberpress\courses\jobs;
use memberpress\courses as base;

abstract class BaseEmail
{
  public $key;
  public $to;
  public $title;
  public $description;
  public $ui_order;
  public $show_form;
  public $defaults;
  public $variables;
  public $test_vars;
  public $headers;
  public $stored_fields;

  public function __construct($args = array())
  {
    $this->headers = array();
    $this->defaults = array();
    $this->variables = array();
    $this->test_vars = array();

    $this->set_defaults($args);
    $this->load_stored_fields();
  }

  /**
   * Get the stored field from the database
   *
   * @param string $fieldname
   * @return mixed
   */
  public function get_stored_field($fieldname)
  {
    if (isset($this->stored_fields->$fieldname)) {
      return $this->stored_fields->$fieldname;
    }

    // If the field is not set in the database, fall back to the default value
    return isset($this->defaults[$fieldname]) ? $this->defaults[$fieldname] : false;
  }

  /**
   * Get the field name for the email
   *
   * @param string $field - The field name
   * @param boolean $id - Whether to include the id or not
   * @return string
   */
  public function field_name($field = 'enabled', $id = false)
  {
    $classname = get_class($this);

    if ($id) {
      return 'mpcs-emails-' . $this->dashed_name() . '-' . $field;
    } else {
      return 'mpcs-emails[' . $classname . '][' . $field . ']';
    }
  }

  /**
   * Load the stored fields from the database
   */
  public function load_stored_fields(){
    $db = lib\DB::fetch();
    $record = $db->get_one_record($db->emails, ['email_key' => $this->key]);

    if ($record) {
      $this->stored_fields = $record;
    }
  }

  /**
   * Check if the email is enabled
   */
  public function enabled()
  {
    return ($this->get_stored_field('enabled') != false);
  }

  /**
   * Check if the email uses a template
   */
  public function use_template()
  {
    return ($this->get_stored_field('use_template') != false);
  }

  /**
   * Get the email headers
   */
  public function headers()
  {
    return $this->headers;
  }

  /**
   * Get the email variables
   */
  public function subject()
  {
    return $this->get_stored_field('subject');
  }

  /**
   * Get the email body
   */
  public function body()
  {
    return $this->get_stored_field('body');
  }

  /**
   * Get the email body
   */
  public function default_subject()
  {
    return $this->defaults['subject'];
  }

  /**
   * Get the email body
   */
  public function default_body()
  {
    return $this->defaults['body'];
  }

  /**
   * Get formatted subject
   *
   * @param array $values - The values to replace in the subject
   * @param string $subject - The subject to replace the values in
   * @return string
   */
  public function formatted_subject($values = array(), $subject = false)
  {
    if ($subject)
      return $this->replace_variables($subject, $values);
    else
      return $this->replace_variables($this->subject(), $values);
  }

  /**
   * Get formatted body
   *
   * @param array $values - The values to replace in the body
   * @param string $type - The type of the email
   * @param string $body - The body to replace the values in
   * @param boolean $use_template - Whether to use a template or not
   * @return string
   */
  public function formatted_body($values = array(), $type = 'html', $body = false, $use_template = null)
  {
    if ($body) {
      $body = $this->replace_variables($body, $values);
    } else {
      $body = $this->replace_variables($this->body(), $values);
    }

    $body .= $this->footer();

    if (is_null($use_template)) {
      $use_template = $this->use_template();
    }

    if ($type == 'html' && $use_template) {
      ob_start();
      require base\VIEWS_PATH . '/emails/template.php';
      return ob_get_clean();
    }

    if ($type == 'html') {
      return $body;
    }

    return lib\Utils::convert_to_plain_text($body);
  }

  /**
   * Send the email
   *
   * @param array $values - The values to replace in the email
   * @param string $subject - The subject of the email
   * @param string $body - The body of the email
   * @param boolean $use_template - Whether to use a template or not
   * @param string $content_type - The content type of the email
   * @return void
   */
  public function send($values = array(), $subject = false, $body = false, $use_template = null, $content_type = 'html')
  {
    // Used to filter parameters to be searched and replaced in the email subject & body
    $values  = apply_filters('mpcs_email_send_params',  $values,  $this, $subject, $body);
    $body    = apply_filters('mpcs_email_send_body',    $body,    $this, $subject, $values);
    $subject = apply_filters('mpcs_email_send_subject', $subject, $this, $body,    $values);
    $attachments = apply_filters('mpcs_email_send_attachments', array(), $this, $body, $values);

    $options = get_option('mpcs-options');

    $bkg_enabled =  apply_filters('mpcs_bkg_email_jobs_enabled', helpers\Options::val($options, 'course_emails_bkg_jobs', false));

    if (!$bkg_enabled || (defined('DOING_CRON') && DOING_CRON)) {
      if (!isset($this->to) or empty($this->to)) {
        throw new \Exception(__('No email recipient has been set.', 'memberpress-courses'));
      }

      add_action('phpmailer_init', array($this, 'mailer_init'));

      if ($content_type == 'html') {
        add_filter('wp_mail_content_type', array($this, 'set_html_content_type'));
      }

      lib\Utils::wp_mail(
        $this->to,
        $this->formatted_subject($values, $subject),
        $this->formatted_body($values, $content_type, $body, $use_template),
        $this->headers(),
        $attachments
      );

      if ($content_type == 'html') {
        remove_filter('wp_mail_content_type', array($this, 'set_html_content_type'));
      }

      remove_action('phpmailer_init', array($this, 'mailer_init'));
      do_action('mpcs_email_sent', $this, $values, $attachments);
    } else {
      $job = new jobs\EmailJob();
      $job->enqueue(
        [
          'values' => $values,
          'subject' => $subject,
          'body' => $body,
          'class' => get_class($this),
          'to' => $this->to,
          'headers' => $this->headers,
          'use_template' => $use_template,
          'content_type' => $content_type,
          'attachments' => $attachments
        ]
      );
    }
  }

  /**
   * Set the content type of the email
   *
   * @param string $content_type - The content type of the email
   * @return string
   */
  public function set_html_content_type($content_type = 'text/html')
  {
    // return 'text/html;charset="UTF-8"'; //UTF-8 is breaking internal WP checks
    return 'text/html';
  }

  /**
   * Set the email content type
   * This is for some severe multipart mailing
   *
   * @param object $phpmailer - The phpmailer object
   * @return void
   */
  public function mailer_init($phpmailer)
  {
    // Plain text
    // Decode body
    $phpmailer->AltBody = wp_specialchars_decode($phpmailer->Body, ENT_QUOTES);
    $phpmailer->AltBody = lib\Utils::convert_to_plain_text($phpmailer->AltBody);

    // Replace variables in email
    $phpmailer->AltBody = apply_filters('mepr-email-plaintext-body', $phpmailer->AltBody);

    if ($phpmailer->ContentType == 'text/html') {
      // HTML
      // Replace variables in email
      $phpmailer->Body = apply_filters('mepr-email-html-body', $phpmailer->Body);
    }
  }

  /**
   * Send the email if enabled
   *
   * @param array $values - The values to replace in the email
   * @param string $content_type - The content type of the email
   * @return void
   */
  public function send_if_enabled($values = array(), $content_type = 'html')
  {
    if ($this->enabled()) {
      $this->send($values, false, false, null, $content_type);
    }
  }

  /**
   * Display the form
   */
  public function display_form()
  {
    $email = $this;
    require base\VIEWS_PATH . '/admin/emails/options';
  }

  /**
   * Get the dashed name
   *
   * @return string
   */
  public function dashed_name()
  {
    // Get the full class name with namespaces
    $classname = get_class($this);

    // Remove everything before the last backslash, including the backslash
    $classname_only = substr(strrchr($classname, '\\'), 1);

    // Replace uppercase letters with a dash and the lowercase equivalent
    $tag = preg_replace('/\B([A-Z])/', '-$1', $classname_only);

    // Convert to lowercase and return
    return strtolower($tag);
  }

  /**
   * Get the view name
   *
   * @return string
   */
  public function view_name()
  {
    $classname = get_class($this);
    $lastPart = substr(strrchr($classname, '\\'), 1);

    $view = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $lastPart));

    return $view;
  }

  /**
   * Get the views path
   *
   * @return string
   */
  public function get_views_path()
  {
    return base\VIEWS_PATH . '/emails/';
  }

  /**
   * Replace variables in the text
   *
   * @param string $text - The text to replace the variables in
   * @param array $values - The values to replace in the text
   * @return string
   */
  public function replace_variables($text, $values)
  {
    return lib\Utils::replace_vals($text, $values);
  }

  /**
   * Get the body partial
   *
   * @param array $vars - The variables to replace in the body
   * @return string
   */
  public function body_partial($vars = array())
  {
    ob_start();
    require $this->get_views_path() . $this->view_name() . '.php';
    return ob_get_clean();
  }

  /**
   * Get the footer
   *
   * @return string
   */
  private function footer()
  {
    $links = $this->footer_links();
    $links_str = join('&#124;', $links);
    ob_start();
?>
    <div id="footer" style="width: 680px; padding: 0px; margin: 0 auto; text-align: center;">
      <?php echo $links_str; ?>
    </div>
<?php

    return ob_get_clean();
  }

  /**
   * Get the footer links
   *
   * @return array
   */
  private function footer_links()
  {
    // $mpcs_options = MeprOptions::fetch();
    $options = get_option('mpcs-options');
    $links = array();

    if (helpers\Options::val($options, 'include_email_privacy_link', false)) {
      // TODO: replace MeprAppHelper later
      $privacy_policy_page_link = \MeprAppHelper::privacy_policy_page_link();
      if ($privacy_policy_page_link !== false) {
        $links[] = '<a href="' . $privacy_policy_page_link . '">' . __('Privacy Policy', 'memberpress-courses') . '</a>';
      }
    }

    return $links;
  }

  /**
   * Set the default enabled, title, subject, body & other variables
   * @param array $args
   * @return void
  */
  abstract public function set_defaults($args = array());
}
