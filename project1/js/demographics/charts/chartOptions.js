export const defaultStackedHorizontalBarChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  datasets: {
    bar: {
      maxBarThickness: 50,
      borderRadius: 5,
      borderSkipped: 'middle',
      backgroundColor (context) {
        const index = context.dataIndex;
        return index % 2 === 0 ? '#f8fafc' : '#e2e8f0';
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      stacked: true,
      ticks: { display: false },
      grid: { display: false },
      border: { display: false }
    },
    y: { stacked: true, display: false }
  },
  plugins: {
    datalabels: {
      display: true,
      color: 'black',
      anchor: 'center',
      align: 'center',
      formatter: (value) => `${value}%`,
      font: { size: 12, weight: 'bold' }
    },
    legend: {
        display: true,
        position: 'right',
        align: 'bottom',
        padding: 10,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: { size: 12, weight: 'bold', color: 'rgb(33, 37, 41)' },
          usePointStyle: true
        }
    }
  },
  layout: {
    autoPadding: false,
    padding: {
      top: 0,
      bottom: 0,
      left: 5
    }
  },
  elements: {
    bar: {
      borderWidth: 0
    }
  },
  tooltip: {
    backgroundColor: '#f7f7f7',
    color: 'black',
    bodyColor: 'black',
    borderColor: 'black',
    borderWidth: 0.5,
    position: 'average',
    bodyFont: { size: 12, weight: 'bold' },
    displayColors: false
  }
};
// Default chart options for stacked horizontal bar charts
export const defaultHorizontalBarChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  datasets: {
    bar: {
      barPercentage: 0.98,
      borderRadius: 5,
    }
  },
  scales: {
    x: {
      display: false,
      beginAtZero: true,
      stacked: false,
      ticks: { display: false },
      grid: { display: false },
      border: { display: false }
    },
    y: {
      stacked: false,
      display: false
    }
  },
  plugins: {
    title: {
      display: false,
      color: 'rgb(33, 37, 41)',
      font: { size: 14, weight: 'bold' },
      padding: { top: 5, bottom: 5}
    },
    datalabels: {
      display: true,
      color: 'rgb(33, 37, 41)',
      anchor: 'right',
      align: 'center',
      formatter: (value) => `${value}`,
      font: { size: 14, weight: 'bold', color: 'rgb(33, 37, 41)' },
    },
    legend: {
      display: true,
      position: 'right',
      align: 'bottom',
      padding: 10,
      labels: {
        boxWidth: 12,
        padding: 10,
        font: { size: 12, weight: 'bold', color: 'rgb(33, 37, 41)' },
        usePointStyle: true
      }
    }
  },
  layout: {
    autoPadding: false,
    padding: {
      top: 0,
      bottom: 0,
      left: 5
    }
  },
  tooltip: {
    backgroundColor: '#f7f7f7',
    color: 'black',
    bodyColor: 'black',
    borderColor: 'black',
    borderWidth: 0.5,
    position: 'average',
    bodyFont: { size: 12, weight: 'bold' },
    displayColors: false
  }
};
  


export const defaultLineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    x: {
      font: { size: 8 },
    },
    y: {
      ticks: {
        callback: (value, applyCustomTickFormat, isPercentage) => {
          if (!applyCustomTickFormat) return value;

          // Use units to format large numbers
          const units = ['', 'K', 'M', 'B', 'T'];
          let i = 0;
          while (value >= 1000 && i < units.length) {
            value /= 1000;
            i++;
            if (value >= 100 && i === 3) {
              // If the value is greater than or equal to 100B, display as X.XT
              value /= 1000;
              return `${value.toFixed(1)}T`;
            }
          }
          return isPercentage ? `${value}%` : `${value.toFixed(0)}${units[i]}`;
        }
      }
    }
  },
  plugins: {
    title: {
      display: false,
      font: { size: 18, weight: 'bold' },
      padding: { top: 10, bottom: 10 },
    },
    legend: {
      position: 'top',
      padding: 5,
      labels: {
        boxWidth: 8,
        font: {
          size: 12,
          weight: 'bold',
        },
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      callbacks: {
        label: (tooltipItem, isPercentage) => 
          isPercentage ? `${tooltipItem.formattedValue}%` : tooltipItem.formattedValue
      }
    }
  },
  elements: {
    point: {
      radius: 3,
      hoverRadius: 9,
    }
  }
};
