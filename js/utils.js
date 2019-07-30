// Getter and setter for cookies
function setCookie(cname, cvalue) { sessionStorage.setItem(cname,cvalue) }
function getCookie(cname) { return sessionStorage.getItem(cname) }


class Page {

    //upon object creation, set name and automatically get the data for the page
    constructor(args){
        this.name = args["name"];
        this.datafile = args["datafile"];
        this.template_name = args["template"];
        this.data = args["data"];
    }
    
    setUpSubcats() {

        console.log(this.data);
        //check whether subcats exists
        if (this.data["subcats"]) {
            var clickID = 0;
            //iterate through all the subcats
            var subcats = this.data["subcats"];
            subcats.forEach(subcat => {
                var target_page = new Page(subcat["link"]); //this is going to break now!!!
                if (target_page.data) {
                    subcat["link"] = "/p=" + subcat["link"]; //prepend proper string formatting to link
                }
                //set clickID
                subcat["clickID"] = clickID++;
            })
        }
    }

    static getData(name, datafile, callback){
        console.log("Getting data for: " + name + " from: " + datafile);
        $.get(datafile, function(data) { callback(data[name]); });
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
            console.log(this.data);
            document.title = this.data["title"];
        } else {
            console.log("yoooo");
            this.template_name = "404.html";
            document.title = "(404) Page Not Found";
        }

        var self = this;
        $.get(this.template_name, function(template) {
            document.body.innerHTML = Mustache.render(template, self.data);
        })

    }
}