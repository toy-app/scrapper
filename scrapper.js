var phantom = require('phantom');
var request = require('request');

//
// DEFAULT Config
//
const EMAIL = ''; // login email > CAN BE CHANGED
const PASSWORD = '';          // login pwd > CAN BE CHANGED
const DEBUG = false;                    // set true to debug



//
// OBJECT
// Predefined config
//
var ScpapeL = function(config){
    config = config || {};
    this.debug          = config.debug || DEBUG;
    // Token used to fetch user profiles
    this.linkedinToken = {
        'name'     : 'li_at',
        'value'    : config.liAt || config.token || '',
        'domain'   : '.www.linkedin.com',
        'path'     : '/',
        'httponly' : true,
        'secure'   : true,
        'expires'  : new Date("2018-01-01T18:24:10.000Z").getTime()
    };
    this.companyListURL = 'https://www.linkedin.com/search/results/companies/?keywords=africa&origin=SWITCH_SEARCH_VERTICAL&page=';
    this.businessURL = 'https://www.linkedin.com';
    // Used to login to linkedin
    this.loginCsrf = config.loginCsrf || null;
    this.loginCookies = config.loginCookies || null;
    this.loginEmail     = config.loginEmail || EMAIL;
    this.loginPassword  = config.loginPassword || PASSWORD;
};


// Opening the linkedin pages using phanthomJS a headless browser


ScpapeL.prototype.openPage = function(url){
    console.log(url);
    const self = this;
    return new Promise((resolve, reject) => {
        phantom.create().then(function(ph){
            ph.createPage().then( function(page){
                page.setting('javascriptEnabled', true);
                page.setting('cookiesEnabled', true);
                page.addCookie(self.linkedinToken);
                return page.open(url)
                .then(function(result){
                    resolve(page);
                });
            });
        });
    });
}

// this funciton extracts all the data about the companies using fetched company list that are in africa

ScpapeL.prototype.businessInfo = function(page){
    console.log('inside businessInfo');
    var self = this;
    return new Promise((resolve, reject) => {
        // page.render('a2.jpg');
        page.evaluate(function(){
            window.document.body.scrollTop = document.body.scrollHeight;
        }).then(setTimeout(function(){
            page.evaluate(function(){
                
                function getCompanyLink() {
                    return true;
                };

                function getText(selector){
                    return get(selector) ? get(selector).textContent : "";
                };

                function getLink(selector){
                    return get(selector) ? get(selector).getAttribute('href') : "";
                }

                function get(selector){
                    return document.querySelector(selector) ? document.querySelector(selector) : false;
                };
                var business = {};
                try {
                    business.name = getText('.search-result__result-link');
                    business.about = getText('.org-about-us-organization-description__text description');
                    business.size = getText('.org-about-company-module__company-staff-count-range');
                    business.website = getText('.org-about-us-company-module__website');
                    business.industry = getText('.org-about-company-module__specialities');
                    business.country = getText('.org-about-company-module__headquarters');
                }
                catch(e){
                    business = e;
                    self.console.error('try', business);
                }
                return business;
            })
            .then(function(result){
                resolve(result);
                // return ph.exit();
            })
            .catch(err => {
                console.log('============err', err)
                reject(err);
            });
        }, 2000))
        .catch(err => {
            console.log('============err', err)
            reject(err);
        });
    });
}


// It parses the company search list and takes the company URL

