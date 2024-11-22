const { app } = require('electron');
const path = require('node:path');
const fs = require('fs');
const SQLjs = require('sql.js');

var dbPath = app.getPath('userData');
var dbExists = false;

process.parentPort.on('message', (e) => {
    const [port] = e.ports;
    port.postMessage({ message: 'connect' });
    port.start();
    port.on('message', (message) => {
        console.log("connected to database handler!");
    });
    // now we can do stuff
});

/*
if (fs.existsSync(path.join(dbPath, 'financeTable.db'))) {
    dbExists = true;
} else {
    dbExists = false;
};*/

/*
initSqlJs(config).then(function(SQL){
    //Create the database
    const db = new SQL.Database();
    // Run a query without reading the results
    db.run("CREATE TABLE test (col1, col2);");
    // Insert two rows: (1,111) and (2,222)
    db.run("INSERT INTO test VALUES (?,?), (?,?)", [1,111,2,222]);

    // Prepare a statement
    const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
    stmt.getAsObject({$start:1, $end:1}); // {col1:1, col2:111}

    // Bind new values
    stmt.bind({$start:1, $end:2});
    while(stmt.step()) { //
      const row = stmt.getAsObject();
      console.log('Here is a row: ' + JSON.stringify(row));
    }
  });
  */
