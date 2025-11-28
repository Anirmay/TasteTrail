import React, { useState, useRef } from 'react';

const TagInput = ({ value = [], onChange, placeholder = '' }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (tag) => {
    const t = String(tag || '').trim();
    if (!t) return;
    if (value.map(v => v.toLowerCase()).includes(t.toLowerCase())) {
      setInput('');
      return;
    }
    onChange([...value, t]);
    setInput('');
  };

  const removeTag = (index) => {
    const next = value.slice();
    next.splice(index, 1);
    onChange(next);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      // remove last
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="w-full">
      <div className="min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg flex flex-wrap items-center gap-2" onClick={() => inputRef.current?.focus()}>
        {value.map((tag, i) => (
          <div key={i} className="flex items-center bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
            <span className="mr-2">{tag}</span>
            <button type="button" onClick={() => removeTag(i)} className="text-green-700 hover:text-green-900">✕</button>
          </div>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(input)}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] outline-none px-1 py-1 text-sm"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">Type and press Enter or comma to add. Click ✕ to remove.</p>
    </div>
  );
};

export default TagInput;
