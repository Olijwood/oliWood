
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

export const mapRelPct = (data) => data.map(v => 100 - v);
