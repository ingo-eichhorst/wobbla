const config = {};

/** **********************************
         App configuration
*********************************** */

// channels and related Informations
config.channels = [
  {
    name: 'Tears of Steal',
    chName: 'Demo 1',
    subPath: './subs/TOS-de.srt',
    url: '',
  },
  {
    name: 'Sintel',
    chName: 'Demo 2',
    subPath: './subs/sintel_de.srt',
    url: '',
  },
  {
    name: 'Frau TV (WDR)',
    chName: 'WDR',
    subPath: './subs/frautv2.srt',
    url: '',
  },
  {
    name: 'Aktuelle Stunde (Einsfestival)',
    chName: 'Einsfestival',
    subPath: './subs/aks2.srt',
    url: '',
  },
];

// word minimum occurances in the subtitles of span offset
config.wordMinOccurrence = 2;

// build the global cloud
config.cloudMaxEntries = 50;
config.globalCloud = [config.cloudMaxEntries];

// offset in min - at wich position the subtitles start to run
config.offset = 5;

// run in real time mode
config.startTime = new Date().getTime();

module.exports = config;
