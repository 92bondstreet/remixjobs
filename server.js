//Calling the packages
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var Job     = require('./app/models/jobs');
var request=require('request');
var cheerio=require('cheerio');



//I've set 8080 as port because mongoose can't listen on the same port as app...
mongoose.connect('mongodb://localhost:27017/');


//Bodyparser configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Setting our port
var port = process.env.PORT || 2929

//Setting the router
var router = express.Router();


router.use(function(req, res, next) {

    console.log('Something is happening.');
    next();
});

router.get('/', function(req, res) {
    res.json({ message: 'Welcome to Remixjob\' first unofficial API!'});
});

//Return all jobs
router.get('/jobs',function(req,res){
  Job.find(function(err, jobs) {
			if (err)
				res.send(err);
			res.json(jobs);
		});
});

//Create a new job
router.post('/jobs', function(req, res) {
    var job=new Job();

    job.title=req.body.title;
    job.company=req.body.company;
    job.localisation=req.body.localisation;
    job.contract=req.body.contract;
    job.category=req.body.category;
    job.description=req.body.description;

    console.log(job);

    job.save(function(err) {
      if (err) {
       return console.error(err);
         }
        res.json({ title: job.title,
        company: job.company,
      localisation: job.localisation,
    contract: job.contract,
    category: job.category,
  description: job.description,
});
        return;
  });
});


//Return information of a job
router.get('/jobs/:jobid', function(req,res)
{

		if(req.params.jobid == "latest")
		{
			var query = Job.find({});
			query.sort({date : -1});
			query.limit(3);
			query.exec(function(err, job) {
				if (err)
					res.send(err);
				res.json(job);
			});
		}
		else {
			Job.findById(req.params.jobid, function(err, job) {
				if (err)
					res.send(err);
				res.json(job);
			});
		}
});



//Change an existing job
router.put('/jobs/:jobid',function(req,res)
{

  		Job.findById(req.params.jobid, function(err, job) {
  			if (err)
  			res.send(err);

  			job.title = req.body.title;
        job.localisation=req.body.localisation;

        job.save(function(err) {
  				if (err)
  					res.send(err);
  				res.json({ message: 'Job updated!' });
  			});
  		});
	});



//delete a job
router.delete('/jobs/:jobid',function(req,res)
{
  Job.remove({
  			_id: req.params.jobid
  		}, function(err, job) {
  			if (err)
  				res.send(err);
  			res.json({ message: 'Successfull deletion' });
  		});
});



//Get all the jobs given a company
router.get('/companies/:company',(function(req, res) {
				if(req.params.company)
				{
					var query = Job.find({});
					query.where("company" , req.params.company);
					query.exec(function(err, job) {
						if (err)
							res.send(err);
						res.json(job);
					});
				}
        else {
          res.send({message: 'No company was chosen'});
        }
}));


//Get all the jobs given a type of contract
router.get('/contracts/:contract',(function(req, res) {
				if(req.params.contract)
				{
					var query = Job.find({});
					query.where("contract" , req.params.contract);
					query.exec(function(err, job) {
						if (err)
							res.send(err);
						res.json(job);
					});
				}
        else {
          res.send({message: 'No type of contract was chosen!'});
        }
}));


//Get all the jobs given the location
router.get('/locations/:joblocation',(function(req, res) {
				if(req.params.joblocation)
				{
					var query = Job.find({});
					query.where("localisation" , req.params.joblocation);
					query.exec(function(err, job) {
						if (err)
							res.send(err);
						res.json(job);
					});
				}
        else {
          res.send({message: 'No location was chosen'});
        }
}));

//Scrap remixjob's jobs pages
router.get('/scrape',function(req,res)
{
      var url="https://remixjobs.com/";
      console.log(url);

  request(url, function(error, response, html){

       if(!error){

         var $ = cheerio.load(html);
         var jsonStr = '{"lesjobs":[]}';
         var json = JSON.parse(jsonStr);

            $('.jobs-list').children().each(function(){

              // Definition of the variables
              var title, company, localisation, category, description, contract, date, tags;

              var jobinfo=$(this);
              var job=new Job();

						  title = jobinfo.find('.job-title').children().first().text();
						  company = jobinfo.find('.company').text();
					    localisation = jobinfo.find('.workplace').text();

              var categorytab = jobinfo.find('.job-link').attr("href");
              category=categorytab.split("/")[2];
						  contract = jobinfo.find('.contract').text();
              contract=contract.replace('\n','');
              contract=contract.replace(' ','');


              var datestr = jobinfo.find('.job-details-right').text();

              var date;



              if(datestr.indexOf('heures')!=-1)
              {
                date=new Date();
              }
              else {

                var spltdate=datestr.split(" ");

                var day=Number(spltdate[0]);
                var month=spltdate[1];
                month=month.replace('.','');
                var year=spltdate[2];

                switch(month)
                {
                  case "jan":
                    month=01;
                    break;
                case "jan":
                  month=01;
                  break;
                case "fev":
                  month=02;
                  break;
                case "mars":
                  month=03;
                  break;
                case "avr":
                  month=04;
                  break;
                case "mai":
                  month=05;
                  break;
                case "juin":
                  month=06;
                  break;
                  case "juil":
                    month=07;
                    break;
                    case "août":
                      month=08;
                    break;
                    case "sept":
                      month=09;
                      break;
                    case "oct":
                      month=10;
                      break;
                    case "nov":
                      month=11;
                      break;
                    case "déc":
                      month=12;
                      break;
                }
                if(year==undefined)
                year=2015;
                if(day==undefined)
                day=15;
                datestr = year + "-" + (month) + "-" + day;
                console.log(datestr);
                date=Date.parse(datestr);
              }

              jobinfo.find('.tag').each(function(){
							var mytag = $(this).text();
							job.tags.push(mytag);

						});

              job.title=title;
              job.company=company;
              job.localisation=localisation;
              job.contract=contract;
              job.category=category;
              job.description=description;
              job.date=date;
              console.log(job.date);

              job.save(function(err) {
                  if (err!=null)
                  res.send(err);
                });
                    });
       }
   });
});

//Routes' registration
app.use('/api', router);


//We start the server
app.listen(port);
console.log('Magic happens on port ' + port);
