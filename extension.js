/* extension.js - Moon Phase Extension Main File */

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { MoonPhaseIndicator } from './indicateurPOM.js';

export default class MoonPhaseIndicatorExtension {
    constructor(metadata) {
        this.metadata = metadata;
        this._indicator = null;
    }

    // Called when the extension is enabled
    enable() {
        // Create a new moon phase indicator with the extension path
        this._indicator = new MoonPhaseIndicator(this.metadata.path);

        // Add it to the top panel's status area
        Main.panel.addToStatusArea('moon-phase-indicator', this._indicator, 0, 'center');
    }

    // Called when the extension is disabled
    disable() {
        if (this._indicator) {
            // Remove the indicator from the panel and free resources
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
