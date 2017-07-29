//Dal1980 - V1.0 (beta)
const fs = require('fs');
const readline = require('readline');
const XmlReader = require('xml-reader');

process.stdout.write('\x1B[2J\x1B[0f');

console.log("     _  _  __  __  __   ____  ____    __    ___  ____  _____  ____ ");
console.log("    ( \\/ )(  \\/  )(  ) (_  _)(  _ \\  /__\\  / __)(_  _)(  _  )(  _ \\");
console.log("     )  (  )    (  )(__  )(   )   / /(__)\\( (__   )(   )(_)(  )   /");
console.log("    (_/\\_)(_/\\/\\_)(____)(__) (_)\\_)(__)(__)\\___) (__) (_____)(_)\\_)");
console.log("                                      for M/\\ME's XML             ");
console.log("                                 MULTIPLE / ARCADE MACHINE EMULATOR");
console.log("    ---------------------------------------------------------------");
console.log("    ----READ (db)------------Dal1980---------------Version 1.0-----");
console.log("                                                            -beta  ");
console.log("");
console.log("    Please note:");
console.log("    .\\exports\\roms.json is wrote for mame.xml");
console.log("    .\\exports\\manufacturers.json is wrote for found manufacturers list");
console.log("     * Notes:");
console.log("     * Future versions will import history.dat");
console.log("     * If you find errors with your own xml import, remove DTD info");
console.log("     * Also, please use the latest Catver.ini and nplayers.ini");
console.log("     * Special thanks to:");
console.log("         - timmyb, Obiwantje and Phweda for freedback and support");
console.log("         - http://www.progettosnaps.net for Catver.ini resource");
console.log("         - http://nplayers.arcadebelgium.be nPlayer.ini resource");
console.log("");
console.log("        ~ This may take a few minutes (approx 1-2 minutes) ~");
console.log("    Working...");

var roms = {};
var currentRom = "";

var manufacturersArray = []; //this stores all manufacturers as a consolidated list

if (fs.existsSync('exports\\roms.json')) fs.unlink('exports\\roms.json');
if (fs.existsSync('exports\\manufacturers.json')) fs.unlink('exports\\manufacturers.json');

const reader = XmlReader.create({stream: true});
const xml = fs.readFile('imports\\mame-187.xml', 'utf8', function (err, fileData) {
    
    if (err) {
        return console.log(err);
    }

    reader.on('tag:machine', (data) => {
        
        currentRom = data.attributes['name']; //current rom name (key)

        roms[ currentRom ] = {
            "sourcefile":   data.attributes['sourcefile'],
            "sampleof":     data.attributes['sampleof'],
            "cloneof":      data.attributes['cloneof'],
            "romof":        data.attributes['romof'],
            "isdevice":     data.attributes['isdevice'],
            "runnable":     data.attributes['runnable']
        };
        
        for(i = 0; i < data.children.length; i++ ){

            //description
            if(data.children[i].name == "description") {                
                descParts = splitStrByChar(data.children[i].children[0]['value'], '(');
                roms[ currentRom ].description_part_1 = descParts[0].replace("&amp;", "and");
                roms[ currentRom ].description_part_2 = descParts[1];
                //roms[ currentRom ].rev_info = [];
                extractRev(currentRom, descParts[1]);
            }

            //year
            else if(data.children[i].name == "year") {
                //We need to remove all ? qmark symbols as we will
                //be feeding this to a field type of integer. 
                var rawYearStr = data.children[i].children[0]['value'];
                var formattedYear = rawYearStr.substring(0, 4);
                var cleanedYear = formattedYear.replace(/\?/g, "0"); //? = 0 (default)
                roms[ currentRom ].year = cleanedYear;
            }
            
            //manufacturer
            else if(data.children[i].name == "manufacturer") {
                var licenseePattern = /(\()(.*)((\b license\b)\))/ig;
                var licenseeMatchGrp = licenseePattern.exec( data.children[i].children[0]['value'] );
                //if( typeof licenseeMatchGrp != "undefined" && licenseeMatchGrp instanceof Array) console.log( licenseeMatchGrp[2] );
                if( licenseeMatchGrp !== null ) roms[ currentRom ].licensee = licenseeMatchGrp[2]; // console.log( licenseeMatchGrp[2] );
                var slashedManArray = data.children[i].children[0]['value'].split('/');
                roms[ currentRom ].manufacturers = [];
                for(var m = 0; m < slashedManArray.length; m++){
                    var tempMan = splitStrByChar(slashedManArray[m], '(');
                    if(tempMan[1] != ""){
                        tempMan[0] = replaceKnownStr(tempMan[0]);
                        tempMan[1] = replaceKnownStr(tempMan[1]);
                        if( !checkForWord("license", tempMan[0]) ){ 
                            tempMan[0] = consolidateSynonyms(tempMan[0]);
                            if(tempMan[0] != "" && tempMan[0] != "bootleg"){
                                //console.log( tempMan[0] + "\t");
                                //var manId = addToManufacturers(tempMan[0]);
                                var manufacturerObj = {
                                    "index": addToManufacturers(tempMan[0]),
                                    "name": tempMan[0]
                                }
                                roms[ currentRom ].total_manufacturers = roms[ currentRom ].manufacturers.length + 1;
                                roms[ currentRom ].manufacturers.push( manufacturerObj );
                            }
                            else roms[ currentRom ].bootleg = true;
                        }
                        if( !checkForWord("license", tempMan[1]) ){ 
                            tempMan[1] = consolidateSynonyms(tempMan[1]);
                            if(tempMan[1] != "" && tempMan[1] != "bootleg"){
                                //console.log( tempMan[1] + "\t");
                                //var manId = addToManufacturers(tempMan[1]);
                                var manufacturerObj = {
                                    "index": addToManufacturers(tempMan[1]),
                                    "name": tempMan[1]
                                }
                                roms[ currentRom ].total_manufacturers = roms[ currentRom ].manufacturers.length + 1;
                                roms[ currentRom ].manufacturers.push( manufacturerObj );
                            }
                            else roms[ currentRom ].bootleg = true;
                        }

                    }
                    else{
                        tempMan[0] = replaceKnownStr(tempMan[0]);
                        if( !checkForWord("license", tempMan[0]) ){ 
                            tempMan[0] = consolidateSynonyms(tempMan[0]);
                            if(tempMan[0] != "" && tempMan[0] != "bootleg"){
                                //console.log( tempMan[0] + "\t");
                                //var manId = addToManufacturers(tempMan[0]);
                                var manufacturerObj = {
                                    "index": addToManufacturers(tempMan[0]),
                                    "name": tempMan[0]
                                }
                                roms[ currentRom ].total_manufacturers = roms[ currentRom ].manufacturers.length + 1;
                                roms[ currentRom ].manufacturers.push( manufacturerObj );
                            }
                            else roms[ currentRom ].bootleg = true;
                        }
                    }
                }
            }

            //display
            else if(data.children[i].name == "display") {
                //check to see if array has been defined on obj
                if (typeof roms[ currentRom ].display == "undefined" ||
                    !(roms[ currentRom ].display instanceof Array) ) {
                    roms[ currentRom ].display = [];
                    roms[ currentRom ].total_displays = 0;
                }
                var d = {
                    'tag': data.children[i].attributes['tag'],
                    'type': data.children[i].attributes['type'],
                    'rotate': data.children[i].attributes['rotate'],
                    'width': data.children[i].attributes['width'],
                    'height': data.children[i].attributes['height'],
                    'refresh': data.children[i].attributes['refresh'],
                    'pixclock': data.children[i].attributes['pixclock']
                }
                roms[ currentRom ].total_displays++;
                roms[ currentRom ].display.push( d );
            }

            //driver
            else if(data.children[i].name == "driver") {
                //be feeding this to a field type of integer. 
                roms[ currentRom ].status = makeStateInt( data.children[i].attributes['status']);
                roms[ currentRom ].emulation = makeStateInt( data.children[i].attributes['emulation']);
                roms[ currentRom ].color = makeStateInt( data.children[i].attributes['color']);
                roms[ currentRom ].sound = makeStateInt( data.children[i].attributes['sound']);
                roms[ currentRom ].graphic = makeStateInt( data.children[i].attributes['graphic']);
                roms[ currentRom ].savestate = makeStateInt( data.children[i].attributes['savestate']);
            }

            //input
            else if(data.children[i].name == "input") {

                roms[ currentRom ].players = data.children[i].attributes['players'];
                roms[ currentRom ].coins = data.children[i].attributes['coins'];
                roms[ currentRom ].service = data.children[i].attributes['service'];
                roms[ currentRom ].tilt = data.children[i].attributes['tilt'];

                for(x = 0; x < data.children[i].children.length; x++ ){

                    //check to see if array has been defined on obj
                    if (typeof roms[ currentRom ].input == "undefined" ||
                        !(roms[ currentRom ].input instanceof Array) ) {
                        roms[ currentRom ].input = [];
                        roms[ currentRom ].total_inputs = 0;
                    }

                    var c = {
                        'player': data.children[i].children[x].attributes['player'],
                        'controls': data.children[i].children[x].attributes['type'], 
                        'buttons': data.children[i].children[x].attributes['buttons'],
                        'ways': data.children[i].children[x].attributes['ways'],
                        'ways2': data.children[i].children[x].attributes['ways2'],
                        'minimum': data.children[i].children[x].attributes['minimum'],
                        'maximum': data.children[i].children[x].attributes['maximum'],
                        'sensitivity': data.children[i].children[x].attributes['sensitivity'],
                        'keydelta': data.children[i].children[x].attributes['keydelta'],
                        'reverse': data.children[i].children[x].attributes['reverse']
                    };
                    roms[ currentRom ].total_inputs++;
                    roms[ currentRom ].input.push( c );
                }
            }
        }
        
              
    });

    reader.on('done', (data) => {
        getCatVerIni(); //pass down the chain of stream jobs       
    });

    reader.parse(fileData);
});

