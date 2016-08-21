//
// CommandCam - A command line image grabber
// Copyright (C) 2012 Ted Burke
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program (see the file "COPYING").
// If not, see <http://www.gnu.org/licenses/>.
//
// Website: http://batchloaf.wordpress.com
//
// To compile using the MSVC++ compiler:
//
//		cl CommandCam.cpp ole32.lib strmiids.lib oleaut32.lib
//
// Last modified 21-4-2012
//

// DirectShow header file
#include <dshow.h>

// This is a workaround for the missing header
// file qedit.h which seems to be absent from the
// Windows SDK versions 7.0 and 7.1.
// To use the items defined in this dll, the
// DexterLib namespace must be specified.
// The items in question are:
//
//		DexterLib::_AMMediaType
//		DexterLib::ISampleGrabber
//		DexterLib::IID_ISampleGrabber
//
#import "qedit.dll" raw_interfaces_only named_guids

// For some reason, these are not included in the
// DirectShow headers. However, they are exported
// by strmiids.lib, so I'm just declaring them
// here as extern.
EXTERN_C const CLSID CLSID_NullRenderer;
EXTERN_C const CLSID CLSID_SampleGrabber;

// DirectShow objects
HRESULT hr;
ICreateDevEnum *pDevEnum = NULL;
IEnumMoniker *pEnum = NULL;
IMoniker *pMoniker = NULL;
IPropertyBag *pPropBag = NULL;
IGraphBuilder *pGraph = NULL;
ICaptureGraphBuilder2 *pBuilder = NULL;
IBaseFilter *pCap = NULL;
IBaseFilter *pSampleGrabberFilter = NULL;
DexterLib::ISampleGrabber *pSampleGrabber = NULL;
IBaseFilter *pNullRenderer = NULL;
IMediaControl *pMediaControl = NULL;
char *pBuffer = NULL;

void exit_message(const char* error_message, int error)
{
	// Print an error message
	fprintf(stderr, error_message);
	fprintf(stderr, "\n");

	// Clean up DirectShow / COM stuff
	if (pBuffer != NULL) delete[] pBuffer;
	if (pMediaControl != NULL) pMediaControl->Release();
	if (pNullRenderer != NULL) pNullRenderer->Release();
	if (pSampleGrabber != NULL) pSampleGrabber->Release();
	if (pSampleGrabberFilter != NULL)
			pSampleGrabberFilter->Release();
	if (pCap != NULL) pCap->Release();
	if (pBuilder != NULL) pBuilder->Release();
	if (pGraph != NULL) pGraph->Release();
	if (pPropBag != NULL) pPropBag->Release();
	if (pMoniker != NULL) pMoniker->Release();
	if (pEnum != NULL) pEnum->Release();
	if (pDevEnum != NULL) pDevEnum->Release();
	CoUninitialize();

	// Exit the program
	exit(error);
}

