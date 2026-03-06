import React, { useState, useRef, useEffect } from 'react';

type Status = 'Active' | 'Inactive' | 'Completed' | 'Paused';

interface StatusDropdownProps {
  currentStatus: Status;
  onStatusChange: (newStatus: Status) => void;
}

const statusConfig = {
  Active: { color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  Inactive: { color: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
  Completed: { color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Paused: { color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
};

export function StatusDropdown({ currentStatus, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusSelect = (status: Status) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const config = statusConfig[currentStatus] || statusConfig.Active;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${config.color} hover:shadow-sm`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        {currentStatus}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {(Object.keys(statusConfig) as Status[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${status === currentStatus ? 'bg-gray-50' : ''
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig[status].dot}`} />
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
