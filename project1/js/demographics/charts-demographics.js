function destroyExistingChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas && canvas.chartInstance) {
        canvas.chartInstance.destroy();  // Destroy any existing chart instance
        canvas.chartInstance = null;     // Clear the reference to avoid memory leaks
    }
}


function createLineChartWithKey(canvasId, labels, data, labelText, borderColor = '#3e95cd', minVal, maxVal) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    // const existingChart = ctx.chartInstance;
    // log params
    console.log("id", canvasId);
    console.log("labels", labels);
    console.log("data", data);
    console.log("labelText", labelText);
    console.log("borderColor", borderColor);
    // if (existingChart) {
    //     existingChart.destroy();
    // }

    destroyExistingChart(canvasId);
    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: labelText,
                data,
                borderColor,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            elements: {
                point: {
                    radius: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: minVal,
                    max: maxVal,
                    ticks: {
                        callback: (value) => value >= 1000000 ? (value / 1000000).toFixed(0) + 'M' : value.toLocaleString()
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: labelText,
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });

    ctx.chartInstance = newChart;
}

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
    document.getElementById(canvasId).chartInstance = newChart;
}
