//Dal1980 -v1.0 (beta)
var sqlite3 = require('sqlite3').verbose();

process.stdout.write('\x1B[2J\x1B[0f');
console.log("");

console.log("     _  _  __  __  __   ____  ____    __    ___  ____  _____  ____ ");
console.log("    ( \\/ )(  \\/  )(  ) (_  _)(  _ \\  /__\\  / __)(_  _)(  _  )(  _ \\");
console.log("     )  (  )    (  )(__  )(   )   / /(__)\\( (__   )(   )(_)(  )   /");
console.log("    (_/\\_)(_/\\/\\_)(____)(__) (_)\\_)(__)(__)\\___) (__) (_____)(_)\\_)");
console.log("                                      for M/\\ME's XML             ");
console.log("                                 MULTIPLE / ARCADE MACHINE EMULATOR");
console.log("    ---------------------------------------------------------------");
console.log("    ----CREATE (db)-----------Dal1980--------------Version 1.0-----");
console.log("                                                            -beta  ");
console.log("");

var dbName = "roms.db"; //SQLite db file (in db folder)
var taskOp = "";
// print process.argv
// 
process.argv.forEach(function (val, index) {
    //tables
    //1: roms_info                  -core table
    //2: roms_tech                  -core table
    //3: roms_displays              -detail table
    //4: roms_controls              -detail table
    //5: manufacturers              -detail table
    //6: p1i (player1-illustrated)  -core table

if(index > 1){
    if(val == '-all') taskOp = "all";
    else if(val == '-roms_info' || val == '-1') taskOp = "roms_info";
    else if(val == '-roms_tech' || val == '-2') taskOp = "roms_tech";
    else if(val == '-roms_displays' || val == '-3') taskOp = "roms_displays";
    else if(val == '-roms_controls' || val == '-4') taskOp = "roms_controls";
    else if(val == '-manufacturers' || val == '-5') taskOp = "manufacturers";
    else if(val == '-p1i' || val == '-6') taskOp = "p1i";

    if(val == '-db'){
        if(typeof process.argv[index + 1] !== "undefined"){
            if(process.argv[index + 1].indexOf('-') != 1){
                if(process.argv[index + 1].indexOf('.db') < 0) var ext = '.db';
                else var ext = '';
                dbName = process.argv[index + 1].replace(/[^A-Za-z0-9\-\_\.]/g, "");
                if(dbName == process.argv[index + 1]){
                    dbName += ext;
                    console.log( "    Creating: " + dbName);
                }
                else {
                    console.log( "    ** Error: -db filename issue: Illigal Character(s) found: " + process.argv[index + 1].replace(/[A-Za-z0-9\-\_\.]/g, ""));
                    taskOp = ""
                }
            }
            else{
                console.log( "    ** Error: -db flag requires a filename");
                taskOp = "";
            }
        }
        else {
            console.log( "    ** Error: -db flag requires a filename" );
            taskOp = "";
        }
    }
}
});

if(taskOp == ""){
    console.log("");
    console.log("    ----- Available options are: -----------------------------------------");
    console.log("    -db {filename}{.db}      ~roms.db is default if not provided.          ");
    console.log("    ------ + (only 1 of) --------------------------------------------------");
    console.log("    -all                     ~All tables will be dropped & created         ");
    console.log("    -1 |or| -roms_info       ~Only roms_info will be dropped & created     ");
    console.log("    -2 |or| -roms_tech       ~Only roms_tech will be dropped & created     ");
    console.log("    -3 |or| -roms_displays   ~Only roms_displays will be dropped & created ");
    console.log("    -4 |or| -roms_controls   ~Only roms_controls will be dropped & created ");
    console.log("    -5 |or| -manufacturers   ~Only manufacturers will be dropped & created ");
    console.log("    -6 |or| -p1i             ~Only p1i will be dropped & created           ");
    console.log("");
    process.exit();
}

if(taskOp == "roms_info" || taskOp == "all"){
    var dbDrop = new sqlite3.Database('db\\' + dbName);
    console.log("    Dropping: roms_info table (if it exists)");
    dbDrop.run("DROP TABLE IF EXISTS `roms_info`;", function(){ create_roms_info_table(); });
    dbDrop.close();
}

if(taskOp == "roms_tech" || taskOp == "all"){
    var dbDrop = new sqlite3.Database('db\\' + dbName);
    console.log("    Dropping: roms_tech table (if it exists)");
    dbDrop.run("DROP TABLE IF EXISTS `roms_tech`;", function(){ create_roms_tech_table(); });
    dbDrop.close();
}

if(taskOp == "roms_displays" || taskOp == "all"){
    var dbDrop = new sqlite3.Database('db\\' + dbName);
    console.log("    Dropping: roms_displays table (if it exists)");
    dbDrop.run("DROP TABLE IF EXISTS `roms_displays`;", function(){ create_roms_displays_table(); });
    dbDrop.close();
}

if(taskOp == "roms_controls" || taskOp == "all"){
    var dbDrop = new sqlite3.Database('db\\' + dbName);
    console.log("    Dropping: roms_controls table (if it exists)");
    dbDrop.run("DROP TABLE IF EXISTS `roms_controls`;", function(){ create_roms_controls_table(); });
    dbDrop.close();
}

if(taskOp == "manufacturers" || taskOp == "all"){
    var dbDrop = new sqlite3.Database('db\\' + dbName);
    console.log("    Dropping: manufacturers table (if it exists)");
    dbDrop.run("DROP TABLE IF EXISTS `manufacturers`;", function(){ create_manufacturers_table(); });
    dbDrop.close();
}

