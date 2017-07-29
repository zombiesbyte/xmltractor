# XMLtractor
*XML Extractor for MAME's XML*

## Overview
This project started from something I required for another project. I was initially intended to be a quick script that extracted some very basic information. After hitting some problems with extracting the 'not so simple' data I decided to just keep going with it :)

## A quick note before I begin
The project simply uses an XML file that can be exported from mame application via the command line. Since I’m using Windows as my working environment every example is presented as compatible with that. Linux/Mac users should not find any issues translating any of these commands or actions.

For those who don’t know or need a reminder (like me, every month), the following command can be run from your cmd prompt when in the directory of your mame folder (usually C:\Mame)

`mame.exe -listxml > mame-list.xml`
(For 64bit version use: `mame64.exe -listxml > mame-list.xml`)

***Please note***: I have included an export in a zipped file if you also want to skip the step above (Mame187). You will need to extract this file before it can be used.
By typing mame.exe you are calling on the program to run but with the attribute -listxml. This asks Mame to produce a full xml formatted file of its full catalogue. The arrow / right angle bracket asks the windows terminal to pipe the contents of the output that would normally just end up being spewed out across the screen to a chosen filename instead. You can replace mame-list.xml with your own filename. If you browse using windows explorer to the location of your Mame install you should now see your newly generated file (mame-list.xml).

## Node.js
Since this is a Node project I’m going to assume you have node installed. Simply run the following npm (Node Package Manager) command to make sure that the packages/modules are installed and up-to-date. Since you’re likely to already be in this directory if you’ve cloned the files I’ll not bother asking that you cd into it first... (I think I technically did ask you there)
`npm install`
*There aren’t many dependencies so it won’t take long*

## Preparing
Now is an appropriate time to give an overview of the project structure. You should be able to see that there are the following directories:
* db
* exports
* imports

## db directory
This is where the end result of the project should be. I have already included a roms.db which you can use and is generated from version 187 of mame. Later versions may be released but running this project through node will give you full control to produce your own. 

## exports directory
This folder contains all of the initial exports. The XML file from Mame is subjectively viewed to extract some information. We also use Catver.ini and nPlayers.ini for further injection of information (see Imports below for more information).
The extraction from XML only looks at information and doesn’t particularly concentrate on too much of the technical details. I will talk about each field in more detail below if you would like more information on what is extracted and how it is interpreted.
It is also worth noting that at this stage in the process which is populated after the read process is all recorded in JSON format. If this is more useful to you than in DB format then you can use these files as the process of data extraction has been fully completed by this part. The remaining two node files create and write simply convert the JSON data model/object into SQLite inserts.

## imports directory
This folder holds all the information that is to be imported for the initial read.js to… well read :)
It is necessary that the Catver.ini and nPlayers.ini files remain here and please do stop by [progettosnaps.net](http://www.progettosnaps.net) and [arcadebelgium.be](http://nplayers.arcadebelgium.be) (respectfully) for your up-to-date versions of these files. However, the process will still work on an older version, they just have to be both present.
I have included a -listxml export in a zipped file if you also want to skip the step above.
You will need to extract this file before it can be used.

## The 3 steps
### Read
The first step is simply to read the information. The script takes care of the information and generates the output in JSON format. You simply need to run the following command.
`Node read`
*After approximately 2-4 minutes the application should return you back to the command line with hopefully no errors.*

### Create
This is the second step and is used to setup the database structure. Please note that the default filename for the db is roms.db. You will see that you can create your own but it is worth mentioning now so that you can keep your own generated db safe.
**Commands**
`node create` by itself will not work. You’ll just end up with a list of parameter options discussed below
Usage:
`node create` [-flag] {optional(-db filename)}

**Example**
`node create -all -db mysqlitefile`
This asks create to setup an SQLite db file called mysqlitefile.db and to add “-all” tables to it

`node create -2`
This asks create to use a default name called roms.db and write roms_tech (table 2) to it only

`node create -roms_info -db anothersqlitefile.db`
This asks create to setup an SQLite db file called anothersqlitefile.db and write roms_info (table 1) to it.

Only 1 flag can be set from the following list
| flag                     | Description                                                            |
| -------------------------|------------------------------------------------------------------------|
| `-all`                   | All tables will be dropped if they exist & (re)created                 |
| -1 |or| -roms_info       | Only roms_info will be dropped if it exists & (re)created              |
| -2 |or| -roms_tech       | Only roms_tech will be dropped if it exists & (re)created              |
| -3 |or| -roms_displays   | Only roms_displays will be dropped if it exists & (re)created          |
| -4 |or| -roms_controls   | Only roms_controls will be dropped if it exists & (re)created          |
| -5 |or| -manufacturers   | Only manufacturers will be dropped if it exists & (re)created          |
| -6 |or| -p1i             | Only p1i will be dropped if it exists & (re)created                    |

*This process should only take seconds*
**It is important to note that you will need the tables you wish to write too created before you can write to them. The safest option from above is to simply pass the -all flag to have them all created. If you wish to only work on a small portion of the data then these other flags allow you to be more specific.**

### Write
Now that we have our database tables setup and the tables we are going to write to created we can run our write application.
The parameters are similar from the ones above excluding the -all flag. This has been excluded for now on the write process.
Usage:
`Node write` [-flag] {optional(-db filename)}

**Example**
`node write -1 -db mysqlitefile`
This asks write to populate the roms_info table using an SQLite db file called mysqlitefile.db

`node write -roms_tech`
This asks write to populate the roms_tech table using the default roms.db file

Only 1 flag can be set from the following list
| flag                     | Description                                   |
| -------------------------|-----------------------------------------------|
| -1 |or| -roms_info       | Only roms_info will be populated              |
| -2 |or| -roms_tech       | Only roms_tech will be populated              |
| -3 |or| -roms_displays   | Only roms_displays will be populated          |
| -4 |or| -roms_controls   | Only roms_controls will be populated          |
| -5 |or| -manufacturers   | Only manufacturers will be populated          |
| -6 |or| -p1i             | Only p1i will be populated                    |

**You may find that it takes several seconds for the initial data to be imported from the JSON model. The write process takes a lot longer and it appears to go very slowly to start with. I would expect (or certainly from what I have experienced) that this takes anywhere from 1-4 minutes to complete. The progress appears to only increase by 1 each time until it nears the end of the process where the entire write happens very quickly. Please be patient.**

## Viewing the Results
There are many ways to view SQLite databases. My personal preference for now is to download and install a free application called [SQLite Database Browser](http://sqlitebrowser.org/). This tool allows you to run and save your own queries as well as view and search columns (with filter option).

Thanks, Dal1980
http://retro.zombiesbyte.com

**The following sections are for reference only and delve deeper into the thought process on how (and why) the data is extracted.**

Coming soon...



