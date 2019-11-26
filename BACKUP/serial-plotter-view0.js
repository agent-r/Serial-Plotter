'use babel';

import Config from '../settings';


export default class SerialPlotterView {

  constructor(serializedState) {
    // Create root element

    basic = document.createElement('div');
    basic.classList.add('serial-plotter');


    /*
    message = document.createElement('div');
    message.textContent = 'Plotting Serial Data ...';
    message.classList.add('message');
    basic.appendChild(message);
    */

    drawing = document.createElement('canvas');
    drawing.width = Config.window.width;
    drawing.height = Config.window.height;
    basic.appendChild(drawing);
    drawing = drawing.getContext('2d');
    drawing.strokeStyle = Config.drawing.color;
    drawing.lineWidth = Config.drawing.linewidth;

  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    basic.remove();
    // message.remove();
  }

  getElement() {
    return basic;
  }
}
