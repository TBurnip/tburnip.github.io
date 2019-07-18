function main(){
    var hist;

    //get the search parameter, and it it isn't null then set the pagename to it
    

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

    //create new page object of pagename and render
    page =  new Page(page_args);
    page.render();
}

class History {
    constructor() {
        this.hist = new Set(["index"]);
    }
}

class Page {

    //upon object creation, set name and automatically get the data for the page
    constructor(args){
        this.name = args["name"];
        this.datafile = args["datafile"];
        this.template_name = args["template"];
        this.data = this.getData(this.name);
    }
    
    setUpSubcats() {
        //check whether subcats exists
        subcats = this.data["subcats"];
        if (subcats) {
            var clickID = 0;
            //iterate through all the subcats
            subcats.forEach(subcat => {
                target_page = new Page(subcat["link"]);
                if (!(target_page || subcat["linkexternal"])) {
                    subcat["type"] = target_page["type"]; //set type of subcat (POSSIBLY GETTING REMOVED)
                    subcat["link"] = "/p=" + subcat["link"]; //append proper string formatting to link
                } else {
                    subcat["type"] = "external\" class=\"";
                }
                //set clickID
                subcat["clickID"] = clickID++;
            })
        }
    }

    getData(name) {
        console.log("Geting Data for: " + name);
        //gets the data for the page of a given name using a HTTP request for data.json
        $.get(this.datafile, function(data) { return data[this.name]; });
    }

    getMotm() {
        $.get("/js/motm.json", function(data) { 
            var d = new Date();
            return data[d.getMonth()];            
        });
    }

    render() {
        //if the data for the page is null or undefined then redirect to 404 and return
        if (!this.data) {
            location = "/404.html";
            return;
        }

        this.setUpSubcats();
        this.data["motm"] = this.getMotm();

        $.get(this.template_name, function(template) {
            document.body.innerHTML = Mustache.render(template, this.data);
            document.body.id = data["type"]; /* POSSIBLY CAN GET RID OF THIS SINCE IT ISN'T DOING ANYTHING IN THE CSS */
            document.title = data["title"];
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