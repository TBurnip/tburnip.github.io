// This is my custom library for get requests

// This take a path a set of keyvalues and a function which it runs once the request responds with http code 200
function getrequest(path,keyvalues,oncedone) {
    console.log(path);
    console.log(keyvalues);
    console.log(oncedone);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            oncedone(this);
        }
    };
    console.log(path + doihaveanyparams(keyvalues) + uriencodedeofkeyvalues(keyvalues))
    xhttp.open("GET", path + doihaveanyparams(keyvalues) + uriencodedeofkeyvalues(keyvalues), true);
    xhttp.setRequestHeader('Content-Type', 'text/json');
    xhttp.send();
}

// function getrequest(path,oncedone) {
//     var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function() {
//         if (this.readyState == 4 && this.status == 200) {
//             oncedone(this)
//         }
//     };
//     xhttp.open("GET", path, true);
//     xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//     xhttp.send();
// }

function doihaveanyparams(keyvalues) {
    if (Object.keys(keyvalues).length === 0) {
        return ""
    }
    return "?"
}

function uriencodedeofkeyvalues(kv) {
    output = ""
    for (const key in kv) {
        if (kv.hasOwnProperty(key)) {
            const value = kv[key];
            output += key + "=" + value + "&"
        }
    }
    return output
}