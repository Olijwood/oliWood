
const toTitleCase = (str) => str.replace(/\w\S*/g, (text) =>
    text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
);

 // Helper function for formatting percentage values
 const formatPercentage = (value) => value !== null ? `${Number(value).toFixed(2)}%` : 'N/A';

 // Helper function for formatting numbers with commas
 const formatNumber = (value) => value !== null ? Number(value).toLocaleString() : 'N/A';

 const strRoundTwo = (value) => value !== null ? `${Number(value).toFixed(2)}` : 'N/A';

 const rndTwo = (value) => value !== null ? Number(value).toFixed(2) : 'N/A';

 const strIntDollar = (value) => value !== null ? `$${Number(value).toLocaleString()}` : 'N/A';