ScpapeL.prototype.documentParser = function(page){
    var self = this;
    return new Promise((resolve, reject) => {
        // page.render('a2.jpg');
        page.evaluate(function(){
            window.document.body.scrollTop = document.body.scrollHeight;
        }).then(setTimeout(function(){
            page.evaluate(function(){
                
                function getCompanyLink() {
                    return true;
                };

                function getText(selector){
                    return get(selector) ? get(selector).textContent : "";
                };

                function getLink(selector){
                    return get(selector) ? get(selector).getAttribute('href') : "";
                }

                function get(selector){
                    return document.querySelector(selector) ? document.querySelector(selector) : false;
                };
                function getTextArray(mainSelector, textSelector){
                    var tmp = document.querySelectorAll(mainSelector);
                    var array = [];
                    if(tmp.length > 0){
                        for(var k = 0 ; k < tmp.length ; k++){
                            if(tmp[k].querySelector(textSelector))
                                array.push(tmp[k].querySelector(textSelector).textContent);
                            else
                                array.push(tmp[k].textContent);
                        }
                    }
                    return array;
                };
                function getLinkArray(mainSelector){
                    var tmp = document.querySelectorAll(mainSelector);
                    var array = [];
                    if(tmp.length > 0){
                        for(var k = 0 ; k < tmp.length ; k++){
                            array.push(tmp[k].getAttribute('href'));
                        }
                    }
                    return array;
                };
                function getJson(mainSelector, json){
                    var tmp = document.querySelectorAll(mainSelector);
                    var array = [];
                    if(tmp.length > 0){
                        for(var k = 0 ; k < tmp.length ; k++){
                            var jsonResult = {};
                            for(var j in json){
                                jsonResult[j] = tmp[k].querySelector(json[j]) ? tmp[k].querySelector(json[j]).textContent : "";

                            }
                            array.push(jsonResult);
                        }
                    }
                    return array;
                };
                function getPicture(selector){
                    return document.querySelector(selector) ? document.querySelector(selector).getAttribute("src") : "";
                };
                var user = [];
                try {
                    user = getLinkArray('.search-result__result-link');
                }
                catch(e){
                    user = e;
                    self.console.error('try', user.link);
                }
                return user;
            })
            .then(function(result){
                resolve(result);
                // return ph.exit();
            })
            .catch(err => {
                console.log('============err', err)
                reject(err);
            });
        }, 2000))
        .catch(err => {
            console.log('============err', err)
            reject(err);
        });
    });
};



//
//	LOG INTO LINKEDIN -> get token
//
ScpapeL.prototype.getToken = function(){
    const self = this;
    var form = {
        'loginCsrfParam':self.loginCsrf,
        'session_key':self.loginEmail,
        'session_password':self.loginPassword
    };
    var tokenOptions = {
        method: 'POST',
        url: 'https://www.linkedin.com/uas/login-submit',
        headers:
        {
            'cache-control': 'no-cache',
            'cookie': self.loginCookies,
            'accept-language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
            'accept-encoding': 'gzip, deflate',
            'referer': 'https://www.linkedin.com/',
            'accept': '*/*',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest',
            'origin': 'https://www.linkedin.com',
            'x-isajaxform': '1'
        },
        'form': form
    };

    return new Promise(function(resolve, reject){
        request(tokenOptions, function (error, response, body) {
            if (error) throw new Error(error);

            const cookies = response.headers["set-cookie"];
            var liAt = "";
            for(var i = 0; i<cookies.length; i++){
                if(/^li_at/.test(cookies[i])){
                    liAt = cookies[i];
                    break;
                }
            }
            if(liAt == ""){
                return reject("no token found");
            }

            liAt = liAt.split("=")[1].split(";")[0];
            return resolve(liAt);
        });
    });
};

//
//  If token is not set, update token
//
ScpapeL.prototype.updateTokenIfNeeded = function(){

    try {
    const self = this;
    return new Promise(function(resolve, reject){
        if(self.linkedinToken.value == ""){
            if(self.debug)
                console.log("fetch linkedin token");
            self.getToken()
            .then(function(res){
                if(self.debug)
                    console.log("linkedin token received:", res);
                self.linkedinToken.value = res;
                resolve(res);
            })
            .catch(function(err){
                reject(err);
            });
        }
    });


}catch(err){
    console.log('updateTokenIfNeeded', err);
}
};








//
//  Get CSRF and Cookies if needed
//
var cookiesOptions = {
    method: 'GET',
    url: 'https://www.linkedin.com/uas/login-submit',
    headers:
    {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept-Language':'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
        'Cache-Control':'max-age=0',
        'Connection':'keep-alive',
        'Host':'www.linkedin.com',
        'Upgrade-Insecure-Requests':1,
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36'
    }
};

