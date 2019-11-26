'use babel';

export default class SerialPlotterView {

  constructor(serializedState) {

    // Create root element
    console.log('Create Div ...');

    basic = document.createElement('div');
    basic.classList.add('serial-plotter');

    // Create message element
    message = document.createElement('div');
    message.textContent = 'Plotting Serial Data ...';
    message.classList.add('message');
    basic.appendChild(message);

  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    basic.remove();
    message.remove();
  }

  getElement() {
    return basic;
  }
}
