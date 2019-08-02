class Page {

    //upon object creation, set name and automatically get the data for the page
    constructor(name, template, data){
        /*
            Attributes:
                name:       name of the page
                template:   .html file used to render the page
                data:       data for the page read from the datafile
        */
        this.name = name;
        this.template = template;
        this.data = data;
    }

    static async getData(name, datafile, callback){
        console.log("Getting data for: " + name + " from: " + datafile);
        $.getJSON(datafile, function(data) { console.log(data);callback(data[name]); });
    }
    
    _setupSubcats() {
        var subcats = this.data["subcats"];
        //check whether subcats exists
        if (subcats) {       
            //for every non-external link, prepend "/?" and the appropriate get parameter
            subcats.forEach(subcat => {
                if (!subcat["linkexternal"]) {
                    var get_praram;
                    subcat["goto_adviser"] ? get_praram = "g" : get_praram = "p";
                    subcat["link"] = "/?" + get_praram + "=" + subcat["link"];
                }
            })
        }
    }

    _setMotm() {
        var self = this;
        $.get("js/motm.json", function(data) { 
            var d = new Date();
            self.data["motm"] = data[d.getMonth()];            
        });
    }

    render() {
        var hist = History.retrieveHistory();

        //if the data for the page is null or undefined then redirect to 404 and return
        if (this.data) {
            this._setupSubcats();
            this._setMotm();
            document.title = this.data["title"];
        } else {
            this.template = "404.html";
            document.title = "(404) Page Not Found";
        }

        //pass the page data and appropriate template to the moustache rendering engine
        var self = this;
        $.get(this.template, function(template) {
            document.body.innerHTML = Mustache.render(template, self.data);
            hist.renderBreadcrumb();
        })

    }
}

class AdviserPage extends Page {

    _assignProperGrammar(who) {
        var grammar_lookup = {
            "SSO": {
                "dp": "the SSO",
                "fdp": "the SSO"
            },
            "adviser": {
                "dp": "your adviser of studies",
                "fdp": "my adviser of studies"
            }
        }
        var who = this.data["who"];
        var grammar = grammar_lookup[who];


        Object.assign(this.data, grammar);
    }

    _getAdviserLink() {

        //retrieve the history from session storage
        var hist = History.retrieveHistory();
        var full_hist = hist.full_hist.toString();

        //build the string for the URL
        return location.origin + location.pathname + "?g=" + this.name + "&h=" + full_hist;
    }

    render() {
        var who = this.data["who"];
        if (who) { this._assignProperGrammar(who); }
        console.log(this.data);
        this.data["hist_link"] = this._getAdviserLink();
        super.render(); 
    }
}

class History {
    constructor(hist) {

        /*  
            Takes:
                hist:       JSON object stored in session storage

            Attributes:
                full_hist:  array storing every page that the user has visited
                breadcrumb: array storing previously visited pages (no duplicates), used as a navigation element
        */

        //see if there is any existing history
        var existing_hist = Nav.findGetParameter("h");
        if (existing_hist) { //if so create array and set with existing history

            //split history on commas and create set object to remove duplicates
            var split_hist = existing_hist.split(",");
            var bc = new Set(split_hist); //this won't work as intended, need to get current page and get the breadcrumb from "index" -> ... -> "current page"

            //then assign members
            this.full_hist = split_hist;
            this.breadcrumb = Array.from(bc);

        } else if (hist){ //if history is stored
            this.full_hist = hist["full_hist"];
            this.breadcrumb = hist["breadcrumb"];
        } else { //otherwise just initialise with empty arrays
            this.full_hist = [];
            this.breadcrumb = [];
        }
    }

    _getBreadcrumbFromFullHist(hist) {
        var len = hist.length;
        console.log(hist);
        for (var i = len; i >= 0; i--){
            continue;
        }
    }

    //get history from session storage and return it, if history doesn't exist in session storage return new history
    static retrieveHistory() {
        var hist = JSON.parse(sessionStorage.getItem("hist"));
        return new History(hist);
    }

    //store a JSON serialized version of the history in session storage
    _storeHistory(){ sessionStorage.setItem("hist", JSON.stringify(this)); }

    update(page, type=null) {

        //add to full_hist if and only if the page is not the same as the most recent page in history (we don't want duplicates)
        var last_page = this.full_hist[this.full_hist.length -1];
        if (last_page != page) { this.full_hist.push(page); }

        if (page === "index") { this.breadcrumb = ["index"]; }                      //page is index             => breadcrumb is reset to ["index"]
        else if (!this.breadcrumb.includes(page)) { this.breadcrumb.push(page); }   //page not in breadcrumb    => add it to breadcrumb
        else if (type === "back") { this.breadcrumb.pop(); }                        //back button clicked       => remove last element from breadcrumb
        else if (type === "breadcrumb") {                                           //breadcrumb link clicked   => set breadcrumb to existing one up to the link clicked (inclusive)
            var bc = this.breadcrumb;
            var idx = bc.indexOf(page);
            this.breadcrumb = bc.slice(0, idx+1);
        }

        //store history after every update
        this._storeHistory();
    }

