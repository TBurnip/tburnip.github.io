async function main(){

    //if page is an adviser page (ie has get parameter "g"), then create new adviser page and render
    var page_name = Nav.findGetParameter("g");
    if (page_name) {
        //create a get request from adviser_info.json
        Page.getData(page_name, "js/adviser_info.json", function(data){
            //create an AdviserPage object with the appropriate data and render
            var page=  new AdviserPage(page_name, "goto_adviser.html", data);
            page.render();
        })
    } else {
        //see if URL has "p" as a get parameter, if not set the page name to index
        page_name = Nav.findGetParameter("p");
        if (!page_name) { page_name = "index"; }

        //create a get request from page_data.json
        Page.getData(page_name, "js/page_data.json", function(data){

            //create a page object with data returned from get request and render
            var page = new Page(page_name, "page_template.html", data);
            page.render();
        });
    }
    //retrieve history from session storage, update then store again
    var hist = History.retrieveHistory();
    hist.update(page_name);
}