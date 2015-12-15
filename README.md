# RemixJobs_API

> Our (un)official Remixjobs API

## Get Started

Our API allows you to add/search/update/delete jobs from your web application to our database.

The initial dataSet is taken from RemixJobs.com and is quite exhaustive in terms of available fields.

Here is the basic "infos" object returned with the results of every request.

"infos": {
    "version": "1.0",
    "countResults": 123,
    "limitResults": 10,
	"fields":["_id","jobId","title","company","localization","category","description","contract","date","salary","lat","lng","tags"]
}, 
"results" : [...]

The version, the count of the results and the maximum number of results returned are given in "infos".

When you run the app.js you can pass in first parameter the port you wan to use (default is 3000) and/or in first/additional parameter if you want to "drop"/"load" the table. If you pass "drop", "load" is optional because the table will automatically be reloaded.
Example : "node app.js 8080 drop" will drop and reload the table, then the API will listen on port 8080.

## Usage

### /home

Whenever you use a malformed path or an endpoint which is not available, you will be automatically redirected to the endpoint "home".
Example : http://localhost:3000/api/v1.0/home
Moreover, you will get a dynamic presentation message that introduces the API.
Example : WELCOME TO REMIXJOBS API ! Please use the route api/v1.0/ and one of the available endpoints : home,jobs,latest,today,distinct.

### /jobs

Is the main endpoint of the API. Here are all the jobs. You can access them precisely with query parameters.

Example : GET http://localhost:3000/api/v1.0/jobs will return all the jobs.
Example : GET http://localhost:3000/api/v1.0/jobs?localization=Paris&tags=php will return all the jobs corresponding to the request parameters.

You can also POST, PUT, DELETE passing parameters in the URL and the JSON object in the body of the request.

### /today

Returns all the jobs uploaded the same day of the request.

Example : GET http://localhost:3000/api/v1.0/today

### /latest

Returns the very latest jobs (very last time of addition)

Example : GET http://localhost:3000/api/v1.0/jobs

### /distinct

Here you can check the distinct elements of every attributes.

Example : http://localhost:3000/api/v1.0/distinct?attribute=category 
Example : http://localhost:3000/api/v1.0/distinct?attribute=localization 

### Logs

During all the lifecycle of the server, your console logs precisely what occurs in the database and all the requests.

Example :
Debugger listening on port 5858
API running on port 3000
Connected to MongoDB server
936 jobs are currently stored.
GET /
GET /api/v1.0/home
GET /api/v1.0/today
GET /api/v1.0/latest
POST /api/v1.0/jobs
PUT /api/v1.0/jobs?company=ESILV
DELETE /api/v1.0/jobs?localization=La%20D%C3%A9fense
GET /api/v1.0/jobs?localization=Paris&tags=php

## Conclusion

Enjoy our API !

Thank You !