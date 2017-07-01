// Import the module in your file 
var ScrapeL = require("./scrapper");
var json2csv = require('json2csv');
var fs = require('fs');
 
// Create the scraper object 
var scrapper = new ScrapeL({
	debug : true,
    loginEmail : "ramgopalvermamail@gmail.com",
    loginPassword : "linkedin$2015" 
});
 
// Fetch a profile 
scrapper.fetch(1)
// Handle the result 
.then(BusinessProfile => {
	try {
		var fields = ['about', 'country', 'industry', 'name', 'size', 'website'];
		var result = json2csv({data: BusinessProfile, fields: fields});
		fs.writeFile('africabusiness.csv', result, function(err) {
			if (err) throw err;
			console.log('file saved');
		});
	} catch (err) {
		console.error(err);
	}
})
// Handle an error 
.catch(err => console.log(err))