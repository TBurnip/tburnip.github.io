var hist;
var data;
var pagename;
var pagedata;

// Once the data from bodyexample.html has been loaded this code is ran. This renders the final webpage using Mustoche as a templating engine 
function bodyexampleloaded(r) {
    console.log(pagedata);
    bodyexamplehtml = r
    document.body.innerHTML = Mustache.render(bodyexamplehtml, pagedata)
    document.body.id = pagedata["type"] /* POSSIBLY CAN GET RID OF THIS SINCE IT ISN'T DOING ANYTHING IN THE CSS */
    document.title = pagedata["title"]
    load(pagename)
}

// Load is a whole bunch of miscellaneous stuff related to loading the page.
function load(name) {
    hist = getCookie("hist");
    if (hist != "") {
        if (location.pathname + location.search == "/?p="
            || (location.search == "" && location.pathname != "/404.html")
            || location.search == "?p=index") {
            setCookie("hist", "index")
        } else {
            setCookie("hist", hist + "," + findGetParameter("p"))
        }
    } else {
        setCookie("hist", findGetParameter("p"))
    }
    hist = getCookie("hist")
    gethist = findGetParameter("h")
    if (gethist != undefined) {
        hist = gethist
    }
    removeconsecutiveduplicates() //this function will be unescessary if we make history a set
    removebrowserbackeventduplicates()
    renderbreadcrumb()
    bottomofpagelink(name,false)
}

// Getter and setter for cookies
function setCookie(cname, cvalue) { sessionStorage.setItem(cname,cvalue); }
function getCookie(cname) { return sessionStorage.getItem(cname); }

// This function takes advantage of a variable and cookie called hist. Hist stands for history and is an array of all the previous pages a user has been to. This function simply steps back up the array and deletes the page you are on while doing so.
function goback() {
    console.log("going back")
    if (location.pathname + location.search != "/?p=" && (location.search != "" || location.pathname == "/404.html")) {
        location = "/?p=" + hist.split(",")[hist.split(",").length - 2]
        hist = hist.split(",").slice(0, hist.split(",").length - 2)
        setCookie("hist", hist)
    }
}

// This takes the data in hist and displays it as an interactive breadcrumb trail
function renderbreadcrumb() {
    bread = document.getElementById("breadcrumb")
    bread.innerHTML = ""
    count = 0
    hist.split(",").forEach(crumb => {
        bread.innerHTML = bread.innerHTML + "<li class=\"breadcrumb-item\"><a onclick=\"clickhandler('/?p=" + 
        crumb + "',this)\" href=\"#\" data-clickID=\"breadcrumb_"+ 
        count +"\">" + 
        crumb + "</a></li>";
        count ++;
    });
}

// This removes duplicate history entries from the history (I know this is not a good function and should be broken out for general use however it is only used once).
function removeconsecutiveduplicates() {
    hista = hist.split(",")
    console.log(hista)
    out = []
    previouscrumb = ""
    hista.forEach(crumb => {
        if (crumb != previouscrumb) {
            out.push(crumb)
            previouscrumb = crumb
        }
    });
    console.log(out)
    hista = out
    hist = hista[0]
    hista.slice(1).forEach(crumb => {
        hist += "," + crumb
    });
    setCookie("hist", hist)
}

// This is used to load data into the page. This only a switch which allows for the use of localhost to represent index.
function loaddata() {
    local = findGetParameter("p");
    pagename = "index";
    if (local) {
        pagename = local;
    }
    loadpage();
}

// Loads the page with the given name. This uses the data from the json to load the page and uses a file called bodyexample.html as a template.
var data
var pagename
var pagedata

function loadpage() {
    console.log("Geting Data for: " + pagename);
    $.get("/js/data.json",jsonloaded);
}

function jsonloaded(resp) {
    data = resp
    console.log(data)
    pagedata = data["pages"][pagename]

    //check whether page is defined in data.json, if not then load 404 page
    if (pagedata != undefined) {
        if (!(pagedata["subcats"] == null || pagedata["subcats"] == undefined)) {


            count = 0;

            //loop through every subcategory
            pagedata["subcats"].forEach(subcat => {
                //if link isn't external and link is defined in data.json
                if (!(subcat["linkexternal"] || data["pages"][subcat["link"]] == undefined)) {
                    subcat["type"] = data["pages"][subcat["link"]]["type"];
                    subcat["link"] = "/?p=" + subcat["link"];
                } else {
                    subcat["type"] = "external\" class=\"";
                }
                //
                subcat["clickid"] = count++;
            })
        }

        var d = new Date();
        var n = d.getMonth();
        pagedata["motm"] = data["motm"][n]
        if (data != null) {
            $.get("/bodyexample.html",bodyexampleloaded);
        }
    } else {
        console.log(pagename)
        location = "/404.html"
        return
    }
}


// Once the data from bodyexample.html has been loaded this code is ran. This renders the final webpage using Mustoche as a templating engine 
function bodyexampleloaded(r) {
    console.log("got this far")
    console.log(pagedata)
    console.log(r)
    bodyexamplehtml = r
    document.body.innerHTML = Mustache.render(bodyexamplehtml, pagedata)
    document.body.id = pagedata["type"]
    document.title = pagedata["title"]
    load(pagename)
}


