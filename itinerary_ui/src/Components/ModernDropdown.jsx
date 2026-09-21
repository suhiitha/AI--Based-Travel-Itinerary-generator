import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheck, FiSearch, FiInbox } from "react-icons/fi";
import "./AllCss/ModernDropdown.css";

const ModernDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  searchable = false,
  icon: IconComponent = null,
  direction = "down",
  grouped = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and group options alphabetically
  const groupedOptions = useMemo(() => {
    let filtered = options;
    if (searchable && searchQuery) {
      filtered = options.filter(opt =>
        opt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!grouped) {
      return { "": filtered };
    }

    const sorted = [...filtered].sort((a, b) => a.localeCompare(b));

    // Group by first letter
    const groups = {};
    sorted.forEach(opt => {
      const letter = opt.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(opt);
    });

    return groups;
  }, [options, searchQuery, searchable, grouped]);

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div
      className={`modern-dropdown${isOpen ? " modern-dropdown--open" : ""}${direction === "up" ? " modern-dropdown--up" : ""}`}
      ref={dropdownRef}
    >
      <div
        className="modern-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="modern-dropdown__trigger-content">
          {IconComponent && (
            <IconComponent className="modern-dropdown__trigger-icon" />
          )}
          <span className={value ? "selected-text" : "placeholder-text"}>
            {value || placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <FiChevronDown className="modern-dropdown__chevron" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="modern-dropdown__menu"
            initial={{ opacity: 0, y: direction === "up" ? 8 : -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === "up" ? 8 : -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {searchable && (
              <div className="modern-dropdown__search-container">
                <div style={{ position: "relative" }}>
                  <FiSearch
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#B8860B",
                      opacity: 0.6,
                      fontSize: "13px",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    className="modern-dropdown__search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ paddingLeft: "32px" }}
                  />
                </div>
              </div>
            )}

            <div className="modern-dropdown__list">
              {Object.keys(groupedOptions).length === 0 ? (
                <div className="modern-dropdown__empty">
                  <FiInbox className="modern-dropdown__empty-icon" />
                  <span>No results found</span>
                </div>
              ) : (
                Object.keys(groupedOptions).map(letter => (
                  <div key={letter}>
                    {letter !== "" && <div className="modern-dropdown__section-header">{letter}</div>}
                    {groupedOptions[letter].map((opt, idx) => {
                      const isSelected = opt === value;
                      return (
                        <div
                          key={idx}
                          className={`modern-dropdown__item${isSelected ? " modern-dropdown__item--selected" : ""}`}
                          onClick={() => handleSelect(opt)}
                        >
                          <span>{opt}</span>
                          {isSelected && <FiCheck className="modern-dropdown__checkmark" />}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernDropdown;
