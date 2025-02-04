export function Eye(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1.2em"
        height="1.2em"
        {...props}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        >
          <path d="M3 13c3.6-8 14.4-8 18 0"></path>
          <path d="M12 17a3 3 0 1 1 0-6a3 3 0 0 1 0 6"></path>
        </g>
      </svg>
    )
  }
  