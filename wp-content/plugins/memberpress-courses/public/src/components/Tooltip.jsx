const Tooltip = ({ heading, message, edge = 'left' }) => (
  <span className="admin-tooltip" data-edge={edge}>
      <i className="mpcs-icon mpcs-info-circled mpcs-info-icon" />
      <span className="data-title hidden">{heading}</span>
      <span className="data-info hidden">{message}</span>
    </span>
);

export default Tooltip;
