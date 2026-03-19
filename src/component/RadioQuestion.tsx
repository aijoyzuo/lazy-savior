import React from "react";

type Option = {
  id: string;
  label: string;
};

interface RadioQuestionProps {
  question: string;
  field: string;
  options: Option[];
  value: string;
  onChange: (selectedId: string) => void;
}

const RadioQuestion: React.FC<RadioQuestionProps> = ({
  question,
  field,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="py-2">
      <p className="h5 py-2">{question}</p>
      <div className={`row row-cols-1 row-cols-md-${options.length}`}>
        {options.map((option) => (
          <div key={option.id} className="col mb-2">
            <label
              htmlFor={option.id}
              className="option-label border py-3 px-2 d-flex align-items-center gap-3 rounded w-100 h-100"
            >
              <input
                className="form-check-input m-0"
                type="radio"
                name={field}
                id={option.id}
                value={option.label}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
              />
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadioQuestion;
