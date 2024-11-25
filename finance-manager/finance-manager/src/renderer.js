/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import dashIcon from './icons/bulb-sharp.svg';
import incomeIcon from './icons/cash-sharp.svg';
import investIcon from './icons/stats-chart-sharp.svg';
import expenseIcon from './icons/trending-down-sharp.svg';
import settingsIcon from './icons/settings-sharp.svg';

import  Chart  from 'chart.js/auto';
const { ipcRenderer } = require('electron')

var currentPageIndex = 0;
var pageList = ['addincome-pg', 'addexpenses-pg']; // final will be ['addincome-pg', 'addexpenses-pg', 'dashboard-pg', 'investments-pg', 'settings-pg']

// inter-process communication test, will fix when we need data from the database.
ipcRenderer.on('init-sync', (event, args) => {
  console.log(args)
});

// Set up the navigation bar
document.getElementById('dashButton').innerHTML = `<object data="${dashIcon}" class="nav-icon" id = "dashIconO"></object><a>Dashboard</a>`;
document.getElementById('incomeButton').innerHTML = `<object data="${incomeIcon}" class="nav-icon" id = "incomeIconO" onclick = "this.incomeIButtonF()"></object><a>Income</a>`;
document.getElementById('invButton').innerHTML = `<object data="${investIcon}" class="nav-icon" id = "investIconO"></object><a>Investments</a>`;
document.getElementById('expButton').innerHTML = `<object data="${expenseIcon}" class="nav-icon" id = "expenseIconO" onclick = "this.expIButtonF()"></object><a>Expenses</a>`;
document.getElementById('settingsButton').innerHTML = `<object data="${settingsIcon}" class="nav-icon" id = "settingsIconO"></object><a>Settings</a>`;

//initialize a page to display
for (let i in pageList) {
    document.getElementById(pageList[i]).style.display = 'none';
}
document.getElementById('addincome-pg').style.display = 'block'; // default page for now

// Graphing code
(async function() {
    const data = [    //temporary until we have a method to fetch data from the database
      { year: 2010, count: 10 },
      { year: 2011, count: 20 },
      { year: 2012, count: 15 },
      { year: 2013, count: 25 },
      { year: 2014, count: 22 },
      { year: 2015, count: 30 },
      { year: 2016, count: 28 },
    ];
  
    new Chart(      // temporary chart visualization until we can get IPC working
      document.getElementById('incomeChart'),
      {
        type: 'bar',
        data: {
          labels: data.map(row => row.year),
          datasets: [
            {
              label: 'Acquisitions by year',
              data: data.map(row => row.count)
            }
          ]
        }
      }
    );
    
  })();

console.log('👋 This message is being logged by "renderer.js", included via webpack');

// page switching functionality
function switchOnClick() {
    for (let i in pageList) {
        document.getElementById(pageList[i]).style.display = 'none';
    }
    document.getElementById(pageList[currentPageIndex]).style.display = 'block';
}
document.getElementById('expButton').expButtonF = () => {
    currentPageIndex = 1 - 1;  //temporarily set to 1-1 while waiting for pages
    switchOnClick();
}
document.getElementById('expenseIconO').expIButtonF = () => {
    currentPageIndex = 1 - 1;
    switchOnClick();
}
document.getElementById('incomeButton').incomeButtonF = () => {
    currentPageIndex = 2 - 1;
    switchOnClick();
}
document.getElementById('incomeIconO').incomeIButtonF = () => {
    currentPageIndex = 2 - 1;
    switchOnClick();
}
document.getElementById('dashButton').addEventListener('click', () => {
    console.log('dash clicked');
});

