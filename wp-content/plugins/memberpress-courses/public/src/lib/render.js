import { createRoot, render } from '@wordpress/element';

export default function (reactNode, domNode) {
  // Use createRoot in WP 6.2+ (React 18+)
  domNode && (createRoot ? createRoot(domNode).render(reactNode) : render(reactNode, domNode));
}
