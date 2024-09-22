
export const toTitleCase = (str) => str.replace(/\w\S*/g, (text) =>
    text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
);

 // Helper function for formatting percentage values
export const formatPercentage = (value) => value !== null || value !== 'N/A'? `${Number(value).toFixed(2)}%` : 'N/A';

 // Helper function for formatting numbers with commas
export const formatNumber = (value) => value !== null ? Number(value).toLocaleString() : 'N/A';

export const strRoundTwo = (value) => value !== null ? `${Number(value).toFixed(2)}` : 'N/A';

export const rndTwo = (value) => value !== null ? Number(value).toFixed(2) : 'N/A';

export const strIntDollar = (value) => value !== null ? `$${Number(value).toLocaleString()}` : 'N/A';