/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

/**
 * Main class for the Phases of Moon GNOME Shell extension
 * Handles loading settings, creating the indicator, and reacting to changes
 */
export default class PhasesOfMoonExtension extends Extension {
  constructor(metadata) {
    super(metadata);

    // Reference to the MoonPhaseIndicator instance
    this._indicator = null;

    // GSettings object for this extension
    this._settings = null;

    // Store connected signal IDs to disconnect later
    this._settingsChangedIds = [];
  }

  /**
   * Called when the extension is enabled
   * Initializes settings, connects to changes, and starts the indicator
   */
  enable() {
    // Initialize GSettings
    this._settings = this.getSettings();

    // Connect to settings changes
    this._settingsChangedIds.push(
      this._settings.connect(
        'changed::show-reversed-moon-phase',
        this._onSettingsChanged.bind(this)
      )
    );
    this._settingsChangedIds.push(
      this._settings.connect(
        'changed::panel-position',
        this._restartIndicator.bind(this)
      )
    );
    this._settingsChangedIds.push(
      this._settings.connect(
        'changed::panel-priority',
        this._restartIndicator.bind(this)
      )
    );

    // Start the moon phase indicator
    this._startIndicator();
  }

  /**
   * Called when the extension is disabled
   * Stops the indicator and disconnects all signal handlers
   */
  disable() {
    // Stop the indicator
    this._stopIndicator();

    // Disconnect all connected signals
    if (this._settingsChangedIds.length > 0) {
      this._settingsChangedIds.forEach((id) => this._settings.disconnect(id));
      this._settingsChangedIds = [];
    }

    // Clear reference to settings
    this._settings = null;
  }

  /**
   * Start the MoonPhaseIndicator
   * Reads user settings for panel position and priority
   */
  async _startIndicator() {
    try {
      // Import the MoonPhaseIndicator dynamically
      const { MoonPhaseIndicator } = await import('./indicatorPOM.js');

      // Create the indicator instance
      this._indicator = new MoonPhaseIndicator(this.path, this);

      if (this._indicator) {
        // Read preferences
        const position = this._settings.get_string('panel-position');
        const priority = this._settings.get_int('panel-priority');

        // Add the indicator to the top panel using the configured settings
        Main.panel.addToStatusArea(
          'phases-of-moon-indicator', // name/id
          this._indicator,            // actor
          priority,                   // priority/order in panel
          position                    // position: left, center, right
        );
      }
    } catch (error) {
      console.error('Error starting moon phase indicator:', error);
    }
  }

  /**
   * Stop and destroy the indicator
   */
  _stopIndicator() {
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }

  /**
   * Restart the indicator
   * Used when position or priority settings change
   */
  _restartIndicator() {
    this._stopIndicator();
    this._startIndicator();
  }

  /**
   * Called when 'show-reversed-moon-phase' setting changes
   * Updates the indicator to reflect the new value
   */
  _onSettingsChanged() {
    // Get the current value of the reversed moon phase setting
    const reversed = this._settings.get_boolean('show-reversed-moon-phase');

    // If the indicator is active, update its visual representation
    if (this._indicator && typeof this._indicator._updateMoonPhase === 'function') {
      this._indicator._updateMoonPhase(reversed);
    }
  }
}

