'use babel';

import path from 'path';
import SerialPlotterView from './serial-plotter-view';
import { CompositeDisposable } from 'atom';
import { Disposable } from 'atom';
import { BufferedProcess } from 'atom';

export default {

  serialPlotterView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.serialPlotterView = new SerialPlotterView(state.serialPlotterViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.serialPlotterView.getElement(),
      visible: false
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

    if ( this.toggle.state )
    this.detectSerialPorts();
    this.detectSerialData();

    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
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
        if(code) {
          atom.notifications.addError('Failed to detect ports');
        }
        console.log('sermon detected ports: ' + result);
        // this.setPorts(JSON.parse(result).ports);
      }
    });

    pyscript.onWillThrowError((err) => {
      err.handle();
      atom.notifications.addError('Failed to detect ports');
    });

  },

  detectSerialData()) {

    console.log('trying to read serial data ...');

    var result = '';
    var res_dir = path.join(
      __dirname, path.join('..', 'resources')
    );

    var script = 'get_serial.py';
    var cmd = path.join(res_dir, script);

    var pyscript = new BufferedProcess({
      command: 'python3',
      args: [cmd, '-p', '/dev/cu.usbserial-14430', '-b', '115200'],
      stdout: (data) => {
        result += data;
      },
      exit: (code) => {
        if(code) {
          atom.notifications.addError('Failed to detect data');
        }
        console.log('sermon detected data: ' + result);
        // this.setPorts(JSON.parse(result).ports);
      }
    });

    pyscript.onWillThrowError((err) => {
      err.handle();
      atom.notifications.addError('Failed to detect ports');
    });

  }
};
