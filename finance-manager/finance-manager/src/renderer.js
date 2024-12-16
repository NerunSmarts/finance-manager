/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
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
Chart.defaults.color = 'white';


var currentPageIndex = 0;
var pageList = ['dashboard-pg', 'addincome-pg', 'addexpenses-pg', "investments-pg", "settings-pg"]; // final will be ['addincome-pg', 'addexpenses-pg', 'dashboard-pg', 'investments-pg', 'settings-pg']

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

function calculateTimesToGet(range) {
    let currentTime = Math.floor(Date.now() / 1000);
    switch (range) {
        case '1 month':
          let oneMonthAgo = currentTime - 2592000;
          return oneMonthAgo;
        case '3 months':
          let threeMonthsAgo = currentTime - 7776000;
          return threeMonthsAgo;
        case '6 months':
          let sixMonthsAgo = currentTime - 15552000;
          return sixMonthsAgo;
        case '1 year':
          let oneYearAgo = currentTime - 31536000;
          return oneYearAgo;
        case '2 years':
          let twoYearsAgo = currentTime - 63072000;
          return twoYearsAgo;
        case '5 years':
          let fiveYearsAgo = currentTime - 157680000;
          return fiveYearsAgo;
        default:
          console.error('Invalid range: ' + range);
          return currentTime - 2592000;
    }
} 

function calculateMonthsSinceTimestamp(timestamp) {
  let months = [];
  let currentTime = new Date();
  let startDate = new Date(timestamp * 1000); // Convert timestamp to milliseconds

  while (startDate <= currentTime) {
      let month = startDate.toLocaleString('default', { month: 'long' });
      let startTimestamp = Math.floor(startDate.getTime() / 1000); // Convert to seconds
      let endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(1); // Set to the first day of the next month
      endDate.setHours(0, 0, 0, -1); // Set to the last millisecond of the previous day
      let endTimestamp = Math.floor(endDate.getTime() / 1000); // Convert to seconds

      months.push({
          month: month,
          startTimestamp: startTimestamp,
          endTimestamp: endTimestamp
      });

      startDate.setMonth(startDate.getMonth() + 1);
      startDate.setDate(1); // Ensure the start date is set to the first day of the month
  }

  return months;
}

function rebuildArrayForDashChart(expenseData, incomeData, months) {
  let monthlyData = months.map(month => ({
    month: month.month,
    gains: 0,
    losses: 0
  }));
  console.log(expenseData);
  for (let income in incomeData) {
    let incomeDate = new Date(incomeData[income].date * 1000);
    let incomeMonth = incomeDate.toLocaleString('default', { month: 'long' });
    let monthData = monthlyData.find(month => month.month === incomeMonth);
    if (monthData) {
      monthData.gains += incomeData[income].amount;
    }
  }

  for (let expense in expenseData) {
    let expenseDate = new Date(expenseData[expense].date * 1000);
    let expenseMonth = expenseDate.toLocaleString('default', { month: 'long' });
    let monthData = monthlyData.find(month => month.month === expenseMonth);
    if (monthData) {
      monthData.losses -= expenseData[expense].amount;
    }
  }
  console.log(monthlyData);
  return monthlyData;
}

function rebuildArrayForChart(data, months) {
  let monthlyData = months.map(month => ({
    month: month.month,
    amount: 0
  }));

  for (let item in data) {
    let itemDate = new Date(data[item].date * 1000);
    let itemMonth = itemDate.toLocaleString('default', { month: 'long' });
    let monthData = monthlyData.find(month => month.month === itemMonth);
    if (monthData) {
      monthData.amount += data[item].amount;
    }
  }

  return monthlyData;
}

