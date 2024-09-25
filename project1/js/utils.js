
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

export const adjustColorBrightness = (hex, amount) => {
    let usePound = false;
    
    if (hex[0] === "#") {
      hex = hex.slice(1);
      usePound = true;
    }
  
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
  
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
  
    return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, "0");
  }