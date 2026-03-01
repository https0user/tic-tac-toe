import React from 'react';

export function IconO(props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={props.size || 64}
      height={props.size || 64}
      aria-hidden="true"
      focusable="false"
      className={props.className}
    >
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
      />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={props.size || 64}
      height={props.size || 64}
      aria-hidden="true"
      focusable="false"
      className={props.className}
    >
      <line
        x1="25"
        y1="25"
        x2="75"
        y2="75"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <line
        x1="75"
        y1="25"
        x2="25"
        y2="75"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}
