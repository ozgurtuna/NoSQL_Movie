document.getElementById('loadData').addEventListener('click', function() {
    fetch('/yarrr')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('movieTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear existing data

            data.forEach(row => {
                const newRow = tableBody.insertRow();
                const cellTitle = newRow.insertCell();
                cellTitle.appendChild(document.createTextNode(row._id.title));
                const cellGenre = newRow.insertCell();
                cellGenre.appendChild(document.createTextNode(row._id.genre));
                const cellReleaseDate = newRow.insertCell();
                cellReleaseDate.appendChild(document.createTextNode(row._id.year));
                const cellAverageRating = newRow.insertCell();
                cellAverageRating.appendChild(document.createTextNode(row.averageRating));
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

function displayReport(report) {
    const reportContainer = document.getElementById('reportContainer');
    reportContainer.innerHTML = ''; // Clear existing content

    for (const year in report) {
        const yearReport = report[year];
        const yearDiv = document.createElement('div');
        yearDiv.innerHTML = `<h3>Year: ${year}</h3>
                             <p>Most Popular Genre: ${yearReport['Most Popular Genre']}</p>
                             <p>Movies Produced: ${yearReport['Movies Produced']}</p>`;
        reportContainer.appendChild(yearDiv);
    }
}

document.getElementById('loadReport').addEventListener('click', function() {
    fetch('/report')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('genreReportTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear existing data

            for (const year in data) {
                const reportRow = data[year];
                const newRow = tableBody.insertRow();
                
                const cellYear = newRow.insertCell();
                cellYear.appendChild(document.createTextNode(year));

                const cellGenre = newRow.insertCell();
                cellGenre.appendChild(document.createTextNode(reportRow['Most Popular Genre']));

                const cellMoviesProduced = newRow.insertCell();
                cellMoviesProduced.appendChild(document.createTextNode(reportRow['Movies Produced']));

                }
        })
        .catch(error => {
            console.error('Error fetching report:', error);
            alert('Failed to load report.');
        });
});

// Function to display the Movie Genre Report chart
function displayGenrePopularityChart(data) {
    const ctx = document.getElementById('genrePopularityChart').getContext('2d');
    const chartLabels = Object.keys(data);
    const chartMoviesProduced = chartLabels.map(year => data[year]['Movies Produced']);
    const chartGenres = chartLabels.map(year => data[year]['Most Popular Genre']);
    const chartAverageRatings = chartLabels.map(year => data[year]['Average Rating']); // Assuming 'Average Rating' exists

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Number of Movies Produced',
                data: chartMoviesProduced,
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1,
                yAxisID: 'y-movies'
            },
            {
                label: 'Average Rating',
                data: chartAverageRatings,
                type: 'line', // Displaying ratings as a line chart
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 2,
                yAxisID: 'y-rating'
            }]
        },
        options: {
            scales: {
                'y-movies': {
                    beginAtZero: true,
                    position: 'left',
                },
                'y-rating': {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false, // Ensures that the rating axis grid doesn't overlap with the primary axis
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y;
                            if (context.datasetIndex === 0) { // For the movies produced dataset
                                label += ' - ' + chartGenres[context.dataIndex];
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    document.getElementById('genrePopularityChart').style.display = 'block'; // Show the chart
}


document.getElementById('showGenrePopularityChart').addEventListener('click', function() {
    fetch('/report')
        .then(response => response.json())
        .then(data => {
            displayGenrePopularityChart(data); // Call function to display the chart
        })
        .catch(error => {
            console.error('Error fetching report:', error);
            alert('Failed to load genre popularity chart.');
        });
});



function displayBoxOfficeChart(data) {
    const ctx = document.getElementById('boxOfficeChart').getContext('2d');
    const labels = data.map(item => `${monthNames[item._id.month - 1]} - ${item._id.genre}`); // Label for each genre and month
    const averageRevenue = data.map(item => item.averageRevenue);
    const averageRating = data.map(item => item.averageRating);
    const movieCount = data.map(item => item.count);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Revenue',
                data: averageRevenue,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                yAxisID: 'y-revenue'
            }, {
                label: 'Average Rating',
                data: averageRating,
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                yAxisID: 'y-rating'
            }, {
                label: 'Number of Movies',
                data: movieCount,
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
                yAxisID: 'y-movieCount'
            }]
        },
        options: {
            scales: {
                'y-revenue': {
                    beginAtZero: true,
                    position: 'left',
                },
                'y-rating': {
                    beginAtZero: true,
                    position: 'right'
                },
                'y-movieCount': {
                    beginAtZero: true,
                    position: 'right'
                }
            }
        }
    });

    document.getElementById('boxOfficeChart').style.display = 'block'; // Show the chart
}

// Event listener for the 'Show Box Office Chart' button
document.getElementById('showBoxOfficeChart').addEventListener('click', function() {
    fetch('/box-office-analysis')
        .then(response => response.json())
        .then(data => {
            displayBoxOfficeChart(data); // Call function to display the chart
        })
        .catch(error => {
            console.error('Error fetching box office analysis:', error);
            alert('Failed to load box office chart.');
        });
});



