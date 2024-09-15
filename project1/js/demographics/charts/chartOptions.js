export const defaultStackedHorizontalBarChartOptions = {
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
          padding: { y: 2 }
      },
      datalabels: {
          display: true,
          color: 'black',
          anchor: 'center',
          align: 'center',
          formatter: (value) => `${value}%`,  // Show percentage on the bar
          font: { size: 12, weight: 'bold' }
      },
      legend: {
          display: true,
          position: 'right' ,
          align: 'center',  // Move the legend below the chart
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
          top: 2,    // Padding above the chart (below the title)
          bottom: 0, // Padding below the chart (above the legend)
          left: 5,   // Padding to the left of the chart
      }
  },
  elements: {
      bar: {
          borderWidth: 0,  // No borders to avoid adding unnecessary space,
          barThickness: 5
      }
  },
};
// Default chart options for stacked horizontal bar charts
export const defaultHorizontalBarChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
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
          display: true,
          font: { size: 14, weight: 'bold' },
          padding: { y: 0 }
      },
      datalabels: {
        display: true,
        color: 'black',
        anchor: 'end',
        align: 'right',
        font: { size: 10, weight: 'bold' },
        formatter: (value, context) => `${context.dataset.label}: ${value}%`},
      legend: {
          display: false,
      }
  },
  layout: {
      padding: {
          top: 0,    
          bottom: 0, 
      }
  },
  elements: {
      bar: {
          borderWidth: 0,  // No borders to avoid adding unnecessary space,
          barThickness: 5
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