// Graphing code
(async function() {
  let incomeRange, expenseRange, investmentRange;

  // Request settings data
  ipcRenderer.send('db-settings-request', 'get all');
  const settingsData = await new Promise((resolve) => {
      ipcRenderer.on('db-settings-reply', (event, args) => {
          incomeRange = args.find(setting => setting.name === 'incomeChartHLength').value;
          expenseRange = args.find(setting => setting.name === 'expenseChartHLength').value;
          investmentRange = args.find(setting => setting.name === 'investmentChartHLength').value;
          resolve(args);
      });
  });

  console.log(settingsData);
  document.getElementById('incomeChartLengthIn').value = incomeRange;
  document.getElementById('expensesChartLengthIn').value = expenseRange;
  console.log(incomeRange, expenseRange, investmentRange);

  // Request recent data
  const recentIncomeData = new Promise((resolve) => {
      ipcRenderer.send('db-incomerecent-request', calculateTimesToGet(incomeRange));
      ipcRenderer.on('db-incomerecent-reply', (event, args) => {
          console.log(args);
          resolve(args);
      });
  });

  const recentExpenseData = new Promise((resolve) => {
      ipcRenderer.send('db-expenserecent-request', calculateTimesToGet(expenseRange));
      ipcRenderer.on('db-expenserecent-reply', (event, args) => {
          console.log(args);
          resolve(args);
      });
  });

  const recentInvestmentData = new Promise((resolve) => {
      ipcRenderer.send('db-investmentrecent-request', calculateTimesToGet(investmentRange));
      ipcRenderer.on('db-investmentrecent-reply', (event, args) => {
          console.log(args);
          resolve(args);
      });
  });

  // Wait for all data to be received
  const [incomeData, expenseData, investmentData] = await Promise.all([recentIncomeData, recentExpenseData, recentInvestmentData]);

  console.log('All data received');
  let oldestTimestamp = Math.min(calculateTimesToGet(incomeRange), calculateTimesToGet(expenseRange), calculateTimesToGet(investmentRange));
  let monthsToShow = calculateMonthsSinceTimestamp(oldestTimestamp);
  monthsToShow = monthsToShow.slice(1, monthsToShow.length); // Remove the first month to fix an off by one because i hate myself.
  const monthlyData = rebuildArrayForDashChart(expenseData, incomeData, monthsToShow);
  const incomeDataForChart = rebuildArrayForChart(incomeData, monthsToShow);
  const expenseDataForChart = rebuildArrayForChart(expenseData, monthsToShow);

  // Build the chart
  new Chart(
      document.getElementById('dashboardChart'),
      {
          type: 'bar',
          data: {
              labels: monthlyData.map(row => row.month),
              datasets: [
                  {
                      label: 'Gains',
                      data: monthlyData.map(row => row.gains),
                      backgroundColor: 'rgba(75, 192, 192, 1)'
                  },
                  {
                      label: 'Losses',
                      data: monthlyData.map(row => row.losses),
                      backgroundColor: 'rgba(255, 99, 132, 1)'
                  }
              ]
          },
          options: {
              plugins: {},
              responsive: true,
              scales: {
                  x: {
                      stacked: true
                  },
                  y: {
                      stacked: true
                  }
              }
          }
      }
  );
  new Chart(
    document.getElementById('expenseChart'),
    {
        type: 'line',
        data: {
            labels: expenseDataForChart.map(row => row.month),
            datasets: [
                {
                    label: 'Expenses',
                    data: expenseDataForChart.map(row => row.amount),
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(75, 192, 192, 1)'
                }
            ]
        },
        options: {
            plugins: {},
            responsive: true,
            
            }
      }
  );
  new Chart(
    document.getElementById('expensePageChart'),
    {
        type: 'line',
        data: {
            labels: expenseDataForChart.map(row => row.month),
            datasets: [
                {
                    label: 'Expenses',
                    data: expenseDataForChart.map(row => row.amount),
                    backgroundColor: 'rgba(255, 99, 132, 1)',
                    borderColor: 'rgba(255, 99, 132, 1)'
                }
            ]
        },
        options: {
            plugins: {},
            responsive: true,
            
            }
      }
  );

  new Chart(
    document.getElementById('incomePageChart'),
    {
        type: 'line',
        data: {
            labels: incomeDataForChart.map(row => row.month),
            datasets: [
                {
                    label: 'Income',
                    data: incomeDataForChart.map(row => row.amount),
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(75, 192, 192, 1)'
                }
            ]
        },
        options: {
            plugins: {},
            responsive: true,
            
            }
      }
  );

  new Chart(
    document.getElementById('incomeChart'),
    {
        type: 'line',
        data: {
            labels: incomeDataForChart.map(row => row.month),
            datasets: [
                {
                    label: 'Income',
                    data: incomeDataForChart.map(row => row.amount),
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(75, 192, 192, 1)'
                }
            ]
        },
        options: {
            plugins: {},
            responsive: true,
            
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

function calendarToUnixTime(dateString, timeString) {
    // Split the input date string into parts
    let [month, day, year] = dateString.split('-').map(Number);
    // Create a Date object
    let dateArray = new Date(year, month - 1, day); // Month is zero-based in JavaScript Date (what the hell)
    if (timeString !== '') {
      // Split the input time string into parts
      let [hours, minutes, seconds] = timeString.split(':').map(Number);
      // Set the time in the Date object
      dateArray.setHours(hours, minutes, seconds);
    }
    // Get the Unix timestamp (in seconds, dividing by 1000)
    let unixTime = Math.floor(dateArray.getTime() / 1000);
    if (isNaN(unixTime)) {
      throw new Error('Invalid date or time');
    } else {
      console.log(unixTime);
      return unixTime;
    }
}

document.getElementById('expenseSubmitBtn').submitExpense = () => {
    let error = false;
    let date = 0;
    // get the values from the form
    let name = document.getElementById('expenseNameIn').value;
    let amount = document.getElementById('expenseAmountIn').value;
    let dateIn = document.getElementById('expenseDateIn').value;
    let timeIn = document.getElementById('expenseTimeIn').value;
    let type = document.getElementById('expenseTypeIn').value;

    try {
        date = calendarToUnixTime(dateIn, timeIn);
        amount = parseFloat(amount);
    } catch (e) {
        console.error(e);
        error = true;
    }
    if (error || name === '' || amount === '' || date === 0 || type === '' || isNaN(date) || isNaN(amount)) {
        console.error('Error submitting expense, aborted');
    } else {
        ipcRenderer.send('db-expense-insert', {name, amount, date, type});
        console.log('expense submitted');
        document.getElementById('expenseNameIn').value = '';
        document.getElementById('expenseAmountIn').value = '';
        document.getElementById('expenseDateIn').value = '';
        document.getElementById('expenseTimeIn').value = '';
        document.getElementById('expenseTypeIn').value = 'One time expense';
    }
};
document.getElementById('incomeSubmitBtn').submitIncome = () => {
  let error = false;
  let date = 0;
  // get the values from the form
  let name = document.getElementById('incomeNameIn').value;
  let amount = document.getElementById('incomeAmountIn').value;
  let dateIn = document.getElementById('incomeDateIn').value;
  let timeIn = document.getElementById('incomeTimeIn').value;
  let type = document.getElementById('incomeTypeIn').value;

  try {
      date = calendarToUnixTime(dateIn, timeIn);
      amount = parseFloat(amount);
  } catch (e) {
      console.error(e);
      error = true;
  }
  if (error || name === '' || amount === '' || date === 0 || type === '' || isNaN(date) || isNaN(amount)) {
      console.error('Error submitting income, aborted');
  } else {
      ipcRenderer.send('db-income-insert', {name, amount, date, type});
      console.log('income submitted:', name, amount, date, type);
      document.getElementById('incomeNameIn').value = '';
      document.getElementById('incomeAmountIn').value = '';
      document.getElementById('incomeDateIn').value = '';
      document.getElementById('incomeTimeIn').value = '';
      document.getElementById('incomeTypeIn').value = 'One time income';
  }
};
document.getElementById('investmentSubmitBtn').submitInvestment = () => {
    // get the values from the form
    ipcRenderer.send('db-investment-insert', {ticker, amount, date});
    console.log('investment submitted');
};
document.getElementById('incomeChartLengthSubmit').submitSettings = () => {
    // get the values from the form
    let name = 'incomeChartHLength';
    let value = document.getElementById('incomeChartLengthIn').value;
    ipcRenderer.send('db-setting-update', {name, value});
    console.log('settings submitted');
};
document.getElementById('expensesChartLengthSubmit').submitSettings = () => {
  // get the values from the form
  let name = 'expenseChartHLength';
  let value = document.getElementById('expenseChartLengthIn').value;
  ipcRenderer.send('db-setting-update', {name, value});
  console.log('settings submitted');
};