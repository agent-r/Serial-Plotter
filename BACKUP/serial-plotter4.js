'use babel';

import path from 'path';
import SerialPlotterView from './serial-plotter-view';
import Config from './settings';
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
	pyscript: null,

	activate(state) {
		this.serialPlotterView = new SerialPlotterView(state.serialPlotterViewState);
		this.modalPanel = atom.workspace.addBottomPanel({
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

		console.log('Sourcefetch was toggled!');

		if (this.modalPanel.isVisible()) {

			this.pyscript.kill;
			this.modalPanel.hide();

		} else {

			this.modalPanel.show();

			drawing = document.createElement('canvas');
			drawing.width = Config.window.width;
			drawing.height = Config.window.height;
			basic.appendChild(drawing);
			ctx = drawing.getContext('2d');
			ctx.strokeStyle = Config.drawing.color;
			ctx.lineWidth = Config.drawing.linewidth;

			// this.detectSerialPorts();
			this.detectSerialData();

		}
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

	var config_title = 'Default Title';
	var config_size = 1;
	var config_lable = new Array();
	var config_color = new Array();
	var config_scale = 1.0;
	var scale_highest = 0.0;
	var scale_lowest = 0.0;
	var config_zero = 150;
	var skip_empty = false;

	var res_dir = path.join(
		__dirname, path.join('..', 'resources')
	);

	var script = 'get_serial.py';
	var cmd = path.join(res_dir, script);

	console.log('Starting Python Script ... ' + cmd);

	this.pyscript = new BufferedProcess({
		command: 'python3',
		args: [cmd],
		stdout: (data) => {

			if (data != 0) {
				split_data = data.split('#');
				for (j = 0; j < split_data.length; j++) {
					if (split_data[j].length > 2) {
						while ((split_data[j].length > 4) && (split_data[j].charAt(0) != '{')) {
							split_data[j] = split_data[j].substr(1);
						}

						if (isJSON(split_data[j])) {
							skip_empty = false;
							parsed_data = JSON.parse(split_data[j]);
							if (stored_values.length < Config.window.width) {
								stored_values.push(parsed_data);
							} else {
								stored_values.shift();
								stored_values.push(parsed_data);
							}
						} else {
							skip_empty = true;
						}
					}
				}

				if (skip_empty == false) {

					if (stored_values[stored_values.length - 1].hasOwnProperty('ng')) { // We have a config !
						config_title = stored_values[stored_values.length - 1].g[0].t;
						config_size = stored_values[stored_values.length - 1].g[0].sz;
						for (l = 0; l < config_size; l++) {
							config_lable[l] = stored_values[stored_values.length - 1].g[0].l[l];
							config_color[l] = stored_values[stored_values.length - 1].g[0].c[l];
						}
						console.log(' WE HAVE A CONFIG ... Title: ' + config_title + '  Size: ' + config_size + '  Lables: ' + config_lable + '  Color: ' + config_color);

						scale_highest = stored_values[0].g[0].d[0];
						scale_lowest = stored_values[0].g[0].d[0];

						for (n = 0; n < config_size; n++) {
							for (o = 0; o < stored_values.length; o++) {
								if (scale_lowest > stored_values[o].g[0].d[n]) {
									scale_lowest = stored_values[o].g[0].d[n];
								}
								if (scale_highest < stored_values[o].g[0].d[n]) {
									scale_highest = stored_values[o].g[0].d[n];
								}
							}
						}
					}

					if ((scale_highest - scale_lowest) != 0) {
						config_scale = (Config.window.height - Config.window.topline - Config.window.bottomline) / (scale_highest - scale_lowest);
					} else {
						config_scale = 1;
					}
					config_zero = (((Config.window.height - Config.window.topline - Config.window.bottomline) / 2) + Config.window.topline) + ((scale_lowest + scale_highest) / 2);

					ctx.clearRect(0, 0, Config.window.width, Config.window.height);
					ctx.font = '12px Arial';
					ctx.fillStyle = 'white';
					ctx.fillText("Graph Title: " + config_title, 10, 10);

					ctx.beginPath();
					ctx.moveTo(0, Config.window.topline - 5);
					ctx.lineTo(Config.window.width, Config.window.topline - 5);
					ctx.moveTo(0, config_zero);
					ctx.lineTo(Config.window.width, config_zero);
					ctx.moveTo(0, Config.window.height - Config.window.bottomline + 5);
					ctx.lineTo(Config.window.width, Config.window.height - Config.window.bottomline + 5);
					ctx.strokeStyle = 'white';
					ctx.stroke();

					for (m = 0; m < config_size; m++) {
						ctx.fillStyle = config_color[m];
						ctx.strokeStyle = config_color[m];
						ctx.fillText(config_lable[m] + ' : ' + stored_values[stored_values.length - 1].g[0].d[m], 200 * m + 200, 10);
						ctx.beginPath();
						ctx.moveTo(0, config_zero - (stored_values[0].g[0].d[m] * config_scale));
						for (i = 1; i < stored_values.length; i++) {
							ctx.lineTo(i, config_zero - (stored_values[i].g[0].d[m] * config_scale));
						}
						ctx.stroke();
					}
				} else {
					console.log('Wrong Input : Skip this time ...');
				}
			} else {
				console.log('Wrong Input : NULL : Skip this time ...');
			}
		},
		exit: (code) => {
			if (code) {
				atom.notifications.addError('Failed to detect data');
			}
			console.log('end data stream: ' + code);
		}
	});

	this.pyscript.onWillThrowError((err) => {
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
