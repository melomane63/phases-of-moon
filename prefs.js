// prefs.js — GNOME 46+ compatible preferences for Phases of Moon extension
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
            icon_name: 'dialog-information-symbolic',
        });

        // --- Create a group for general options ---
        const generalGroup = new Adw.PreferencesGroup();
        page.add(generalGroup);

        // --- ComboRow: Panel position (left, center, right) ---
        const positions = ['left', 'center', 'right'];
        const positionModel = new Gtk.StringList();
        positions.forEach(pos => positionModel.append(pos));

        const positionRow = new Adw.ComboRow({
            title: _('Indicator position'),
            subtitle: _('Choose where to place the indicator in the top panel'),
            model: positionModel,
        });
        positionRow.use_subtitle = true;

        const currentPos = settings.get_string('panel-position');
        const posIndex = Math.max(0, positions.indexOf(currentPos));
        positionRow.selected = posIndex;

        positionRow.connect('notify::selected', () => {
            const sel = positionRow.selected;
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

        const currentPriority = settings.get_int('panel-priority');
        const priorityIndex = Math.min(Math.max(0, currentPriority), priorities.length - 1);
        priorityRow.selected = priorityIndex;

        priorityRow.connect('notify::selected', () => {
            const sel = priorityRow.selected;
            if (sel >= 0 && sel < priorities.length)
                settings.set_int('panel-priority', parseInt(priorities[sel], 10));
        });
        generalGroup.add(priorityRow);

        // --- SwitchRow: Southern Hemisphere ---
        const hemisphereRow = new Adw.SwitchRow({
            title: _('Southern Hemisphere'),
            subtitle: _('Mirror the moon display horizontally for southern hemisphere observers'),
        });
        settings.bind(
            'southern-hemisphere',
            hemisphereRow,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        generalGroup.add(hemisphereRow);

        // --- Finalize page ---
        window.add(page);
        window.default_width = 480;
        window.default_height = 400;

        return Promise.resolve();
    }
}