// Load is a whole bunch of miscellaneous stuff related to loading the page.
function load(name) {
    hist = getCookie("hist")
    if (hist != "") {
        if (location.pathname + location.search == "/?p="
            || (location.search == "" && location.pathname != "/404.html")
            || location.search == "?p=index") {
            setCookie("hist", "index")
        } else {
            setCookie("hist", hist + "," + findGetParameter("p"))
        }
    } else {
        setCookie("hist", findGetParameter("p"))
    }
    hist = getCookie("hist")
    gethist = findGetParameter("h")
    if (gethist != undefined) {
        hist = gethist
    }
    removeconsecutiveduplicates()
    removebrowserbackeventduplicates()
    renderbreadcrumb()
    bottomofpagelink(name,false)
}

// This function is used to detect if the browser back button has been used and if it has it removes the correct items from the bread crumb train.
function removebrowserbackeventduplicates() {

    /*
        example of how this works

        if you are on a page called course_assignments
        and your history was
        index,course,course_assignments

        then you were to use the browser back button
        your history would become
        index,course,course_assignments,course

        to fix this once detected we simply remove
        course_assignments and course

        for the example bellow presume 
        hist = "index,course,course_assignments,course"
    */


    hista = hist.split(",") // hista = ["index","course","course_assignments","course"]
    if (hista[hista.length - 3] == pagename) { // 4 - 3 => 1 if hista[1] = "course"
        console.log("browser back") 
        hist = hista.slice(0,-2).join(); // makes removes the last two elements from hista then makes hist = hista joined with ","
    }
}

// This just returns data for a get parameter named when calling the function
function findGetParameter(parameterName) {

    var result = null, tmp = [];

    /*
        We'll use the following example URL to see how this function works:
        "http://localhost/?p=exams&h=index,exams"
    */

    location.search //get the query URI - ie. "?p=exams&h=index,exams"
        .substr(1) // => "p=exams&h=index,exams"
        .split("&") //=> ["p=exams", "h=index,exams"]
        .forEach(function (item) {
            //then for each element in the array
            //if the first character of the element is the get parameter passed to the function the return the unencoded version of the URI
            tmp = item.split("=");
            if (tmp[0] === parameterName) { result = decodeURIComponent(tmp[1]) };
        });
        return result
}

// Loadadviser loads the data into the goto_adviser page
function loadadviser() {
    load()
    x = findGetParameter("g")
    $.get("/js/data.json",function (r) {
        data = r
        jobject = data["goto_adviser"][x]
        document.getElementById("why").innerHTML = jobject["why"]
        document.getElementById("what").innerHTML = jobject["what"]
        
        var arr = [].slice.call(document.getElementsByClassName("who"));
        arr.forEach(element => {
            element.innerHTML = jobject["who"]
        });
        
        var dp
        if (jobject["who"] == "adviser") {
            dp = "your adviser of studies"
        } else if (jobject["who"] == "SSO") {
            dp = "the SSO"
        }

        var fdp
        if (jobject["who"] == "adviser") {
            fdp = "my adviser of studies"
        } else if (jobject["who"] == "SSO") {
            fdp = "the SSO"
        }

        var arr2 = [].slice.call(document.getElementsByClassName("dpwho"));
        arr2.forEach(element => {
            element.innerHTML = dp   
        });

        var arr3 = [].slice.call(document.getElementsByClassName("fdpwho"));
        arr3.forEach(element => {
            element.innerHTML = fdp   
        });

        document.getElementsByTagName("title")[0].innerHTML = "Go to "+dp+"."
        bottomofpagelink(x,true)
    });
}

// This creates the link for the bottom of the page and puts it in the input box for the link
function bottomofpagelink(page,ad) {
    text = document.getElementById("link").getElementsByTagName("input")[0]
    hist = getCookie("hist")

    if (ad) {
        linkstr = location.origin + location.pathname + "?g=" + page + "&h=" + hist
    }else {
        linkstr = location.origin + location.pathname + "?p=" + page + "&h=" + hist
    }
    
    text.setAttribute("value", linkstr)
    link = document.getElementById("link").getElementsByTagName("a")[0]
}


function clicktocopy(element) {
    console.log("copying")
    /* Get the text field */
    link = element

    /* Select the text field */
    link.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
}

// This function is the beginning of a new system which will replace the breadcrumb/history system. This click handler is used instead of links in most cases.
function clickhandler(url,t,external,goto_adviser) {
    // This retrives a small bit of information about the thing that has been clicked
    clickid = t.getAttribute("data-clickid")

    // This records the destination URL, clickid, name of the page you are on
    console.log(url,clickid,pagename)

    // this is a section of data which will be used in the new journey system
    clickdata = {"type":"click","currentpage":pagename,"clickname":clickid};
    console.log(JSON.stringify(clickdata))

    // This simply redirects you to the location your click was supposed to go to
    if (clickid.search(/subcat\_.*/) == 0) {
        if (external) {
            var win = window.open(url, '_blank');
            win.focus();
        } else if (goto_adviser) {
            location = url
        } else {
            location = url
        }
    } else if (clickID.search(/breadcrumb\_.*/) == 0) {
        console.log("Lets go breadcrumbing")
    }
}