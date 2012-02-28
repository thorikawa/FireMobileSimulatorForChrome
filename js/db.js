// variables
var dbNameidb = "ua";
var dbVersionidb = "1.0.9";

// defaults
const defaultUaName = "Chrome default";
const baseData = [
    {name:defaultUaName, string:navigator.userAgent, description:"default"},
    {name:"Google Nexus One (Android 2.2)", string:"Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1", description:"Google Nexus One (Android 2.2)"},
    {name:"iPhone 4 (iOS5)", string:"Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3", description:"iPhone 4S iOS5"},
    {name:"Internet Explorer 6", string:"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)", description:"Internet Explorer 6"},
    {name:"Internet Explorer 7", string:"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)", description:"Internet Explorer 7"},
    {name:"Internet Explorer 8", string:"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)", description:"Internet Explorer 8"},
    {name:"Internet Explorer 9", string:"Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; Trident/5.0)", description:"Internet Explorer 9"},
    {name:"Nokia 7110", string:"Nokia 7110/1.0", description:"Enter the Matrix"},
    {name:"Firefox 8 (Mac OS X 10.6)", string:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:8.0.1) Gecko/20100101 Firefox/8.0.1", description:"Firefox 8 (Mac)"},
    {name:"Safari 5 (Mac OS X 10.6)", string:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.52.7 (KHTML, like Gecko) Version/5.1.2 Safari/534.52.7", description:"Safari 5 (Mac OS X 10.6)"},
    {name:"iPad 2 (iOS5)", string:"Mozilla/5.0 (iPad; CPU 0S 5_0_1 like Mac OS X) AppleWebkit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3", description:"iPad 2 iOS5"}
];

// idb
var indexedDB = window.indexedDB || window.webkitIndexedDB ||
    window.mozIndexedDB;
if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}

indexedDB.db = null;

// idb open
function openIDB() {

    var BG = chrome.extension.getBackgroundPage();

    var request = indexedDB.open(dbNameidb, dbVersionidb);
    request.onblocked = function (e) {
        console.log("warning, db is blocked:" + e);
        return;
    };
    request.onsuccess = function (e) {
        //console.log("idb success");
        indexedDB.db = request.result;
        if (dbVersionidb != indexedDB.db.version) {
            // old version found, fill with initial data
            var setVrequest = indexedDB.db.setVersion(dbVersionidb);
            setVrequest.onfailure = indexedDB.onerror;
            setVrequest.onsuccess = function (e) {
                //console.log("idb setvrequest success");
                if (indexedDB.db.objectStoreNames.contains("useragent")) {
                    indexedDB.db.deleteObjectStore("useragent");
                }
                var objectStore = indexedDB.db.createObjectStore("useragent", {keyPath:"name"});
                objectStore.createIndex("name", "name", { unique:true });
                for (i in baseData) {
                    objectStore.add(baseData[i]);
                }
            };
        } else {
            // always update the ua, chrome may have been upgraded
            var trans = indexedDB.db.transaction(["useragent"], IDBTransaction.READ_WRITE);
            var objectStore = trans.objectStore("useragent");
            var defaultNavigatorUa =  {name:defaultUaName, string:navigator.userAgent, description:"default"};
            var insertDefault = objectStore.put(defaultNavigatorUa);
            insertDefault.onsuccess = function (e) {
                BG.log("idb default ua successfully written with:" + defaultNavigatorUa.string);
            };
        }
    };
    request.onError = function (event) {
        console.log("idb error:" + event);
    };
}

indexedDB.importUserAgents = function (useragents) {
    var db = indexedDB.db;
    var trans = db.transaction(["useragent"], IDBTransaction.READ_WRITE);
    var objectStore = trans.objectStore("useragent");
    var ua = JSON.parse(useragents);
    for (i in ua) {
        var data = ua[i];
        //console.log("idb adding data:" + data);
        var request = objectStore.put(data);
        request.onsuccess = function (e) {
            //console.log("success !" + e);
        };
        request.onerror = function (e) {
            //console.log("error !" + e);
        };
    }
};

indexedDB.getAllUserAgents = function (callback, onsuccess) {
    //console.log("idb getAllUserAgents");
    var db = indexedDB.db;
    var trans = db.transaction(["useragent"], IDBTransaction.READ_ONLY);
    var objectStore = trans.objectStore("useragent");
    objectStore.openCursor().onsuccess = function (event) {
        //console.log("idb cursor success");
        var cursor = event.target.result;
        if (cursor) {
            //console.log("idb cursor " + cursor.key + " is " + cursor.value.name);
            callback(cursor);
            cursor.continue();
        }
        else {
            onsuccess();
        }
    };
};

indexedDB.addUserAgent = function (useragent, onsuccess) {
    var db = indexedDB.db;
    var trans = db.transaction(["useragent"], IDBTransaction.READ_WRITE);
    var objectStore = trans.objectStore("useragent");
    var request = objectStore.put(useragent);
    request.onsuccess = function (e) {
        onsuccess();
    }
};

indexedDB.loadUserAgent = function (key, onsuccess) {
    var db = indexedDB.db;
    var trans = db.transaction(["useragent"], IDBTransaction.READ_ONLY);
    var objectStore = trans.objectStore("useragent");
    var request = objectStore.get(key);
    request.onsuccess = function (e) {
        onsuccess(request.result);
    }
};

indexedDB.updateUserAgent = function (key, useragent, onsuccess) {
    var db = indexedDB.db;
    var trans = db.transaction(["useragent"], IDBTransaction.READ_WRITE);
    var objectStore = trans.objectStore("useragent");
    var del = objectStore.delete(key);
    del.onsuccess = function (e) {
        var create = objectStore.put(useragent);
        create.onsuccess = function (e) {
            onsuccess();
        }
    }
};

indexedDB.deleteUserAgent = function (key, onsuccess) {
    var db = indexedDB.db;
    var trans = db.transaction(["useragent"], IDBTransaction.READ_WRITE);
    var objectStore = trans.objectStore("useragent");
    var request = objectStore.delete(key);
    request.onsuccess = function (e) {
        onsuccess();
    }
};

// db
function checkDb() {
    openIDB();
}





