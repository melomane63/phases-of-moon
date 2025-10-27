/* indicatorPOM.js - Moon Phase Indicator UI */
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import GdkPixbuf from 'gi://GdkPixbuf';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

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

        // Store extension references and initialize components
        this._extensionPath = extensionPath;
        this._extension = extension;
        this._calculator = new MoonPhaseCalculator();
        this._timerId = null;

        // Create the top bar icon
        this.moon_phase_icon = new St.Icon({
            icon_name: 'weather-clear-night-symbolic',
            style_class: 'system-status-icon',
            icon_size: ICON_SIZE
        });
        this.add_child(this.moon_phase_icon);

        // Initialize the menu and start periodic updates
        this._buildMenu();
        this._updateMoonPhase();
        this._startTimer();
    }

    _startTimer() {
        // Stop any existing timer before starting a new one
        this._stopTimer();
        
        // Set up a periodic update using GLib timeout
        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            UPDATE_INTERVAL_SECONDS,
            () => {
                this._updateMoonPhase();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _stopTimer() {
        // Clean up the timer if it exists
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
    }

    _buildMenu() {
        // Create custom popup menu item and connect open state handler
        this._styledMenuItem = new PopupCustom();
        this.menu.addMenuItem(this._styledMenuItem);
        
        // Update moon phase data when menu is opened
        this.menu.connect('open-state-changed', (menu, isOpen) => {
            if (isOpen) this._updateMoonPhase();
        });
    }

    _updateMoonPhase() {
        // Calculate current moon phase with error handling
        const now = new Date();
        let moonData;
        try {
            moonData = this._calculator.calculateMoonPhase(now);
        } catch (err) {
            console.error('Moon phase calculation failed:', err);
            // Fallback to full moon data on error
            moonData = { name: 'Full Moon', illumination: 100 };
        }
        this._updateUI(moonData);
        return true;
    }

    _updateUI(moonData) {
        // Update all UI components with new moon data
        const translatedPhaseName = this._translatePhaseName(moonData.name);
        this._updateTopBarIcon(moonData.name);
        this._updatePopupSmart(moonData, new Date());
        this._updateUIText(moonData, translatedPhaseName);
    }

    _updateTopBarIcon(englishPhaseName) {
        // Update the top bar icon based on current moon phase
        const iconName = PHASE_ICONS[englishPhaseName] || 'weather-clear-night-symbolic';
        const iconPath = `${this._extensionPath}/icons/${iconName}.svg`;

        // Use custom SVG icon if available, otherwise fallback to symbolic icon
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
        // Translate phase name using translation map
        return PHASE_TRANSLATION_MAP[englishPhaseName] || englishPhaseName;
    }

    _formatSeconds(seconds) {
        // Format seconds into human-readable time (days, hours, minutes)
        if (!seconds || seconds === null) return '—';
        
        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        let parts = [];
        if (days > 0) parts.push(`${days} ${LABELS.DAYS.charAt(0)}`);
        if (hours > 0) parts.push(`${hours} h`);
        if (minutes > 0) parts.push(`${minutes} min`);
        
        return parts.join(' ') || '0s';
    }

    _updateUIText(moonData, translatedPhaseName) {
        // Format illumination percentage with special handling for very low values
        let illuminationStr = '—';
        if (moonData.illumination !== null) {
            const value = moonData.illumination < 0.1 ? 0 : Number(moonData.illumination).toFixed(0);
            illuminationStr = `${LABELS.ILLUMINATION}: ${value}%`;
        }

        // Calculate and format time to next phase
        let nextPhaseTime = '—';
        let nextPhaseDisplayName = '—';
        if (moonData.timeToNextPhase !== null) {
            nextPhaseTime = `${LABELS.IN} ${this._formatSeconds(moonData.timeToNextPhase)}`;
            nextPhaseDisplayName = this._getNextPhase(translatedPhaseName);
        }

        // Format moon age in days
        let displayAge = '—';
        if (moonData.age !== null) {
            const ageValue = moonData.age < 0.1 ? 0 : moonData.age.toFixed(0);
            displayAge = `${LABELS.AGE}: ${ageValue} ${LABELS.DAYS}`;
        }

        // Update all text labels in the popup
        this._styledMenuItem.ageLabel.text = displayAge;
        this._styledMenuItem.nextPhaseNameLabel.text = nextPhaseDisplayName;
        this._styledMenuItem.nextPhaseTimeLabel.text = nextPhaseTime;

        // Update main phase data in popup
        this._styledMenuItem.updateData({
            phaseName: translatedPhaseName,
            illumination: illuminationStr,
        });
    }

    _getNextPhase(currentTranslatedPhase) {
        // Map current phase to next phase in the lunar cycle
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

        // Find English key for current translated phase
        let englishKey = null;
        Object.keys(PHASE_TRANSLATION_MAP).forEach(englishPhase => {
            if (PHASE_TRANSLATION_MAP[englishPhase] === currentTranslatedPhase) {
                englishKey = englishPhase;
            }
        });

        if (!englishKey) return '—';
        
        // Get next phase and return its translation
        const nextEnglishPhase = phaseMap[englishKey];
        return PHASE_TRANSLATION_MAP[nextEnglishPhase] || nextEnglishPhase || '—';
    }

    _getCachePath(date) {
        // Generate cache file path for StarWalk image with date-based naming
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `/tmp/moon-phase-starwalk-${year}${month}${day}.png`;
    }

    _getCroppedPath(date) {
        // Generate path for cropped version of the moon image
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `/tmp/moon-phase-cropped-${year}${month}${day}.png`;
    }

    _getInvertedPath(date) {
        // Generate path for inverted (light theme) version of the moon image
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `/tmp/moon-phase-cropped-${year}${month}${day}-inverted.png`;
    }

    _getStaticMoonPhasePath() {
        // Static path for current moon phase image (used by other components)
        return '/tmp/moonphase.png';
    }

    _isDarkTheme() {
        // Detect if system is using dark theme
        try {
            const interfaceSettings = new Gio.Settings({ 
                schema_id: 'org.gnome.desktop.interface' 
            });
            const colorScheme = interfaceSettings.get_string('color-scheme');
            return colorScheme === 'prefer-dark';
        } catch (e) {
            console.error('Error detecting theme:', e);
            return true; // Default to dark theme on error
        }
    }

    _updatePopupSmart(phase, date) {
        // Smart image loading with caching and theme adaptation
        const cachePath = this._getCachePath(date);
        const cacheFile = Gio.File.new_for_path(cachePath);
        const croppedPath = this._getCroppedPath(date);
        const croppedFile = Gio.File.new_for_path(croppedPath);
        const invertedPath = this._getInvertedPath(date);
        const invertedFile = Gio.File.new_for_path(invertedPath);

        // Determine which image version to use based on theme and settings
        const isDarkTheme = this._isDarkTheme();
        const isSessionLight = Main.sessionMode.colorScheme === 'prefer-light';
        const showReversed = this._extension._settings.get_boolean('show-reversed-moon-phase');
        const useInverted = !isDarkTheme && (isSessionLight || showReversed);

        // Image loading strategy: check cached files in order of preference
        if (useInverted) {
            // Prefer inverted image for light themes
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
            // Prefer normal cropped image for dark themes
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
        // Crop the downloaded image to remove borders
        try {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file(cachePath);

            // Define crop dimensions (40px border removal)
            const cropSize = 40;
            const cropWidth = pixbuf.get_width() - (cropSize * 2);
            const cropHeight = pixbuf.get_height() - (cropSize * 2);
            const cropped = pixbuf.new_subpixbuf(cropSize, cropSize, cropWidth, cropHeight);

            // Save cropped version and create inverted version
            const croppedPath = this._getCroppedPath(date);
            cropped.savev(croppedPath, 'png', [], []);
            
            this._createInvertedImage(cropped, date);
            
            // Also save to static path for other components
            const staticPath = this._getStaticMoonPhasePath();
            cropped.savev(staticPath, 'png', [], []);
            
            this._styledMenuItem.setMoonImage(croppedPath);

        } catch (error) {
            console.error('Error creating cropped image:', error);
            this._styledMenuItem.setMoonImage(cachePath);
        }
    }

    _createInvertedImage(pixbuf, date) {
        // Create inverted color version of image for light themes
        const MAX_COLOR_VALUE = 255;
        try {
            const width = pixbuf.get_width();
            const height = pixbuf.get_height();
            const rowstride = pixbuf.get_rowstride();
            const n_channels = pixbuf.get_n_channels();
            const has_alpha = pixbuf.get_has_alpha();
            const bits = pixbuf.get_bits_per_sample();
            const colorspace = pixbuf.get_colorspace();

            // Get pixel data and create destination buffer
            const src = pixbuf.get_pixels();
            const dest = new Uint8Array(src.length);

            // Invert each pixel's RGB values
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

            // Create new pixbuf from inverted data and save
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
        // Download moon image from StarWalk with fallback to symbolic icons
        const url = this._getStarWalkUrl(date);

        this._downloadImageSimple(url, cachePath)
            .then(() => this._createCroppedImage(cachePath, date))
            .catch((error) => {
                console.error('StarWalk download failed, using symbolic fallback:', error);
                this._useSymbolicFallback(phase.name);
            });
    }

    _downloadImageSimple(url, outputPath) {
        // Simple file download using Gio file operations
        return new Promise((resolve, reject) => {
            try {
                const sourceFile = Gio.File.new_for_uri(url);
                const destFile = Gio.File.new_for_path(outputPath);
                
                // Copy from URL to local file
                sourceFile.copy(destFile, Gio.FileCopyFlags.OVERWRITE, null, null);
                
                if (destFile.query_exists(null)) resolve();
                else reject(new Error('Download failed'));
            } catch (error) {
                reject(error);
            }
        });
    }

    _useSymbolicFallback(phaseName) {
        // Fallback to symbolic icons when image download fails
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
        // Generate StarWalk URL for specific date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return STARWALK_URL_TEMPLATE
            .replace('{year}', year)
            .replace('{month}', month)
            .replace('{day}', day);
    }

    _openStarWalkCalendar() {
        // Open StarWalk moon calendar in default browser
        try {
            Gio.AppInfo.launch_default_for_uri(STARWALK_CALENDAR_URL, null);
        } catch (err) {
            console.error('Error opening StarWalk calendar:', err);
        }
    }

    destroy() {
        // Clean up resources when extension is disabled
        this._stopTimer();
        super.destroy();
    }
});
