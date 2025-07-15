const icons = {};
icons.view = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-eye"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);
icons.edit = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-edit"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
icons.close = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-x-circle"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);
icons.delete = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-trash-2"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
icons.draggable = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22 22"
    fill="#333"
    stroke="#333"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-more-vertical"
  >
    <circle cx="12" cy="11" r="1.2"></circle>
    <circle cx="12" cy="5" r="1.2"></circle>
    <circle cx="12" cy="17" r="1.2"></circle>
    <circle cx="5" cy="11" r="1.2"></circle>
    <circle cx="5" cy="5" r="1.2"></circle>
    <circle cx="5" cy="17" r="1.2"></circle>
  </svg>
);
icons.draggableSmall = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="18"
    viewBox="0 0 18 22"
    fill="#666"
    stroke="#666"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-more-vertical"
  >
    <circle cx="12" cy="11" r="1.2"></circle>
    <circle cx="12" cy="5" r="1.2"></circle>
    <circle cx="12" cy="17" r="1.2"></circle>
    <circle cx="5" cy="11" r="1.2"></circle>
    <circle cx="5" cy="5" r="1.2"></circle>
    <circle cx="5" cy="17" r="1.2"></circle>
  </svg>
);
icons.arrowDown = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>ionicons-v5-b</title>
    <path d="M98,190.06,237.78,353.18a24,24,0,0,0,36.44,0L414,190.06c13.34-15.57,2.28-39.62-18.22-39.62H116.18C95.68,150.44,84.62,174.49,98,190.06Z" />
  </svg>
);
icons.arrowRight = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>ionicons-v5-b</title>
    <path d="M190.06,414,353.18,274.22a24,24,0,0,0,0-36.44L190.06,98c-15.57-13.34-39.62-2.28-39.62,18.22V395.82C150.44,416.32,174.49,427.38,190.06,414Z" />
  </svg>
);
icons.plusCircle = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-plus-circle"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);
icons.arrowNext = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-arrow-right"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
icons.arrowPrev = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-arrow-left"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

icons.arrowBack = (
  <svg
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
  </svg>
);

icons.link = (
  // <svg
  //   xmlns="http://www.w3.org/2000/svg"
  //   viewBox="0 0 24 24"
  //   fill="none"
  //   stroke="currentColor"
  //   strokeWidth="2"
  //   strokeLinecap="round"
  //   strokeLinejoin="round"
  //   className="link-icon"
  // >
  //   <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
  //   <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  // </svg>
  <svg
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="link-icon"
  >
    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
  </svg>
);

export default icons;
