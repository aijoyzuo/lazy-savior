import type { ReactElement } from 'react';
type SliderQuestionProps ={
 label: string;
 field:string;
min?: number; 
max?: number; 
step?: number; 
value: number;
onChange:(field: string, value: number) => void; 
sliderClassName?: string; 
}


export default function SliderQuestion({ label, field, min = 30, max = 180, step = 15, value, onChange,sliderClassName}: SliderQuestionProps):ReactElement  { 
   
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field, Number(e.target.value));
  };
   return (<>
        <div className="py-2">
            <div className="mb-2">
                <label htmlFor={field} className="h5 py-2 form-label">{label}</label>
                <input type="range"                  
                    id={field}
                    min={min}
                    max={max}
                    step={step}
                    value={value} 
                    onChange={handleChange} 
                   className={`form-range slider ${sliderClassName ?? ""}`}  />
            </div>
            <div className="text-end me-2">{value} 分鐘</div>
        </div >
    </>)
}