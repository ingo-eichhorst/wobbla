# wobbla
The TVHackday2015 team Wobbla's app to build a word cloud of subtitle files.

The app allows you to build a programm of seperately running channels. Each subtitle stands for one channel. After the app starts running the subtiles start to run in real time with 5 (configurable) minutes offset. 
It scans the last 5 minutes of the requestet channel/subtitle and weights it by its occurances and time passed since the last occurance.

Please see the description video for more details:
https://www.youtube.com/watch?v=XK9OCQxX62k

The app comes with a simple frontend but can also work with other frontends as done at the TV Hackday

## SetUp

#### Install required Software

Only needed Software is Node.js.
To install follow the instructions for your OS at: https://nodejs.org/en/download/package-manager/ 

#### Download

Downloard this package and unzip or create a local git.

#### Install Dependencies

Go to the root folder of this App and do:
<pre>npm i</pre>

#### Configuration

The configuration is made in *./config/config.js*

###### Channel Configuration

This defines the channels/subtitle files. Two example srt-files are included to help you get started.

<pre>[
  {
    name: "Frau TV (WDR)",  // containing the Name of the current airing 
    chName: "WDR", // channel Name
    subPath: "./subs/frautv2.srt", // path to the subtitle file (only *.srt will work)
    url: "/videos/frautv.mp4" // url to a related video file - the vid-folder (./vid/some.mp4) is used to statically deliver files as "/video/some.mp4" download
  },
  {...}
]</pre>

###### Advanced Config:
* wordMinOccurrence --> Minimum occurance of a Word before it is used for processing (default: 2)
* cloudMaxEntries --> Maximum entries of the via API delivered cloud (default: 50)
* offset --> offset in min - at wich position the subtitles start to run

#### Start App

To start the App simply
<pre>node app.js</pre>

The Frontend can now be visited at: http://127.0.0.1:4242

## API

The API is somehow RESTfull and returns JSON.

#### Channel

All channels defined in the config and the parsed subtitle files will be delivered at:
<pre> GET /channels </pre>

#### Cloud

The cloud can be build as a descending list of entries or as static cloud where entries only fall out of the cloud if other wordes get higher ranked. Set the "mode" parameter in the query string to desc|static for utilarisation. (default: desc)

The cloud contains a list of words with it's size(ranking) and all the channels that shown the word in the last 5 minutes.

<pre> GET /cloud?mode=desc </pre>

<pre> GET /cloud/:id?mode=static </pre>

## License

MIT
