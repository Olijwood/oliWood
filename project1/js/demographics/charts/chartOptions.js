
// Default chart options for stacked horizontal bar charts
export const defaultHorizontalBarChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales: {
      x: {
          beginAtZero: true,
          max: 100,  // Percentage-based data
          stacked: true,
          ticks: { display: false },
          grid: { display: false },
          border: { display: false }
      },
      y: { stacked: true, display: false }
  },
  plugins: {
      title: {
          display: true,
          font: { size: 14, weight: 'bold' },
          padding: { bottom: 0 }
      },
      datalabels: {
          display: true,
          color: 'black',
          anchor: 'center',
          align: 'center',
          formatter: (value) => `${value}%`,  // Show percentage on the bar
          font: { size: 14, weight: 'bold' }
      },
      legend: {
          display: true,
          position: 'bottom',  // Move the legend below the chart
          labels: {
              boxWidth: 12,
              padding: 10,
              font: { size: 12, weight: 'bold' },  // Bold font for the legend labels
              usePointStyle: true  // Use small circles for legend
          }
      }
  },
  layout: {
      padding: {
          top: 5,    // Padding above the chart (below the title)
          bottom: 5, // Padding below the chart (above the legend)
      }
  },
  elements: {
      bar: {
          borderWidth: 0  // No borders to avoid adding unnecessary space
      }
  }
};
  
export const defaultLineChartOptions2 = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      font: { size: 8 }
    },
    y: {
      ticks: {
        callback: (value, index, ticks) => {
          // Use custom formatting logic for large numbers
          const units = ['', 'K', 'M', 'B', 'T'];
          let i = 0;
          while (value >= 1000 && i < units.length) {
            value /= 1000;
            i++;
          }
          return `${value.toFixed(0)}${units[i]}`;
        }
      }
    }
  },
  plugins: {
    title: {
      display: false,
    },
    legend: {
      display: true,
      position: 'top',
      padding: 5,
      labels: {
        boxWidth: 8,
        font: { size: 12, weight: 'bold' },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      callbacks: {
        label: (tooltipItem) => `${tooltipItem.formattedValue}` // Format tooltip labels
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  },
  elements: {
    point: {
      radius: 3,
      hoverRadius: 6
    }
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
