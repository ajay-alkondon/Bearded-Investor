import { debounce } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';
import { F10, isKeyboardEvent } from '@wordpress/keycodes';
import { __ } from '@wordpress/i18n';

export default function ClassicEditor({
  id,
  content,
  onChange,
  height = 200,
}) {
  const defaultEditorMode = window.getUserSetting ? window.getUserSetting('editor', 'tmce') : 'tmce';
  const didMount = useRef(false);
  const [mode, setMode] = useState(defaultEditorMode === 'html' ? 'html' : 'tmce');

  useEffect(() => {
    if (!didMount.current) {
      return;
    }

    const editor = window.tinymce.get(id);

    if (editor) {
      const currentContent = editor.getContent();

      if (currentContent !== content) {
        editor.setContent(content || '');
      }
    }
  }, [content]);

  useEffect(() => {
    const { baseURL, suffix } = window.wpEditorL10n.tinymce;

    didMount.current = true;

    window.tinymce.EditorManager.overrideDefaults({
      base_url: baseURL,
      suffix,
    });

    function onSetup(editor) {
      const debouncedOnChange = debounce(() => {
        const value = editor.getContent();

        if (value !== editor._lastChange) {
          editor._lastChange = value;
          onChange(value);
        }
      }, 250);

      editor.on('Paste Change input Undo Redo', debouncedOnChange);

      // We need to cancel the debounce call because when we remove
      // the editor (onUnmount) this callback is executed in
      // another tick. This results in setting the content to empty.
      editor.on('remove', debouncedOnChange.cancel);

      editor.on('keydown', (event) => {
        if (isKeyboardEvent.primary(event, 'z')) {
          // Prevent the gutenberg undo kicking in so TinyMCE undo stack works as expected.
          event.stopPropagation();
        }

        const { altKey } = event;
        /*
         * Prevent Mousetrap from kicking in: TinyMCE already uses its own
         * `alt+f10` shortcut to focus its toolbar.
         */
        if (altKey && event.keyCode === F10) {
          event.stopPropagation();
        }
      });

      editor.on('init', () => {
        if (editor.theme && editor.theme.resizeTo) {
          editor.theme.resizeTo(null, height);
        }

        if (window.switchEditors && mode !== 'tmce') {
          window.switchEditors.go(id, mode);
        }
      });
    }

    function initialize() {
      const { settings } = window.wpEditorL10n.tinymce;

      if (settings.toolbar1) {
        settings.toolbar1 = settings.toolbar1
          .split(',')
          .filter(tool => !['wp_more', 'wp_add_media'].includes(tool))
          .join(',');
      }

      wp.oldEditor.initialize(id, {
        tinymce: {
          ...settings,
          content_css: false,
          setup: onSetup,
        },
      });
    }

    function onReadyStateChange() {
      if (document.readyState === 'complete') {
        initialize();
      }
    }

    if (document.readyState === 'complete') {
      initialize();
    } else {
      document.addEventListener('readystatechange', onReadyStateChange);
    }

    return () => {
      document.removeEventListener(
        'readystatechange',
        onReadyStateChange
      );

      wp.oldEditor.remove(id);
    };
  }, []);

  function changeMode(newMode) {
    if (window.switchEditors && mode !== newMode) {
      window.switchEditors.go(id, newMode);
      setMode(newMode);
    }
  }

  return (
    <div className={`mpcs-classic-editor mpcs-classic-editor-mode-${mode}`}>
      <div className="mpcs-classic-editor-tabs">
        <button
          type="button"
          className="mpcs-switch-tmce"
          onClick={() => changeMode('tmce')}
        >
          {__('Visual', 'memberpress-courses')}
        </button>
        <button
          type="button"
          className="mpcs-switch-html"
          onClick={() => changeMode('html')}
        >
          {__('Text', 'memberpress-courses')}
        </button>
      </div>
      <div className="mpcs-classic-editor-field">
        <textarea
          id={id}
          className="mpcs-classic-editor-tinymce"
          value={content}
          onChange={event => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
