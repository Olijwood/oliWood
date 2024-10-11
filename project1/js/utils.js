export const mapRelPct = (data) => data.map(v => 100 - v);
export const pctPerCap = (val) => `${(Number(val) * 0.1).toFixed(2)}%`;
export const formatPctRounded = (val) => val !== "N/A"  ? `${Number(val).toFixed(2)}%`: "N/A";
export const pctInt = (val) => `${Number(val)}%`;
export const formatUsd = (val) => `$${Number(val.toFixed(0)).toLocaleString()}`;
export const labelPlacementMax = (val1, val2) => Math.max(Number(val1), Number(val2))/3;
export const toTitleCase = (str) => str.replace(/\w\S*/g, (text) =>
    text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
);

 // Helper function for formatting percentage values
export const formatPercentage = (value) => value !== null || value !== 'N/A'? `${Number(value).toFixed(2)}%` : 'N/A';

 // Helper function for formatting numbers with commas
export const formatNumber = (value) => value !== null ? Number(value).toLocaleString() : 'N/A';

export const strRoundTwo = (value) => value !== null ? `${Number(value).toFixed(2)}` : 'N/A';
export const round1d = (value) => value !== null ? Math.round(Number(value) * 10) / 10 : value;
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

  

// Helper to get a single string of indicator IDs for all indicator groups
export const getAllIndicatorIdsString = (indicatorGroups) => 
  Object.values(indicatorGroups)
      .flatMap(Object.values)
      .join(';');

// Helper to get indicator IDs string for a specific indicator group
export const getGroupIndicatorIdsString = (indicatorGroup) => 
  Object.values(indicatorGroup).join(';');

// Downsample data to make it more manageable on smaller screens
export const downsampleData = (data) => {
  const maxPoints = window.innerWidth < 768 ? 15 : 30;

  if (data.length <= maxPoints) return data; // No need to downsample

  const [firstDate, lastDate] = [data[0], data[data.length - 1]];
  const middleDates = data.slice(1, -1);
  const step = Math.ceil(middleDates.length / (maxPoints - 2));

  // Collect downsampled data
  const downsampledMiddleDates = middleDates.filter((_, i) => i % step === 0);
  
  return [firstDate, ...downsampledMiddleDates, lastDate];
};

export const injectNumericDataForTab = (data, config) => {
config.forEach(({ id, data: sectionData }) => {
  const $sectionElements = $(`#${id} td[id]`);
  sectionData.forEach(({ id: key, format }, index) => {
    const value = data[key];
    let formattedValue;
    if (value === undefined) {
      $sectionElements.eq(index).text("N/A");
    } else {
      switch (format) {
        case "":
          formattedValue = value.toLocaleString();
          break;
        case "pctInt":
          formattedValue = pctInt(value);
          break;
        case "pct":
          formattedValue = value === 0 ? "0%" : formatPctRounded(value);
          break;
        case "pct1k":
          formattedValue = pctPerCap(value);
          break;
        case "usd":
          formattedValue = formatUsd(value);
          break;
        default:
          formattedValue = value;
      }
      $sectionElements.eq(index).text(formattedValue);
    }
  });
});
};

export const chartColours = {
  male: 'rgba(135, 206, 235, 0.5)',
  female: 'rgba(255, 192, 203, 0.5)',
  deaths: 'rgba(201, 203, 207, 0.5)',
  births: 'rgba(255, 217, 64, 0.2)'
};

