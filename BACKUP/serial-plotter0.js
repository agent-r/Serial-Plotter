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
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(1200, 1);
    ctx.stroke();
    ctx.moveTo(0, 150);
    ctx.lineTo(1200, 150);
    ctx.stroke();
    ctx.moveTo(0, 299);
    ctx.lineTo(1200, 299);
    ctx.stroke();


    // this.detectSerialPorts();
    this.detectSerialData();

    return (
      // this.modalPanel.isVisible() ?
      // this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

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


  detectSerialData() {

    console.log('trying to read serial data ...');

    var position = 0;
    var value = new Array();

    var d_result = '';
    var d_res_dir = path.join(
      __dirname, path.join('..', 'resources')
    );

    var d_script = 'get_serial.py';
    var d_cmd = path.join(d_res_dir, d_script);

    console.log(d_cmd);

    var d_pyscript = new BufferedProcess({
      command: 'python3',
      args: [d_cmd],
      stdout: (d_data) => {
        d_result = d_data;
        d_data = 0;
        // console.log(d_result);
        d_result = parseInt(10 * parseFloat(d_result));
        message.textContent = d_result;

        if (value.length < 1200) {value.push(d_result);}
        else {value.shift(); value.push(d_result);}

        ctx.clearRect(0,0,1200,300);
        ctx.beginPath();
        ctx.moveTo(0, 150 + value[0]);
        for (i = 1; i < value.length; i++) {
        ctx.lineTo(i, 150 + value[i]);
        }
        ctx.stroke();
        position = position+1;

      },
      exit: (d_code) => {
        if (d_code) {
          atom.notifications.addError('Failed to detect data');
        }
        console.log('end data stream: ' + d_result);
        // this.setPorts(JSON.parse(result).ports);
      }
    });

    d_pyscript.onWillThrowError((err) => {
      err.handle();
      atom.notifications.addError('Failed to detect ports');
    });

  },

};
