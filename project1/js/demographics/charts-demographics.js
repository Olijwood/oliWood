function destroyExistingChart(canvasId) {
    const canvas = $(`#${canvasId}`);
    if (canvas && canvas.chartInstance) {
        canvas.chartInstance.destroy();  // Destroy any existing chart instance
        canvas.chartInstance = null;     // Clear the reference to avoid memory leaks
    }
}

// function createLineChartWithKey(
//   canvasId, labels, data, title, borderColors = ['#3e95cd'], isFilled = false, isPercentage = false, 
//   isMultiDataset = false, legendLabels = null, applyCustomTickFormat = true) {

//   const ctx = document.getElementById(canvasId).getContext('2d');
//   const canvas = document.getElementById(canvasId);
//   const spinnerId = `spinner-${canvasId}`;

//   // Show the spinner and hide the canvas
//   $(`#${spinnerId}`).show();
//   $(canvas).hide();

//   // Destroy any existing chart before creating a new one
//   destroyExistingChart(canvasId);
  
//   // Handling multiple datasets and legend labels
//   const datasets = Array.isArray(data) && Array.isArray(data[0]) ? 
//     data.map((d, i) => ({
//       label: legendLabels && legendLabels[i] ? legendLabels[i] : `Dataset ${i + 1}`,
//       data: d,
//       borderColor: borderColors[i] || '#3e95cd',
//     pointBackgroundColor: borderColors[i] || '#3e95cd', 
//       fill: isFilled ? 'start' : false,
//       tension: 0.4
//     })) : 
//     [{
//       label: legendLabels && legendLabels[0] ? legendLabels[0] : title,
//       data: data,
//       borderColor: borderColors[0],
//       backgroundColor: borderColors[0] || '#3e95cd',
//       pointBackgroundColor: borderColors[0] || '#3e95cd', 
//       fill: isFilled ? 'start' : false,
//       tension: 0.4
//     }];

//   const newChart = new Chart(ctx, {
//       type: 'line',
//       data: {
//           labels: labels[0], // asumming all datasets have the same labels (dates)
//           datasets
//       },
//       options: {
//           responsive: true,
//           maintainAspectRatio: true,
//           scales: {
//               x: {
//                   font: {
//                       size: 8
//                   }
//               },
//               y: {
               
//                   // Custom y-axis tick callback to display large numbers with K, M, B, or T suffixes
//                   // and to display percentages with a % sign
//                   ticks: {
//                     callback: (value) => {
//                       if (!applyCustomTickFormat) {
//                         return value;  // Return the value without formatting
//                       }  
//                       // Array of suffixes for large numbers
//                       const units = ['', 'K', 'M', 'B', 'T'];
//                       let i = 0;
//                       // Loop until the value is less than 1000 or we've reached the last suffix
//                       while (value >= 1000 && i < units.length) {
//                         // Divide the value by 1000 and increment the suffix index
//                         value /= 1000;
//                         ++i;
//                         if (value >= 100 && i === 3) {
//                           // If the value is greater than or equal to 100B, display as X.XT
//                           value /= 1000;
//                           return `${value.toFixed(1)}T`;
//                         }
//                       }
//                       // Return the value with the appropriate suffix and/or percentage sign
//                       return isPercentage ? `${value}%` : `${value.toFixed(0)}${units[i]}`;
//                     }
//                   }
//               }
//           },
//           plugins: {
//               title: {
//                   display: false,
//                   text: title,  
//                   font: {
//                       size: 18,
//                       weight: 'bold'
//                   },
//                   padding: {
//                       top: 10,
//                       bottom: 10
//                   }
//               },
//               legend: {
//                   display: isMultiDataset,
//                   position: 'top',
//                   padding: 5,
//                   labels: {
//                       boxWidth: 8,
//                       font: {
//                           size: 12,
//                           weight: 'bold'
//                       },
//                       usePointStyle: true,
//                       pointStyle: 'circle'
//                   }
//               },
//               tooltip: {
//                   callbacks: {
//                       label: (tooltipItem) => isPercentage ? `${tooltipItem.formattedValue}%` : tooltipItem.formattedValue
//                   }
//               },
//               hover: {
//                   mode: 'nearest',
//                   intersect: true
//               }
//           },
//           elements: {
//               point: {
//                   radius: 3,
//                   hoverRadius: 6
//               }
//           }
//       }
//   });

//   // Store the chart instance on the canvas element for future cleanup
//   $(`#${canvasId}`).chartInstance = newChart;
//   // Hide the spinner and show the canvas
//   $(canvas).show();
//   $(`#${spinnerId}`).hide();
// }


// Function to create stacked horizontal bar charts
function createStackedHorizontalBarChart(canvasId, datasets, chartTitle) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Destroy any existing chart before creating a new one
    destroyExistingChart(canvasId);

    // Create a new chart
    const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [''],  // Empty label to avoid label overflow
            datasets: datasets  // Dynamic datasets passed for gender, rural/urban, etc.
        },
        options: {
            indexAxis: 'y',  // Horizontal bars
            responsive: true,
            maintainAspectRatio: false, // Allow control over the chart's height via CSS
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,  // Since this is percentage based
                    stacked: true,  // Stack the bars
                    ticks: {
                        display: false  // Hide the x-axis ticks
                    },
                    grid: {
                        display: false  // Disable grid lines for a cleaner look
                    },
                    border: {
                        display: false  // Ensure axis border line is also removed
                    }
                },
                y: {
                    stacked: true,
                    display: false  // Hide y-axis labels for better visuals
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,  // Chart title passed as a parameter
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 0
                    }
                },
                datalabels: {
                    display: true,
                    color: 'black',
                    anchor: 'center',
                    align: 'center',
                    formatter: (value) => `${value}%`, // Show percentage on the bar
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',  // Move the legend below the chart
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 12,
                            weight: 'bold'  // Bold font for the legend labels
                        },
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
                    borderWidth: 0 // Ensure there's no border adding unnecessary space
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    // Store the chart instance on the canvas element for future cleanup
    $(`#${canvasId}`).chartInstance = newChart;
}