// Function to display the genre-budget analysis
function displayGenreBudgetAnalysis(data) {
    const analysisContainer = document.getElementById('analysisContainer');
    analysisContainer.innerHTML = ''; // Clear existing content

    data.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `<h3>Genre: ${item._id}</h3>
                         <p>Average Budget: ${item.averageBudget.toFixed(2)}</p>
                         <p>Average Rating: ${item.averageRating.toFixed(2)}</p>
                         <p>Number of Movies: ${item.count}</p>`;
        analysisContainer.appendChild(div);
    });
}

// Event listener for the 'Load Genre-Budget Analysis' button
document.getElementById('loadGenreBudgetAnalysis').addEventListener('click', function() {
    fetch('/genre-budget-analysis')
        .then(response => response.json())
        .then(data => {
            displayGenreBudgetAnalysis(data); // Call function to display the analysis
        })
        .catch(error => {
            console.error('Error fetching genre-budget analysis:', error);
            alert('Failed to load genre-budget analysis.');
        });
});



function displayGenreBudgetChart(data) {
    const ctx = document.getElementById('genreBudgetChart').getContext('2d');
    const genres = data.map(item => item._id); // Array of genres
    const averageBudgets = data.map(item => item.averageBudget); // Array of average budgets for each genre
    const averageRatings = data.map(item => item.averageRating); // Array of average ratings for each genre

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: genres,
            datasets: [{
                label: 'Average Budget',
                data: averageBudgets,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y-budget'
            },
            {
                label: 'Average Rating',
                data: averageRatings,
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                yAxisID: 'y-rating'
            }]
        },
        options: {
            scales: {
                'y-budget': {
                    beginAtZero: true,
                    position: 'left',
                },
                'y-rating': {
                    beginAtZero: true,
                    position: 'right'
                }
            }
        }
    });

    document.getElementById('genreBudgetChart').style.display = 'block'; // Show the chart
}

// Event listener for the 'Show Genre-Budget Chart' button
document.getElementById('showGenreBudgetChart').addEventListener('click', function() {
    fetch('/genre-budget-analysis')
        .then(response => response.json())
        .then(data => {
            displayGenreBudgetChart(data); // Call function to display the chart
        })
        .catch(error => {
            console.error('Error fetching genre-budget analysis:', error);
            alert('Failed to load genre-budget chart.');
        });
});

function displayBoxOfficeAnalysis(data) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    const analysisContainer = document.getElementById('boxOfficeAnalysisContainer');
    analysisContainer.innerHTML = ''; // Clear existing content

    let monthlyData = {};

    // Aggregate data by month
    data.forEach(item => {
        const month = item._id.month;
        if (!monthlyData[month]) {
            monthlyData[month] = {
                totalRevenue: 0,
                totalRating: 0,
                movieCount: 0,
                numberOfGenres: 0
            };
        }
        monthlyData[month].totalRevenue += item.averageRevenue * item.count;
        monthlyData[month].totalRating += item.averageRating * item.count;
        monthlyData[month].movieCount += item.count;
        monthlyData[month].numberOfGenres += 1;
    });

    // Calculate average and create display elements
    Object.keys(monthlyData).forEach(month => {
        const monthData = monthlyData[month];
        const averageRevenue = monthData.totalRevenue / monthData.movieCount;
        const averageRating = monthData.totalRating / monthData.movieCount;

        const monthName = monthNames[month - 1]; // Convert month number to month name
        const div = document.createElement('div');
        div.innerHTML = `<h3>Month: ${monthName}</h3>
                         <p>Average Revenue: ${averageRevenue.toFixed(2)}</p>
                         <p>Average Rating: ${averageRating.toFixed(2)}</p>
                         <p>Number of Movies: ${monthData.movieCount}</p>
                         <p>Genres Considered: ${monthData.numberOfGenres}</p>`;
        analysisContainer.appendChild(div);
    });
}


// Event listener for the 'Load Box Office Analysis' button
document.getElementById('loadBoxOfficeAnalysis').addEventListener('click', function() {
    fetch('/box-office-analysis')
        .then(response => response.json())
        .then(data => {
            displayBoxOfficeAnalysis(data); // Call function to display the analysis
        })
        .catch(error => {
            console.error('Error fetching box office analysis:', error);
            alert('Failed to load box office analysis.');
        });
});

function displayBoxOfficeChart(data) {
    const ctx = document.getElementById('boxOfficeChart').getContext('2d');
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    let monthlyData = {};
    data.forEach(item => {
        const month = item._id.month;
        if (!monthlyData[month]) {
            monthlyData[month] = {
                totalRevenue: 0,
                totalRating: 0,
                movieCount: 0
            };
        }
        monthlyData[month].totalRevenue += item.averageRevenue * item.count;
        monthlyData[month].totalRating += item.averageRating * item.count;
        monthlyData[month].movieCount += item.count;
    });

    const labels = Object.keys(monthlyData).map(month => monthNames[month - 1]);
    const averageRating = Object.values(monthlyData).map(item => (item.totalRating / item.movieCount).toFixed(2));
    const averageRevenue = Object.values(monthlyData).map(item => (item.totalRevenue / item.movieCount).toFixed(2));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Rating',
                data: averageRating,
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Avg Rating: ${context.parsed.y}, Avg Revenue: $${averageRevenue[context.dataIndex]}`;
                        }
                    }
                }
            }
        }
    });

    document.getElementById('boxOfficeChart').style.display = 'block'; // Show the chart
}