function getCatVerIni(){
    const rl = readline.createInterface({
        input: fs.createReadStream('imports\\Catver.ini')
    });
    
    var readIniSection = false;
    rl.on('line', function (line) {
        //console.log('Line from file:', line);
        var firstChar = line.substring(0,1);
        if(firstChar != "[" && firstChar != ";" && firstChar != ""  && firstChar != " "){
            if(readIniSection){
                var romAndCats = line.split('=');
                var cats = romAndCats[1].split(' / ');
                if (typeof roms[ romAndCats[0] ] != "undefined"){
                    //check to see if array has been defined on obj
                    if(cats[0]) roms[ romAndCats[0] ].categories = { "primary": cats[0] };
                    if(cats[1]){
                        var matureFound = cats[1].indexOf(" * Mature *");
                        if(matureFound > 0) {
                            cats[1] = cats[1].replace(" * Mature *", "");
                            roms[ romAndCats[0] ].categories.secondary = cats[1];
                            roms[ romAndCats[0] ].categories.mature = true;
                        }
                        else roms[ romAndCats[0] ].categories.secondary = cats[1];
                    }
                    //console.log("primary added: " +  cats[0]);
                }
            }
        }
        else if(firstChar == "["){
            if(line == "[Category]") readIniSection = true;
            else readIniSection = false;
        }
    });

    rl.on('close', function(){
        getNPlayersIni(); //pass down the chain of stream jobs
    });
}

function getNPlayersIni(){
    const rl = readline.createInterface({
        input: fs.createReadStream('imports\\nplayers.ini')
    });
    
    rl.on('line', function (line) {
        //console.log('Line from file:', line);
        var firstChar = line.substring(0,1);
        if(firstChar != "[" && firstChar != ";" && firstChar != ""  && firstChar != " "){
            var romAndNp = line.split('=');
           
            if (typeof roms[ romAndNp[0] ] != "undefined"){
                //check to see if array has been defined on obj
                if (typeof roms[ romAndNp[0] ].nPlayers == "undefined" ||
                    !(roms[ romAndNp[0] ].nPlayers instanceof Array) ) {
                    roms[ romAndNp[0] ].nPlayers = replaceKnownStr( romAndNp[1] );
                }
                
            }
        }
    });

    rl.on('close', function(){
        //lets define our generic P1-Illustrated control panel layouts
        determineGenericP1Illustrated();

        fs.appendFile('exports\\roms.json', JSON.stringify( roms, null, "\t" ), (err) => {
            if (err) throw err;
        });
        fs.appendFile('exports\\manufacturers.json', JSON.stringify( singleArrayToObject(manufacturersArray), null, "\t" ), (err) => {
            if (err) throw err;
        });
    });
}