if(taskOp == "p1i" || taskOp == "all"){
    var dbDrop = new sqlite3.Database('db\\' + dbName);
    console.log("    Dropping: p1i table (if it exists)");
    dbDrop.run("DROP TABLE IF EXISTS `p1i`;", function(){ create_p1i_table(); });
    dbDrop.close();
}

function create_roms_info_table(){
    var dbCreate = new sqlite3.Database('db\\' + dbName);
    console.log("    Creating: roms_info table");
    //thanks Phweda for pointing out the "set" field, renamed to a safe field name "setnum" instead.
    dbCreate.run(         
        "CREATE TABLE `roms_info` (" +
            "`name`             TEXT NOT NULL UNIQUE," +
            "`desc_1`           TEXT," +
            "`desc_2`           TEXT," +
            "`year`             INTEGER DEFAULT 1900," +
            "`players`          INTEGER DEFAULT 0," +
            "`displays`         INTEGER," +
            "`nplayers`         TEXT," +
            "`status`           INTEGER DEFAULT 0," +
            "`cat_primary`      TEXT," +
            "`cat_secondary`    TEXT," +
            "`manufacturer_1`   INTEGER DEFAULT 0," +
            "`licensee`         TEXT," +
            "`mature`           INTEGER DEFAULT 0," +
            "`bootleg`          INTEGER DEFAULT 0," +
            "`region`           TEXT," +
            "`setnum`           TEXT," +
            "`rev`              TEXT," +
            "`ver`              TEXT," +
            "PRIMARY KEY(`name`)" +
        ");"
    );
    dbCreate.close();
}

function create_roms_tech_table(){
    var dbCreate = new sqlite3.Database('db\\' + dbName);
    console.log("    Creating: roms_tech table");
    dbCreate.run(
        "CREATE TABLE `roms_tech` (" +
        "`name`  TEXT NOT NULL UNIQUE," +
        "`localisation_1`       TEXT," +
        "`localisation_2`       TEXT," +
        "`localisation_3`       TEXT," +
        "`localisation_4`       TEXT," +
        "`localisation_5`       TEXT," +
        "`manufacturer_2`       INTEGER DEFAULT 0," +
        "`manufacturer_3`       INTEGER DEFAULT 0," +
        "`manufacturer_4`       INTEGER DEFAULT 0," +
        "`manufacturer_5`       INTEGER DEFAULT 0," +
        "`sourcefile`           TEXT," +
        "`cloneof`              TEXT," +
        "`romof`                TEXT," +
        "`isdevice`             TEXT," +
        "`runnable`             TEXT," +
        "`coins`                INTEGER," +
        "`service`              TEXT," +
        "`tilt`                 TEXT," +
        "`emulation`            INTEGER," +
        "`color`                INTEGER," +
        "`sound`                INTEGER," +
        "`graphic`              INTEGER," +
        "`savestate`            INTEGER," +
        "PRIMARY KEY(`name`)" +
        ");"
    );
    dbCreate.close();
}

function create_roms_displays_table(){
    var dbCreate = new sqlite3.Database('db\\' + dbName);
    console.log("    Creating: roms_displays table");
    dbCreate.run(         
        "CREATE TABLE `roms_displays` (" +
            "`name`             TEXT NOT NULL," +
            "`did`              INTEGER," +
            "`tag`              TEXT," +
            "`type`             TEXT," +
            "`rotate`           INTEGER," +
            "`width`            INTEGER," +
            "`height`           INTEGER," +
            "`refresh`          TEXT," +
            "`pixclock`         TEXT" +
        ");"
    );
    dbCreate.close();
}

function create_roms_controls_table(){
    var dbCreate = new sqlite3.Database('db\\' + dbName);
    console.log("    Creating: roms_controls table");
    dbCreate.run(
        "CREATE TABLE `roms_controls` (" +
        "`name`         TEXT NOT NULL," +
        "`cid`          INTEGER," +
        "`player`       INTEGER," +
        "`controls`     TEXT," +
        "`buttons`      TEXT," +
        "`ways`         TEXT," +
        "`ways2`        TEXT," +
        "`minimum`      INTEGER," +
        "`maximum`      INTEGER," +
        "`sensitivity`  INTEGER," +
        "`keydelta`     INTEGER," +
        "`reverse`      TEXT" +
        ");"
    );
    dbCreate.close();
}

function create_manufacturers_table(){
    var dbCreate = new sqlite3.Database('db\\' + dbName);
    console.log("    Creating: manufacturers table");
    dbCreate.run(         
        "CREATE TABLE `manufacturers` (" +
            "`id`               INTEGER," +
            "`manufacturer`     TEXT," +
            "PRIMARY KEY(`id`)" +
        ");"
    );
    dbCreate.close();
}

function create_p1i_table(){
var dbCreate = new sqlite3.Database('db\\' + dbName);
    console.log("    Creating: p1i table");
    dbCreate.run(
        "CREATE TABLE `p1i` (" +
        "`name`  TEXT NOT NULL UNIQUE," +
        "`element_1`    TEXT," +
        "`element_2`    TEXT," +
        "`element_3`    TEXT," +
        "`element_4`    TEXT," +
        "`element_5`    TEXT," +
        "`element_6`    TEXT," +
        "`element_7`    TEXT," +
        "`element_8`    TEXT," +
        "`element_9`    TEXT," +
        "`version`      INTEGER," +
        "PRIMARY KEY(`name`)" +
        ");"
    );
    dbCreate.close();    
}
