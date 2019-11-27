'use babel';

// import fs from 'fs';
import path from 'path';
import Config from '../settings';
import SerialPlotter from './serial-plotter';
import { BufferedProcess } from 'atom';

export default class SerialPlotterView {

	constructor(serializedState) {

		// this.element.innerHTML = fs.readFileSync(path.join(__dirname, './serial-plotter.html'));

		panel_maximized = false;
		panel_size = Config.window.height;

		// Create root element
		basic = document.createElement('div');
		// basic.style.width = '100vh';
		basic.style.width = '100vh';
		// basic.style.height = '100vh';
		// basic.style.height = Config.window.height + 'px';
		// basic.style.display = 'table-cell';
		// basic.style.verticalAlign = 'middle';
		// basic.style.textAlign = 'center';
		basic.classList.add('serial-plotter');

		toolbar = document.createElement('div');
		toolbar.classList.add('btn-group');
		toolbar.style.width = '100vh';
		toolbar.style.padding = '5px';
		basic.append(toolbar);

		caption = document.createElement('div');
		caption.style.float = 'left';
		toolbar.append(caption);
		caption_text = document.createTextNode("Serial Plotter 1.0");
		caption.style.padding = '5px';
		caption.style.fontSize = '12px';
		caption.appendChild(caption_text);

		tb_close = document.createElement("BUTTON");
		tb_close.classList.add('btn');
		tb_close.classList.add('icon-close');
		tb_close.style.float = 'right';
		tb_close.onclick = function(){ atom.packages.loadedPackages["serial-plotter"].mainModule.toggle() };
		toolbar.append(tb_close);

		tb_hide = document.createElement("BUTTON");
		tb_hide.classList.add('btn');
		tb_hide.classList.add('icon-minimize');
		tb_hide.style.float = 'right';
		tb_hide.onclick = function(){ atom.packages.loadedPackages["serial-plotter"].mainModule.serialPlotterView.minimize() };
		toolbar.append(tb_hide);

		tb_plus = document.createElement("BUTTON");
		tb_plus.classList.add('btn');
		tb_plus.classList.add('icon-up');
		tb_plus.style.float = 'right';
		tb_plus.onclick = function(){ atom.packages.loadedPackages["serial-plotter"].mainModule.serialPlotterView.panel_size_change(200) };
		toolbar.append(tb_plus);

		tb_minus = document.createElement("BUTTON");
		tb_minus.classList.add('btn');
		tb_minus.classList.add('icon-down');
		tb_minus.style.float = 'right';
		tb_minus.onclick = function(){ atom.packages.loadedPackages["serial-plotter"].mainModule.serialPlotterView.panel_size_change(-200) };
		toolbar.append(tb_minus);



		content_area = document.createElement('div');
		content_area.style.height = Config.window.height + 'px';
		content_area.style.width = '100vh';
		content_area.style.display = 'table-cell';
		content_area.style.verticalAlign = 'middle';
		basic.append(content_area);


		// Create Connection Form
		form_area = document.createElement('div');
		form_area.style.textAlign = 'center';
		content_area.append(form_area);

		listBox1 = document.createElement('div');
		listBox1.style.display = 'inline-block';
		form_area.appendChild(listBox1);

		dropdownPort = document.createElement("select");
		dropdownPort.classList.add('form-control');
		listBox1.append(dropdownPort);

		spacer = document.createElement('div');
		spacer.style.width = '10px';
		spacer.style.display = 'inline-block';
		form_area.appendChild(spacer);

		listBox2 = document.createElement('div');
		listBox2.style.display = 'inline-block';
		form_area.appendChild(listBox2);

		dropdownBaudrate = document.createElement("select");
		dropdownBaudrate.classList.add('form-control');
		listBox2.append(dropdownBaudrate);

		spacer = document.createElement('div');
		spacer.style.width = '10px';
		spacer.style.height = '20px';
		spacer.style.display = 'block';
		form_area.appendChild(spacer);

		buttonBox = document.createElement('div');
		buttonBox.style.display = 'block';
		form_area.appendChild(buttonBox);

		form_button_connect = document.createElement("BUTTON");
		form_button_text = document.createTextNode("Connect");
		form_button_connect.appendChild(form_button_text);
		form_button_connect.disabled = false;
		// form_button_connect.style.color = 'black';
		form_button_connect.onclick = function(){ atom.packages.loadedPackages["serial-plotter"].mainModule.serialPlotterView.check() };
		form_button_connect.classList.add('btn');
		// form_button_connect.classList.add('icon');
		form_button_connect.classList.add('icon-chevron-right');
		form_area.appendChild(form_button_connect);

		console.log(this);

		// Create Plotting Area
		plotter_area = document.createElement('div');
		plotter_area.style.display = 'none';
		plotter_area.style.height = Config.window.height + 'px';
		plotter_area.style.display = 'table-cell';
		plotter_area.style.verticalAlign = 'middle';
		plotter_area.style.textAlign = 'center';
		plotter_area.style.backgroundColor = 'rgb(44, 48, 55)';
		content_area.append(plotter_area);

		plotter_canvas = document.createElement('canvas');
		plotter_canvas.width = atom.workspace.panelContainers.bottom.element.clientWidth;
		plotter_canvas.height = Config.window.height;
		drawing = plotter_canvas.getContext('2d');
		drawing.strokeStyle = Config.drawing.color;
		drawing.lineWidth = Config.drawing.linewidth;
		plotter_area.appendChild(plotter_canvas);

		/*
		message = document.createElement('div');
		message.textContent = 'Plotting Serial Data ...';
		message.classList.add('message');
		basic.appendChild(message);
		*/

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


// Show Form, Get Ports and Baudrates
showSettingsLayer(){

		form_area.style.display = 'block';

		this.detectSerialPorts()
		.then(portList => {

			dropdownPort.options.length = 0;

			for (a = 0; a < portList.ports.length; a++) {
				var option_x = new Option();
				option_x.value = portList.ports[a].device;
				option_x.text = portList.ports[a].device;
				dropdownPort.options.add(option_x);
				if (a == Config.connection.port) { dropdownPort.value = portList.ports[Config.connection.port].device; }
				
			}
			// dropdownPort.value = portList.ports[Config.connection.port].device;

			dropdownBaudrate.options.length = 0;

			for (b = 0; b < 20; b++) {
				var option_x = new Option();
				option_x.value = Config.menu.baudrates[b];
				option_x.text = Config.menu.baudrates[b];
				dropdownBaudrate.options.add(option_x);
			}
			dropdownBaudrate.value = Config.connection.baudrate;

		})
		.catch(error => {
			console.log(error);
		})
	}

	hideSettingsLayer(){
		form_area.style.display = 'none';
	}

	showDrawingLayer(){
		plotter_area.style.display = 'block';
	}

	hideDrawingLayer(){
		plotter_area.style.display = 'none';
	}

	detectSerialPorts() {
		return new Promise((resolve, reject) => {

			console.log('trying to detect serial ports ...');
			var result = '';
			var res_dir = path.join(	__dirname, path.join('..', 'resources'));
			var cmd = path.join(res_dir, 'serial_stream.py');

			console.log('Starting Python Script ... ' + cmd);

			var pyscript_port = new BufferedProcess({
				command: 'python3',
				args: [cmd, '--listjson'],
				stdout: (data) => {
					result = result + data;
				},
				exit: (code) => {
					if (code) {
						atom.notifications.addError('Failed to detect ports');
						reject (new Error("Error ... Reject"))
					}
					pyscript_port.kill;
					result = JSON.parse(result);
					resolve(result);
				}
			});

			pyscript_port.onWillThrowError((err) => {
				err.handle();
				atom.notifications.addError('Failed to detect ports');
			});
		})
	}

	check() {
		console.log("Connect with Port : " + dropdownPort.options[dropdownPort.selectedIndex].value + '    Baudrate : ' + dropdownBaudrate.options[dropdownBaudrate.selectedIndex].value);
		this.hideSettingsLayer();
		this.showDrawingLayer();
		SerialPlotter.detectSerialData(dropdownPort.options[dropdownPort.selectedIndex].value, dropdownBaudrate.options[dropdownBaudrate.selectedIndex].value);
	}

	minimize() {
   	if (window.getComputedStyle(content_area).display === "none") {
			content_area.style.display = 'block';
			tb_hide.classList.remove('icon-chevron-up');
			tb_hide.classList.add('icon-chevron-down');
		}
		else {
			content_area.style.display = 'none';
			tb_hide.classList.remove('icon-chevron-down');
			tb_hide.classList.add('icon-chevron-up');
		}
	}

	panel_size_change(amount) {


		if (panel_size + amount <= 1000 && panel_size + amount >= 200) {
			panel_size = panel_size + amount;
			content_area.style.height = panel_size + 'px';
			plotter_area.style.height = panel_size + 'px';
			plotter_canvas.height = panel_size;
		}
	}


}