/*  Probably should mention, the role of this function is to speculate based on 
    logical deductions (at best) or a leap of faith (at worst) into populating
    how the control panel would have looked. This population of data is not
    meant to be the final data but provides a starting block for me to go through
    manually adjusting the profiles. I'd previously started this excerise and
    realised that it would be some time before I managed to complete the work.
    I'd rather have something generated than nothing at all. It hopefully won't
    be a million miles away using some reasoning but I'm basing this on the XML
    only since controls.dat has not been updated in such a long time. Last check
    there was only about a thousand entries on that .dat file.
    This function may run each time but the manual entries will be used to replace
    this data as a second pass. External to this script. This is much the same
    for the entirety of the data.
*/
function determineGenericP1Illustrated(){

    for(var currentRom in roms){
        //lets create a template for our object
        roms[ currentRom ].p1i = Object;
        roms[ currentRom ].p1i = {
            "element_1": "",
            "element_2": "",
            "element_3": "",
            "element_4": "",
            "element_5": "",
            "element_6": "",
            "element_7": "",
            "element_8": "",
            "element_9": "",
            "version": "0" //we use this in the future for tracking purposes
        };

        //welcome to the land of the IF's - I don't I've ever wrote this size of if block before!
        for(var x = 0; x < roms[ currentRom ].total_inputs; x++){
            
            var p1i_p = "";      //(p)art (never with spaces)
            var p1i_w = "";      //(w)ays
            var p1i_x = 0;      //(x) coordinate
            var p1i_y = 0;      //(y) coordinate
            var p1i_c = "";     //(c)olour
            var p1i_l = "";     //(l)abel

            if(x == 0){
                var elementNum = 1; //this keeps track of what number between 1 and 9 we are on.
                var totalButtons = 0;
            }

            if(roms[ currentRom ].input[x].player == "1" || roms[ currentRom ].players == "1"){
                if( roms[ currentRom ].input[x].controls == "dial" || roms[ currentRom ].input[x].controls == "doublejoy" ||
                    roms[ currentRom ].input[x].controls == "joy" || roms[ currentRom ].input[x].controls == "lightgun" ||
                    roms[ currentRom ].input[x].controls == "only_buttons" || roms[ currentRom ].input[x].controls == "paddle" ||
                    roms[ currentRom ].input[x].controls == "pedal" || roms[ currentRom ].input[x].controls == "positional" ||
                    roms[ currentRom ].input[x].controls == "stick" || roms[ currentRom ].input[x].controls == "trackball"){
                             
                    if( roms[ currentRom ].input[x].buttons == null || roms[ currentRom ].input[x].buttons < 9){

                        if( typeof roms[ currentRom ].categories == "undefined" || typeof roms[ currentRom ].categories.primary == "undefined" ||
                            roms[ currentRom ].categories.primary == "Ball & Paddle" || roms[ currentRom ].categories.primary == "Climbing" ||
                            roms[ currentRom ].categories.primary == "Driving" || roms[ currentRom ].categories.primary == "Maze" ||
                            roms[ currentRom ].categories.primary == "Maze * Mature *" || roms[ currentRom ].categories.primary == "Multiplay" ||
                            roms[ currentRom ].categories.primary == "Platform" || roms[ currentRom ].categories.primary == "Not Classified" ||
                            roms[ currentRom ].categories.primary == "Puzzle" || roms[ currentRom ].categories.primary == "Shooter" ||
                            roms[ currentRom ].categories.primary == "Tabletop" || roms[ currentRom ].categories.primary == "Sports" ||
                            roms[ currentRom ].categories.primary == "Fighter" || roms[ currentRom ].categories.primary == "Multi-cart" ||
                            roms[ currentRom ].categories.primary == "Board"){

                            /*
                            This worked out to be too agressive and a bit of a nightmare to maintain - I'll revisit
                            if( typeof roms[ currentRom ].categories == "undefined" || typeof roms[ currentRom ].categories.secondary == "undefined" ||
                                roms[ currentRom ].categories.secondary == "Maze" || roms[ currentRom ].categories.secondary == "Driving" ||
                                roms[ currentRom ].categories.secondary == "Climbing" || roms[ currentRom ].categories.secondary == "Not Classified" ||
                                roms[ currentRom ].categories.secondary == "Maze * Mature *" || roms[ currentRom ].categories.secondary == "Multi-cart Board" ||
                                roms[ currentRom ].categories.secondary == "Fighter" || roms[ currentRom ].categories.secondary == "Ball & Paddle" ||
                                roms[ currentRom ].categories.secondary == "Multiplay" || roms[ currentRom ].categories.secondary == "Shooter" ||
                                roms[ currentRom ].categories.secondary == "Tabletop" || roms[ currentRom ].categories.secondary == "Puzzle" ||
                                roms[ currentRom ].categories.secondary == "Platform" || roms[ currentRom ].categories.secondary == "Sports" ||
                                roms[ currentRom ].categories.secondary == "Flying Vertical"){
                            */
                            //meanwhile we just set this as true
                            if(true){

                                //Indiana Jones would not have made it this far, well done
                                
                                //for dial or paddle we can make an assumption that if it's a driving game this will be a wheel
                                if(roms[ currentRom ].input[x].controls == "dial" || roms[ currentRom ].input[x].controls == "paddle"){
                                    if((typeof roms[ currentRom ].categories != "undefined" && typeof roms[ currentRom ].categories.primary != "undefined" &&
                                        typeof roms[ currentRom ].categories.primary != "undefined") && (roms[ currentRom ].categories.primary == "Driving" ||
                                        roms[ currentRom ].categories.secondary == "Driving")){
                                        //we know this is a steering wheel
                                        p1i_p = "wheel";
                                    }
                                    else{
                                        //we know this is a spinner knob style
                                        if( roms[ currentRom ].input[x].controls == "dial") p1i_p = "dial";
                                        if( roms[ currentRom ].input[x].controls == "paddle") p1i_p = "paddle";
                                    }
                                }
                                else{
                                    if( roms[ currentRom ].input[x].controls == "joy"){
                                        p1i_p = "joy";
                                        //we can handles the ways (ways2 is handled sperately)
                                        if(roms[ currentRom ].input[x].ways == "1"){
                                            p1i_w = "1ln";  //default this to: 1-way (l)eft north facing arrangement standard i/o stick
                                        }
                                        else if(roms[ currentRom ].input[x].ways == "2"){
                                            p1i_w = "2hn";  //default this to: 2-way (l+r) north facing arrangement standard i/o stick
                                        }
                                        else if(roms[ currentRom ].input[x].ways == "vertical2"){
                                            p1i_w = "2vn";  //default this to: 2-way (u+d) north facing arrangment standard i/o stick
                                        }
                                        
                                        else if(roms[ currentRom ].input[x].ways == "4"){
                                            p1i_w = "4n";  //default this to: 4 way (u+d,l+r) north facing arrangement standard i/o stick
                                        }
                                        else if(roms[ currentRom ].input[x].ways == "8"){
                                            p1i_w = "8n";  //default this to: 8 way (u+d,l+r, ul+ur,dl+dr) north facing arrangement standard i/o stick
                                        }
                                        else if(roms[ currentRom ].input[x].ways == "3 (half4)"){
                                            p1i_w = "4cegn";  //default this to: 4 way (d,l+r) north facing arrangement standard i/o stick
                                        }
                                        else if(roms[ currentRom ].input[x].ways == "5 (half8)"){
                                            p1i_w = "8icegn";  //default this to: 8 way (u, ul+ur,dl+dr) north facing arrangement standard i/o stick
                                        }
                                        

                                    }
                                    else if( roms[ currentRom ].input[x].controls == "stick") p1i_p = "astick";
                                    else if( roms[ currentRom ].input[x].controls == "positional") p1i_p = "posstick";
                                    if( roms[ currentRom ].input[x].controls == "doublejoy") p1i_p = "doublejoy"; //? "doublejoy" how to handle this?
                                    else if( roms[ currentRom ].input[x].controls == "pedal") p1i_p = "pedal";
                                    //else if( roms[ currentRom ].input[x].controls == "only_buttons") p1i_p = "button"; //we don't need to handle this
                                    else if( roms[ currentRom ].input[x].controls == "lightgun") p1i_p = "gun0";
                                    else if( roms[ currentRom ].input[x].controls == "trackball") p1i_p = "trackball";
                                }

                                //if the light gun then perhaps all the buttons are on the gun. Would there ever be more than 2 or 3 buttons idk
                                //we will assume that the light gun can have 1 - 3 buttons so we won't count any more than that. Any less than
                                //1 then the game is pointless since you won't be able to fire!. Mame records these buttons for lightguns in
                                //strange ways. I've seen configurations for lightguns where all buttons are listed on a single lightgun. We also
                                //can't determine if there are any buttons on the CP itself. I've also see that the board allows for only 2 lightguns
                                //but 4 are connected such as "gun buster". I'm struggling here!
                                
                                //lightgun determination goes here
                                
                                //everything else looks like we can cope with it
                                
                                //we need to use compressed fields since this information is not meant for human consumption. If you do swallow this
                                //then it is advised to drink plenty of cold water and seek medical advice.
                                //I'd need 45 fields to store all this information separetly so seems sensible to csv the details of each part...
                                //There are a maximum of 9 elements supported at the time of writing... or there will be, I haven't wrote it yet...
                                //each of the 9 fields contain a csv list (or other sensible separator):
                                //(P)art ref:       The reference of the part...this could be a wheel, a button, a paddle etc and is a text ref with no spaces
                                //(W)ays ref:       Information on way points, mostly this is to do with joysticks but could hold further info for wheels turn etc
                                //(X) & (Y):        The coordinates this element should be displated at (1000px, 500px is the chosen platter for working within)
                                //(C)olour:         The colour of the part (a range of predefined colours can be selected from by name)
                                //(L)abel:          The label for the element
                                //                  -should be a maximum of 7 characters
                                //                  -should only contain [a-z][0-9][-][.]
                                //                  -all letters are made uppercase
                                //                  -you can use uppercase and lowercase numbers as you wish :p
                                //                  -just to be clear: symbols are counted as characters
                                //P,X,Y,C,L
                                //button,400,200,red,punch
                                if(typeof roms[ currentRom ].input[x].buttons !== "undefined") {
                                    //this passes our values down the chain. If we didn't do this
                                    //then we would lose our reference to buttons on certain inputs
                                    //as mame records buttons in random places, we use this field to
                                    //tie them down to a single variable
                                    totalButtons += parseInt(roms[ currentRom ].input[x].buttons); 
                                }
                                p1i_c = "red"; //lets just default everything to red
                                p1i_l = ""; //default label is blank
                                
                                //lets write what we have to the element property of our object
                                roms[ currentRom ].p1i["element_" + elementNum] = p1i_p + ',' + p1i_w + ',' + p1i_x + ',' + p1i_y + ',' + p1i_c + ',' + p1i_l;
                                //roms[ currentRom ].p1i.element_1 = p1i_p + ',' + p1i_w + ',' + p1i_x + ',' + p1i_y + ',' + p1i_c + ',' + p1i_l;
                                elementNum++;

                            }
                        }        
                    }
                    
                    

                }

                /*
                player      (null, 1, 2, 3, 4, 5, 6, 7, 8)
                            * Since P1-i is an illustration of Player 1 controls there obviously is only need to identify P1 controls ;)

                controls    (dial, doublejoy, gambling, hanafuda, joy, keyboard, keypad, lightgun, mahjong, mouse, only_buttons, paddle, pedal, positional,) 
                            (stick, trackball, triplejoy)
                            The ones we are interested in for P1-i will be:
                            (please note that these show the part refs)
                            * joy2 - standard i/o stick
                            * stick - an alologue registered stick
                            * positional - oh dear, still not sure on this one, some kind of twisty joystick or something (flight control?)
                            * doublejoy - left and right hand joystick
                            * pedal - sprung return analogue
                            * dial - a spinner
                            * paddle - like a spinner but with stops (usually set at 330 degrees according to Wiki) This may also have a button(?)
                            * only_buttons - buttons only. This will also be hi-jacked for buttons too.
                            * lightgun - a lightgun :)
                            * trackball - A big ball to track
                            
                            These show the part refs for the list above + additional ones that further define and also include the (w)ays options in context
                            
                            [ways described] (see ways for further info)
                            ______________________________________________________
                            Please note due to the limitations with ASCII I am
                            unable to represent (n)orth-(w)est and (n)orth-(e)ast
                            place facing. The pin at the top (_______._______)
                            illustrates the facing.
                            | | = north      \ \ = north-west     / / = north-east
                            ______________________________________________________
                            _______._______
                            |              |            1 way right (1rn)
                            |      O ->    |            (n)orth facing plate
                            |              |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______
                            |              |            1 way left (1ln)
                            |   <- O       |            (n)orth facing plate
                            |              |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______
                            |              |            1 way down (1dn)
                            |      O       |            (n)orth facing plate
                            |      |       |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______
                            |      |       |            1 way up (1un)
                            |      O       |            (n)orth facing plate
                            |              |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            ______________________________________________________
                            _______._______
                            |             |             2 way horizontal (2h)
                            |   <- O ->   |             (n)north facing plate
                            |             |             | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______
                            |      |       |            2 way virtical (2v)
                            |      O       |            (n)orth facing plate
                            |      |       |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______
                            |      |       |            4 way virtical (4)
                            |   <- O ->    |            (n)orth facing plate
                            |      |       |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______
                            |    \ | /     |            8 way virtical (4)
                            |   <- O ->    |            (n)orth facing plate
                            |    / | \     |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            These get a little more compex due to a modified way
                            point but based on the above standards
                            ______________________________________________________
                            fig1  8-way std     fig2
                            _______._______     _______._______
                            |   \  |  /    |    | (h) [a] (b)  |   For reference 
                            |  <-  O  ->   |    | [g]  O  [c]  |   purposes only
                            |   /  |  \    |    | (f) [e] (d)  |   
                            ---------------     ---------------
                            ______________________________________________________
                            _______._______             mame: 3 (half4)
                            |              |            4CEG (4ceg)
                            |   <- O ->    |            (n)orth facing plate
                            |      |       |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______             mame: 3 (half4)
                            |      |       |            4ACG (4acg)
                            |   <- O ->    |            (n)orth facing plate
                            |              |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______             mame: 3 (half4)
                            |      |       |            4AEG (4aeg)
                            |   <- O       |            (n)orth facing plate
                            |      |       |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______             mame: 3 (half4)
                            |      |       |            4ACE (4ace)
                            |      O ->    |            (n)orth facing plate
                            |      |       |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______             mame: 5 (half8)
                            |   \  |  /    |            8 (i)nverted CEG (4iceg)
                            |      O       |            (n)orth facing plate
                            |   /     \    |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______             mame: 5 (half8)
                            |   \     /    |            8 (i)nverted ACG (4iacg)
                            |      O       |            (n)orth facing plate
                            |   /  |  \    |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______             mame: 5 (half8)
                            |   \     /    |            8 (i)nverted AEG (4iaeg)
                            |      O ->    |            (n)orth facing plate
                            |   /     \    |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            _______._______             mame: 5 (half8)
                            |   \     /    |            8 (i)nverted ACE (4iace)
                            |   <- O       |            (n)orth facing plate
                            |   /     \    |            | |     \ \    / /
                            ---------------
                            ______________________________________________________
                            
                            * "joy","1rn"      1-way (r)ight north facing arrangement standard i/o stick
                            * "joy","1rnw"     1-way (r)ight north-west facing arrangement
                            * "joy","1rne"     1-way (r)ight north-east facing arrangement
                            
                            * "joy","1ln"      1-way (l)eft north facing arrangement standard i/o stick
                            * "joy","1lnw"     1-way (l)eft north-west facing arrangement
                            * "joy","1lne"     1-way (l)eft north-east facing arrangement
                            
                            * "joy","1dn"      1-way (d)own north facing arrangement standard i/o stick
                            * "joy","1dnw"     1-way (d)own north-west facing arrangement
                            * "joy","1dne"     1-way (d)own north-east facing arrangement
                            
                            * "joy","1un"      1-way (u)p north facing arrangement standard i/o stick
                            * "joy","1unw"     1-way (u)p north-west facing arrangement
                            * "joy","1une"     1-way (u)p north-east facing arrangement
                            
                            * "joy","2hn"      2-way (l+r) north facing arrangement standard i/o stick
                            * "joy","2hnw"     2-way (l+r) north-west facing arrangement
                            * "joy","2hne"     2-way (l+r) north-east facing arrangement
                            
                            * "joy","2vn"      2-way (u+d) north facing arrangment standard i/o stick
                            * "joy","2vnw"     2-way (u+d) north-west
                            * "joy","2vne"     2-way (u+d) north-east
                            
                            * "joy","4n"       4 way (u+d,l+r) north facing arrangement standard i/o stick
                            * "joy","4nw"      4 way (u+d,l+r) north-west
                            * "joy","4ne"      4 way (u+d,l+r) north-east
                            
                            * "joy","8n"       8 way (u+d,l+r, ul+ur,dl+dr) north facing arrangement standard i/o stick
                            * "joy","8nw"      8 way (u+d,l+r, ul+ur,dl+dr) north-west
                            * "joy","8ne"      8 way (u+d,l+r, ul+ur,dl+dr) north-east
                            
                              [3 (half4)]
                            * "joy","4cegn"    4 way (d,l+r) north facing arrangement standard i/o stick
                            * "joy","4cegnw"   4 way (d,l+r) north-west
                            * "joy","4cegne"   4 way (d,l+r) north-east
                            
                            * "joy","4acgn"    4 way (u,l+r) north facing arrangement standard i/o stick
                            * "joy","4acgnw"   4 way (u,l+r) north-west
                            * "joy","4acgne"   4 way (u,l+r) north-east
                            
                            * "joy","4aegn"    4 way (u+d,l) north facing arrangement standard i/o stick
                            * "joy","4aegnw"   4 way (u+d,l) north-west
                            * "joy","4aegne"   4 way (u+d,l) north-east
                            
                            * "joy","4acen"    4 way (u+d,r) north facing arrangement standard i/o stick
                            * "joy","4acenw"   4 way (u+d,r) north-west
                            * "joy","4acene"   4 way (u+d,r) north-east
                            
                              [5 (half8)]
                            * "joy","8icegn"   8 way (u, ul+ur,dl+dr) north facing arrangement standard i/o stick
                            * "joy","8icegnw"  8 way (u, ul+ur,dl+dr) north-west
                            * "joy","8icegne"  8 way (u, ul+ur,dl+dr) north-west
                            
                            * "joy","8iacgn"   8 way (d, ul+ur,dl+dr) north facing arrangement standard i/o stick
                            * "joy","8iacgnw"  8 way (d, ul+ur,dl+dr) north-west
                            * "joy","8iacgne"  8 way (d, ul+ur,dl+dr) north-west
                            
                            * "joy","8iaegn"   8 way (r, ul+ur,dl+dr) north facing arrangement standard i/o stick
                            * "joy","8iaegnw"  8 way (r, ul+ur,dl+dr) north-west
                            * "joy","8iaegne"  8 way (r, ul+ur,dl+dr) north-west
                            
                            * "joy","8iacen"   8 way (l, ul+ur,dl+dr) north facing arrangement standard i/o stick
                            * "joy","8iacenw"  8 way (l, ul+ur,dl+dr) north-west
                            * "joy","8iacene"  8 way (l, ul+ur,dl+dr) north-west

                            * "astick" - an alologue registered stick
                            * "posstick" - oh dear, still not sure on this one, some kind of twisty joystick or something (flight control?)
                hmmm ->* "doublejoy - left and right hand joystick
                            * "pedal" - sprung return analogue
                            * "dial" - a spinner
                            * "paddle" - like a spinner but with stops (usually set at 330 degrees according to Wiki) This may also have a button(?)
                            * "wheel" - this is a steering wheel 
                            * "button" - buttons only. This will also be hi-jacked for buttons too.
                            * "gun0"- a lightgun no buttons
                            * "gun1" - a lightgun 1 button
                            * "gun2" - a lightgun 2 buttons
                            * "trackball" - A big ball to track

                            Disregarded (or generically represented, if I have time)
                            * x - gambling - gambling buttons of some ilk
                            * x - hanafuda - some kind of mahjong control I think(?)
                            * x - keyboard - don't know :p
                            * x - keypad - yeah that
                            * x - mouse - squeek
                            * x - triplejoy - there's no way anyone can hold more than 2 :)


                buttons     (null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32)
                            (33, 35, 36, 37, 38, 40, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68)
                            (69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99)
                            (100, 101, 102, 103, 104, 105, 106, 107, 108, 110, 112, 117, 118, 119, 121, 122, 126, 128, 131, 132, 151)
                            * Shorthand representation: (null, 0-151) (Missing: 34, 39, 41-43, 109, 111-116, 120, 123-125, 127, 129-130, 133-150)
                            * null - 8 button: we will include these
                            * 9 button:   Off Road Challenge is one I can find that isn't related to custom systems or gambling. 
                            * 10 button:  bradley only real one I think

                ways        (null, 1, 2, 4, 8, 16, 3 (half4), 5 (half8), strange2, vertical2)
                            * 1 way seems to be used as a lever such as a break or single gear shift. I assume this is on a spring 
                              in both scenarios, regardless, it would simply register 1 direction and an action associated with it.
                            * 3 (half4) Is likely to be a Tetris style game with up disabled
                            * 5 (half8) is likely to be UL, U, UR, DR, DL (basically 8 way with L, D & R removed)
                            * strange2 seems to only appear on 1 game and it's accompanied by a joy with 1 button. Don't know.
                            * vertical2 is up + down rather than the default left + right
                            * 16 way is a up, down, left, right joystick with 12 other button inputs. As far as I can tell 16 way is
                              pretty much only used on Tomy and Entex hardware which is reserved for domestic handheld use. I haven't
                              checked them all but it looks this way from the ones I have checked.

                ways2       (null, 2, 4, 8, 5 (half8), vertical2)
                            * see above: ways

                minimum     (null, 0, 1, 2, 4, 8, 16, 19, 20, 22, 24, 26, 27, 28, 29, 31, 32, 38, 40, 43, 44, 48, 50, 52, 53, 56, 60, 64, 68, 71, 72, 76,) 
                            (90, 96, 98, 116, 125, 128, 144, 192, 210, 255, 512, 707, 852, 2048)
                            * At this time minimum will not be required for illustration purposes

                maximum     (null, 0, 3, 6, 7, 8, 10, 12, 14, 15, 16, 30, 31, 32, 46, 48, 63, 64, 71, 80, 99, 111, 119, 127, 128, 130, 139, 144, 149, 152,)
                            (159, 160, 167, 168, 172, 180, 183, 191, 192, 200, 203, 206, 207, 208, 213, 214, 223, 224, 227, 228, 234, 236, 239, 240, 242,)
                            (252, 254, 255, 265, 283, 284, 285, 294, 383, 454, 478, 511, 536, 642, 915, 934, 1023, 1024, 1152, 2047, 2531, 3584, 4080)
                            (4095, 4096, 16383, 25600, 32767, 32768, 63488, 65024, 65280, 65535)
                            * At this time maximum will not be required for illustration purposes

                sensitivity (null, 1, 2, 3, 5, 10, 12, 15, 16, 20, 25, 30, 35, 40, 45, 48, 50, 60, 64, 70, 75, 80, 85, 100, 120, 150, 200, 400)
                            * At this time sensitivity will not be required for illustration purposes

                keydelta    (-20, 1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 15, 16, 20, 24, 25, 30, 32, 35, 40, 45, 50, 52, 60, 63, 64, 79, 80, 100, 125, 128, 200)
                            * At this time keydelta will not be required for illustration purposes

                reverse     (null, yes)
                            * At this time reverse will not be required for illustration purposes
                            
                Primary Categories
                            We can use these categories to help identify targets for our P1-i set.
                            Include
                            Ball & Paddle, Climbing, Driving, Maze, Maze * Mature *, Multiplay, Platform, Not Classified, Puzzle,
                            Shooter, Tabletop, Sports, Fighter, Multi-cart Board

                            Exclude
                            3D Printer, Astrological Computer, Audio Sequencer, Bank-teller Terminal, Barcode Printer, Bridge Machine, 
                            Business Computer, Calculator, Car Voice Alert, Cash Counter, Casino, Casino * Mature *, Chess Machine, 
                            Clock, Credit Card Terminal, DVD Player, DVD Reader/Writer, Dame Machine, Development Computer, 
                            Device Programmer, Devices, Document Processors, Dot-Matrix Display, Drum Machine, EPROM Programmer, 
                            Educational Game, Electromechanical, Electronic Board Game, Electronic Typewriter, Engine Control Unit, 
                            Gambling Board, Game Console, Game Console Expansion, Graphic Tablet, Graphics Display Controller, 
                            Handheld Child Computers, Handheld Game, Handheld Game Console, Home Computer, In Circuit Emulator, JukeBox, 
                            Kit Computer, Laptop, Laser Disk Simulator, Laser Printer, Matrix Printer, Medal Game, Microcomputer, Misc., 
                            Misc. * Mature *, Mobile Phone, Modem, Network Processor, Pinball, Pinball * Mature *, 
                            Pocket Device, Portable Media Player, Print Club, Printer Handbook, Punched Card Computer, Quiz, Rhythm, 
                            Robot Control, Satellite Receiver, Single Board Computer, Speech Synthesizer, Synthesizer, System, 
                            Talking Calculator, Telephone, Test ROM, Thermal Printer, Toy cars, Training Board, Utilities, VTR Control, 
                            Virtual Environment, Wavetables Generator, Word-processing Machine, Workstation

                Secondary Categories
                            Include
                            Maze, Driving, Climbing, Not Classified, Maze * Mature *, Multi-cart Board, Fighter, Ball & Paddle, 
                            Multiplay, Shooter, Tabletop, Puzzle, Platform, Sports, Flying Vertical
                            
                            Exclude
                            Training Board, Game Console, Misc., Clock, EPROM Programmer, Handheld Game, Print Club, Home Computer, 
                            Kit Computer, Chess Machine, Modem, Development Computer, Microcomputer, Synthesizer, Pinball, 
                            Bank-teller Terminal, Punched Card Computer, Single Board Computer, Word-processing Machine, 
                            Astrological Computer, Document Processors, Bridge Machine, Toy cars, Electronic Board Game, 
                            Misc. * Mature *, Device Programmer, Cash Counter, Electronic Typewriter, Handheld Child Computers, 
                            Audio Sequencer, Casino * Mature *, Dame Machine, Satellite Receiver, Handheld Game Console, 
                            Speech Synthesizer, Engine Control Unit, JukeBox, Matrix Printer, Graphics Display Controller, 
                            Wavetables Generator, Car Voice Alert, Pinball * Mature *, Network Processor, Drum Machine, 
                            Educational Game, Printer Handbook, DVD Reader/Writer, Laser Printer, In Circuit Emulator, 
                            Game Console Expansion, Gambling Board, 3D Printer, Thermal Printer, Mobile Phone, Test ROM, 
                            Barcode Printer, Virtual Environment, VTR Control, Portable Media Player, Graphic Tablet, Robot Control, 
                            Laser Disk Simulator, Talking Calculator, DVD Player, Dot-Matrix Display, Credit Card Terminal, Devices, 
                            Medal Game, Telephone, System, Rhythm, Quiz, Electromechanical, Laptop, Pocket Device, Calculator, Casino, 
                            Workstation, Business Computer, Utilities
                */
            }
        }

        //on the way out write out buttons
        if(x == roms[ currentRom ].total_inputs ){ //test for last pass
            for(var b = 0; b < totalButtons; b++){
                p1i_p = "btn";
                p1i_w = "na";
                p1i_c = "red"; //lets just default everything to red
                p1i_l = ""; //default label is blank
                roms[ currentRom ].p1i["element_" + elementNum] = p1i_p + ',' + p1i_w + ',' + p1i_x + ',' + p1i_y + ',' + p1i_c + ',' + p1i_l;
                elementNum++;
            }
        }
    }
}

