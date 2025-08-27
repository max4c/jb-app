'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  isDarkMode?: boolean;
  className?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  isDarkMode = false,
  className = ""
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selected.includes(option.value)
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  const getOptionLabel = (value: string) => {
    return options.find(option => option.value === value)?.label || value;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main container with selected tags */}
      <div
        className={`min-h-[42px] w-full px-3 py-2 border rounded-md cursor-text flex flex-wrap gap-1 items-center ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'
        } ${isOpen ? 'ring-2 ring-[#C84344] ring-opacity-20 border-[#C84344]' : ''}`}
        onClick={() => {
          setIsOpen(true);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {/* Selected tags */}
        {selected.map((value) => (
          <span
            key={value}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
              isDarkMode
                ? 'bg-[#C84344] text-white'
                : 'bg-[#C84344] text-white'
            }`}
          >
            {getOptionLabel(value)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(value);
              }}
              className="hover:bg-red-600 rounded-full p-0.5 ml-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ''}
          className={`flex-1 min-w-[120px] outline-none text-sm bg-transparent ${
            isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'
          }`}
        />

        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div
          className={`absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-md border shadow-lg ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-white border-gray-300'
          }`}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 cursor-pointer text-sm hover:${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className={`px-3 py-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm ? 'No matching options' : 'All options selected'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}