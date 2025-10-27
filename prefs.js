// prefs.js — GNOME 46+ compatible preferences for Phases of Moon extension
// Fully commented in English

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PhasesOfMoonPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // --- Create the main Preferences Page ---
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic', // Info icon
        });

        // --- Create a group for general options ---
        const generalGroup = new Adw.PreferencesGroup();
        page.add(generalGroup);

        // --- SwitchRow: Toggle reversed moon image ---
        const reversedSwitch = new Adw.SwitchRow({
            title: _('Moon phase image'),
            subtitle: _('Display the reversed image when using a light theme'),
        });

        // Bind the switch to the GSettings key
        settings.bind(
            'show-reversed-moon-phase',
            reversedSwitch,
            'active', // property of the switch
            Gio.SettingsBindFlags.DEFAULT
        );

        generalGroup.add(reversedSwitch);

        // --- ComboRow: Panel position (left, center, right) ---
        const positions = ['left', 'center', 'right'];

        // Gtk.StringList is the recommended model for ComboRow
        const positionModel = new Gtk.StringList();
        positions.forEach(pos => positionModel.append(pos));

        const positionRow = new Adw.ComboRow({
            title: _('Indicator position'),
            subtitle: _('Choose where to place the indicator in the top panel'),
            model: positionModel,
        });
        positionRow.use_subtitle = true;

        // Set the initial selection based on saved settings
        const currentPos = settings.get_string('panel-position');
        const posIndex = Math.max(0, positions.indexOf(currentPos));
        if (typeof positionRow.set_selected === 'function')
            positionRow.set_selected(posIndex);
        else
            positionRow.selected = posIndex;

        // Update GSettings when the user changes the selection
        positionRow.connect('notify::selected', () => {
            const sel = (typeof positionRow.get_selected === 'function') ? positionRow.get_selected() : positionRow.selected;
            if (sel >= 0 && sel < positions.length)
                settings.set_string('panel-position', positions[sel]);
        });

        generalGroup.add(positionRow);

        // --- ComboRow: Panel priority (0-7) ---
        const priorities = ['0','1','2','3','4','5','6','7'];
        const priorityModel = new Gtk.StringList();
        priorities.forEach(p => priorityModel.append(p));

        const priorityRow = new Adw.ComboRow({
            title: _('Indicator priority'),
            subtitle: _('Choose the indicator priority (0 = highest, 7 = lowest)'),
            model: priorityModel,
        });
        priorityRow.use_subtitle = true;

        // Set the initial selection based on saved settings
        const currentPriority = settings.get_int('panel-priority');
        const priorityIndex = Math.min(Math.max(0, currentPriority), priorities.length - 1);
        if (typeof priorityRow.set_selected === 'function')
            priorityRow.set_selected(priorityIndex);
        else
            priorityRow.selected = priorityIndex;

        // Update GSettings when the user changes the selection
        priorityRow.connect('notify::selected', () => {
            const sel = (typeof priorityRow.get_selected === 'function') ? priorityRow.get_selected() : priorityRow.selected;
            if (sel >= 0 && sel < priorities.length)
                settings.set_int('panel-priority', parseInt(priorities[sel], 10));
        });

        generalGroup.add(priorityRow);

        // --- Finalize page ---
        window.add(page);
        window.default_width = 480;  // reasonable default width
        window.default_height = 400; // reasonable default height

        return Promise.resolve();
    }
}

