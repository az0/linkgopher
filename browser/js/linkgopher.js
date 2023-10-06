
document.addEventListener("DOMContentLoaded", function() {
'use strict';
const containerLinks = document.getElementById('links');
const containerDomains = document.getElementById('domains');
const message = document.getElementById('message');
const reBaseURL = /(^\w+:\/\/[^\/]+)|(^[A-Za-z0-9.-]+)\/|(^[A-Za-z0-9.-]+$)/;
const tabId = parseInt(location.search.replace(/.*tabId=(\d+).*/, '$1'));
const filtering = location.search.replace(/.*filtering=(true|false).*/, '$1');
const pattern = filtering === 'true'
  ? window.prompt(chrome.i18n.getMessage('askPattern'))
  : null;
const filteringDomains = location
  .search.replace(/.*filteringDomains=(true|false).*/, '$1') === 'true'
  ? true
  : false;
const onlyDomains = location.search.replace(/.*onlyDomains=(true|false).*/, '$1');

chrome.tabs.sendMessage(tabId, {action: 'extract'}, links => {
  handler(links, pattern, onlyDomains);
});

// Localization.
[
  {id: 'links', messageId: 'links'},
  {id: 'domains', messageId: 'domains'},
  {id: 'message', messageId: 'pleaseWait'}
].forEach(item => {
  const container = document.getElementById(item.id);
  container.dataset.content = chrome.i18n.getMessage(item.messageId);
})

/**
 * @function handler
 * @param links
 * @param {string} pattern -- Pattern for filtering.
 * @param onlyDomains
 */
function handler(links, pattern, onlyDomains) {
  if (chrome.runtime.lastError) {
    return window.alert(chrome.runtime.lastError);
  }

  // To filter links like: javascript:void(0)
  const resLinks = links.filter(link => link.lastIndexOf('://', 10) > 0);
  // Remove duplicate, sorting of links.
  const items = [...(new Set(resLinks))].sort();
  const re = pattern ? new RegExp(pattern, 'g') : null;
  const added = items.filter(link => addNodes(link, containerLinks, re, onlyDomains));

  if (!added.length) {
    return message.dataset.content = chrome.i18n.getMessage('noMatches');
  }
  // Extract base URL from link, remove duplicate, sorting of domains.
  const domains = [...(new Set(added.map(link => getBaseURL(link))))].sort();
  const reDomains = filteringDomains ? re : null;
  domains.forEach(domain => addNodes(domain, containerDomains, reDomains), onlyDomains);
};

/**
 * Add nodes to container.
 *
 * @function addNodes
 * @param url
 * @param {Node} container
 * @param {object|null} re -- Regular Expression pattern.
 * @param onlyDomains
 * @return {boolean} -- Whether link added into document.
 */
function addNodes(url, container, re, onlyDomains) {
  if (re && !url.match(re)) return false;

  if(onlyDomains === 'true' && container === containerLinks) {
    return true;
  }

  const br = document.createElement('br');
  const a = document.createElement('a');
  a.href = url;
  a.innerText = url;
  container.appendChild(a);
  container.appendChild(br);

  return true;
};

/**
 * Get base URL of link.
 *
 * @function getBaseURL
 * @param {string} link
 */
function getBaseURL(link) {
  const result = link.match(reBaseURL);

  if (!result) {
    return null;
  } else if (result[1]) {
    return `${result[1]}/`;
  } else {
    return `http://${result[2] || result[3]}/`;
  }
};

// Adjusting the saveThemePreference function to toggle the "light-mode" class on the html element
function saveThemePreference() {
    const themeSwitch = document.getElementById('theme-switch');
    const htmlElement = document.documentElement;

    if (themeSwitch.checked) {
        localStorage.setItem('linkgopher-theme', 'light');
        htmlElement.classList.add('light-mode');
    } else {
        localStorage.setItem('linkgopher-theme', 'dark');
        htmlElement.classList.remove('light-mode');
    }
}

// Adjusting the loadThemePreference function to set the "light-mode" class on the html element
function loadThemePreference() {
    const themeSwitch = document.getElementById('theme-switch');
    const htmlElement = document.documentElement;
    const userThemePreference = localStorage.getItem('linkgopher-theme');

    if (userThemePreference === 'light') {
        themeSwitch.checked = true;
        htmlElement.classList.add('light-mode');
    } else {
        htmlElement.classList.remove('light-mode');
    }
}

function applyThemeStyles() {
    const themeSwitch = document.getElementById('theme-switch');
    const headerElement = document.querySelector('.header');
    const bodyElement = document.body;
    const linksElement = document.getElementById('links');
    const domainsElement = document.getElementById('domains');
    const linksDivs = document.querySelectorAll('#links div');
    const domainsDivs = document.querySelectorAll('#domains div');
    const footerElement = document.querySelector('.footer');
    const anchorElements = document.querySelectorAll('a');

    if (themeSwitch.checked) {
        // Apply light mode styles
        headerElement.style.backgroundColor = "#ddd";
        bodyElement.style.backgroundColor = "#f5f5f5";
        bodyElement.style.color = "#000";
        linksElement.style.backgroundColor = "#ffffff";
        domainsElement.style.backgroundColor = "#ffffff";

        linksDivs.forEach((div, index) => {
            div.style.backgroundColor = (index % 2 === 0) ? "#e6e6e6" : "#f0f0f0";
        });

        domainsDivs.forEach((div, index) => {
            div.style.backgroundColor = (index % 2 === 0) ? "#e6e6e6" : "#f0f0f0";
        });

        anchorElements.forEach(anchor => {
            anchor.style.color = "#555";
        });

        footerElement.style.backgroundColor = "#ddd";
        footerElement.style.borderTop = "double 2px #555";
    } else {
        // Reset styles to default (dark mode)
        headerElement.style.backgroundColor = "";
        bodyElement.style.backgroundColor = "";
        bodyElement.style.color = "";
        linksElement.style.backgroundColor = "";
        domainsElement.style.backgroundColor = "";

        linksDivs.forEach(div => {
            div.style.backgroundColor = "";
        });

        domainsDivs.forEach(div => {
            div.style.backgroundColor = "";
        });

        anchorElements.forEach(anchor => {
            anchor.style.color = "";
        });

        footerElement.style.backgroundColor = "";
        footerElement.style.borderTop = "";
    }
}

// Call the function initially to set the correct theme on page load
// applyThemeStyles();

document.getElementById('theme-switch').addEventListener('click', applyThemeStyles);

// Function to toggle the theme and switch the logo
function toggleTheme() {
    const bodyElement = document.body;
    const logoElement = document.getElementById('logo-section').querySelector('img');
    const buttonElement = document.querySelector('.toggleButton_MMFG');
    const lightLogo = 'assets/logo-transparent-48.png';
    const darkLogo = 'assets/logo-black-48.png';

    if (bodyElement.classList.contains('light-mode')) {
        bodyElement.classList.remove('light-mode');
        logoElement.src = darkLogo;
        buttonElement.setAttribute('aria-label', 'Switch to light mode');
        buttonElement.setAttribute('title', 'Switch to light mode');
    } else {
        bodyElement.classList.add('light-mode');
        logoElement.src = lightLogo;
        buttonElement.setAttribute('aria-label', 'Switch to dark mode');
        buttonElement.setAttribute('title', 'Switch to dark mode');
    }
} 

// Attach the event listener to the toggle button
const themeToggleButton = document.querySelector('.toggleButton_MMFG');
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
}


document.querySelector(".colorModeToggle").addEventListener("click", function() {
    var element = document.body;
    element.classList.toggle("dark-mode");
})

});