    //takes the breadcrumb and builds and inserts the html for displaying it
    renderBreadcrumb() {
        var bc = this.breadcrumb;
        $(document).ready(function(){

            //the string we will be appending text to
            var str = "";
            bc.forEach(function(crumb){
                
                //replace underscores with spaces and capitalise all words
                var clean_crumb = crumb.replace(/_/g, " ");
                clean_crumb = clean_crumb.replace(/\w\S*/g, function(txt){
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
                
                //build anchor tag for the links in the breadcrumb
                var link = "<a onclick=\"Nav.breadcrumbClick('" + crumb + "')\" href=\"#\">" + clean_crumb + "</a>";
                //add the list item tags with appropriate class
                str += "<li class=\"breadcrumb-item\">" + link + "</li>";
            });
    
            document.getElementById("breadcrumb").innerHTML = str;
        }) 
    }

    //if the length of the history is greater than 1 (ie a previous page exists), then return the previous page otherwise return the only element in the array
    getPreviousPage() {
        var len = this.full_hist.length;
        if (len > 1) { return this.full_hist[len - 2]; }
        else { return this.full_hist[0]; }
    }
}

class Nav {

    //find appropriate get parameter for page, build URI and redirect to that location
    static redirect(page) {
        var get_param = Nav.getParamForPage(page);
        var uri = "\?" + get_param + "=" + page;

        try { location = uri; } 
        catch { location = "/404.html"; }
        
    }

    static goBack() {
        var hist = History.retrieveHistory();
        var prev_page = hist.getPreviousPage();
        hist.update(prev_page, "back");
        Nav.redirect(prev_page);
    }

    static breadcrumbClick(page) {
        var hist = History.retrieveHistory();
        hist.update(page, "breadcrumb");
        Nav.redirect(page);
    }

    //returns the "g" if page is an adviser page, "p" otherwise
    static getParamForPage(page) {
        /*
            NOTE: this is a really hacky way of doing things and needs rethought

            Possibly get the keys from adviser_info.json? would still be a hacky solution but saves page names being hard-coded
        */

        //names of all the goto adviser pages
        var adviser_pages = ["can_drop_or_swap", "outside_add_drop", "degree", "consider_for_fit_to_study", "cant_progress"];
        var get_param;
        adviser_pages.includes(page) ? get_param = "g" : get_param = "p";
        return get_param;
    }

    //returns the string followed by the get parameter (ie "/?=p" or "/?=g")
    static findGetParameter(param) {
        var result = null, tmp = [];

        //using the url "http://localhost/?p=exams&h=index,exams" as an example
        location.search //get the query URI - ie. "?p=exams&h=index,exams"
            .substr(1) // => "p=exams&h=index,exams"
            .split("&") //=> ["p=exams", "h=index,exams"]
            .forEach(function (item) {
                //then for each element in the array
                //if the first character of the element is the get parameter passed to the function the return the unencoded version of the URI
                tmp = item.split("=");
                if (tmp[0] == param) { result = decodeURIComponent(tmp[1]) };
            });
            return result;
    }
}

function clickToCopy(element) {
    console.log("copying")
    /* Get the text field */
    link = element

    /* Select the text field */
    link.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
}

/*
    This is used for compressing and decompressing the history for storage in the link

    Code is copied from Rosetta Code (https://rosettacode.org/wiki/LZW_compression#JavaScript)

*/


class LZW 
{
    /**
        Perform the LZW compression
        uncompressed - String. The string on which to perform the compression.
    */
    static compress(uncompressed)
    {
        // Initialize dictionary
        let dictionary = {};
        for (let i = 0; i < 256; i++)
        {
            dictionary[String.fromCharCode(i)] = i;
        }
 
        let word = '';
        let result = [];
        let dictSize = 256;
 
        for (let i = 0, len = uncompressed.length; i < len; i++)
        {
            let curChar = uncompressed[i];
            let joinedWord = word + curChar;
 
            // Do not use dictionary[joinedWord] because javascript objects 
            // will return values for myObject['toString']
            if (dictionary.hasOwnProperty(joinedWord)) 
            {
                word = joinedWord;
            }
            else
            {
                result.push(dictionary[word]);
                // Add wc to the dictionary.
                dictionary[joinedWord] = dictSize++;
                word = curChar;
            }
        }
 
        if (word !== '')
        {
            result.push(dictionary[word]);
        }
 
        return result;
    }
 
    /**
        Decompress LZW array generated by LZW.compress()
        compressed - Array. The array that holds LZW compressed data.
    */
    static decompress(compressed)
    {
        // Initialize Dictionary (inverse of compress)
        let dictionary = {};
        for (let i = 0; i < 256; i++)
        {
            dictionary[i] = String.fromCharCode(i);
        }
 
        let word = String.fromCharCode(compressed[0]);
        let result = word;
        let entry = '';
        let dictSize = 256;
 
        for (let i = 1, len = compressed.length; i < len; i++)
        {
            let curNumber = compressed[i];
 
            if (dictionary[curNumber] !== undefined)
            {
                entry = dictionary[curNumber];
            }
            else
            {
                if (curNumber === dictSize)
                {
                    entry = word + word[0];
                }
                else
                {
                    throw 'Error in processing';
                    return null;
                }
            }
 
            result += entry;
 
            // Add word + entry[0] to dictionary
            dictionary[dictSize++] = word + entry[0];
 
            word = entry;
        }
 
        return result;
    }
}