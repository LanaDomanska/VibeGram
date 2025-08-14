// src/assets/icons/ProfileIcon.jsx
import React from "react";

function ProfileIcon({ size = 24, color = "#FAFAFA", strokeOpacity = 0.098 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0)">
        <rect
          width={24}
          height={24}
          rx={12}
          fill={color}
        />
        <rect
          x={0.5}
          y={0.5}
          width={23}
          height={23}
          rx={11.5}
          stroke="black"
          strokeOpacity={strokeOpacity}
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect
            width={24}
            height={24}
            rx={12}
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export default ProfileIcon;
