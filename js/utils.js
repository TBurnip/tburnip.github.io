// Getter and setter for cookies
function setCookie(cname, cvalue) { sessionStorage.setItem(cname,cvalue) }
function getCookie(cname) { return sessionStorage.getItem(cname) }