int main(int argc, char **argv)
{
	// Capture settings
	int snapshot_delay = 2000;
	int show_preview_window = 0;
	int list_devices = 0;
	int device_number = 1;
	char device_name[100];
	char filename[100];

	// Other variables
	char char_buffer[100];

	// Default device name and output filename
	strcpy(device_name, "");
	strcpy(filename, "image.bmp");


	// Parse command line arguments. Available options:
	//
	//		/delay DELAY_IN_MILLISECONDS
	//		/filename OUTPUT_FILENAME
	//		/devnum DEVICE_NUMBER
	//		/devname DEVICE_NAME
	//		/preview
	//		/devlist
	//
	int n = 1;
	while (n < argc)
	{
		// Process next command line argument
		if (strcmp(argv[n], "/preview") == 0)
		{
			// Enable preview window
			show_preview_window = 1;
		}
		else if (strcmp(argv[n], "/devlist") == 0)
		{
			// Set flag to list devices rather than capture image
			list_devices = 1;
		}
		else if (strcmp(argv[n], "/filename") == 0)
		{
			// Set output filename to specified string
			if (++n < argc) //strcpy(filename, argv[n]);
			{
				// Copy provided string into char buffer
				strcpy(char_buffer, argv[n]);

				// Trim inverted commas if present and copy
				// provided string into filename char array
				if (char_buffer[0] == '"')
				{
					strncat(filename, char_buffer, strlen(char_buffer)-2);
				}
				else
				{
					strcpy(filename, char_buffer);
				}
			}
			else exit_message("Error: no filename specified", 1);
		}
		else if (strcmp(argv[n], "/delay") == 0)
		{
			// Set snapshot delay to specified value
			if (++n < argc) snapshot_delay = atoi(argv[n]);
			else exit_message("Error: invalid delay specified", 1);

			if (snapshot_delay <= 0)
				exit_message("Error: invalid delay specified", 1);
		}
		else if (strcmp(argv[n], "/devnum") == 0)
		{
			// Set device number to specified value
			if (++n < argc) device_number = atoi(argv[n]);
			else exit_message("Error: invalid device number", 1);

			if (device_number <= 0)
				exit_message("Error: invalid device number", 1);
		}
		else if (strcmp(argv[n], "/devname") == 0)
		{
			// Set device number to specified value
			if (++n < argc)
			{
				// Copy device name into char buffer
				strcpy(char_buffer, argv[n]);

				// Trim inverted commas if present and copy
				// provided string into device_name
				if (char_buffer[0] == '"')
				{
					strncat(device_name, char_buffer, strlen(char_buffer)-2);
				}
				else
				{
					strcpy(device_name, char_buffer);
				}

				// Remember to choose by name rather than number
				device_number = 0;
			}
			else exit_message("Error: invalid device name", 1);
		}
		else
		{
			// Unknown command line argument
			fprintf(stderr, "Unrecognised option: %s\n", argv[n]);
			exit_message("", 1);
		}

		// Increment command line argument counter
		n++;
	}

	// Intialise COM
	hr = CoInitializeEx(NULL, COINIT_MULTITHREADED);
	if (hr != S_OK)
		exit_message("Could not initialise COM", 1);

	// Create filter graph
	hr = CoCreateInstance(CLSID_FilterGraph, NULL,
			CLSCTX_INPROC_SERVER, IID_IGraphBuilder,
			(void**)&pGraph);
	if (hr != S_OK)
		exit_message("Could not create filter graph", 1);

	// Create capture graph builder.
	hr = CoCreateInstance(CLSID_CaptureGraphBuilder2, NULL,
			CLSCTX_INPROC_SERVER, IID_ICaptureGraphBuilder2,
			(void **)&pBuilder);
	if (hr != S_OK)
		exit_message("Could not create capture graph builder", 1);

	// Attach capture graph builder to graph
	hr = pBuilder->SetFiltergraph(pGraph);
	if (hr != S_OK)
		exit_message("Could not attach capture graph builder to graph", 1);

	// Create system device enumerator
	hr = CoCreateInstance(CLSID_SystemDeviceEnum, NULL,
			CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&pDevEnum));
	if (hr != S_OK)
		exit_message("Could not crerate system device enumerator", 1);

	// Video input device enumerator
	hr = pDevEnum->CreateClassEnumerator(
					CLSID_VideoInputDeviceCategory, &pEnum, 0);
	if (hr != S_OK)
		exit_message("No video devices found", 1);

	// If the user has included the "/list" command line
	// argument, just list available devices, then exit.
	if (list_devices != 0)
	{
		fprintf(stderr, "Available capture devices:\n");
		n = 0;
		while(1)
		{
			// Find next device
			hr = pEnum->Next(1, &pMoniker, NULL);
			if (hr == S_OK)
			{
				// Increment device counter
				n++;

				// Get device name
				hr = pMoniker->BindToStorage(0, 0, IID_PPV_ARGS(&pPropBag));
				VARIANT var;
				VariantInit(&var);
				hr = pPropBag->Read(L"FriendlyName", &var, 0);
				fprintf(stderr, "%ls\n", var.bstrVal);
				VariantClear(&var);
			}
			else
			{
				// Finished listing device, so exit program
				if (n == 0) exit_message("No devices found", 0);
				else exit_message("", 0);
			}
		}
	}

	// Get moniker for specified video input device,
	// or for the first device if no device number
	// was specified.
	VARIANT var;
	n = 0;
	while(1)
	{
		// Access next device
		hr = pEnum->Next(1, &pMoniker, NULL);
		if (hr == S_OK)
		{
			n++; // increment device count
		}
		else
		{
			if (device_number == 0)
			{
				fprintf(stderr,
					"Video capture device %s not found\n",
					device_name);
			}
			else
			{
				fprintf(stderr,
					"Video capture device %d not found\n",
					device_number);
			}
			exit_message("", 1);
		}

		// If device was specified by name rather than number...
		if (device_number == 0)
		{
			// Get video input device name
			hr = pMoniker->BindToStorage(0, 0, IID_PPV_ARGS(&pPropBag));
			if (hr == S_OK)
			{
				// Get current device name
				VariantInit(&var);
				hr = pPropBag->Read(L"FriendlyName", &var, 0);

				// Convert to a normal C string, i.e. char*
				sprintf(char_buffer, "%ls", var.bstrVal);
				VariantClear(&var);
				pPropBag->Release();
				pPropBag = NULL;

				// Exit loop if current device name matched devname
				if (strcmp(device_name, char_buffer) == 0) break;
			}
			else
			{
				exit_message("Error getting device names", 1);
			}
		}
		else if (n >= device_number) break;
	}

	// Get video input device name
	hr = pMoniker->BindToStorage(0, 0, IID_PPV_ARGS(&pPropBag));
	VariantInit(&var);
	hr = pPropBag->Read(L"FriendlyName", &var, 0);
	fprintf(stderr, "Capture device: %ls\n", var.bstrVal);
	VariantClear(&var);

	// Create capture filter and add to graph
	hr = pMoniker->BindToObject(0, 0,
					IID_IBaseFilter, (void**)&pCap);
	if (hr != S_OK) exit_message("Could not create capture filter", 1);

	// Add capture filter to graph
	hr = pGraph->AddFilter(pCap, L"Capture Filter");
	if (hr != S_OK) exit_message("Could not add capture filter to graph", 1);

	// Create sample grabber filter
	hr = CoCreateInstance(CLSID_SampleGrabber, NULL,
		CLSCTX_INPROC_SERVER, IID_IBaseFilter,
		(void**)&pSampleGrabberFilter);
	if (hr != S_OK)
		exit_message("Could not create Sample Grabber filter", 1);

	// Query the ISampleGrabber interface of the sample grabber filter
	hr = pSampleGrabberFilter->QueryInterface(
			DexterLib::IID_ISampleGrabber, (void**)&pSampleGrabber);
	if (hr != S_OK)
		exit_message("Could not get ISampleGrabber interface to sample grabber filter", 1);

	// Enable sample buffering in the sample grabber filter
	hr = pSampleGrabber->SetBufferSamples(TRUE);
	if (hr != S_OK)
		exit_message("Could not enable sample buffering in the sample grabber", 1);

	// Set media type in sample grabber filter
	AM_MEDIA_TYPE mt;
	ZeroMemory(&mt, sizeof(AM_MEDIA_TYPE));
	mt.majortype = MEDIATYPE_Video;
	mt.subtype = MEDIASUBTYPE_RGB24;
	hr = pSampleGrabber->SetMediaType((DexterLib::_AMMediaType *)&mt);
	if (hr != S_OK)
		exit_message("Could not set media type in sample grabber", 1);

	// Add sample grabber filter to filter graph
	hr = pGraph->AddFilter(pSampleGrabberFilter, L"SampleGrab");
	if (hr != S_OK)
		exit_message("Could not add Sample Grabber to filter graph", 1);

	// Create Null Renderer filter
	hr = CoCreateInstance(CLSID_NullRenderer, NULL,
		CLSCTX_INPROC_SERVER, IID_IBaseFilter,
		(void**)&pNullRenderer);
	if (hr != S_OK)
		exit_message("Could not create Null Renderer filter", 1);

	// Add Null Renderer filter to filter graph
	hr = pGraph->AddFilter(pNullRenderer, L"NullRender");
	if (hr != S_OK)
		exit_message("Could not add Null Renderer to filter graph", 1);

	// Connect up the filter graph's capture stream
	hr = pBuilder->RenderStream(
		&PIN_CATEGORY_CAPTURE, &MEDIATYPE_Video,
		pCap,  pSampleGrabberFilter, pNullRenderer);
	if (hr != S_OK)
		exit_message("Could not render capture video stream", 1);

	// Connect up the filter graph's preview stream
	if (show_preview_window > 0)
	{
		hr = pBuilder->RenderStream(
				&PIN_CATEGORY_PREVIEW, &MEDIATYPE_Video,
				pCap, NULL, NULL);
		if (hr != S_OK && hr != VFW_S_NOPREVIEWPIN)
			exit_message("Could not render preview video stream", 1);
	}

	// Get media control interfaces to graph builder object
	hr = pGraph->QueryInterface(IID_IMediaControl,
					(void**)&pMediaControl);
	if (hr != S_OK) exit_message("Could not get media control interface", 1);

	// Run graph
	while(1)
	{
		hr = pMediaControl->Run();

		// Hopefully, the return value was S_OK or S_FALSE
		if (hr == S_OK) break; // graph is now running
		if (hr == S_FALSE) continue; // graph still preparing to run

		// If the Run function returned something else,
		// there must be a problem
		fprintf(stderr, "Error: %u\n", hr);
		exit_message("Could not run filter graph", 1);
	}

	// Wait for specified time delay (if any)
	Sleep(snapshot_delay);

	// Grab a sample
	// First, find the required buffer size
	long buffer_size = 0;
	while(1)
	{
		// Passing in a NULL pointer signals that we're just checking
		// the required buffer size; not looking for actual data yet.
		hr = pSampleGrabber->GetCurrentBuffer(&buffer_size, NULL);

		// Keep trying until buffer_size is set to non-zero value.
		if (hr == S_OK && buffer_size != 0) break;

		// If the return value isn't S_OK or VFW_E_WRONG_STATE
		// then something has gone wrong. VFW_E_WRONG_STATE just
		// means that the filter graph is still starting up and
		// no data has arrived yet in the sample grabber filter.
		if (hr != S_OK && hr != VFW_E_WRONG_STATE)
			exit_message("Could not get buffer size", 1);
	}

	// Stop the graph
	pMediaControl->Stop();

	// Allocate buffer for image
	pBuffer = new char[buffer_size];
	if (!pBuffer)
		exit_message("Could not allocate data buffer for image", 1);

	// Retrieve image data from sample grabber buffer
	hr = pSampleGrabber->GetCurrentBuffer(
			&buffer_size, (long*)pBuffer);
	if (hr != S_OK)
		exit_message("Could not get buffer data from sample grabber", 1);

	// Get the media type from the sample grabber filter
	hr = pSampleGrabber->GetConnectedMediaType(
			(DexterLib::_AMMediaType *)&mt);
	if (hr != S_OK) exit_message("Could not get media type", 1);

	// Retrieve format information
	VIDEOINFOHEADER *pVih = NULL;
	if ((mt.formattype == FORMAT_VideoInfo) &&
		(mt.cbFormat >= sizeof(VIDEOINFOHEADER)) &&
		(mt.pbFormat != NULL))
	{
		// Get video info header structure from media type
		pVih = (VIDEOINFOHEADER*)mt.pbFormat;

        //pVih->bmiHeader.biWidth = 4000;

		// Print the resolution of the captured image
		fprintf(stderr, "Capture resolution: %dx%d\n",
			pVih->bmiHeader.biWidth,
			pVih->bmiHeader.biHeight);

		// Create bitmap structure
		long cbBitmapInfoSize = mt.cbFormat - SIZE_PREHEADER;
		BITMAPFILEHEADER bfh;
		ZeroMemory(&bfh, sizeof(bfh));
		bfh.bfType = 'MB'; // Little-endian for "BM".
		bfh.bfSize = sizeof(bfh) + buffer_size + cbBitmapInfoSize;
		bfh.bfOffBits = sizeof(BITMAPFILEHEADER) + cbBitmapInfoSize;

		// Open output file
		HANDLE hf = CreateFile(filename, GENERIC_WRITE,
					FILE_SHARE_WRITE, NULL, CREATE_ALWAYS, 0, NULL);
		if (hf == INVALID_HANDLE_VALUE)
			exit_message("Error opening output file", 1);

		// Write the file header.
		DWORD dwWritten = 0;
		WriteFile(hf, &bfh, sizeof(bfh), &dwWritten, NULL);
		WriteFile(hf, HEADER(pVih),
					cbBitmapInfoSize, &dwWritten, NULL);

		// Write pixel data to file
		WriteFile(hf, pBuffer, buffer_size, &dwWritten, NULL);
		CloseHandle(hf);
	}
	else
	{
		exit_message("Wrong media type", 1);
	}

	// Free the format block
	if (mt.cbFormat != 0)
	{
		CoTaskMemFree((PVOID)mt.pbFormat);
		mt.cbFormat = 0;
		mt.pbFormat = NULL;
	}
	if (mt.pUnk != NULL)
	{
		// pUnk should not be used.
		mt.pUnk->Release();
		mt.pUnk = NULL;
	}

	// Clean up and exit
	fprintf(stderr, "Captured image to %s", filename);
	exit_message("", 0);
}
