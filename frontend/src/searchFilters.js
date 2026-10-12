export const filterData = (data, query, fields = ['name']) => {
  if (!query) return data;
  const lowerQuery = query.toLowerCase();
  return data.filter(item => 
    fields.some(field => 
      item[field]?.toString().toLowerCase().includes(lowerQuery)
    )
  );
};