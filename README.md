# Remixjobs

> Unofficial Remixjobs API
This is the first unofficial API for remixjobs, an online web engine to look for 
jobs in the IT departement

## Usage
### Start
To start using the API, you need to lauch server.js with the npm command (given that npm
is already installed on your computer): node server.js.
Then you must launch MongoDB (mongod.exe and mongo.exe).
Finally you launch postman in order to view the response to the further requests.

###Routes
Several routes are present:
###/api/jobs
 get->retieve all the jobs
###/api/jobs/:jobid
 get->retrive the specific job
 put->updates the specific job
 delete->deletes the specific job
###/api/comapnies/:company
  get->retrieves all the jobs available for a company
###/api/contracts/:contract
  get->retrives all the jobs with the same contract as the one specified
###/api/locations/:joblocation
  get->retrives all the jobs with a the same localisation as the one specified

## Licence

[Uncopyrighted](http://zenhabits.net/uncopyright/)
