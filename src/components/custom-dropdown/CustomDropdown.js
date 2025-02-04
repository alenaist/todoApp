import React, { useState } from "react";
import { SkillLevelAdvanced } from "../icons/HighLevel";
import { SkillLevelBasic } from "../icons/LowLevel";
import { SkillLevelIntermediate } from "../icons/MediumLevel";
import "./CustomDropdown.scss";

const CustomDropdown = ({ selectedImportance, setSelectedImportance }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "low", label: "Low", color: 'green', icon: <SkillLevelBasic /> },
    { value: "medium", label: "Medium", color: 'orange', icon: <SkillLevelIntermediate /> },
    { value: "high", label: "High", color: 'red', icon: <SkillLevelAdvanced /> },
  ];

  const handleSelect = (value) => {
    setSelectedImportance(value);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="custom-dropdown">
      <div
        className="dropdown-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: options.find((opt) => opt.value === selectedImportance)?.color }}
      >
        {options.find((opt) => opt.value === selectedImportance)?.icon}{" "}
      </div>
      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="dropdown-option"
              style={{ color: option.color }}
            >
              {option.icon}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;