ScpapeL.prototype.fetchCsrfAndCookies = function(){
    try {
    return new Promise(function(resolve, reject){
        request(cookiesOptions, function (error, response, body) {
            if (error) throw new Error(error);

            const cookies = response.headers["set-cookie"];
            var strCookies = "";
            var csrf = null
            cookies.map(v =>{
                if(/bcookie=/.test(v))
                    csrf = v.split('"')[1].split("&")[1];
                strCookies += v.split(";")[0] +"; ";
            });
            resolve({
                cookies : strCookies,
                csrf : csrf
            });
        });
    });

}catch(err){
    console.log('fetchCsrfAndCookies', err);
}
};



//
//  Update cookie if needed
//
ScpapeL.prototype.updateCsrfAndCookiesIfNeeded = function(){

    try {


    const self = this;
    return new Promise((resolve, reject)=>{
        if(self.loginCsrf == null || self.loginCookies == null){
            if(self.debug)
                console.log("fetch default cookies and csrf");
            self.fetchCsrfAndCookies().then(json =>{
                self.loginCsrf = json.csrf;
                self.loginCookies = json.cookies;
                if(self.debug)
                    console.log("default cookies and csrf are:", json);
                resolve();
            }).catch(err => {
                reject(err);
            });
        }else{
            return resolve();
        }
    });


    }catch(err){
    console.log('updateCsrfAndCookiesIfNeeded', err);
}
};

//
// This function list the all the companies that are satisfies africa search filter
//

ScpapeL.prototype.listCompanies = function(pageURL){
    const self = this;
    return new Promise((resolve, reject) => {
        self.openPage(pageURL).then(page => {
            setTimeout(function(){
                self.documentParser(page).then(profile => {
                    resolve(profile)
                }).catch(err => reject(err));
            }, 6000);
        })
        .catch(function(err){
             reject(err);
         });
    });
};

ScpapeL.prototype.getBusinessInfo = function(pages){
    // console.log('inside getBusinessInfo', pages);
    const self = this;
    return new Promise((resolve, reject) => {
     // self.updateCsrfAndCookiesIfNeeded().then()
     // .then(()=>{
         // self.updateTokenIfNeeded()
         // .then(()=>{
            var businessPages = [];
            
            for(var page = 0; page <= pages.length; page = page + 2){
                if(pages[page]){
                 businessPages.push(self.openPage(self.businessURL + pages[page]));
                }
            }

            Promise.all(businessPages)
            .then(phPage => {
                var data = [];
                for (var page = 0, len = phPage.length; page < len; page++) {
                    data.push(self.businessInfo(phPage[page]));
                }
                Promise.all(data)
                .then( res => {
                    resolve(res);
                })
                .catch(function(err){
                    console.log('parsing business page', err);
                    reject(err);
                });  
            // })
         })
         .catch(function(err){
             reject(err);
         });
     // })
     // .catch(err => {
     //     reject(err);
     // });
 });

};


//
//  Login to linkedin if needed, get the token if needed and THEN fetch profile
//
ScpapeL.prototype.bindIfNeededThenfetch = function(pages){
    const self = this;
    return new Promise((resolve, reject) => {
     self.updateCsrfAndCookiesIfNeeded().then()
     .then(()=>{
         self.updateTokenIfNeeded()
         .then(()=>{
            var companylist = [];
            
            for(var page = 1; page <= pages; page++){
                 companylist.push(self.listCompanies(self.companyListURL + page));
            }

            Promise.all(companylist)
            .then(result => {
                var data = [];
                for (var i = 0, len = result.length; i < len; i++) {
                    result[i].forEach(function(item){
                        data.push(item);
                    });
                }
                self.getBusinessInfo(data)
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    console.error('Company pages error', err);
                    reject(err);
                });
                
            })
         })
         .catch(function(err){
             reject(err);
         });
     })
     .catch(err => {
         reject(err);
     });
 });

};
ScpapeL.prototype.fetch  = ScpapeL.prototype.bindIfNeededThenfetch;


module.exports = ScpapeL;