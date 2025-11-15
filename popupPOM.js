// popupPOM.js - Moon Phase Popup Menu Item
import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { POPUP_ICON_SIZE } from './constantesPOM.js';

export const PopupCustom = GObject.registerClass(
class PopupCustom extends PopupMenu.PopupBaseMenuItem {
    _init() {
        super._init({
            reactive: true,
            can_focus: true,
            style_class: 'styled-menu-item moon-phase-menu'
        });

        this._starWalkCalendarUrl = 'https://starwalk.space/en/moon-calendar';

        this.container = new St.BoxLayout({
            vertical: false,
            x_expand: true,
            style_class: 'styled-container'
        });
        this.add_child(this.container);

        this.icon = new St.Icon({
            icon_size: POPUP_ICON_SIZE,
            style_class: 'popup-menu-icon'
        });
        this.container.add_child(this.icon);

        this.textColumn = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'text-column'
        });
        this.container.add_child(this.textColumn);

        this.phaseLine = new St.BoxLayout({
            vertical: false,
            style_class: 'phase-line'
        });
        this.textColumn.add_child(this.phaseLine);

        this.phaseLabel = new St.Label({ 
            text: '', 
            style_class: 'phase-label phase-current-label' 
        });
        this.phaseLine.add_child(this.phaseLabel);

        this.phaseTimeLabel = new St.Label({ 
            text: '', 
            style_class: 'phase-time-label secondary-label' 
        });
        this.phaseLine.add_child(this.phaseTimeLabel);

        this.illuminationLabel = new St.Label({ text: '', style_class: 'secondary-label illumination-label' });
        this.textColumn.add_child(this.illuminationLabel);

        this.ageLabel = new St.Label({ text: '', style_class: 'secondary-label age-label' });
        this.textColumn.add_child(this.ageLabel);

        this.separator = new PopupMenu.PopupSeparatorMenuItem();
        this.separator.actor.style_class = 'custom-separator';
        this.textColumn.add_child(this.separator.actor);

        this.nextPhaseNameLabel = new St.Label({ text: '', style_class: 'next-phase-name phase-next-label' });
        this.textColumn.add_child(this.nextPhaseNameLabel);

        this.nextPhaseTimeLabel = new St.Label({ text: '', style_class: 'next-phase-time secondary-label' });
        this.textColumn.add_child(this.nextPhaseTimeLabel);

        this.connect('activate', () => {
            Gio.AppInfo.launch_default_for_uri(this._starWalkCalendarUrl, null);
        });
    }

    setMoonImage(filePath) {
        const gicon = new Gio.FileIcon({ file: Gio.File.new_for_path(filePath) });
        this.icon.gicon = gicon;
    }

    updateData(data) {
        if (!data) return;
        if (data.phaseName) this.phaseLabel.text = data.phaseName;
        if (data.phaseTime) {
            this.phaseTimeLabel.text = ` ${data.phaseTime}`;
            this.phaseTimeLabel.show();
        } else {
            this.phaseTimeLabel.hide();
        }
        if (data.illumination) this.illuminationLabel.text = `${data.illumination}`;
        if (data.age) this.ageLabel.text = data.age;
        if (data.nextPhaseName) this.nextPhaseNameLabel.text = data.nextPhaseName;
        if (data.nextPhaseTime) this.nextPhaseTimeLabel.text = data.nextPhaseTime;
    }
});
