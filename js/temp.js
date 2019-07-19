function main(){
    
    //args object for passing to the page constructor, set default arguments for datafile and template_name, these only change if the get parameter "g" is non-null
    page_args = Object();
    page_args["datafile"] = "js/page_data.json";
    page_args["template"] = "bodyexample.html"

    //find the name to be passed to the constructor
    local = findGetParameter("p");
    if (!local) {
        //if null is returned for "p", try "g"
        local = findGetParameter("g");
        if (local) {
            //if get parameter for "g" is non-null then set data and template for adviser page
            page_args["datafile"] = "js/adviser_info.json";
            page_args["template"] = "goto_adviser.html";
        } else {
            //if both p and g return null then set local to index
            local = "index"
        }
    }

    //set the page name in args to local
    page_args["name"] = local;

    console.log(page_args);

    //create new page object of pagename and render
    page =  new Page(page_args);
    console.log(JSON.stringify(page));
    console.log(page.data);
    page.render();
}

class History {
    constructor() {
        this.full_hist = new Array();
        this.breadcrumb = new Set();
    }

    //get history from session storage
    static getHistory(){ sessionStorage.getItem("hist"); }
    storeHistory(){ sessionStorage.setItem(this); }
}

class Page {

    //upon object creation, set name and automatically get the data for the page
    constructor(args){
        this.name = args["name"];
        this.datafile = args["datafile"];
        this.template_name = args["template"];
        var self = this;
        console.log("getting data for: " + this.name + " from: " + this.datafile);
        $.get(this.datafile, function(self, data) { self.data = data[self.name]; });
    }
    
    setUpSubcats() {

        console.log(this.data);
        //check whether subcats exists
        if (this.data["subcats"]) {
            var clickID = 0;
            //iterate through all the subcats
            subcats = this.data["subcats"];
            subcats.forEach(subcat => {
                target_page = new Page(subcat["link"]);
                if (target_page.data) {
                    subcat["link"] = "/p=" + subcat["link"]; //prepend proper string formatting to link
                }
                //set clickID
                subcat["clickID"] = clickID++;
            })
        }
    }

    setMotm() {
        var self = this;
        $.get("js/motm.json", function(data) { 
            var d = new Date();
            self.data["motm"] = data[d.getMonth()];            
        });
    }

    render() {

        //if the data for the page is null or undefined then redirect to 404 and return
        if (this.data) {
            this.setUpSubcats();
            this.setMotm();
            document.title = data["title"];
        } else {
            console.log("yoooo");
            this.template_name = "404.html";
            document.title = "(404) Page Not Found";
        }

        $.get(this.template_name, function(template) {
            document.body.innerHTML = Mustache.render(template, this.data);
        })

    }
}

















// This just returns data for a get parameter named when calling the function
function findGetParameter(parameterName) {
    var result = null, tmp = [];

    //using the url "http://localhost/?p=exams&h=index,exams" as an example
    location.search //get the query URI - ie. "?p=exams&h=index,exams"
        .substr(1) // => "p=exams&h=index,exams"
        .split("&") //=> ["p=exams", "h=index,exams"]
        .forEach(function (item) {
            //then for each element in the array
            //if the first character of the element is the get parameter passed to the function the return the unencoded version of the URI
            tmp = item.split("=");
            if (tmp[0] === parameterName) { result = decodeURIComponent(tmp[1]) };
        });
        return result;
}