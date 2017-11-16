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

function dedupe(a) {
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

function extractLinksMain(searchstring) {

    // extract the links
    var links = new Array();
    for (i = 0; i < document.links.length; i++) {
        var thisLink = document.links[i].toString();
        if ("" == searchstring || thisLink.indexOf(searchstring) > -1)
            links.push(document.links[i].toString());
    }

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

		var links = dedupe(links);

				var heading = document.createElement("h1");
				heading.appendChild(document.createTextNode("Extracted links"));
				document.body.appendChild(heading);

    for (i = 0; i < links.length; i++) {
        var linkElement = document.createElement("a");
				var lineBreak = document.createElement("br");

        linkElement.setAttribute("href", links[i]);
        linkElement.appendChild(document.createTextNode(links[i]));
				
			  document.body.appendChild(linkElement);
				document.body.appendChild(lineBreak);
    }

}

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "extractAll") {
						extractLinksMain("");
    } else if (message.command === "extractByFilter") {
						extractLinksMain(message.filterText);
    }
  });
