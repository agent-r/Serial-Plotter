# serial-plotter package

Package for ATOM text editor to show data from a serial port in ATOM.

I did this to show data from an Arduino (or anything else), sent by this library: https://github.com/devinaconley/arduino-plotter

- Reads up to 5 continuous multi-variable plots against time
- No Support for XY-graphs yet

Dependencies:
- Python3 with Serial library installed
- Atom "file-icons" package

this thing is working but still work-in-progress...

![alt text](https://github.com/agent-r/Serial-Plotter/blob/master/screenshot.png)

in Settings.json you can change your standard baudrate, window height, resolution (number of data points in width), etc..
