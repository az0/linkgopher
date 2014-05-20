/*
 *  Link Gopher
 *  Copyright (C) 2008, 2009 Andrew Ziem
 *  http://sites.google.com/site/linkgopher/
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
// function copied from  Web Developer by  Chris Pederick
// http://chrispederick.com/work/web-developer/help/
// https://addons.mozilla.org/en-US/firefox/addon/60
function webdeveloper_getDocumentBodyElement(contentDocument) {
    // If there is a body element
    if (contentDocument.body) {
        return contentDocument.body;
    } else {
        var bodyElementList = contentDocument.getElementsByTagName("body");

        // If there is a body element
        if (bodyElementList.length > 0) {
            return bodyElementList[0];
        }
    }

    return contentDocument.documentElement;
}

// Generates a document in a new tab or window
// function adapted from  Web Developer by  Chris Pederick
// http://chrispederick.com/work/web-developer/help/
// https://addons.mozilla.org/en-US/firefox/addon/60
function webdeveloper_generateDocument(url) {
    var generatedPage = null;
    var request = new XMLHttpRequest();

    getBrowser().selectedTab = getBrowser().addTab(url);
    generatedPage = window;

    // This must be done to make generated content render
    request.open("get", "about:blank", false);
    request.send(null);

    return generatedPage.content.document;
}


function linkgopher_arrayRemoveDuplicates(a) {
    var a = a.sort();
    var a2 = new Array();
    a2.push(a[0]);
    for (i = 1; i < a.length; i++) {
        if (a[i] != a[i - 1]) {
            a2.push(a[i]);
        }
    }
    return a2;
}

// purpose: generate list of links in a given HTML document
//
// parameters
//  doc = document
//  links = array of links
function linkgopher_displayLinks(doc, bodyElement, links) {
    var headerElement = doc.createElement("h2");
    headerElement.appendChild(doc.createTextNode("Links"));
    bodyElement.appendChild(headerElement);

    for (i = 0; i < links.length; i++) {
        var linkElement = doc.createElement("a");
        linkElement.setAttribute("href", links[i]);
        linkElement.appendChild(doc.createTextNode(links[i]));

        bodyElement.appendChild(doc.createElement("br"));
        bodyElement.appendChild(linkElement);
    }

}


// Purpose: The main function to do hard work
//
// Parameters
//   searchstring: blank ("") means no filtering, otherwise look for this string
function extractLinksMain(searchstring) {

    // extract the links
    var links = new Array();
    for (i = 0; i < content.document.links.length; i++) {
        var thisLink = content.document.links[i].toString();
        if ("" == searchstring || thisLink.indexOf(searchstring) > -1)
            links.push(content.document.links[i].toString());
    }

    // open tab
    var doc = webdeveloper_generateDocument("");
    doc.title = "Extracted Links";
    var bodyElement = webdeveloper_getDocumentBodyElement(doc);

    // find embedded links
    var embedded_links = new Array();
    for (i = 0; i < links.length; i++) {
        var link = links[i];
        link = link.replace(/%3[Aa]/g, ":");
        link = link.replace(/%2[fF]/g, "\/");
        var re = /.(https?:\/\/.*)/g;
        var a = link.match(re);
        if (a !== null && a.length > 0) {
            embedded_links.push(a[0].substring(1));
        }
    }
    var links = links.concat(embedded_links);

    //  remove duplicates
    var links = linkgopher_arrayRemoveDuplicates(links);

    // display links
    linkgopher_displayLinks(doc, bodyElement, links);

    // find domains
    var domains = new Array();
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var re = /https?:\/\/([^\/]*)\/?/g;
        var a = link.match(re);
        if (a !== null && a.length > 0) {
            domains = domains.concat(a);
        }
    }

    // remove duplicates
    var domains = linkgopher_arrayRemoveDuplicates(domains);

    // display domains
    var headerElement = doc.createElement("h2");
    headerElement.appendChild(doc.createTextNode("Domains"));
    bodyElement.appendChild(headerElement);

    for (var i = 0; i < domains.length; i++) {
        var linkElement = doc.createElement("a");
        linkElement.setAttribute("href", domains[i]);
        linkElement.appendChild(doc.createTextNode(domains[i]));


        bodyElement.appendChild(doc.createElement("br"));
        bodyElement.appendChild(linkElement);
    }
}


// The common function called from XUL.
function linkgopher_callbackExtractAllLinks() {
    extractLinksMain("");

}


// Called from XUL.  Allows filtering.
// The filtering is based on code from Kevin Pease.
function linkgopher_callbackExtractLinksByFilter() {
    var searchstring = prompt('Enter a string of characters to search for within the link.  Links without this string will be ignored.');

    if (!searchstring || 0 == searchstring.length) {
        return;
    }

    extractLinksMain(searchstring);

}



// Called from XUL to show usage instructions and support info.
function linkgopher_callbackAbout() {
    // Add tab, then make active
    gBrowser.selectedTab = gBrowser.addTab("http://sites.google.com/site/linkgopher/");

}
