'use babel';

import path from 'path';
import SerialPlotterView from './serial-plotter-view';
import {
  CompositeDisposable
} from 'atom';
import {
  Disposable
} from 'atom';
import {
  BufferedProcess
} from 'atom';

export default {

  serialPlotterView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.serialPlotterView = new SerialPlotterView(state.serialPlotterViewState);
    this.modalPanel = atom.workspace.addBottomPanel({
      item: this.serialPlotterView.getElement(),
      visible: true
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'serial-plotter:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.serialPlotterView.destroy();
  },

  serialize() {
    return {
      serialPlotterViewState: this.serialPlotterView.serialize()
    };
  },

  toggle() {
    console.log('SerialPlotter was toggled!');
    this.modalPanel.show();

    drawing = document.createElement('canvas');
    drawing.width = 1200;
    drawing.height = 300;
    basic.appendChild(drawing);
    ctx = drawing.getContext('2d');
    ctx.strokeStyle = '#0000FF';
    ctx.lineWidth = 1;

    // this.detectSerialPorts();
    this.detectSerialData();

    return (
      // this.modalPanel.isVisible() ?
      // this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  /*
  detectSerialPorts() {

  console.log('trying to detect serial ports ...');

  var result = '';
  var res_dir = path.join(
  __dirname, path.join('..', 'resources')
);

var script = 'get_serial.py';
var cmd = path.join(res_dir, script);

var pyscript = new BufferedProcess({
command: 'python3',
args: [cmd, '--listjson'],
stdout: (data) => {
result += data;
},
exit: (code) => {
if (code) {
atom.notifications.addError('Failed to detect ports');
}
console.log('sermon detected ports: ' + result);
pyscript.kill;
}
});

pyscript.onWillThrowError((err) => {
err.handle();
atom.notifications.addError('Failed to detect ports');
});

},
*/

  detectSerialData() {

    console.log('Trying to read serial data ...');

    var stored_values = new Array();
    var split_data = new Array();
    var copy_data = '';

    var config_title = '0';
    var config_size = 0;
    var config_lable = new Array();
    var config_color = new Array();
    var config_scale = 1;
    var scale_highest = 0;
    var scale_lowest = 0;
    var config_zero = 150;
    var skip_empty = false;

    var res_dir = path.join(
      __dirname, path.join('..', 'resources')
    );

    var script = 'get_serial.py';
    var cmd = path.join(res_dir, script);

    console.log('Starting Python Script ... ' + cmd);

    var pyscript = new BufferedProcess({
      command: 'python3',
      args: [cmd],
      stdout: (data) => {
        copy_data = data;
        data = 0;

        //        result = data;
        //        data = 0;

        if (copy_data != 0) {
          split_data = copy_data.split('#');
          for (j = 0; j < split_data.length; j++) {
            if (split_data[j].length > 2) {
              while ((split_data[j].length > 4) && (split_data[j].charAt(0) != '{')) {
                split_data[j] = split_data[j].substr(1);
              }
              // console.log(split_data[j]);


              if (isJSON(split_data[j])) {
                skip_empty = false;
                parsed_data = JSON.parse(split_data[j]);
                if (typeof parsed_data == 'object') {
                  if (stored_values.length < 1200) {
                    stored_values.push(parsed_data);
                  } else {
                    stored_values.shift();
                    stored_values.push(parsed_data);
                  }
                }
              } else {
                skip_empty = true;
              }
            }
          }

          if (skip_empty == false) {

            if (stored_values[stored_values.length - 1].hasOwnProperty('ng')) { // We have a config !
              for (k = 0; k < stored_values[stored_values.length - 1].ng; k++) {
                config_title = stored_values[stored_values.length - 1].g[0].t;
                config_size = stored_values[stored_values.length - 1].g[0].sz;
                for (l = 0; l < config_size; l++) {
                  config_lable[l] = stored_values[stored_values.length - 1].g[0].l[l];
                  config_color[l] = stored_values[stored_values.length - 1].g[0].c[l];
                }
                console.log(' WE HAVE A CONFIG ... Title: ' + config_title + '  Size: ' + config_size + '  Lables: ' + config_lable + '  Color: ' + config_color);
              }
            }


            ctx.clearRect(0, 0, 1200, 300);
            ctx.font = "12px Arial";
            ctx.fillStyle = 'white';
            ctx.fillText("Graph Title: " + config_title, 10, 10);

            scale_highest = stored_values[0].g[0].d[0];
            scale_lowest = stored_values[0].g[0].d[0];

            for (n = 0; n < config_size; n++) {
              for (o = 0; 0 < stored_values.length - 1; o++) {
                if (scale_lowest > stored_values[n].g[0].d[o]) {
                  scale_lowest = stored_values[n].g[0].d[o];
                }
                if (scale_highest < stored_values[n].g[0].d[o]) {
                  scale_highest = stored_values[n].g[0].d[o];
                }
              }
            }

            console.log("lowest " + scale_lowest + "    highest " + scale_highest);

            if ((scale_highest - scale_lowest) != 0) {
              config_scale = 260 / parseFloat(scale_highest - scale_lowest);
              console.log("config_scale " + config_scale);
            } else {
              config_scale = 1;
              console.log("config_scale " + config_scale);
            }
            config_zero = (260 / 2) + parseFloat((scale_lowest + scale_highest) / 2);
            console.log("config_zero " + config_zero);

            ctx.beginPath();
            ctx.moveTo(0, 20);
            ctx.lineTo(1200, 20);
            ctx.moveTo(0, config_zero);
            ctx.lineTo(1200, config_zero);
            ctx.moveTo(0, 290);
            ctx.lineTo(1200, 290);
            ctx.strokeStyle = 'white';
            ctx.stroke();

            console.log("Lines fertig ...");

            for (m = 0; m < config_size; m++) {
              ctx.fillStyle = config_color[m];
              ctx.fillText(config_lable[m] + " : " + stored_values[0].g[0].d[m], 200 * m + 200, 10);
              console.log("Text fertig ...");
              // ctx.beginPath();
              // ctx.moveTo(0, config_zero - stored_values[0].g[0].d[m]);
              for (i = 1; i < stored_values.length; i++) {
                // ctx.lineTo(i, config_zero - stored_values[i].g[0].d[m]);
                console.log(stored_values[i].g[0].d[m]);
              }
              // ctx.strokeStyle = config_color[m];
              // ctx.stroke();
              console.log("Curve Stroke ...");
            }
          } else {
            console.log('Skip ...');
          }
        }
      },
      exit: (code) => {
        if (code) {
          atom.notifications.addError('Failed to detect data');
        }
        console.log('end data stream: ' + code);
      }
    });

    pyscript.onWillThrowError((err) => {
      err.handle();
      atom.notifications.addError('Failed to detect ports');
    });

  }
}

function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
