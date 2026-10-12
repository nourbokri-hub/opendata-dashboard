// src/components/DataTable.jsx
import React, { useState } from "react";

const DataTable = ({ data }) => {
  const [search, setSearch] = useState("");

  const filteredData = data.filter(row =>
    Object.values(row).some(val => val.toString().toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <input
        type="text"
        placeholder="Recherche..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {data.length > 0 && Object.keys(data[0]).map((key) => (
              <th key={key} className="px-4 py-2 border">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {Object.values(row).map((val, i) => (
                <td key={i} className="px-4 py-2 border">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
