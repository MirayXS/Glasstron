/*
   Copyright 2020 AryToNeX

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
"use strict";

const electron = require("electron");
const path = require("path");
const Main = require("./main.js");
const Utils = require("./utils.js");

/*
 * The BrowserWindow override class
 */
class BrowserWindow extends electron.BrowserWindow {
	constructor(options) {
		if(process.platform !== "win32") options.transparent = true;

		const _backgroundColor = options.backgroundColor;
		options.backgroundColor = "#00000000";
		// We do not call super to get an actual BrowserWindow from electron and not mess with native casts (broke GTK modals)
		const window = new electron.BrowserWindow(options);
		BrowserWindow._bindAndReplace(window, BrowserWindow.setBackgroundColor);
		window.setBackgroundColor(_backgroundColor);
		return window;
	}

	static setBackgroundColor(color){
		if(typeof color == "undefined")
			color = "00000000";
		// Color transform from ARGB to RGBA
		color = [...color.replace("#","")];
		if(color.length % 4 === 0)
			for(let i=0;i<color.length/4;i++)
				color.push(color.shift());
		color = color.join("");
		// CSS insertion
		const callback = () => {
			return this.webContents.insertCSS(`:root{ background-color: #${color} !important; }`).then(key => {this._bgCssKey = key;});
		}
		if(typeof this._bgCssKey !== "undefined") return this.webContents.removeInsertedCSS(this._bgCssKey).then(callback);
		else return callback();
	}
	
	static _bindAndReplace(object, method){
		const boundFunction = method.bind(object);
		Object.defineProperty(object, method.name, {
			get: () => boundFunction
		});
	}
}

module.exports = BrowserWindow;
