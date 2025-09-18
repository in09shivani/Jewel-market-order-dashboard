
import React from 'react';

const IconUsers: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.513-.96 1.487-1.594 2.572-1.788v-.042A3 3 0 0 1 13.5 9.75V9A3 3 0 0 0 7.5 9v.75a3 3 0 0 1 3.5 2.962M12 21a9.094 9.094 0 0 0-3.741-.479 3 3 0 0 0-4.682-2.72M12 3a3 3 0 0 1 3 3v.75A3 3 0 0 1 13.5 9.75V9A3 3 0 0 0 7.5 9v.75a3 3 0 0 1 3.5 2.962" />
  </svg>
);

export default IconUsers;
