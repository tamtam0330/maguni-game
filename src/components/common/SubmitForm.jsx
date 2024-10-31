// Form.jsx
import { useState } from 'react';
import Button from './Button';

function SubmitForm() {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("제출된 값:", value);
    // 여기에 제출 로직 추가
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        placeholder="내용을 입력하세요"
        className="flex-1 h-12 px-4 border rounded-md"
      />
      <Button 
        variant="round"
        className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white border-none"
        onClick={handleSubmit}
      >
        →
      </Button>
    </form>
  );
}

export default SubmitForm;