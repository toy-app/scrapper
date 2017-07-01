// Import the module in your file 
var ScrapeL = require("./scrapper");
 
// Create the scraper object 
var scrapper = new ScrapeL({
	debug : true,
    loginEmail : "ramgopalvermamail@gmail.com",
    loginPassword : "linkedin$2015" 
});
 
// Fetch a profile 
scrapper.fetch(1)
// Handle the result 
.then(profile => console.log('kkkkkk', profile))
// Handle an error 
.catch(err => console.log(err))