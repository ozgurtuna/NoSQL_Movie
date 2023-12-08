let reportData = {};
let click = 0;

document.getElementById('loadData').addEventListener('click', function() {
    fetch('/yarrr')
        .then(response => response.json())
        .then(data => {
            document.getElementById('movieTable').classList.remove('hidden');

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
            reportData = data;
            document.getElementById('genreReportTable').classList.remove('hidden');

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

//GENRE BUTTON//
function displayGenrePopularityChart(data) {
    const ctx = document.getElementById('genrePopularityChart').getContext('2d');
    const chartLabels = Object.keys(data);
    const chartMoviesProduced = chartLabels.map(year => data[year]['Movies Produced']);
    const chartGenres = chartLabels.map(year => data[year]['Most Popular Genre']);
    console.log(chartLabels.map(year => data[year]['Average Rating']).toString());
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

function analyzeGenrePopularity(data) {
    let genrePopularityCount = {};
    for (const year in data) {

        const mostPopularGenre = data[year]['Most Popular Genre'];
        if (!genrePopularityCount[mostPopularGenre]) {
            genrePopularityCount[mostPopularGenre] = 0;
        }
        genrePopularityCount[mostPopularGenre]++;
    }

    displayGenrePopularityResults(genrePopularityCount);
}

function displayGenrePopularityResults(data) {
    document.getElementById('genrePopularityCountTable').classList.remove('hidden');
    const tableBody = document.getElementById('genrePopularityCountTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing data

    for (const genre in data) {
        const newRow = tableBody.insertRow();
        const cellGenre = newRow.insertCell();
        cellGenre.appendChild(document.createTextNode(genre));

        const cellCount = newRow.insertCell();
        cellCount.appendChild(document.createTextNode(data[genre]));

    }
}

document.getElementById('analyzeGenrePopularity').addEventListener('click', function() {
    fetch('/report')
        .then(response => response.json())
        .then(data => {
            analyzeGenrePopularity(data); // Call function to analyze and display the genre popularity
        })
        .catch(error => {
            console.error('Error fetching report:', error);
            alert('Failed to analyze genre popularity.');
        });
});

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

document.getElementById('budgetRatingComparison').addEventListener('click', function() {
    fetch('/genre-budget-analysis') // Assuming the endpoint returns the required data
        .then(response => response.json())
        .then(data => {
            displayBudgetRatingComparison(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to perform budget-rating comparison.');
        });
});

function displayBudgetRatingComparison(data) {
    // Filter genres with an average budget greater than 100 million
    const highBudgetGenres = data.filter(item => item.averageBudget > 100000000);

    // Calculate the average rating for high-budget genres
    const totalRatingHighBudget = highBudgetGenres.reduce((acc, item) => acc + item.averageRating, 0);
    const averageRatingHighBudget = highBudgetGenres.length > 0 ? (totalRatingHighBudget / highBudgetGenres.length).toFixed(2) : 'No data';

    // Calculate the average rating for all genres
    const totalRatingAll = data.reduce((acc, item) => acc + item.averageRating, 0);
    const averageRatingAll = data.length > 0 ? (totalRatingAll / data.length).toFixed(2) : 'No data';

    // Display the results
    const resultContainer = document.getElementById('budgetRatingResult');
    resultContainer.innerHTML = `<p>Average Rating for All Genres: ${averageRatingAll}</p>
                                 <p>Average Rating for Genres with Average Budget > $100M: ${averageRatingHighBudget}</p>
                                 <p>It is determined that high budget doesnt translate into high rating.</p>`;
}



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


//BOX OFFICE//
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

document.getElementById('showBoxOfficeSummary').addEventListener('click', function() {
    fetch('/box-office-analysis')
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            alert('Please load the box office data first.');
            return;
        }
        document.getElementById('boxOfficeRevenueSummaryTable').classList.remove('hidden');
        showBoxOfficeSummary(data);
    }).catch(error => {
        console.error('Error fetching report:', error);
        alert('Failed to yarrrw.');
    });
   
});

function showBoxOfficeSummary(data) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    let monthlySummary = {};
    data.forEach(item => {
        const month = item._id.month;
        if (!monthlySummary[month]) {
            monthlySummary[month] = {
                totalRevenue: 0,
                movieCount: 0
            };
        }
        monthlySummary[month].totalRevenue += item.averageRevenue * item.count;
        monthlySummary[month].movieCount += item.count;
    });

    // Convert to an array for sorting
    const monthlyDataArray = Object.keys(monthlySummary).map(month => {
        return {
            month: month,
            averageRevenue: monthlySummary[month].totalRevenue / monthlySummary[month].movieCount
        };
    });

    // Sort by average revenue
    monthlyDataArray.sort((a, b) => b.averageRevenue - a.averageRevenue);

    const summaryTableBody = document.getElementById('boxOfficeRevenueSummaryTable').getElementsByTagName('tbody')[0];
    summaryTableBody.innerHTML = ''; // Clear existing content

    monthlyDataArray.forEach(item => {
        const row = summaryTableBody.insertRow();
        const cellMonth = row.insertCell();
        cellMonth.appendChild(document.createTextNode(monthNames[item.month - 1]));
        const cellAverageRevenue = row.insertCell();
        cellAverageRevenue.appendChild(document.createTextNode(item.averageRevenue.toFixed(2)));
    });
}

