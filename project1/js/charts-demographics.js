// Function to create stacked horizontal bar charts
function createStackedHorizontalBarChart(canvasId, datasets, chartTitle) {
    const ctx = $(`#${canvasId}`)[0].getContext('2d'); // Use jQuery to select the canvas
    new Chart(ctx, {
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
                        // padding: 0,
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
                        // top: 10,
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
                    },
                    
                }
            },
            layout: {
                // autoPadding: false,
                padding: {
                    top: 5,    // Padding above the chart (below the title)
                    bottom: 5, // Padding below the chart (above the legend// Adjust margin between the bars and the legend
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
}

// Function to create line charts (for historical data)
function createLineChart(canvasId, labels, data, labelText, borderColor = '#3e95cd') {
new Chart(document.getElementById(canvasId), {
    type: 'line',
    data: {
    labels: labels,
    datasets: [{
        label: labelText,
        data: data,
        borderColor: borderColor,
        fill: false
    }]
    },
    options: {
    scales: {
        x: {
        beginAtZero: true,
        scaleLabel: {
            display: true,
            labelString: 'Year'
        }
        },
        y: {
        beginAtZero: true,
        scaleLabel: {
            display: true,
            labelString: labelText
        },
        ticks: {
            callback: function(value) {
            return value.toLocaleString();
            }
        }
        }
    }
    }
});
}