function addToManufacturers(val){
    var addTo = true;
    var returnID = -1;
    for(var x = 0; x < manufacturersArray.length; x++){
        if(manufacturersArray[x] == val){
            addTo = false;
            returnID = x;
        }
    }

    if(addTo){
        manufacturersArray.push( val ); //new entry in our manufacturersArray
        return manufacturersArray.length; //because our db references will always start at 1
    }
    else return returnID + 1; //because our db references will always start at 1
}

//converts our single array into an object together with numeric keys (for db id)
function singleArrayToObject(singleArray) {
  var objFromArray = {};
  for (var i = 0; i < singleArray.length; ++i)
    objFromArray[ i + 1 ] = singleArray[i]; //because our db references will always start at 1
  return objFromArray;
}

function extractRev(currentRom, descStr){
    //descStr = descStr.replace(/\(/g, '').replace(/\)/g, '');
    var descStrArray = descStr.split(',');
    var setInfo = "0";

    for(var n = 0; n < descStrArray.length; n++){
        //# = number
        //@ = letter
        //. = literal dot/period
        //capture all   v# | v#.# | v#.## | v##.# | v##.##
        //      /(v)(\d|\.){1,5}+(\w)*/gi
        //      This will pick up empty "v."'s so you will need to test for them. The next rule catches them though.
        //capture all   ver # | ver #@ | ver #.# | ver #.#@ | ver #.## | ver #.##@ | ...
        //  -&          version # | version #@ | version #.# | version #.#@ | version #.## | ...
        //  -&          ver @ | ver @@ | ver @@@ ...
        //  -&          version @ | version @@ | version @@@ ...
        //      /(\bver\b|\bversion\b)\ (\d|\.|\S|\w){1,5}+(\w)*/gi
        // notes
        // Possible letter representations:
        // U = United States, J = Japan, E = Europe, A = Asia, W = World
        // Konami may have used letters to describe further version information (speculation)
        // eg
        // asterix: (ver EAD) = Europe, ver 1.4
        // asterixaad: (ver AAD) = Asia, ver 1.4
        // asterixeaa: (ver EAA) = Europe, ver 1.1
        // asterixeac: (ver EAC) = Europe, ver 1.3
        // asterixj: (ver JAD) = Japan, ver 1.4
        // Other manufacturers may have had their own internal code which explains why some are hard to decipher
        
        //lets look for version information 
        var simpleVerPattern = /(v)(\d|\.){1,5}(\w)*/gi;
        var complexVerPattern = /(\bver\b|\bversion\b)(?:\ |\.)+(\d|\.|\S|\w){1,5}(\w)*/gi;
        //other cleanup rules
        removeVer = /(\bver\.\ \b|\bversion\.\ \b)|(v\.\ )|(\bver\ \b|\bversion\ \b)|(v\ )|(\bver\.\b|\bversion\.\b)|(v\.)|(\bver\b|\bversion\b)|(v)/gi

        var found = descStrArray[n].match(simpleVerPattern);
        if(found && found != "v."){
            var check = found.toString();            
            check = check.replace(removeVer, '');
            roms[ currentRom ].ver = check;
        }
        else{
            var found = descStrArray[n].match(complexVerPattern);
            if(found){
                var check = found.toString();
                check = check.replace(/\)/g, '');
                check = check.replace(removeVer, '');
                if(check != '.') roms[ currentRom ].ver = check;
            }
        }

        //lets look for revision information
        //  (\brev\b|\brevision\b)(?:\ |\.)+(\d|\.|\w){1,5}
        //  This is similar to the complex match we used for version searching
        var RevPattern = /(\brev\b|\brevision\b)(?:\ |\.)+(\d|\.|\w){1,5}/gi
        removeRev = /(\brev\.\ \b|\brevision\.\ \b)|(\brev\ \b|\brevision\ \b)|(\brev\.\b|\brevision\.\b)/gi
        var found = descStrArray[n].match(RevPattern);
        if(found){
            var check = found.toString();
            check = check.replace(/\)/g, '');
            check = check.replace(removeRev, '');
            roms[ currentRom ].rev = check;
        }

        //lets look for any info on region. If it's not in plain site it might be contained in version info
        var identified = [];
        var places = [];
        for(var x = 0; x <= 18; x++ ) places[ x ] = [];
        //special search due to World also being in terms like World Wars, World Games, World Cup etc
        places[0]['regex'] = /world(?!.?wars|.?games|.?cup)/gi; 
        places[0]['setas'] = "World";

        places[1]['regex'] = /(\bjapan\b)/gi;
        places[1]['setas'] = "Japan";
        places[2]['regex'] = /(\busa\b|\bus\b)/gi;
        places[2]['setas'] = "US";
        places[3]['regex'] = /(\bgerman\b|\bgermany\b|\bger\b)/gi;
        places[3]['setas'] = "Germany";
        places[4]['regex'] = /(\bfrance\b|\bfrench\b)/gi;
        places[4]['setas'] = "France";
        places[5]['regex'] = /(\bitaly\b|\bita\b|\bitalian\b)/gi;
        places[5]['setas'] = "Italy";
        places[6]['regex'] = /(\beurope\b|\beur\b|\beuro\b)/gi;
        places[6]['setas'] = "Europe";
        places[7]['regex'] = /(\bAsia\b)/gi;
        places[7]['setas'] = "Asia";
        places[8]['regex'] = /(\buk\b|\benglish\b)/gi;
        places[8]['setas'] = "UK";
        places[9]['regex'] = /(\brussia\b|\brussian\b)/gi;
        places[9]['setas'] = "Russia";
        places[10]['regex'] = /(\bnew\ zealand\b)/gi;
        places[10]['setas'] = "New Zealand";
        places[11]['regex'] = /(\bKorea\b)/gi;
        places[11]['setas'] = "Korea";
        places[12]['regex'] = /(\bArabic\b)/gi;
        places[12]['setas'] = "Arabic";
        places[13]['regex'] = /(\bSpanish\b|\bspain\b)/gi;
        places[13]['setas'] = "Spain";
        places[14]['regex'] = /(\bHong\ Kong\b)/gi;
        places[14]['setas'] = "Hong Kong";
        places[15]['regex'] = /(\bTaiwan\b)/gi;
        places[15]['setas'] = "Taiwan";
        places[16]['regex'] = /(\boceana\b|\boceania\b)/gi;
        places[16]['setas'] = "Oceania"; 
        places[17]['regex'] = /(\bvictoria\b)/gi;
        places[17]['setas'] = "Australia"; 
        places[18]['regex'] = /(\bcanada\b)/gi;
        places[18]['setas'] = "Canada";

        for(var x = 0; x < places.length; x++ ){
            var worldSearch = /(\bworld\b)/gi;
            var found = descStrArray[n].match( places[x]['regex'] );
            if(found){
                //check to see if array has been defined on obj
                if (typeof roms[ currentRom ].localisation == "undefined" ||
                    !(roms[ currentRom ].localisation instanceof Array) ) {
                    roms[ currentRom ].localisation = [];
                }
                //var check = found.toString();
                roms[ currentRom ].total_localisation = roms[ currentRom ].localisation.length + 1; //lets mark this for seaching
                roms[ currentRom ].localisation.push( places[x]['setas'] );
            }
        }

        //look for set info
        var posSet = descStrArray[n].toLowerCase().indexOf('set');
        if(posSet >= 0){
            setCheck = descStrArray[n].substring(posSet, posSet + 7);
            if(setCheck.length >= 5){
                setCheck = setCheck.substring(4);
                if(!isNaN(setCheck.substring(0,1))){
                    setInfo = setCheck.substring(0,1);                    
                    if(!isNaN(setCheck.substring(1,2))){
                        setInfo += setCheck.substring(1,2);
                        if(!isNaN(setCheck.substring(2,3))){
                            setInfo += setCheck.substring(2,3);
                        }
                    }
                }
            }
        }
    }

    roms[ currentRom ].set = setInfo;
    assumeRegion(currentRom);
}

