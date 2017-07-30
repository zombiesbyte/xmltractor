# XMLtractor
*XML Extractor for MAME's XML*

### Contents
#### 1. General Information
- [1.1. Overview](#11-overview)
- [1.2. A quick note before I begin](#12-a-quick-note-before-i-begin)
- [1.3. Node.js](#13-nodejs)
- [1.4. Preparing](#14-preparing)
- [1.5. Db directory](#15-db-directory)
- [1.6. Exports directory](#16-exports-directory)
- [1.7. Imports directory](#17-imports-directory)
- [1.8. The 3 steps](#18-the-3-steps)
    - [1.8.1 Read](#181-read)
    - [1.8.2 Create](#182-create)
    - [1.8.3 Write](#183-write)
- [1.9. Viewing the Results](#19-viewing-the-results)
#### 2. Reference
- [2.1. Introduction](#21-introduction)
    - [2.1.1. Notes](#211-notes)
- [2.2. sourcefile](#22-sourcefile)
- [2.3. sampleof](#23-sampleof)
- [2.4. cloneof](#24-cloneof)
- [2.5. romof](#25-romof)
- [2.6. isdevice](#26-isdevice)
- [2.7. runnable](#27-runnable)
- [2.8. description](#28-description)
- [2.9. year](#29-year)
- [2.10. manufacturer](#210-manufacturer)
- [2.11. Display Information](#211-display-information)
- [2.12. (display) tag](#212-display-tag)
- [2.13. (display) type](#213-display-type)
- [2.14. (display) rotate](#214-display-rotate)
- [2.15. (display) width](#215-display-width)
- [2.16. (display) height](#216-display-height)
- [2.17. (display) refresh](#217-display-refresh)
- [2.18. (display) pixclock](#218-display-pixclock)
- [2.19. (driver) status](#219-driver-status)
- [2.20. (driver) emulation](#220-driver-emulation)
- [2.21. (driver) color](#221-driver-color)
- [2.22. (driver) sound](#222-driver-sound)
- [2.23. (driver) graphic](#223-driver-graphic)
- [2.24. (driver) savestate](#224-driver-savestate)
- [2.25. Input Overview](#225-input-overview)
- [2.26. (input) players](#226-input-players)
- [2.27. (input) coins](#227-input-coins)
- [2.28. (input) service](#228-input-service)
- [2.29. (input) tilt](#229-input-tilt)
- [2.30. Controller Inputs](#230-controller-inputs)
    - [2.30.1. (input) player](#2301-input-player)
    - [2.30.2. (input) controls](#2302-input-controls)
    - [2.30.3. (input) buttons](#2303-input-buttons)
    - [2.30.4. (input) ways](#2304-input-ways)
    - [2.30.5. (input) ways2](#2305-input-ways2)
    - [2.30.6. (input) minimum](#2306-input-minimum)
    - [2.30.7. (input) maximum](#2307-input-maximum)
    - [2.30.8. (input) sensitivity](#2308-input-sensitivity)
    - [2.30.9. (input) keydelta](#2309-input-keydelta)
    - [2.30.10. (input) reverse](#23010-input-reverse)
    - [2.30.11. total_inputs](#23011-total_inputs)
- [2.31. Catver.ini Overview](#231-catverini-overview)
    - [2.31.1. primary](#2311-primary)
    - [2.31.2. secondary](#2312-secondary)
    - [2.31.3. mature](#2313-mature)
- [2.32. nPlayers.ini Overview](#232-nplayersini-overview)
    - [2.32.1 nplayers](#2321-nplayers)


---

## 1.1. Overview 
###### [^ Back to Top](#contents "Back to Top")
This project started from something I required for another project. I was initially intended to be a quick script that extracted some very 
basic information. After hitting some problems with extracting the 'not so simple' data I decided to just keep going with it :)

## 1.2. A quick note before I begin
###### [^ Back to Top](#contents "Back to Top")
The project simply uses an XML file that can be exported from mame application via the command line. Since I’m using Windows as my working 
environment every example is presented as compatible with that. Linux/Mac users should not find any issues translating any of these commands 
or actions.

For those who don’t know or need a reminder (like me, every month), the following command can be run from your cmd prompt when in the directory 
of your mame folder (usually C:\Mame)

`mame.exe -listxml > mame-list.xml`

(For 64bit version use: `mame64.exe -listxml > mame-list.xml`)

***Please note***: I have included an export in a zipped file if you also want to skip the step above (Mame187). You will need to extract this 
file before it can be used.

By typing mame.exe you are calling on the program to run but with the attribute -listxml. This asks Mame to produce a full xml formatted file 
of its full catalogue. The arrow / right angle bracket asks the windows terminal to pipe the contents of the output that would normally just 
end up being spewed out across the screen to a chosen filename instead. You can replace mame-list.xml with your own filename. If you browse 
using windows explorer to the location of your Mame install you should now see your newly generated file (mame-list.xml).

## 1.3. Node.js
###### [^ Back to Top](#contents "Back to Top")
Since this is a Node project I’m going to assume you have node installed. Simply run the following npm (Node Package Manager) command to make 
sure that the packages/modules are installed and up-to-date. Since you’re likely to already be in this directory if you’ve cloned the files 
I’ll not bother asking that you cd into it first... (I think I technically did ask you there)

`npm install`

*There aren’t many dependencies so it won’t take long*

## 1.4. Preparing
###### [^ Back to Top](#contents "Back to Top")
Now is an appropriate time to give an overview of the project structure. You should be able to see that there are the following directories:
* db
* exports
* imports

## 1.5. Db directory
###### [^ Back to Top](#contents "Back to Top")
This is where the end result of the project should be. I have already included a roms.db which you can use and is generated from version 187 
of mame. Later versions may be released but running this project through node will give you full control to produce your own. 

## 1.6. Exports directory
###### [^ Back to Top](#contents "Back to Top")
This folder contains all of the initial exports. The XML file from Mame is subjectively viewed to extract some information. We also use 
Catver.ini and nPlayers.ini for further injection of information (see Imports below for more information).

The extraction from XML only looks at information and doesn’t particularly concentrate on too much of the technical details. I will talk about 
each field in more detail below if you would like more information on what is extracted and how it is interpreted.

It is also worth noting that at this stage in the process which is populated after the read process is all recorded in JSON format. If this is 
more useful to you than in DB format then you can use these files as the process of data extraction has been fully completed by this part. The 
remaining two node files create and write simply convert the JSON data model/object into SQLite inserts.

## 1.7. Imports directory
###### [^ Back to Top](#contents "Back to Top")
This folder holds all the information that is to be imported for the initial read.js to… well read :)
It is necessary that the Catver.ini and nPlayers.ini files remain here and please do stop by [progettosnaps.net](http://www.progettosnaps.net) 
and [arcadebelgium.be](http://nplayers.arcadebelgium.be) (respectfully) for your up-to-date versions of these files. However, the process will 
still work on an older version, they just have to be both present.

I have included a -listxml export in a zipped file if you also want to skip the step above.

**You will need to extract this file before it can be used.**

## 1.8. The 3 steps
### 1.8.1 Read
###### [^ Back to Top](#contents "Back to Top")
The first step is simply to read the information. The script takes care of the information and generates the output in JSON format. You 
simply need to run the following command.

`Node read`

*After approximately 2-4 minutes the application should return you back to the command line with hopefully no errors.*

### 1.8.2 Create
###### [^ Back to Top](#contents "Back to Top")
This is the second step and is used to setup the database structure. Please note that the default filename for the db is *roms.db*. You 
will see that you can create your own but it is worth mentioning now so that you can keep your own generated db safe.

**Commands**

`node create` by itself will not work. You’ll just end up with a list of parameter options discussed below

Usage:

`node create` [-flag] {optional(-db filename)}

**Example**

`node create -all -db mysqlitefile`

This asks create to setup an SQLite db file called *mysqlitefile.db* and to add "-all" tables to it

`node create -2`

This asks create to use a default name called *roms.db* and write roms_tech (table 2) to it only

`node create -roms_info -db anothersqlitefile.db`

This asks create to setup an SQLite db file called *anothersqlitefile.db* and write roms_info (table 1) to it.

Only 1 flag can be set from the following list

| flag                     | Description                                                            |
| -------------------------|------------------------------------------------------------------------|
| `-all`                   | All tables will be dropped if they exist & (re)created                 |
| -1 (or) -roms_info       | Only roms_info will be dropped if it exists & (re)created              |
| -2 (or) -roms_tech       | Only roms_tech will be dropped if it exists & (re)created              |
| -3 (or) -roms_displays   | Only roms_displays will be dropped if it exists & (re)created          |
| -4 (or) -roms_controls   | Only roms_controls will be dropped if it exists & (re)created          |
| -5 (or) -manufacturers   | Only manufacturers will be dropped if it exists & (re)created          |
| -6 (or) -p1i             | Only p1i will be dropped if it exists & (re)created                    |

*This process should only take seconds*

**It is important to note that you will need the tables you wish to write too created before you can write to them. The safest 
option from above is to simply pass the -all flag to have them all created. If you wish to only work on a small portion of the 
data then these other flags allow you to be more specific.**

### 1.8.3 Write
###### [^ Back to Top](#contents "Back to Top")
Now that we have our database tables setup and the tables we are going to write to created we can run our write application.

The parameters are similar from the ones above excluding the *-all* flag. This has been excluded for now on the write process.

Usage:

`Node write` [-flag] {optional(-db filename)}

**Example**

`node write -1 -db mysqlitefile`

This asks write to populate the roms_info table using an SQLite db file called *mysqlitefile.db*

`node write -roms_tech`

This asks write to populate the roms_tech table using the default *roms.db* file

Only 1 flag can be set from the following list

| flag                     | Description                                   |
| -------------------------|-----------------------------------------------|
| -1 (or) -roms_info       | Only roms_info will be populated              |
| -2 (or) -roms_tech       | Only roms_tech will be populated              |
| -3 (or) -roms_displays   | Only roms_displays will be populated          |
| -4 (or) -roms_controls   | Only roms_controls will be populated          |
| -5 (or) -manufacturers   | Only manufacturers will be populated          |
| -6 (or) -p1i             | Only p1i will be populated                    |

**You may find that it takes several seconds for the initial data to be imported from the JSON model. The write process takes 
a lot longer and it appears to go very slowly to start with. I would expect (or certainly from what I have experienced) that 
this takes anywhere from 1-4 minutes to complete. The progress appears to only increase by 1 each time until it nears the end 
of the process where the entire write happens very quickly. Please be patient.**

## 1.9. Viewing the Results
###### [^ Back to Top](#contents "Back to Top")
There are many ways to view SQLite databases. My personal preference for now is to download and install a free application 
called [SQLite Database Browser](http://sqlitebrowser.org/). This tool allows you to run and save your own queries as well as 
view and search columns (with filter option).

Thanks, Dal1980

http://retro.zombiesbyte.com


---


# 2. Reference 

**The following sections are for reference only and delve deeper into the thought process on how (and why) the data is extracted.**

## 2.1. Introduction
###### [^ Back to Top](#contents "Back to Top")

The task of extracting some of this information has been difficult in some steps. The idea behind why I’ve gone down particular paths 
or provided information based on a logical speculation is so that this can be used in systems like front-ends. Having boundaries for 
data or at least consistent data (where possible) provides more scope for design when including it in a front-end.

I will attempt to share my knowledge about the fields in Mame’s XML however you should always check if the information I have provided 
is accurate as I have not found any official documentation on the XML and some of this is pure speculation. I will generally state this 
to be so if I am trying to explain the details. Please feel free to correct me on any of this, it would help a great deal.

The method I’ll use to describe each field is in the order that read.js works through it. If I miss a field then I will have probably 
not used it in the data extraction process. Some fields are more complex than others… let’s begin

### 2.1.1. Notes
###### [^ Back to Top](#contents "Back to Top")
The XML contains a lot of information, sometimes the information we find for one entry can be quite different to the amount of information 
from another. To make matters worse, this information can be expressed in all sorts of different ways and I have tried my best to catch a 
wide array of possibilities. Sometimes this information is illogically formatted and it would be impossible for the extraction to take place 
without targeting the entry specifically. Luckily these are few and far between and I’d like to see these issues raised directly with MameDev 
once they have been all compiled and a case put forward for approval (or at least, a review).

*It’s great that the first 6 fields are my weakest entries.*

## 2.2. sourcefile
###### [^ Back to Top](#contents "Back to Top")
Not sure exactly.
## 2.3. sampleof
###### [^ Back to Top](#contents "Back to Top")
Not sure exactly.
## 2.4. cloneof
###### [^ Back to Top](#contents "Back to Top")
If this is a clone of a parent then the parent sourcefile will be shown here I think.
## 2.5. romof
###### [^ Back to Top](#contents "Back to Top")
Not sure exactly.
## 2.6. isdevice
###### [^ Back to Top](#contents "Back to Top")
If the system is a device.
## 2.7. runnable
###### [^ Back to Top](#contents "Back to Top")
I assume this is if the emulation is possible. In terms of it being practical. Not 100% sure.  

## 2.8. description
###### [^ Back to Top](#contents "Back to Top")
This seems to be a field that is a dumping ground for various information. I have managed to identify the following data types 
from this field:
* Description (a full name of the rom/system)
* Region / Localisation information
* Set numbers
* Revision numbers
* Version numbers

It is worth mentioning that this field has also been recoded as desc_1 and desc_2 in the database. The desc_1 field is meant to hold 
the game title/full name while the second field generally shows the garbage collection of various appended information. If desc_1 and 
desc_2 are concatenated with a space in the middle then the original Mame XML description can be recreated.

I’ve used the term region to explain the general scope of distribution of the entry. If an entry is pre-defined as “world” then this 
would be established as the region. Other generic terms are also regarded as regions such as “Europe”, “US” and “Oceania”. “Japan” is 
both a region and a localisation due to it being an important player in the distribution of roms/systems.

Localisations would exist for example if they had a particular location they designed an entry for. So for something that was designed 
for Germany and France would have both Germany and France as a localisation entry however region would be set as Europe. In another 
example, US, Japan and France may be three localisations found in the entry but Region has been set as World due to it being in more 
than one specific place that cannot be singularly named. I believe that is how Mame has originally used “World” but again this is very 
much down to providing consistency in data without losing information. The region information is an additional field which is not found 
from the XML but rather extrapolated from assumptions of existing data.

Mame XML example
`<description>9-Ball Shootout (set 3)</description>`

## 2.9. year
###### [^ Back to Top](#contents "Back to Top")
This is generally a straightforward entry. Sometimes there are question marks placed over the units of the year to illustrate that the 
exact year is not known. Since this database is meant to provide some consistencies, I have opted to use an integer field type and set 
any question marks to a zero.

## 2.10. manufacturer
###### [^ Back to Top](#contents "Back to Top")
Sometimes this field hold 1 manufacturer while other times it can hold many manufacturers. One part of this information sometimes reveals 
the company name that holds the license. All this information is extracted. We also need to clean up the slight differences in how we use 
"limited" for example as Mame’s XML hold many different ways of showing the common abbreviations. The corrections on this are quite 
passive and only the company types part of the string have been cleaned.

For example

", ltd.", ", ltd", " ltd.", " limited", " ltd" and ",ltd" are converted to "Ltd"

* An Example Company Name, ltd.
* An Example Company Name limited
* An Example Company Name,ltd

Becomes

* An Example Company Name Ltd

This helps on condensing the slight variations in the titles

This does not affect integrity of recorded company names

For example
* An Example Company Name
* An Example Company limited
* An Example of Company ,ltd

Becomes

* An Example Company Name
* An Example Company Ltd
* An Example of Company Ltd

The manufacturers are also stored in a separate JSON file which was previously used to generate a lookup table. This has since been 
changed in favour of directly storing the manufacturer rather than a lookup value. This file may help other projects so I’ve left it 
available for use.

The bootleg flag has also been determined from this field.

total_manufacturers is recorded in the JSON model only and is a tally of how many manufacturers there are in a particular entry.

## 2.11. Display Information
## 2.12. (display) tag
###### [^ Back to Top](#contents "Back to Top")
Each display is given a tag. I’m no sure where the tag comes from but maybe buried deep in the source code. It may also be something 
physical like a sticker but regardless, this is used in identifying between more than one screen if present.
## 2.13. (display) type
###### [^ Back to Top](#contents "Back to Top")
Possible values (to date): "lcd", "raster", "unknown" or "vector".
## 2.14. (display) rotate
###### [^ Back to Top](#contents "Back to Top")
Possible values (to date): “null”, "0", "90", "180" and "270".
The rotation of the screen. This gives us a clue on the orientation although it is not known why you would rotate a screen 180 or 
270 since this places the screen up-side-down while 0 and 90 would be enough to change the orientation.
## 2.15. (display) width
###### [^ Back to Top](#contents "Back to Top")
The pixel width of the screen (this gives us a good indication of resolution)
## 2.16. (display) height
###### [^ Back to Top](#contents "Back to Top")
The pixel height of the screen (this gives us a good indication of resolution)
## 2.17. (display) refresh
###### [^ Back to Top](#contents "Back to Top")
A floating-point value to the native refresh rate.
## 2.18. (display) pixclock
###### [^ Back to Top](#contents "Back to Top")
Uknown what this field does exactly but I was informed that is it useful together with the other information about the display.

total_displays is recorded in the JSON model only and is a tally of how many displays there are in a particular entry.

## 2.19. (driver) status
###### [^ Back to Top](#contents "Back to Top")
The status field is a general field that tells us the overall status of the emulation as a whole. This field shows the lowest 
denominating factor in emulation, color, sound and graphic. The status field is useful for quickly targeting those entries 
which are regarded as being in perfect working order.

I use a numeric system to symbolise the following states
* 1: Preliminary
* 2: Imperfect
* 3: Good

## 2.20. (driver) emulation
###### [^ Back to Top](#contents "Back to Top")
How successful the rom emulation is regarded in its current form

*See (driver) status for more information*

## 2.21. (driver) color
###### [^ Back to Top](#contents "Back to Top")
How successful the colour emulation is regarded in its current form

*See (driver) status for more information*

## 2.22. (driver) sound
###### [^ Back to Top](#contents "Back to Top")
How successful the sound emulation is regarded in its current form

*See (driver) status for more information*

## 2.23. (driver) graphic
###### [^ Back to Top](#contents "Back to Top")
How successful the graphic emulation is regarded in its current form

*See (driver) status for more information*

## 2.24. (driver) savestate
###### [^ Back to Top](#contents "Back to Top")
This field is set to show if Mame supports saving and loading of the game state. I believe this is something of a Mame feature 
rather than something that existed on the original system.

The possible flags are:
* Null (zero, not supported)
* 0 – not supported
* 1 – supported

## 2.25. Input Overview
###### [^ Back to Top](#contents "Back to Top")
This set of information has been a little disappointing for me personally. Due to the different perspectives on the hardware as a 
whole versus the specifics of the rom the information gathered has leant towards profiling the full hardware capabilities rather 
than the specifics of what was used.

In a nut shell, this means that a PCB for instance could have supported a wide range of inputs which is obviously valuable 
information. This however does not grant us much of an insight into what controls the game allowed. To put this as an example. 
A particular rom may have been programmed to allow for movement left and right only (2-way horizontal) with 1 button input (let’s 
say this was a punch button for the sake of argument). We then come to the PCB that in this example allows input of an 8 way 
joystick (joy/digital), and supports up to 3 button inputs. The two profiles are both important however only the later has been 
recorded within the XML. (can someone confirm that this is indeed correct?)

The following two sections show information about the control panel (or system inputs for peripheral control) (I’m not sure if I 
phrased that right so feel free to correct me)

## 2.26. (input) players
###### [^ Back to Top](#contents "Back to Top")
The total number of players the system allows.
## 2.27. (input) coins
###### [^ Back to Top](#contents "Back to Top")
The number of coin slots the system had
## 2.28. (input) service
###### [^ Back to Top](#contents "Back to Top")
If there was a service button present (for admin)
## 2.29. (input) tilt
###### [^ Back to Top](#contents "Back to Top")
If there was a tilt mechanism present. I think this was attached to visual or audio alarm (or both). Possibly worked the same as 
a tilt mechanism on a pinball machine. Did people really try and move arcades? This field opens up a discussion the more I think 
about it. I haven’t checked if this field only appears on pinball machines so might be self-explanatory. 

## 2.30. Controller Inputs
###### [^ Back to Top](#contents "Back to Top")
The following sub-sections may have multiple occurrences to describe each of the inputs on a machine. The tags will only be 
partially used for each entry as some devices do not require that type of tag to be included. For instance, ways2 is only used 
on "doublejoy" entries as it describes the second joy way points.

### 2.30.1. (input) player
###### [^ Back to Top](#contents "Back to Top")
The player number that this entry refers to. i.e. 1 (player 1) could have multiple inputs.
### 2.30.2. (input) controls
###### [^ Back to Top](#contents "Back to Top")
The ‘type’ of controls. Possible values and descriptions follow:
* "stick" - an alologue registered stick
* "positional" - I’m still not sure on this one, some kind of twisty joystick or something (flight control maybe?)
* "doublejoy - left and right-hand joystick
* "pedal" – (sprung return?) analogue
* "dial" - a spinner
* "paddle" - like a spinner but with stops (usually set at 330 degrees according to Wiki) This may also have a button(?)
* "only_buttons" - buttons only so this entry has no other control input.
* "lightgun"- a lightgun
* "trackball" - A sunken ball that you roll with finger and/or palm of your hand. Like an upside down balled-mouse 
but with a bigger ball.
* "gambling" - gambling buttons of some ilk
* "hanafuda" - some kind of mahjong control I think(?)
* "keyboard" – A keyboard
* "keypad" – I presume something similar to the num-pad on a keyboard, perhaps not specifically for numbers though.
* "mouse" – squeak 
* "triplejoy" - there's no way anyone can hold more than 2 :). From what I can gather on this is that it was mainly used on 
a system that understood the input of 3 joys as a single input. This would have more than likely belonged to a system that 
enabled up to 3 players to play at the same time. I’m not sure though.

### 2.30.3. (input) buttons
###### [^ Back to Top](#contents "Back to Top")
The total number of buttons. It is not specific to the control type so these may be buttons on a joystick or regular buttons 
on the control panel or even a mixture of both. We are not even sure if the control panel used the total amount of buttons 
shown (*see Input Overview for more information*)

### 2.30.4. (input) ways
###### [^ Back to Top](#contents "Back to Top")
The available (or allowable) directions that a joy can travel on its axis. These sometimes used restrictor plates if it was 
more elaborate restrictions needed.

Possible values and descriptions are as follows:
* "1" way seems to be used as a lever such as a break (handlebar) or single gear shift. I assume this is on a spring 
that returns it back. 
* "2" way. Left and right (horizontal) or up and down (vertical), perhaps sometimes rotated to be an angle of diagonal-up 
and diagonal-down. There doesn’t seem to be any evidence to support that the path was ever miss-aligned or non-opposite. 
Was there ever up + left combinations. If so then I imagine that would have been a 4 way with a restrictor plate attached. 
* "3 (half4)" Is likely to be a Tetris style game with up disabled. Other combinations exist.
Soapbox: This puts me mentally on the back-foot. When we talk about Mame recording what the PCB input could facilitate we 
break that ideology when we start talking about the restrictor plates. Since the 3 (half4) is indeed a fully-fledged 4 way 
control system. We suddenly start getting specific about things randomly. Anyway, let’s move on before this turns to any 
more of a rant on my part.
* "5 (half8)" is likely to be UL, U, UR, DR, DL (basically 8 way with L, D & R removed) Other combinations exist.
* "strange2" seems to only appears on 1 game and it's accompanied by a joy with 1 button. Don't know. Is 2 a way point or 
was there a strange1 and possibly even a strange3 that became reclassified after finding out it wasn’t so “strange” after all lol
* "vertical2" is up + down rather than the default left + right 2-way
* "16" way is a up, down, left, right joystick with 12 other button inputs. As far as I can tell 16-way is pretty much only used 
on Tomy and Entex hardware which is reserved for domestic handheld use.
### 2.30.5. (input) ways2
###### [^ Back to Top](#contents "Back to Top")
The second joy ways for instances where doublejoy is the control type. See (input) ways for more information
### 2.30.6. (input) minimum
###### [^ Back to Top](#contents "Back to Top")
Some measurement of minimum restriction. It may be degrees for things that turn/spin or it may be the threshold measurement 
boundary for registering movement.
### 2.30.7. (input) maximum
###### [^ Back to Top](#contents "Back to Top")
See above
### 2.30.8. (input) sensitivity
###### [^ Back to Top](#contents "Back to Top")
The sensitivity may control the threshold registrations for movement. I imagine that minimum and maximum also play a role in 
this in some configurations. It may simply be a step value.
### 2.30.9. (input) keydelta
###### [^ Back to Top](#contents "Back to Top")
Absolutely no idea what this is.
### 2.30.10. (input) reverse
###### [^ Back to Top](#contents "Back to Top")
I imagine this is when up is down and down is up for such things as flight sticks, or perhaps it has something to do with 
control panel layout. I’m not sure.
### 2.30.11. total_inputs
###### [^ Back to Top](#contents "Back to Top")
Recorded in the JSON model only and is a tally of how many inputs there are in a particular entry.

## 2.31. Catver.ini Overview
###### [^ Back to Top](#contents "Back to Top")
The file is used to match against our full list of items. The data is then separated into the following properties
### 2.31.1. primary
###### [^ Back to Top](#contents "Back to Top")
Catver.ini chosen primary category
### 2.31.2. secondary
###### [^ Back to Top](#contents "Back to Top")
Catver.ini chosen secondary category
### 2.31.3. mature
###### [^ Back to Top](#contents "Back to Top")
This holds a flag of true if it has been marked as mature according to Catver.ini

## 2.32. nPlayers.ini Overview
### 2.32.1 nplayers
###### [^ Back to Top](#contents "Back to Top")
Field contains the same entry as found in nPlayers.ini

-end
###### [^ Back to Top](#contents "Back to Top")