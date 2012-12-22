

// function copied from  Web Developer by  Chris Pederick
// http://chrispederick.com/work/web-developer/help/
// https://addons.mozilla.org/en-US/firefox/addon/60
function webdeveloper_getDocumentBodyElement(contentDocument)
{
    // If there is a body element
    if(contentDocument.body)
    {
        return contentDocument.body;
    }
    else
    {
        var bodyElementList = contentDocument.getElementsByTagName("body");

        // If there is a body element
        if(bodyElementList.length > 0)
        {
            return bodyElementList[0];
        }
    }

    return contentDocument.documentElement;
}

// Generates a document in a new tab or window
// function adapted from  Web Developer by  Chris Pederick
// http://chrispederick.com/work/web-developer/help/
// https://addons.mozilla.org/en-US/firefox/addon/60
function webdeveloper_generateDocument(url)
{
    var generatedPage = null;
    var request       = new XMLHttpRequest();

    getBrowser().selectedTab = getBrowser().addTab(url);
    generatedPage = window;

    // This must be done to make generated content render
    request.open("get", "about:blank", false);
    request.send(null);

    return generatedPage.content.document;
}


function arrayRemoveDuplicates(a)
{
    a = a.sort();
    var a2 = new Array();
    a2.push(a[0]);
    for (i = 1; i < a.length; i++)
    {   
        if (a[i] != a[i-1])
        {
            a2.push(a[i]);
        }
    }
    return a2;
}


// d = document
// links = array of links
function displayLinks(d, bodyElement, links)
{
    headerElement = d.createElement("h2");
    headerElement.appendChild(d.createTextNode("Links"));
    bodyElement.appendChild(headerElement);

    for (i = 0; i < links.length; i++)
    {   
        linkElement   = d.createElement("a");
        linkElement.setAttribute("href", links[i]);
        linkElement.appendChild(d.createTextNode(links[i]));

        bodyElement.appendChild(d.createElement("br"));
        bodyElement.appendChild(linkElement);
    }

}

function extractLinksGo() {

    // extract the links
    var links = new Array();
    for (i = 0; i < content.document.links.length; i++)
    {   
        links.push(content.document.links[i].toString());
    }

    // open tab
    d =  webdeveloper_generateDocument("");
    d.title = "Extracted Links";
    var bodyElement = webdeveloper_getDocumentBodyElement(d);

    // find embedded links
    var embedded_links = new Array();
    for (i = 0; i < links.length; i++)
    {   
        var link = links[i];
        link = link.replace(/%3[Aa]/g,":");
        link = link.replace(/%2[fF]/g, "\/");
        var re  =  /.(https?:\/\/.*)/g;
        var a = link.match(re);
        if (a !== null && a.length > 0)
        {
            embedded_links.push(a[0].substring(1));
        }
    }
    links = links.concat(embedded_links);

    //  remove duplicates
    links = arrayRemoveDuplicates(links);

    // display links
    displayLinks(d, bodyElement, links);

    // find domains

    var domains = new Array();
    for (i = 0; i < links.length; i++)
    {   
        var link = links[i];
        var re  =  /https?:\/\/([^\/]*)\/?/g;
        var a = link.match(re);
        if (a !== null && a.length > 0)
        {
            domains = domains.concat(a);
        }

    }

    // remove duplicates
    domains = arrayRemoveDuplicates(domains);

    // display domains
    headerElement = d.createElement("h2");
    headerElement.appendChild(d.createTextNode("Domains"));
    bodyElement.appendChild(headerElement);

    for (i = 0; i < domains.length; i++)
    {   
        linkElement   = d.createElement("a");
        linkElement.setAttribute("href", domains[i]);
        linkElement.appendChild(d.createTextNode(domains[i]));

        bodyElement.appendChild(d.createElement("br"));
        bodyElement.appendChild(linkElement);
    }
}