//predetirmed checking. This simply checks for the presence of a word/phrase
//using a regex and returns a true or false state.
function checkForWord(word, str){
    var regEx = "";
    if(word == "license" || word == "licence") regEx = /(\blicen(?:s|c)e(d?)\b)/gi;
    //more tests here
    
    if( str.toString().toLowerCase().match( regEx ) ) return true;
    else return false;
}

function makeStateInt(stateStr){
    if(stateStr == "preliminary") return 1;
    else if(stateStr == "imperfect") return 2;
    else if(stateStr == "good") return 3;
    else if(stateStr == "supported") return 1;
    else if(stateStr == "unsupported") return 0;
    else return '0'; //no state fallback
}

function splitStrByChar(str, char){
    str = str.trim();
    var charFound = str.indexOf(char);
    if(charFound > 0){
        return [ str.substring(0, charFound).trim(), str.substring(charFound).trim() ];
    }
    else{
        return [ str, "" ];
    } 
}

function replaceKnownStr(str){
    str = str.replace("&amp;", "and");
    str = str.replace(/\B\&lt\;unknown\&gt\;\B/gi, '');
    str = str.replace(/\B\&lt\;generic\&gt\;\B/gi, '');
    str = str.replace(/\(/g, '');
    str = str.replace(/\)/g, '');
    str = str.replace(/\?/g, '');
    return str;
}

