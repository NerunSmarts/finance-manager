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
ipcRenderer.setMaxListeners(15);

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
function calculateWeeksSinceTimestamp (timestamp) {
    let weeks = [];
    let currentTime = new Date();
    let startDate = new Date(timestamp * 1000); // Convert timestamp to milliseconds

    while (startDate <= currentTime) {
        let week = startDate.toLocaleString('default', { month: 'short', day: 'numeric' });
        let startTimestamp = Math.floor(startDate.getTime() / 1000); // Convert to seconds
        let endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        endDate.setHours(0, 0, 0, -1); // Set to the last millisecond of the previous day
        let endTimestamp = Math.floor(endDate.getTime() / 1000); // Convert to seconds

        weeks.push({
            week: week,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp
        });

        startDate.setDate(startDate.getDate() + 7);
    }
    return weeks;
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
function calculateYearsSinceTimestamp (timestamp) {
    let years = [];
    let currentTime = new Date();
    let startDate = new Date(timestamp * 1000); // Convert timestamp to milliseconds

    while (startDate <= currentTime) {
        let year = startDate.toLocaleString('default', { year: 'numeric' });
        let startTimestamp = Math.floor(startDate.getTime() / 1000); // Convert to seconds
        let endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        endDate.setDate(1); // Set to the first day of the next month
        endDate.setHours(0, 0, 0, -1); // Set to the last millisecond of the previous day
        let endTimestamp = Math.floor(endDate.getTime() / 1000); // Convert to seconds

        years.push({
            year: year,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp
        });

        startDate.setFullYear(startDate.getFullYear() + 1);
        startDate.setDate(1); // Ensure the start date is set to the first day of the month
    }

    return years;
}
function rebuildArrayForWeekDashChart(expenseData, incomeData, weeks) {
  let weeklyData = weeks.map(week => ({
    week: week.week,
    gains: 0,
    losses: 0
  }));

  for (let income of incomeData) {
    let incomeDate = new Date(income.date * 1000);
    for (let week of weeks) {
      if (income.date >= week.startTimestamp && income.date <= week.endTimestamp) {
        let weekData = weeklyData.find(w => w.week === week.week);
        if (weekData) {
          weekData.gains += income.amount;
        }
        break;
      }
    }
  }

  for (let expense of expenseData) {
    let expenseDate = new Date(expense.date * 1000);
    for (let week of weeks) {
      if (expense.date >= week.startTimestamp && expense.date <= week.endTimestamp) {
        let weekData = weeklyData.find(w => w.week === week.week);
        if (weekData) {
          weekData.losses -= expense.amount;
        }
        break;
      }
    }
  }

  return weeklyData;
}

function rebuildArrayForMonthDashChart(expenseData, incomeData, months) {
  let monthlyData = months.map(month => ({
    month: month.month,
    gains: 0,
    losses: 0
  }));
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
  return monthlyData;
}

function rebuildArrayForYearDashChart (expenseData, incomeData, years) {
  let yearlyData = years.map(year => ({
    year: year.year,
    gains: 0,
    losses: 0
  }));

  for (let income in incomeData) {
    let incomeDate = new Date(incomeData[income].date * 1000);
    let incomeYear = incomeDate.toLocaleString('default', { year: 'numeric' });
    let yearData = yearlyData.find(year => year.year === incomeYear);
    if (yearData) {
      yearData.gains += incomeData[income].amount;
    }
  }

  for (let expense in expenseData) {
    let expenseDate = new Date(expenseData[expense].date * 1000);
    let expenseYear = expenseDate.toLocaleString('default', { year: 'numeric' });
    let yearData = yearlyData.find(year => year.year === expenseYear);
    if (yearData) {
      yearData.losses -= expenseData[expense].amount;
    }
  }

  return yearlyData;
}

function rebuildArrayForWeekChart(data, weeks) {
  let weeklyData = weeks.map(week => ({
    week: week.week,
    amount: 0
  }));

  for (let item of data) {
    let itemDate = new Date(item.date * 1000);
    for (let week of weeks) {
      if (item.date >= week.startTimestamp && item.date <= week.endTimestamp) {
        let weekData = weeklyData.find(w => w.week === week.week);
        if (weekData) {
          weekData.amount += item.amount;
        }
        break;
      }
    }
  }

  return weeklyData;
}
function rebuildArrayForMonthChart(data, months) {
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

function rebuildArrayForYearChart(data, years) {
  let yearlyData = years.map(year => ({
    year: year.year,
    amount: 0
  }));

  for (let item in data) {
    let itemDate = new Date(data[item].date * 1000);
    let itemYear = itemDate.toLocaleString('default', { year: 'numeric' });
    let yearData = yearlyData.find(year => year.year === itemYear);
    if (yearData) {
      yearData.amount += data[item].amount;
    }
  }

  return yearlyData;
}
function calculateTimesSinceOldestTimestamp(stepSize, data) {
  let oldestTimestamp = Math.min(...data.map(item => item.date));
  let count = Math.floor((Date.now() / 1000 - oldestTimestamp) / stepSize);
  return count;
}

function findAverageForTime(data, range, stepSize) {
  let total = 0;
  let count = calculateTimesSinceOldestTimestamp(stepSize, data);
  for (let item in data) {
    if (data[item].date >= range) {
      total += data[item].amount;
    }
  }
  if (count === 0) {
    count = 1;
  }
  return Math.ceil((total / count) * 100) / 100;
}

function generateListHTML(data, idStringPrefix) {
  let listHTML = '';
  for (let item in data) {
    let date = new Date(data[item].date * 1000);
    let dateString = date.toLocaleString();
    listHTML += `<option id="${idStringPrefix+item}">${data[item].name} - $${data[item].amount} - ${dateString}</option>`;
  }
  return listHTML;
}
let dashChart, expenseChart, incomeChart, expensePageChart, incomePageChart;
let labels, incomeDataForChart, expenseDataForChart, combinedData;
let ready = false;
// Graphing code
async function updateAll() {
  let incomeRange, expenseRange, investmentRange;

  // Request settings data
  ipcRenderer.send('db-settings-request', 'get all');
  let settingsData = await new Promise((resolve) => {
      ipcRenderer.on('db-settings-reply', (event, args) => {
          incomeRange = args.find(setting => setting.name === 'incomeChartHLength').value;
          expenseRange = args.find(setting => setting.name === 'expenseChartHLength').value;
          investmentRange = args.find(setting => setting.name === 'investmentChartHLength').value;
          resolve(args);
      });
  });

  document.getElementById('incomeChartLengthIn').value = incomeRange;

  // Request recent data
  let recentIncomeData = new Promise((resolve) => {
      ipcRenderer.send('db-incomerecent-request', calculateTimesToGet(incomeRange));
      ipcRenderer.on('db-incomerecent-reply', (event, args) => {
          resolve(args);
      });
  });

  let recentExpenseData = new Promise((resolve) => {
      ipcRenderer.send('db-expenserecent-request', calculateTimesToGet(incomeRange));
      ipcRenderer.on('db-expenserecent-reply', (event, args) => {
          resolve(args);
      });
  });

  let recentInvestmentData = new Promise((resolve) => {
      ipcRenderer.send('db-investmentrecent-request', calculateTimesToGet(incomeRange));
      ipcRenderer.on('db-investmentrecent-reply', (event, args) => {
          resolve(args);
      });
  });

  let allIncomeData = new Promise((resolve) => {
      ipcRenderer.send('db-incomeall-request', 'get all');
      ipcRenderer.on('db-incomeall-reply', (event, args) => {
        resolve(args);
      });
  });

  let allExpenseData = new Promise((resolve) => {
      ipcRenderer.send('db-expenseall-request', 'get all');
      ipcRenderer.on('db-expenseall-reply', (event, args) => {
        resolve(args);
      });
  });

  // Wait for all data to be received
  let [incomeData, expenseData, investmentData, fullIncomeData, fullExpenseData] = await Promise.all([recentIncomeData, recentExpenseData, recentInvestmentData, allIncomeData, allExpenseData]);

  console.log('All data received');
  let oldestTimestamp = Math.min(calculateTimesToGet(incomeRange), calculateTimesToGet(expenseRange), calculateTimesToGet(investmentRange));
  let weeksToShow = calculateWeeksSinceTimestamp(oldestTimestamp);
  let monthsToShow = calculateMonthsSinceTimestamp(oldestTimestamp);
  let yearsToShow = calculateYearsSinceTimestamp(oldestTimestamp);
  weeksToShow = weeksToShow.slice(1, weeksToShow.length); // Remove the first week to fix an off by one because i hate myself.
  monthsToShow = monthsToShow.slice(1, monthsToShow.length); // Remove the first month to fix an off by one
  yearsToShow = yearsToShow.slice(1, yearsToShow.length); // Remove the first year to fix an off by one

  if (incomeRange === '3 months' || incomeRange === '6 months' || incomeRange === '1 year') {
    incomeDataForChart = rebuildArrayForMonthChart(incomeData, monthsToShow);
    expenseDataForChart = rebuildArrayForMonthChart(expenseData, monthsToShow);
    combinedData = rebuildArrayForMonthDashChart(expenseData, incomeData, monthsToShow);
    labels = monthsToShow.map(row => row.month);
  } else if (incomeRange === '2 years' || incomeRange === '5 years') {
    incomeDataForChart = rebuildArrayForYearChart(incomeData, yearsToShow);
    expenseDataForChart = rebuildArrayForYearChart(expenseData, yearsToShow);
    combinedData = rebuildArrayForYearDashChart(expenseData, incomeData, yearsToShow);
    labels = yearsToShow.map(row => row.year);
  } else if (incomeRange === '1 month') {
    incomeDataForChart = rebuildArrayForWeekChart(incomeData, weeksToShow);
    expenseDataForChart = rebuildArrayForWeekChart(expenseData, weeksToShow);
    combinedData = rebuildArrayForWeekDashChart(expenseData, incomeData, weeksToShow);
    labels = weeksToShow.map(row => row.week);
  }
  ready = true;
  document.getElementById('incPY').innerHTML = 'Income (last 365 days): ' + findAverageForTime(fullIncomeData, (Date.now() / 1000) - 31536000, 31536000);
  document.getElementById('incPM').innerHTML = 'Income per month: ' + findAverageForTime(fullIncomeData, (Date.now() / 1000) - (2592000 * 5), 2592000);
  document.getElementById('incPW').innerHTML = 'Income per week: ' + findAverageForTime(fullIncomeData, (Date.now() / 1000) - (604800 * 5), 604800);
  document.getElementById('incPD').innerHTML = 'Income per day: ' + findAverageForTime(fullIncomeData, (Date.now() / 1000) - (86400 * 30), 86400);
  document.getElementById('incomeList').innerHTML = generateListHTML(fullIncomeData, 'incomeList');
  document.getElementById('expensesList').innerHTML = generateListHTML(fullExpenseData, 'expensesList');
  try {
  dashChart.data.labels = labels;
  dashChart.data.datasets[0].data = combinedData.map(row => row.gains);
  dashChart.data.datasets[1].data = combinedData.map(row => row.losses);
  expenseChart.data.labels = labels;
  expenseChart.data.datasets[0].data = expenseDataForChart.map(row => row.amount);
  incomeChart.data.labels = labels;
  incomeChart.data.datasets[0].data = incomeDataForChart.map(row => row.amount);
  expensePageChart.data.labels = labels;
  expensePageChart.data.datasets[0].data = expenseDataForChart.map(row => row.amount);
  incomePageChart.data.labels = labels;
  incomePageChart.data.datasets[0].data = incomeDataForChart.map(row => row.amount);
  dashChart.update();
  expenseChart.update();
  incomeChart.update();
  expensePageChart.update();
  incomePageChart.update();
  } catch (e) {
    console.error(e);
    console.log('Charts not ready');
  }
};
updateAll().then(() => {
initGraphs();
updateAll();
});


async function initGraphs() {
  if (ready) {
  // Build the chart
dashChart = new Chart(
      document.getElementById('dashboardChart'),
      {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [
                  {
                      label: 'Income',
                      data: combinedData.map(row => row.gains),
                      backgroundColor: 'rgba(75, 192, 192, 1)'
                  },
                  {
                      label: 'Spendings',
                      data: combinedData.map(row => row.losses),
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
expenseChart = new Chart(
    document.getElementById('expenseChart'),
    {
        type: 'line',
        data: {
            labels: labels,
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
expensePageChart = new Chart(
    document.getElementById('expensePageChart'),
    {
        type: 'line',
        data: {
            labels: labels,
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

incomePageChart = new Chart(
    document.getElementById('incomePageChart'),
    {
        type: 'line',
        data: {
            labels: labels,
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

incomeChart = new Chart(
    document.getElementById('incomeChart'),
    {
        type: 'line',
        data: {
            labels: labels,
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
}
return 
  };

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
    updateAll();
}
document.getElementById('expenseIconO').expButtonF = () => {
    currentPageIndex = 2;
    switchOnClick();
    updateAll();
}
document.getElementById('incomeButton').incomeButtonF = () => {
    currentPageIndex = 1;
    switchOnClick();
    updateAll();
}
document.getElementById('incomeIconO').incomeButtonF = () => {
    currentPageIndex = 1;
    switchOnClick();
    updateAll();
}
document.getElementById('dashButton').dashButtonF = () => {
    currentPageIndex = 0;
    switchOnClick();
    updateAll();
}
document.getElementById('dashIconO').dashButtonF = () => {
    currentPageIndex = 0;
    switchOnClick();
    updateAll();
}
document.getElementById('settingsButton').settingsButtonF = () => {
    currentPageIndex = 4;
    switchOnClick();
    updateAll();
}
document.getElementById('settingsIconO').settingsButtonF = () => {
    currentPageIndex = 4;
    switchOnClick();
    updateAll();
}
document.getElementById('invButton').invButtonF = () => {
    currentPageIndex = 3;
    switchOnClick();
    updateAll();
}
document.getElementById('investIconO').invButtonF = () => {
    currentPageIndex = 3;
    switchOnClick();
    updateAll();
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
    updateAll();
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
  updateAll();
};
document.getElementById('investmentSubmitBtn').submitInvestment = () => {
    // get the values from the form
    ipcRenderer.send('db-investment-insert', {ticker, amount, date});
    console.log('investment submitted');
    updateAll();
};
document.getElementById('incomeChartLengthSubmit').submitSettings = () => {
    // get the values from the form
    let name = 'incomeChartHLength';
    let value = document.getElementById('incomeChartLengthIn').value;
    ipcRenderer.send('db-setting-update', {name, value});
    console.log('settings submitted');
    updateAll();
};
let incomeClicked = false;
let expenseClicked = false;

document.getElementById('deleteIncomeBtn').deleteSelectedIncome = () => {
    if (incomeClicked) {
        let id = document.getElementById('incomeList').selectedIndex;
        id++; console.log(id);
        ipcRenderer.send('db-income-delete', id);
        console.log('income deleted');
        ipcRenderer.on('db-income-delete-reply', (event, args) => {
          incomeClicked = false;
          document.getElementById('deleteIncomeBtn').innerHTML = 'Delete income';
          document.getElementById('deleteIncomeBtn').style.backgroundColor = '#04AA6D';
          updateAll();
        });
    } else {
        incomeClicked = true;
        document.getElementById('deleteIncomeBtn').innerHTML = 'Confirm';
        document.getElementById('deleteIncomeBtn').style.backgroundColor = 'red';
    }
};
document.getElementById('deleteExpenseBtn').deleteSelectedExpense = () => {
    if (expenseClicked) {
      let id = document.getElementById('expensesList').selectedIndex;
      id++; console.log(id);
        ipcRenderer.send('db-expense-delete', id);
        console.log('expense deleted');
        ipcRenderer.on('db-expense-delete-reply', (event, args) => {
          expenseClicked = false;
          document.getElementById('deleteExpenseBtn').innerHTML = 'Delete expense';
          document.getElementById('deleteExpenseBtn').style.backgroundColor = '#04AA6D';
          updateAll();
        });
    } else {
        expenseClicked = true;
        document.getElementById('deleteExpenseBtn').innerHTML = 'Confirm';
        document.getElementById('deleteExpenseBtn').style.backgroundColor = 'red';
    }
};