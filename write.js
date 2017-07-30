//Dal1980 -v1.0 (beta)
var fs = require('fs');
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
console.log("    ----WRITE (db)------------Dal1980--------------Version 1.0-----");
console.log("                                                            -beta  ");
console.log("");
console.log("    This may take a few minutes...             ...please be patient");
console.log("");
console.log("    Please note:");
console.log("    The process looks slow to start with but will quickly complete.");
console.log("");

var dbName = "roms.db"; //SQLite db file (in db folder)
var taskOp = "";

process.argv.forEach(function (val, index) {
  
  if(index > 1){
    if(val == '-roms_info' || val == '-1') taskOp = "roms_info";
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
                    console.log( "    Using: " + dbName);
                }
                else {
                    console.log( "    ** Error: -db filename issue: Illigal Character(s) found: " + process.argv[index + 1].replace(/[A-Za-z0-9\-\_\.]/g, ""));
                    taskOp = ""
                }
            }
            else{
                console.log( "** Error: -db flag requires a filename");
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
    console.log("    -1 |or| -roms_info       ~Only roms_info will be wrote                 ");
    console.log("    -2 |or| -roms_tech       ~Only roms_tech will be wrote                 ");
    console.log("    -3 |or| -roms_displays   ~Only roms_displays will be wrote             ");
    console.log("    -4 |or| -roms_controls   ~Only roms_controls will be wrote             ");
    console.log("    -5 |or| -manufacturers   ~Only manufacturers will be wrote             ");
    console.log("    -6 |or| -p1i             ~Only p1i will be wrote                       ");
    console.log("");
    process.exit();
}


//tables
//1: roms_info                  -core table
//create_roms_info_table();
//2: roms_tech                  -core table
//create_roms_tech_table();
//3: roms_displays              -detail table
//create_roms_displays_table();
//4: roms_controls              -detail table
//create_roms_controls_table();
//5: manufacturers              -detail table
//create_manufacturers_table();
//6: p1i (player1-illustrated)  -core table
//create_p1i_table();


//Further cross-reference, list, and lookup tables can be generated
//from the initial scope of the above tables in the future.

//schema (example: this is not a real rom)
//roms.600                                      Table   Example Values                  Further Details
//roms.600.sourcefile                           2       "galaxian.cpp"
//roms.600.cloneof                              2       "turtles"
//roms.600.romof                                2       "turtles"
//roms.600.isdevice                             2       "yes"
//roms.600.runnable                             2       "no"
//roms.600.description_part_1                   1       "600 is not a real rom"
//roms.600.description_part_2                   1       "(It just looks like one)"
//roms.600.set                                  1       "A"
//roms.600.ver                                  1       "1.0"
//roms.600.localisation                                 [ Obj Array ]
//      roms.600.localisation[0]                2       "US"
//      roms.600.localisation[1]                2       "Asia"
//      roms.600.localisation[2]                2       "Japan"
//      roms.600.localisation[3]                2       "France"
//      roms.600.localisation[4]                2       "New Zealand"
//roms.600.region                               1       "World"
//roms.600.year                                 1       "1981"
//roms.600.manufacturers                                [ Obj Array ]
//
//      roms.600.manufacturers[0]               1       "Konami"
//      roms.600.manufacturers[1]               2       "Capcom"
//      roms.600.manufacturers[2]               2       "Atari Games"
//      roms.600.manufacturers[3]               2       "Atari Games"
//      roms.600.manufacturers[4]               2       "Atari Games"
//
//roms.600.bootleg                              1       true
//roms.600.licensee                             1       "Atari Games"
//roms.600.display":                                    [ Obj Array ]
//
//      roms.600.display[0].tag                 3       "screen"
//      roms.600.display[0].type                3       "raster"
//      roms.600.display[0].rotate              3       "90"
//      roms.600.display[0].width               3       "768"
//      roms.600.display[0].height              3       "224"
//      roms.600.display[0].refresh             3       "60.606061"
//      roms.600.display[0].pixclock            3       "18432000"
//
//roms.600.total_displays                       1       1
//roms.600.players                              1       "2"
//roms.600.coins                                2       "2"
//roms.600.service                              2       "yes"
//roms.600.tilt                                 2       "yes"
//roms.600.input                                        [ Obj Array ]
//
//      roms.600.input[0].players               4       "1"
//      roms.600.input[0].controls              4       "joy"
//      roms.600.input[0].buttons               4       "1"
//      roms.600.input[0].ways                  4       "8"
//      roms.600.input[0].ways2                 4       "4"
//      roms.600.input[0].minimum               4       "0"
//      roms.600.input[0].maximum               4       "255"
//      roms.600.input[0].sensitivity           4       "50"
//      roms.600.input[0].keydelta              4       "10"
//      roms.600.input[0].reverse               4       "yes"
//      
//      roms.600.input[1].player                4       "2"
//      roms.600.input[1].controls              4       "joy"
//      roms.600.input[1].buttons               4       "1"
//      roms.600.input[1].ways                  4       "4"
//      
//      ...
//      
//roms.600.status                               1       3                               {0: not set, 1: preliminary, 2: imperfect, 3: good }
//roms.600.emulation                            2       3                               {0: not set, 1: preliminary, 2: imperfect, 3: good }
//roms.600.color                                2       3                               {0: not set, 1: preliminary, 2: imperfect, 3: good }
//roms.600.sound                                2       3                               {0: not set, 1: preliminary, 2: imperfect, 3: good }
//roms.600.graphic                              2       3                               {0: not set, 1: preliminary, 2: imperfect, 3: good }
//roms.600.savestate                            2       1                               {0: false, 1: true }
//roms.600.categories                                  
//      roms.600.categories.primary             1       "Maze"                          Import from Catver.ini
//      roms.600.categories.secondary           1       "Platformer"                    Import from Catver.ini
//      roms.600.categories.mature              1       true                            Import from Catver.ini
//roms.600.nPlayers                             1       "2P alt"                        Import from nplayers.ini
//roms.600.p1i                                  
//      roms.600.element_1                      6       "joy,2hn,0,0,red,"              csv details for an input (player1-illustrated code)
//      roms.600.element_2                      6       "dial,,0,0,red,"
//      roms.600.element_3                      6       "btn,na,0,0,red,"
//      roms.600.element_4                      6       "btn,na,0,0,red,"
//      roms.600.element_5                      6       "btn,na,0,0,red,"
//      roms.600.element_6                      6       "btn,na,0,0,red,"
//      roms.600.element_7                      6       ""
//      roms.600.element_8                      6       ""
//      roms.600.element_9                      6       ""
//      roms.600.version"                       6       "0"                             version for tracking purposes (0 signifies auto-populated)


var roms;
var totalRoms = 0;
var totalManufacturers = 0;
var displaysDIDCount = 0; //(D)isplay ID
var controlsCIDCount = 0; //(C)ontrols ID

var countInfo = 0;
var countTech = 0;
var countDisplays = 0;
var countManufacturers = 0;

var errorlog = "";

var db = new sqlite3.Database('db\\' + dbName);
console.log("    Writing to: " + dbName);

fs.readFile('exports\\roms.json', 'utf8', function (err, data) {
    if (err) throw err;
    roms = JSON.parse(data); //kaboom - our data object is back
    var romNames = Object.keys(roms);
    //console.log(JSON.stringify(roms, null, "\t"));
    totalRoms = romNames.length;
    romNames.forEach( function(romName, index){
        //console.log("Preparing: " + index + " / " + totalRoms);
        updateConsole("    [ Importing: " + (index + 1) + " / " + totalRoms + " ]");
        if(typeof roms[romName].categories === "undefined") {
             roms[romName].categories = {"mature" : 0 };
        }

        for(var n = 0; n <= 5; n++){
            if (typeof roms[romName].manufacturers == "undefined" ||
                !(roms[romName].manufacturers instanceof Array) ) {
                roms[romName].manufacturers = [];
            }
            if(typeof roms[romName].manufacturers[n] === "undefined") {
                roms[romName].manufacturers[n] = { "index": 0 };
            }
        }

        if(typeof roms[romName].localisation === "undefined") {
            roms[romName].localisation = [];
        }

        for(var n = 0; n <= 5; n++){
            if(typeof roms[romName].localisation[n] === "undefined") {
                roms[romName].localisation[n] = null;
            }
        }
        if(taskOp == "roms_info") insert_roms_info_table(romName);
        else if(taskOp == "roms_tech") insert_roms_tech_table(romName);
        else if(taskOp == "p1i")insert_p1i_table(romName);
        else if(taskOp == "roms_displays"){
            displaysDIDCount = 0;
            for(var x = 0; x < roms[romName].total_displays; x++){
                insert_roms_displays_table(romName, displaysDIDCount);
                displaysDIDCount++;
            }
        }
        else if(taskOp == "roms_controls"){
            controlsCIDCount = 0;
            for(var x = 0; x < roms[romName].total_inputs; x++){
                insert_roms_controls_table(romName, controlsCIDCount);
                controlsCIDCount++;
            }
        }
    });
    if(taskOp == "manufacturers"){
        fs.readFile('exports\\manufacturers.json', 'utf8', function (err, data) {
            if (err) throw err;
            manufacturersJSON = JSON.parse(data); //our data object
            Object.keys(manufacturersJSON).forEach(function(key) {
                var val = manufacturersJSON[key];
                //console.log(key + ": " + val);
                insert_manufacturers_table(key, val);
            });
        });
    }
});
console.log(errorlog);


function insert_roms_info_table(romName){
    
    db.run(
        "INSERT INTO `roms_info`" + 
        "(  `name`, `desc_1`, `desc_2`, `year`, `players`, `nplayers`, `displays`, `status`," +
        "   `cat_primary`, `cat_secondary`, `manufacturer_1`, `licensee`, `mature`," +
        "   `bootleg`, `region`, `setnum`, `rev`, `ver` ) " +
        "VALUES " +
        "(  $name, $desc_1, $desc_2, $year, $players, $nplayers, $displays, $status," +
        "   $cat_primary, $cat_secondary, $manufacturer_1, $licensee, $mature," +
        "   $bootleg, $region, $setnum, $rev, $ver )", {
            $name:              romName,
            $desc_1:            roms[romName].description_part_1,
            $desc_2:            roms[romName].description_part_2,
            $year:              roms[romName].year,
            $players:           roms[romName].players,
            $nplayers:          roms[romName].nPlayers,
            $displays:          roms[romName].total_displays,
            $status:            roms[romName].status,
            $cat_primary:       roms[romName].categories.primary,
            $cat_secondary:     roms[romName].categories.secondary,
            $manufacturer_1:    roms[romName].manufacturers[0].name,
            $licensee:          roms[romName].licensee,
            $mature:            roms[romName].categories.mature,
            $bootleg:           roms[romName].bootleg,
            $region:            roms[romName].region,
            $setnum:            roms[romName].set,
            $rev:               roms[romName].rev,  
            $ver:               roms[romName].ver
        }, function(err){
            errorlog += "\n" + err;
            if(countInfo == 0) console.log("");
            countInfo++;
            updateConsole("    [ Inserting Data into roms_info: " + countInfo + " / " + totalRoms + " ]");
    });
    //db.close();
}

function insert_roms_tech_table(romName){
    db.run(
        "INSERT INTO `roms_tech`" + 
        "(  `name`, `localisation_1`, `localisation_2`, `localisation_3`, `localisation_4`," +
        "   `localisation_5`, `manufacturer_2`, `manufacturer_3`, `manufacturer_4`," +
        "   `manufacturer_5`, `sourcefile`, `cloneof`, `romof`, `isdevice`, `runnable`, `coins`," +
        "   `service`, `tilt`, `emulation`, `color`, `sound`, `graphic`, `savestate` )" +
        "VALUES " +
        "(  $name, $localisation_1, $localisation_2, $localisation_3, $localisation_4," +
        "   $localisation_5, $manufacturer_2, $manufacturer_3, $manufacturer_4," +
        "   $manufacturer_5, $sourcefile, $cloneof, $romof, $isdevice, $runnable, $coins, " +
        "   $service, $tilt, $emulation, $color, $sound, $graphic, $savestate )", {
            $name:              romName,
            $localisation_1:    roms[romName].localisation[0],
            $localisation_2:    roms[romName].localisation[1],
            $localisation_3:    roms[romName].localisation[2],
            $localisation_4:    roms[romName].localisation[3],
            $localisation_5:    roms[romName].localisation[4],
            $manufacturer_2:    roms[romName].manufacturers[1].name,
            $manufacturer_3:    roms[romName].manufacturers[2].name,
            $manufacturer_4:    roms[romName].manufacturers[3].name,
            $manufacturer_5:    roms[romName].manufacturers[4].name,
            $sourcefile:        roms[romName].sourcefile,
            $cloneof:           roms[romName].cloneof,
            $romof:             roms[romName].romof,
            $isdevice:          roms[romName].isdevice,
            $runnable:          roms[romName].runnable,
            $coins:             roms[romName].coins,
            $service:           roms[romName].service, 
            $tilt:              roms[romName].tilt, 
            $emulation:         roms[romName].emulation,
            $color:             roms[romName].color, 
            $sound:             roms[romName].sound,
            $graphic:           roms[romName].graphic,
            $savestate:         roms[romName].savestate
        }, function(err){
            errorlog += "\n" + err;
            if(countInfo == 0) console.log("");
            countInfo++;
            updateConsole("    [ Inserting Data into roms_tech: " + countInfo + " / " + totalRoms + " ]");
    });
}

function insert_roms_displays_table(romName, displaysDIDCount){
    db.run(
        "INSERT INTO `roms_displays`" + 
        "(  `name`, `did`, `tag`, `type`, `rotate`, `width`, `height`, `refresh`, `pixclock` )" +
        "VALUES " +
        "(  $name, $did, $tag, $type, $rotate, $width, $height, $refresh, $pixclock )", {
            $name:          romName,
            $did:           displaysDIDCount,
            $tag:           roms[romName].display[ displaysDIDCount ].tag,
            $type:          roms[romName].display[ displaysDIDCount ].type,
            $rotate:        roms[romName].display[ displaysDIDCount ].rotate,
            $width:         roms[romName].display[ displaysDIDCount ].width,
            $height:        roms[romName].display[ displaysDIDCount ].height,
            $refresh:       roms[romName].display[ displaysDIDCount ].refresh,
            $pixclock:      roms[romName].display[ displaysDIDCount ].pixclock
        }, function(err){
            errorlog += "\n" + err;
            if(countInfo == 0) console.log("");
            countInfo++;
            updateConsole("    [ Inserting Data into roms_displays: " + countInfo + " ]");
    });
}

function insert_roms_controls_table(romName, controlsIDCount){
    db.run(
        "INSERT INTO `roms_controls`" + 
        "(  `name`, `cid`, `player`, `controls`, `buttons`, `ways`, `ways2`, `minimum`, `maximum`, `sensitivity`, `keydelta`, `reverse` )" +
        "VALUES " +
        "(  $name, $cid, $player, $controls, $buttons, $ways, $ways2, $minimum, $maximum, $sensitivity, $keydelta, $reverse )", {
            $name:          romName,
            $cid:           controlsIDCount,
            $player:        roms[romName].input[ controlsIDCount ].player,
            $controls:      roms[romName].input[ controlsIDCount ].controls,
            $buttons:       roms[romName].input[ controlsIDCount ].buttons,
            $ways:          roms[romName].input[ controlsIDCount ].ways,
            $ways2:         roms[romName].input[ controlsIDCount ].ways2,
            $minimum:       roms[romName].input[ controlsIDCount ].minimum,
            $maximum:       roms[romName].input[ controlsIDCount ].maximum,
            $sensitivity:   roms[romName].input[ controlsIDCount ].sensitivity,
            $keydelta:      roms[romName].input[ controlsIDCount ].keydelta,
            $reverse:       roms[romName].input[ controlsIDCount ].reverse
        }, function(err){
            errorlog += "\n" + err;
            if(countInfo == 0) console.log("");
            countInfo++;
            updateConsole("    [ Inserting Data into roms_controls: " + countInfo + " ]");
    });
}


function insert_manufacturers_table(id, name){
    db.run(
        "INSERT INTO `manufacturers`" + 
        "(  `id`, `manufacturer` )" +
        "VALUES " +
        "(  $id, $manufacturer )", {
            $id:              id,
            $manufacturer:    name
        }, function(err){
            errorlog += "\n" + err;
            if(countManufacturers == 0) console.log("");
            countManufacturers++;
            updateConsole("    [ Inserting (manufacturers) ]");
    });
}

function insert_p1i_table(romName){
    db.run(
        "INSERT INTO `p1i`" + 
        "(  `name`, `element_1`, `element_2`, `element_3`, `element_4`," +
        "   `element_5`, `element_6`, `element_7`, `element_8`," +
        "   `element_9`, `version`)" +
        "VALUES " +
        "(  $name, $element_1, $element_2, $element_3, $element_4," +
        "   $element_5, $element_6, $element_7, $element_8," +
        "   $element_9, $version)", {
            $name:          romName,
            $element_1:     roms[romName].p1i.element_1,
            $element_2:     roms[romName].p1i.element_2,
            $element_3:     roms[romName].p1i.element_3,
            $element_4:     roms[romName].p1i.element_4,
            $element_5:     roms[romName].p1i.element_5,
            $element_6:     roms[romName].p1i.element_6,
            $element_7:     roms[romName].p1i.element_7,
            $element_8:     roms[romName].p1i.element_8,
            $element_9:     roms[romName].p1i.element_9,
            $version:       roms[romName].p1i.version
        }, function(err){
            errorlog += "\n" + err;
            if(countInfo == 0) console.log("");
            countInfo++;
            updateConsole("    [ Inserting Data into p1i: " + countInfo + " / " + totalRoms + " ]");
    });
}



function updateConsole(text){
    //process.stdout.clearLine();  // clear current text
    process.stdout.cursorTo(0);  // move cursor to beginning of line
    process.stdout.write(text);  // write text
}