function reformRevTxt(str){
    if(str){
        str = str.replace(/version\./ig, 'Version');
        str = str.replace(/version/g, 'Version');
        str = str.replace(/ver\./ig, 'Version');
    }
    return str;
}

function consolidateSynonyms(str){
    str = str.replace(/\(/g, '').replace(/\)/g, '');
    var replaceArray = []
    for(var x = 0; x <= 7; x++ ) replaceArray[ x ] = [];
    replaceArray[0]['regex'] = /(,\ inc\.|,\ inc|\ inc\.)/gi;
    replaceArray[0]['setas'] = " Inc";
    replaceArray[1]['regex'] = /(,\ ltd\.|,\ ltd|\ ltd\.|\ limited|\ ltd|\,ltd)/gi;
    replaceArray[1]['setas'] = " Ltd";
    replaceArray[2]['regex'] = /(,\ plc\.|,\ plc|\ plc\.|\ plc)/gi;
    replaceArray[2]['setas'] = " Plc";
    replaceArray[3]['regex'] = /(,\ int\.|,\ int|\ int\.|\ international)/gi;
    replaceArray[3]['setas'] = " Int";
    replaceArray[4]['regex'] = /(,\ pl\.|,\ pl|\ pl\.|\ p\.l\.)/gi;
    replaceArray[4]['setas'] = " PL";
    replaceArray[5]['regex'] = /(,\ corp\.|,\ corp|\ corp\.|\ corporation|\ corp)/gi;
    replaceArray[5]['setas'] = " Corp";
    replaceArray[6]['regex'] = /(,\ co\.|,\ co|\ co\.)/gi;
    replaceArray[6]['setas'] = " Co";
    replaceArray[7]['regex'] = /(,\ ag\.|,\ ag|\ ag\.)/gi;
    replaceArray[7]['setas'] = " Ag";

    for(var x = 0; x < replaceArray.length; x++ ){
        var str = str.replace( replaceArray[x]['regex'], replaceArray[x]['setas'] );
    }
    str = str.replace(/\$/g, 'S');
    str = str.replace(/\:/g, ' ');
    str = str.replace(/\+/g, ' and ');
    str = str.replace(/\'/g, '');
    str = str.replace(/\./g, '');
    return str;
}

//lets build a region based on a few rules
//The idea behind the region field is so we have a general
//understanding of what region the rom is. This is purely based
//on logical diduction and is a broader perspective of catagorisation.
//The end goal here is to provide a single value so we can repersent in
//an easy way for such things like Front-Ends
//Note:
//We get slightly more confusing when we talk about Japan seperately 
//since it is regarded as being Asia however Japan is a focus point so
//it should be included as a seperate region. The only time this folds 
//down would be if it was regarded ultimately as "world"
//
function assumeRegion(currentRom){
    //this is the logical breakdown - notice the rules order
    //If the localisation array has the value:
    //{"world"} then it should be regarded that way
    //{"Japan"} then it should be regarded that way
    //{any countries from Europe} then "Europe" is region
    //{any countries from "Asia","Hong Kong","Taiwan","Korea","Arabic"} then "Asia"
    //{any countries from Australia i.e. "Victoria","New Zealand"} then "Oceania"
    //{any countries from US / Canada} then "US"
    //"" (no value), then this should be set as "World" until further info is available
    //if the value has already been set to one of the above and also matches the rule then
    //the value should be set as "World". (for instances like US + Asia or Europe + Asia or Europe + Oceania)
    //
    roms[ currentRom ].region = "";
    if(typeof roms[ currentRom ].localisation != "undefined"){
        //var totalElements = Object.keys();
        for(x = 0; x < roms[ currentRom ].total_localisation; x++){

            var curLocal = roms[ currentRom ].localisation[x];
            //console.log(x + ": " + curLocal );
            if(curLocal == "World"){
                roms[ currentRom ].region = "World"
                break;
            }
            else if(curLocal == "Japan"){
                if(roms[ currentRom ].region == "") roms[ currentRom ].region = "Japan";
                else if(roms[ currentRom ].region != "Japan"){
                    roms[ currentRom ].region = "World";
                    break;
                }
            }
            else if(curLocal == "US" || curLocal == "Canada"){
                if(roms[ currentRom ].region == "") roms[ currentRom ].region = "US";
                else if(roms[ currentRom ].region != "US"){
                    roms[ currentRom ].region = "World";
                    break;
                }
            }
            else if(curLocal == "Europe" || curLocal == "Germany" || curLocal == "France" || curLocal == "Spain" || curLocal == "UK" || curLocal == "Italy" || curLocal == "Russia"){
                if(roms[ currentRom ].region == "") roms[ currentRom ].region = "Europe";
                else if(roms[ currentRom ].region != "Europe"){
                    roms[ currentRom ].region = "World";
                    break;
                }
            }
            else if(curLocal == "Asia" || curLocal == "Korea" || curLocal == "Hong Kong" || curLocal == "Taiwan" || curLocal == "Korea" || curLocal == "Arabic"){
                if(roms[ currentRom ].region == "") roms[ currentRom ].region = "Asia";
                else if(roms[ currentRom ].region != "Asia"){
                    roms[ currentRom ].region = "World";
                    break;
                }
            }
            else if(curLocal == "Oceania" || curLocal == "New Zealand" || curLocal == "Victoria" || curLocal == "Australia"){
                if(roms[ currentRom ].region == "") roms[ currentRom ].region = "Oceania";
                else if(roms[ currentRom ].region != "Oceania") {
                    roms[ currentRom ].region = "World";
                    break;
                }
            }
        }
    }
    else roms[ currentRom ].region = "World";
    
    //now we must clean up localisation now that we have it sorted
    if(typeof roms[ currentRom ].localisation != "undefined"){
        for(var x = 0; x < roms[ currentRom ].localisation.length; x++) {
            if(roms[ currentRom ].localisation[x] == 'World') roms[ currentRom ].localisation.splice(x, 1);
            if(roms[ currentRom ].localisation[x] == roms[ currentRom ].region) roms[ currentRom ].localisation.splice(x, 1);
        }
        //lets update the length again
        roms[ currentRom ].total_localisation = roms[ currentRom ].localisation.length;
    }



}


