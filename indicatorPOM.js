/* indicatorPOM.js - Moon Phase Indicator UI */
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import GdkPixbuf from 'gi://GdkPixbuf';
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
    _init(extensionPath, extension) {
        super._init(0.0, 'Moon Phase Indicator');

        this._extensionPath = extensionPath;
        this._extension = extension;
        this._calculator = new MoonPhaseCalculator();
        this._timerId = null;

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
        this._updateTopBarIcon(moonData.name);
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
                this.moon_phase_icon.icon_name = null;
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
        if (days > 0) parts.push(`${days} ${LABELS.DAYS.charAt(0)}`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}min`);
        
        return parts.join(' ') || '0s';
    }

    _updateUIText(moonData, translatedPhaseName) {
        let illuminationStr = '—';
        if (moonData.illumination !== null) {
            const value = moonData.illumination < 0.1 ? 0 : Number(moonData.illumination).toFixed(1);
            illuminationStr = `${LABELS.ILLUMINATION}: ${value}%`;
        }

        let nextPhaseTime = '—';
        let nextPhaseDisplayName = '—';
        if (moonData.timeToNextPhase !== null) {
            nextPhaseTime = `${LABELS.IN} ${this._formatSeconds(moonData.timeToNextPhase)}`;
            nextPhaseDisplayName = this._getNextPhase(translatedPhaseName);
        }

        let displayAge = '—';
        if (moonData.age !== null) {
            const ageValue = moonData.age < 0.1 ? 0 : moonData.age.toFixed(1);
            displayAge = `${LABELS.AGE}: ${ageValue} ${LABELS.DAYS}`;
        }

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

    _getInvertedPath(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `/tmp/moon-phase-cropped-${year}${month}${day}-inverted.png`;
    }

    _getStaticMoonPhasePath() {
        return '/tmp/moonphase.png';
    }

    _isDarkTheme() {
        try {
            const interfaceSettings = new Gio.Settings({ 
                schema_id: 'org.gnome.desktop.interface' 
            });
            const colorScheme = interfaceSettings.get_string('color-scheme');
            return colorScheme === 'prefer-dark';
        } catch (e) {
            console.error('Error detecting theme:', e);
            return true;
        }
    }

    _updatePopupSmart(phase, date) {
        const cachePath = this._getCachePath(date);
        const cacheFile = Gio.File.new_for_path(cachePath);
        const croppedPath = this._getCroppedPath(date);
        const croppedFile = Gio.File.new_for_path(croppedPath);
        const invertedPath = this._getInvertedPath(date);
        const invertedFile = Gio.File.new_for_path(invertedPath);

        const isDarkTheme = this._isDarkTheme();
        
        // Use dconf key via extension
        const useInverted = !isDarkTheme && this._extension._settings.get_boolean('show-reversed-moon-phase');


        if (useInverted) {
            if (invertedFile.query_exists(null)) {
                this._styledMenuItem.setMoonImage(invertedFile.get_path());
            } else if (croppedFile.query_exists(null)) {
                try {
                    const pixbuf = GdkPixbuf.Pixbuf.new_from_file(croppedPath);
                    this._createInvertedImage(pixbuf, date);
                    this._styledMenuItem.setMoonImage(invertedFile.get_path());
                } catch (error) {
                    console.error('Error creating inverted image from cropped:', error);
                    this._styledMenuItem.setMoonImage(croppedFile.get_path());
                }
            } else if (cacheFile.query_exists(null)) {
                this._createCroppedImage(cachePath, date);
                if (invertedFile.query_exists(null)) {
                    this._styledMenuItem.setMoonImage(invertedFile.get_path());
                }
            } else {
                this._downloadStarWalkWithSymbolicFallback(phase, date, cachePath);
            }
        } else {
            if (croppedFile.query_exists(null)) {
                this._styledMenuItem.setMoonImage(croppedFile.get_path());
            } else if (cacheFile.query_exists(null)) {
                this._createCroppedImage(cachePath, date);
            } else {
                this._downloadStarWalkWithSymbolicFallback(phase, date, cachePath);
            }
        }
    }

    _createCroppedImage(cachePath, date) {
        try {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file(cachePath);

            const cropSize = 40;
            const cropWidth = pixbuf.get_width() - (cropSize * 2);
            const cropHeight = pixbuf.get_height() - (cropSize * 2);
            const cropped = pixbuf.new_subpixbuf(cropSize, cropSize, cropWidth, cropHeight);

            const croppedPath = this._getCroppedPath(date);
            cropped.savev(croppedPath, 'png', [], []);
            
            this._createInvertedImage(cropped, date);
            
            const staticPath = this._getStaticMoonPhasePath();
            cropped.savev(staticPath, 'png', [], []);
            
            this._styledMenuItem.setMoonImage(croppedPath);

        } catch (error) {
            console.error('Error creating cropped image:', error);
            this._styledMenuItem.setMoonImage(cachePath);
        }
    }

    _createInvertedImage(pixbuf, date) {
        const MAX_COLOR_VALUE = 255;
        try {
            const width = pixbuf.get_width();
            const height = pixbuf.get_height();
            const rowstride = pixbuf.get_rowstride();
            const n_channels = pixbuf.get_n_channels();
            const has_alpha = pixbuf.get_has_alpha();
            const bits = pixbuf.get_bits_per_sample();
            const colorspace = pixbuf.get_colorspace();

            const src = pixbuf.get_pixels();
            const dest = new Uint8Array(src.length);

            for (let y = 0; y < height; y++) {
                const rowOffset = y * rowstride;
                for (let x = 0; x < width; x++) {
                    const pixelIndex = rowOffset + x * n_channels;
                    dest[pixelIndex] = MAX_COLOR_VALUE - src[pixelIndex];
                    dest[pixelIndex + 1] = MAX_COLOR_VALUE - src[pixelIndex + 1];
                    dest[pixelIndex + 2] = MAX_COLOR_VALUE - src[pixelIndex + 2];
                    if (n_channels === 4) dest[pixelIndex + 3] = src[pixelIndex + 3];
                }
            }

            const gbytes = GLib.Bytes.new(dest);
            const invertedPixbuf = GdkPixbuf.Pixbuf.new_from_bytes(
                gbytes,
                colorspace,
                has_alpha,
                bits,
                width,
                height,
                rowstride
            );

            const invertedPath = this._getInvertedPath(date);
            invertedPixbuf.savev(invertedPath, 'png', [], []);
        } catch (error) {
            console.error('Error creating inverted image:', error);
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
                
                if (destFile.query_exists(null)) resolve();
                else reject(new Error('Download failed'));
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

