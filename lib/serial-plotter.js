'use babel';

import path from 'path';
import SerialPlotterView from './serial-plotter-view';
import Config from '../settings';
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
	PlotterPanel: null,
	subscriptions: null,
	pyscript: null,

	activate(state) {

		killer = false;

		this.serialPlotterView = new SerialPlotterView(state.serialPlotterViewState);
		this.PlotterPanel = atom.workspace.addBottomPanel({
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
		this.PlotterPanel.destroy();
		this.subscriptions.dispose();
		this.serialPlotterView.destroy();
	},


	serialize() {
		return {
			serialPlotterViewState: this.serialPlotterView.serialize()
		};
	},


	toggle() {
		if (this.PlotterPanel.isVisible()) {
			this.PlotterPanel.hide();
			this.serialPlotterView.hideDrawingLayer();
			this.serialPlotterView.hideDrawingLayer();
		} else {
			this.PlotterPanel.show();
			this.serialPlotterView.hideDrawingLayer();
			this.serialPlotterView.showSettingsLayer();
		}
	},


	detectSerialData(ConnectionPort, ConnectionBaudrate) {

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
		var config_offset = 150;
		var skip_empty = false;
		var time_scale = 1;

		var res_dir = path.join(
			__dirname, path.join('..', 'resources')
		);
		var cmd = path.join(res_dir, 'serial_stream.py');

		console.log('Starting python script ... ' + cmd);

		this.pyscript = new BufferedProcess({
			command: 'python',
			args: [cmd, '-p', ConnectionPort, '-b', ConnectionBaudrate],
			stdout: (data) => {

				if (killer == true) {
					console.log("Kill buffered process ...");
					this.pyscript.kill();
					return;
				}

				if (data != 0) {
					split_data = data.split('#');
					for (j = 0; j < split_data.length; j++) {
						if (split_data[j].length > 2) {
							while ((split_data[j].length > 4) && (split_data[j].charAt(0) != '{')) {
								split_data[j] = split_data[j].substr(1);
							}

							if (isJSON(split_data[j])) {
								skip_empty = false;
								var parsed_data = JSON.parse(split_data[j]);
								if (stored_values.length < Config.data.resolution) {
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

						plotter_canvas.width = this.PlotterPanel.element.clientWidth;
						basic.style.width = this.PlotterPanel.element.clientWidth + 'px';
						toolbar.style.width = this.PlotterPanel.element.clientWidth + 'px';
						content_area.style.width = this.PlotterPanel.element.clientWidth + 'px';
						time_scale = this.PlotterPanel.element.clientWidth / (Config.data.resolution - 1);

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

						if (stored_values[stored_values.length - 1].hasOwnProperty('ng')) { // We have a config !

							config_title = stored_values[stored_values.length - 1].g[0].t;
							config_size = stored_values[stored_values.length - 1].g[0].sz;
							for (l = 0; l < config_size; l++) {
								config_lable[l] = stored_values[stored_values.length - 1].g[0].l[l];
								config_color[l] = stored_values[stored_values.length - 1].g[0].c[l];
							}
							// console.log(' WE HAVE A CONFIG ... Title: ' + config_title + '  Size: ' + config_size + '  Lables: ' + config_lable + '  Color: ' + config_color);
						}

						if ((scale_highest - scale_lowest) != 0) {
							config_scale = (plotter_canvas.height - Config.window.topline - Config.window.bottomline) / (scale_highest - scale_lowest);
						} else {
							config_scale = 1;
						}
						config_zero = (((plotter_canvas.height - Config.window.topline - Config.window.bottomline) / 2) + Config.window.topline) + (((scale_lowest + scale_highest) / 2) * config_scale);

						drawing.clearRect(0, 0, this.PlotterPanel.element.clientWidth, plotter_canvas.height);
						drawing.font = '12px Arial';
						drawing.fillStyle = 'white';
						drawing.fillText("Graph Title: " + config_title, 10, 15);

						drawing.beginPath();
						drawing.moveTo(0, Config.window.topline - 5);
						drawing.lineTo(this.PlotterPanel.element.clientWidth, Config.window.topline - 5);
						drawing.moveTo(0, config_zero);
						drawing.lineTo(this.PlotterPanel.element.clientWidth, config_zero);
						drawing.moveTo(0, plotter_canvas.height - Config.window.bottomline + 5);
						drawing.lineTo(this.PlotterPanel.element.clientWidth, plotter_canvas.height - Config.window.bottomline + 5);
						drawing.strokeStyle = 'white';
						drawing.lineWidth = Config.drawing.linewidth;
						drawing.stroke();

						for (m = 0; m < config_size; m++) {
							drawing.fillStyle = config_color[m];
							drawing.strokeStyle = config_color[m];
							drawing.lineWidth = Config.drawing.datalinewidth;
							drawing.fillText(config_lable[m] + ' : ' + stored_values[stored_values.length - 1].g[0].d[m], ((this.PlotterPanel.element.clientWidth / 6.0) * (m + 1) + 15), 15);
							drawing.beginPath();
							drawing.moveTo(0, config_zero - (stored_values[0].g[0].d[m] * config_scale));
							for (i = 1; i < stored_values.length; i++) {
								drawing.lineTo(i * time_scale, config_zero - (stored_values[i].g[0].d[m] * config_scale));
							}
							drawing.stroke();
						}

						drawing.fillStyle = 'rgba(100,100,100,0.6)';
						drawing.fillRect(30, Config.window.topline - 5, 90, 20);
						drawing.fillRect(30, config_zero - 10, 40, 20);
						drawing.fillRect(30, plotter_canvas.height - Config.window.bottomline - 20 + 5, 90, 20);

						drawing.fillStyle = 'white';
						drawing.font = 'bold 12px Arial';
						drawing.fillText(scale_highest, 38, Config.window.topline + 9);
						drawing.fillText('0.00', 38, config_zero + 5);
						drawing.fillText(scale_lowest, 38, plotter_canvas.height - Config.window.bottomline - 1);

					} else {
						console.log('Wrong input : Skip this buffer line ...');
					}
				} else {
					console.log('Wrong input : NULL : Skip this buffer line ...');
				}
			},
			exit: (code) => {
				if (code) {
					console.log('Data Stream broken ...');
				}
				console.log('End data stream ...');
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
