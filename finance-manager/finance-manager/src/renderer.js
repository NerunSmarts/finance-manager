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
import fmlogo from './icons/fmlogo.svg';

import  Chart  from 'chart.js/auto';
const { ipcRenderer } = require('electron')

var currentPageIndex = 0;
var pageList = ['dashboard-pg', 'addincome-pg', 'addexpenses-pg', "investments-pg", "settings-pg"]; // final will be ['addincome-pg', 'addexpenses-pg', 'dashboard-pg', 'investments-pg', 'settings-pg']

// inter-process communication test, will fix when we need data from the database.
ipcRenderer.on('init-sync', (event, args) => {
  console.log(args)
});
  ipcRenderer.send('init-sync', 'connected to renderer!');

// Set up the navigation bar
document.getElementById('dashButton').innerHTML = `<img src="${dashIcon}" class="nav-icon" id = "dashIconO" onclick = "this.dashButtonF()"></img><a>Dashboard</a>`;
document.getElementById('incomeButton').innerHTML = `<img src="${incomeIcon}" class="nav-icon" id = "incomeIconO" onclick = "this.incomeButtonF()"></img><a>Income</a>`;
document.getElementById('invButton').innerHTML = `<img src="${investIcon}" class="nav-icon" id = "investIconO" onclick = "this.invButtonF()"></img><a>Investments</a>`;
document.getElementById('expButton').innerHTML = `<img src="${expenseIcon}" class="nav-icon" id = "expenseIconO" onclick = "this.expButtonF()"></img><a>Expenses</a>`;
document.getElementById('settingsButton').innerHTML = `<img src="${settingsIcon}" class="nav-icon" id = "settingsIconO" onclick = "this.settingsButtonF()"></img><a>Settings</a>`;
document.getElementById('fmlogodisplay').innerHTML = `<img src="${fmlogo}" class="fm-logo" id = "fmlogoimg"></src>`;

//initialize a page to display
for (let i in pageList) {
    document.getElementById(pageList[i]).style.display = 'none';
}
document.getElementById('dashboard-pg').style.display = 'block';

ipcRenderer.send('db-incomerecent-request', 'get most recent income');
let recentIncomeData = ipcRenderer.on('db-incomerecent-reply', (event, args) => {
    //blank for now
});
ipcRenderer.send('db-expenserecent-request', 'get expenses');
let recentExpenseData = ipcRenderer.on('db-expenserecent-reply', (event, args) => {
    
});
ipcRenderer.send('db-investmentrecent-request', 'get investments');
let recentInvestmentData = ipcRenderer.on('db-investmentrecent-reply', (event, args) => {
    
});
ipcRenderer.send('db-settingsrequest', 'get settings');
let settingsData = ipcRenderer.on('db-settingsreply', (event, args) => {

});

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
    currentPageIndex = 2;  //temporarily set to 1-1 while waiting for pages
    switchOnClick();
}
document.getElementById('expenseIconO').expButtonF = () => {
    currentPageIndex = 2;
    switchOnClick();
}
document.getElementById('incomeButton').incomeButtonF = () => {
    currentPageIndex = 1;
    switchOnClick();
}
document.getElementById('incomeIconO').incomeButtonF = () => {
    currentPageIndex = 1;
    switchOnClick();
}
document.getElementById('dashButton').dashButtonF = () => {
    currentPageIndex = 0;
    switchOnClick();
}
document.getElementById('dashIconO').dashButtonF = () => {
    currentPageIndex = 0;
    switchOnClick();
}
document.getElementById('settingsButton').settingsButtonF = () => {
    currentPageIndex = 4;
    switchOnClick();
}
document.getElementById('settingsIconO').settingsButtonF = () => {
    currentPageIndex = 4;
    switchOnClick();
}
document.getElementById('invButton').invButtonF = () => {
    currentPageIndex = 3;
    switchOnClick();
}
document.getElementById('investIconO').invButtonF = () => {
    currentPageIndex = 3;
    switchOnClick();
}


