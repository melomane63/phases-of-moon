/* indicateurPOM.js - Moon Phase Indicator UI */
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import { PopupCustom } from './popupPOM.js';
import { MoonPhaseCalculator } from './calculatorPOM.js';
import { 
    UPDATE_INTERVAL_SECONDS, 
    ICON_SIZE,
    LABELS,
    PHASE_ICONS,
    PHASE_TRANSLATION_MAP,
    STARWALK_URL_TEMPLATE,
    STARWALK_CALENDAR_URL
} from './constantesPOM.js';

export const MoonPhaseIndicator = GObject.registerClass(
class MoonPhaseIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Moon Phase Indicator');

        // Get extension path
        this._extensionPath = this._getExtensionPath();
        this._calculator = new MoonPhaseCalculator();
        this._timerId = null;

        // Topbar icon
        this.moon_phase_icon = new St.Icon({
            icon_name: 'weather-clear-night-symbolic',
            style_class: 'system-status-icon',
            icon_size: ICON_SIZE
        });
        this.add_child(this.moon_phase_icon);

        this._buildMenu();
        this._updateMoonPhase();
        this._startTimer();
    }

    _getExtensionPath() {
        try {
            const extensionUri = import.meta.url;
            const extensionFile = Gio.File.new_for_uri(extensionUri);
            const extensionDir = extensionFile.get_parent();
            return extensionDir.get_path();
        } catch (err) {
            console.error('Error getting extension path:', err);
            return '';
        }
    }

    _startTimer() {
        this._stopTimer();
        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            UPDATE_INTERVAL_SECONDS,
            () => { this._updateMoonPhase(); return GLib.SOURCE_CONTINUE; }
        );
    }

    _stopTimer() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
    }

    _buildMenu() {
        this._styledMenuItem = new PopupCustom();
        this.menu.addMenuItem(this._styledMenuItem);
        
        // Refresh on popup open
        this.menu.connect('open-state-changed', (menu, isOpen) => {
            if (isOpen) this._updateMoonPhase();
        });
    }

    _updateMoonPhase() {
        const now = new Date();
        let moonData;
        try {
            moonData = this._calculator.calculateMoonPhase(now);
        } catch (err) {
            console.error('Moon phase calculation failed:', err);
            moonData = { name: 'Full Moon', illumination: 100 };
        }
        this._updateUI(moonData);
        return true;
    }

    _updateUI(moonData) {
        const translatedPhaseName = this._translatePhaseName(moonData.name);
        
        // Update topbar icon
        this._updateTopBarIcon(moonData.name);

        // Update popup
        this._updatePopupSmart(moonData, new Date());
        this._updateUIText(moonData, translatedPhaseName);
    }

    _updateTopBarIcon(englishPhaseName) {
        const iconName = PHASE_ICONS[englishPhaseName] || 'weather-clear-night-symbolic';
        const iconPath = `${this._extensionPath}/icons/${iconName}.svg`;

        if (GLib.file_test(iconPath, GLib.FileTest.EXISTS)) {
            try {
                const gicon = Gio.icon_new_for_string(iconPath);
                this.moon_phase_icon.gicon = gicon;
            } catch (error) {
                console.error(`Error setting topbar icon: ${error}`);
                this.moon_phase_icon.icon_name = 'weather-clear-night-symbolic';
            }
        } else {
            this.moon_phase_icon.icon_name = 'weather-clear-night-symbolic';
        }
    }

    _translatePhaseName(englishPhaseName) {
        return PHASE_TRANSLATION_MAP[englishPhaseName] || englishPhaseName;
    }

    _formatSeconds(seconds) {
        if (!seconds || seconds === null) return '—';
        
        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        let parts = [];
        if (days > 0) parts.push(`${days}j`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        
        return parts.join(' ') || '0s';
    }

    _updateUIText(moonData, translatedPhaseName) {
        // Illumination
        let illuminationStr = '—';
        if (moonData.illumination !== null) {
            const value = moonData.illumination < 0.1 ? 0 : Number(moonData.illumination).toFixed(1);
            illuminationStr = `${LABELS.ILLUMINATION}: ${value}%`;
        }

        // Next phase
        let nextPhaseTime = '—';
        let nextPhaseDisplayName = '—';
        if (moonData.timeToNextPhase !== null) {
            nextPhaseTime = `${LABELS.IN} ${this._formatSeconds(moonData.timeToNextPhase)}`;
            nextPhaseDisplayName = this._getNextPhase(translatedPhaseName);
        }

        // Age
        let displayAge = '—';
        if (moonData.age !== null) {
            const ageValue = moonData.age < 0.1 ? 0 : moonData.age.toFixed(1);
            displayAge = `${LABELS.AGE}: ${ageValue} ${LABELS.DAYS}`;
        }

        // Update UI
        this._styledMenuItem.ageLabel.text = displayAge;
        this._styledMenuItem.nextPhaseNameLabel.text = nextPhaseDisplayName;
        this._styledMenuItem.nextPhaseTimeLabel.text = nextPhaseTime;

        this._styledMenuItem.updateData({
            phaseName: translatedPhaseName,
            illumination: illuminationStr,
        });
    }

    _getNextPhase(currentTranslatedPhase) {
        const phaseMap = {
            'New Moon': 'First Quarter',
            'Waxing Crescent': 'First Quarter',
            'First Quarter': 'Full Moon',
            'Waxing Gibbous': 'Full Moon',
            'Full Moon': 'Last Quarter',
            'Waning Gibbous': 'Last Quarter',
            'Last Quarter': 'New Moon',
            'Waning Crescent': 'New Moon'
        };

        // Find English key
        let englishKey = null;
        Object.keys(PHASE_TRANSLATION_MAP).forEach(englishPhase => {
            if (PHASE_TRANSLATION_MAP[englishPhase] === currentTranslatedPhase) {
                englishKey = englishPhase;
            }
        });

        if (!englishKey) return '—';
        
        const nextEnglishPhase = phaseMap[englishKey];
        return PHASE_TRANSLATION_MAP[nextEnglishPhase] || nextEnglishPhase || '—';
    }

    _getCachePath(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `/tmp/moon-phase-starwalk-${year}${month}${day}.png`;
    }

    _getCroppedPath(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `/tmp/moon-phase-cropped-${year}${month}${day}.png`;
    }

    _getStaticMoonPhasePath() {
        return '/tmp/moonphase.png';
    }

    _updatePopupSmart(phase, date) {
        const cachePath = this._getCachePath(date);
        const cacheFile = Gio.File.new_for_path(cachePath);
        const croppedPath = this._getCroppedPath(date);
        const croppedFile = Gio.File.new_for_path(croppedPath);
        const staticPath = this._getStaticMoonPhasePath();
        const staticFile = Gio.File.new_for_path(staticPath);

        if (croppedFile.query_exists(null)) {
            this._styledMenuItem.setMoonImage(croppedFile.get_path());
        } else if (cacheFile.query_exists(null)) {
            this._createCroppedImage(cachePath, date);
        } else {
            this._downloadStarWalkWithSymbolicFallback(phase, date, cachePath);
        }
    }

    _createCroppedImage(cachePath, date) {
        try {
            const GdkPixbuf = imports.gi.GdkPixbuf;
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file(cachePath);

            const cropSize = 40;
            const cropWidth = pixbuf.get_width() - (cropSize * 2);
            const cropHeight = pixbuf.get_height() - (cropSize * 2);
            const cropped = pixbuf.new_subpixbuf(cropSize, cropSize, cropWidth, cropHeight);

            const croppedPath = this._getCroppedPath(date);
            cropped.savev(croppedPath, 'png', [], []);
            
            // Copie vers moonphase.png
            const staticPath = this._getStaticMoonPhasePath();
            cropped.savev(staticPath, 'png', [], []);
            
            this._styledMenuItem.setMoonImage(croppedPath);

        } catch (error) {
            console.error('Error creating cropped image:', error);
            this._styledMenuItem.setMoonImage(cachePath);
        }
    }

    _downloadStarWalkWithSymbolicFallback(phase, date, cachePath) {
        const url = this._getStarWalkUrl(date);

        this._downloadImageSimple(url, cachePath)
            .then(() => this._createCroppedImage(cachePath, date))
            .catch((error) => {
                console.error('StarWalk download failed, using symbolic fallback:', error);
                this._useSymbolicFallback(phase.name);
            });
    }

    _downloadImageSimple(url, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                const sourceFile = Gio.File.new_for_uri(url);
                const destFile = Gio.File.new_for_path(outputPath);
                
                sourceFile.copy(destFile, Gio.FileCopyFlags.OVERWRITE, null, null);
                
                if (destFile.query_exists(null)) {
                    resolve();
                } else {
                    reject(new Error('Download failed'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    _useSymbolicFallback(phaseName) {
        const iconName = PHASE_ICONS[phaseName] || 'weather-clear-night-symbolic';
        const iconPath = `${this._extensionPath}/icons/${iconName}.svg`;

        if (GLib.file_test(iconPath, GLib.FileTest.EXISTS)) {
            const gicon = Gio.icon_new_for_string(iconPath);
            this._styledMenuItem.icon.gicon = gicon;
        } else {
            this._styledMenuItem.icon.icon_name = 'weather-clear-night-symbolic';
        }
    }

    _getStarWalkUrl(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return STARWALK_URL_TEMPLATE
            .replace('{year}', year)
            .replace('{month}', month)
            .replace('{day}', day);
    }

    _openStarWalkCalendar() {
        try {
            Gio.AppInfo.launch_default_for_uri(STARWALK_CALENDAR_URL, null);
        } catch (err) {
            console.error('Error opening StarWalk calendar:', err);
        }
    }

    destroy() {
        this._stopTimer();
        super.destroy();
    }
});
