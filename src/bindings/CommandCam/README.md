# CommandCam exe

Grabbed from https://github.com/tedburke/CommandCam, this offers a way to use windows webcam drawing. Currently only supports BMP images.

## Building

Dependencies

* Visual Studio
* Cygwin
* vcvarsall.bat <platform> #Run from the shell

```
#Run make
#Runs this command
#cl CommandCam.cpp ole32.lib strmiids.lib oleaut32.lib
make
```
