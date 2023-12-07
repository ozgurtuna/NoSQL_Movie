const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const app = express();
const port = 3000;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


let database;
client.connect()
    .then(() => {
        database = client.db("Demo");
        console.log("Connected to MongoDB");
        app.listen(port, () => console.log(`Server running on port ${port}`));
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });

app.use(express.static(path.join(__dirname, 'public')));


//MOVIE-GENRE POPULARITY//

app.get('/yarrr', async (req, res) => {
    if (!database) {
        console.log("Database not connected");
        return res.status(500).send("Database not connected");
    }

    try {
        const movies = database.collection("MoviesDB");
        const currentYear = new Date().getFullYear();
        const threeDecadesAgo = currentYear - 30;

        let query = [
            {
                $match: {
                    release_date: { $gte: new Date(threeDecadesAgo, 0, 1) }
                    
                }
            },
            {
                $project: {
                    year: { $year: "$release_date" },
                    genres: { $split: ["$genres", ", "] }, // Split genres into an array
                    vote_average: 1,
                    title: 1,
                    release_date: 1
                }
            },
            { $unwind: "$genres" }, // Unwind genres array
            {
                $group: {
                    _id: { year: "$year", genre: "$genres" },
                    averageRating: { $avg: "$vote_average" },
                    movieCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.genre": 1 } }
        ];

        const result = await movies.aggregate(query).toArray();
        console.log('Query executed successfully. Number of results:', result.length);
        res.json(result);
    } catch (e) {
        console.error("Error during query execution:", e);
        res.status(500).send("Error retrieving data");
    }
});


//MOVIE-GENRE REPORT//

app.get('/report', async (req, res) => {
    if (!database) {
        return res.status(500).send("Database not connected");
    }

    try {
        const movies = database.collection("MoviesDB");
        const currentYear = new Date().getFullYear();
        const threeDecadesAgo = currentYear - 30;
        const queryResult = await movies.aggregate([
            {
                $match: {
                    release_date: { $gte: new Date(threeDecadesAgo, 0, 1) } // Filters movies released in the last three decades
                }
            },
            {
                $project: {
                    year: { $year: "$release_date" }, // Extracts the year from the release date
                    genres: { $split: ["$genres", ", "] }, // Splits the genres field into an array
                    vote_average: 1, // Keeps the vote_average field
                    title: 1, // Includes the title field
                    release_date: 1 // Includes the release date field
                }
            },
            { $unwind: "$genres" },
            {
                $group: {
                    _id: { year: "$year", genre: "$genres" },
                    averageRating: { $avg: "$vote_average" },
                    movieCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.genre": 1 } }
        ]).toArray();
        

        let reportData = organizeData(queryResult);
        let summary = analyzeTrends(reportData);

        res.json(summary);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error generating report");
    }
});


function organizeData(queryResult) {
    let data = {};
    queryResult.forEach(item => {
        const year = item._id.year;
        const genre = item._id.genre;
        if (!data[year]) {
            data[year] = {};
        }
        data[year][genre] = {
            averageRating: item.averageRating,
            movieCount: item.movieCount
        };
    });
    return data;
}


function analyzeTrends(data) {
    let summary = {};
    for (let year in data) {
        let maxMovies = 0;
        let mostPopularGenre = '';
        for (let genre in data[year]) {
            if (data[year][genre].movieCount > maxMovies) {
                maxMovies = data[year][genre].movieCount;
                mostPopularGenre = genre;
            }
        }
        summary[year] = {
            'Most Popular Genre': mostPopularGenre,
            'Movies Produced': maxMovies
        };
    }
    return summary;
}


//GENRE-BUDGET ANALYSIS//

app.get('/genre-budget-analysis', async (req, res) => {
    if (!database) {
        console.log("Database not connected");
        return res.status(500).send("Database not connected");
    }

    try {
        const movies = database.collection("MoviesDB");

        const query = [
            {
                $match: {
                    budget: { $gt: 0 }, // Consider movies with a defined budget
                    vote_average: { $gt: 0 } // Consider movies with a rating
                }
            },
            {
                $project: {
                    genre: { $split: ["$genres", ", "] }, // Split genres into an array
                    budget: 1,
                    vote_average: 1
                }
            },
            { $unwind: "$genre" }, // Separate each genre
            {
                $group: {
                    _id: "$genre",
                    averageBudget: { $avg: "$budget" },
                    averageRating: { $avg: "$vote_average" },
                    count: { $sum: 1 } // Count of movies per genre
                }
            },
            { $sort: { "_id": 1 } } // Sorting by genre name
        ];

        const result = await movies.aggregate(query).toArray();
        console.log('Genre-Budget Analysis executed successfully. Number of results:', result.length);
        res.json(result);
    } catch (e) {
        console.error("Error during query execution:", e);
        res.status(500).send("Error retrieving data");
    }
});


//BOX OFFICE ANALYSIS//

app.get('/box-office-analysis', async (req, res) => {
    if (!database) {
        console.log("Database not connected");
        return res.status(500).send("Database not connected");
    }

    try {
        const movies = database.collection("MoviesDB");

        const query = [
            {
                $match: {
                    revenue: { $gt: 0 }, // Consider movies with recorded revenue
                    vote_average: { $gt: 0 }, // Consider movies with a rating
                    release_date: { $exists: true } // Ensure release date exists
                }
            },
            {
                $project: {
                    month: { $month: "$release_date" }, // Extract the month from the release date
                    genre: { $split: ["$genres", ", "] }, // Split genres into an array
                    vote_average: 1,
                    revenue: 1
                }
            },
            { $unwind: "$genre" }, // Separate each genre
            {
                $group: {
                    _id: { month: "$month", genre: "$genre" },
                    averageRevenue: { $avg: "$revenue" },
                    averageRating: { $avg: "$vote_average" },
                    count: { $sum: 1 } // Count of movies per genre per month
                }
            },
            { $sort: { "_id.month": 1, "_id.genre": 1 } } // Sorting by month and then by genre
        ];

        const result = await movies.aggregate(query).toArray();
        console.log('Box Office Analysis executed successfully. Number of results:', result.length);
        res.json(result);
    } catch (e) {
        console.error("Error during query execution:", e);
        res.status(500).send("Error retrieving data");
    }
});




