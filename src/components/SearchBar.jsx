function SearchBar({ value, onChange, placeholder }) {
    return (
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
        placeholder={placeholder}
      />
    );
  }
  
  export default SearchBar;