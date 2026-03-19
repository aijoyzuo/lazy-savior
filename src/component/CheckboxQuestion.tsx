import React from 'react';

type Option = {
  id: string;
  label: string;
};

interface CheckboxQuestionProps {
  question: string;
  field: string;
  options: Option[];
  /** 勾選中的選項 id 陣列 */
  value: string[];
  /** onChange(選項 id, 是否被勾選) */
  onChange: (id: string, checked: boolean) => void;
}

const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({
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
                type="checkbox"
                name={field}
                id={option.id}
                checked={value.includes(option.id)}
                onChange={(e) => onChange(option.id, e.target.checked)}
              />
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxQuestion;
