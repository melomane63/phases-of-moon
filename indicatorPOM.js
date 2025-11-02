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
        this._stopTimer();
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
        this._setIconWithFallback(this.moon_phase_icon, iconPath);
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
        if (hours > 0) parts.push(`${hours} h`);
        if (minutes > 0) parts.push(`${minutes} min`);
        
        return parts.join(' ') || '0s';
    }

    _updateUIText(moonData, translatedPhaseName) {
        // Format illumination
        let illuminationStr = '—';
        if (moonData.illumination !== null) {
            const value = moonData.illumination < 0.1 ? 0 : Number(moonData.illumination).toFixed(0);
            illuminationStr = `${LABELS.ILLUMINATION}: ${value}%`;
        }

        // Format time to next phase
        let nextPhaseTime = '—';
        let nextPhaseDisplayName = '—';
        if (moonData.timeToNextPhase !== null) {
            nextPhaseTime = `${LABELS.IN} ${this._formatSeconds(moonData.timeToNextPhase)}`;
            nextPhaseDisplayName = this._getNextPhase(translatedPhaseName);
        }

        // Format moon age
        let displayAge = '—';
        if (moonData.age !== null) {
            const ageValue = moonData.age < 0.1 ? 0 : moonData.age.toFixed(0);
            displayAge = `${LABELS.AGE}: ${ageValue} ${LABELS.DAYS}`;
        }

        // Update labels
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

    _getFilePath(date, suffix) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `/tmp/moon-phase-${suffix}-${year}${month}${day}.png`;
    }

    _getStaticMoonPhasePath() {
        return '/tmp/moonphase.png';
    }

    _setIconWithFallback(iconElement, iconPath, fallbackIconName = 'weather-clear-night-symbolic') {
        if (GLib.file_test(iconPath, GLib.FileTest.EXISTS)) {
            try {
                const gicon = Gio.icon_new_for_string(iconPath);
                iconElement.gicon = gicon;
                iconElement.icon_name = null;
                return true;
            } catch (error) {
                console.error(`Error setting icon: ${error}`);
            }
        }
        iconElement.icon_name = fallbackIconName;
        return false;
    }

    _updatePopupSmart(phase, date) {
        const showReversed = this._extension._settings.get_boolean('show-reversed-moon-phase');
        const requestedImagePath = showReversed ? 
            this._getFilePath(date, 'cropped-graygcale') : 
            this._getFilePath(date, 'cropped-circled');

        const file = Gio.File.new_for_path(requestedImagePath);
        if (file.query_exists(null)) {
            this._styledMenuItem.setMoonImage(requestedImagePath);
            return;
        }

        this._downloadAndProcessMoonImage(date, phase, requestedImagePath);
    }

    async _downloadAndProcessMoonImage(date, phase, requestedImagePath) {
        const starwalkUrl = this._getStarWalkUrl(date);
        const cachePath = this._getFilePath(date, 'starwalk');
        
        try {
            await this._downloadImageSimple(starwalkUrl, cachePath);
            this._createCroppedImage(cachePath, date);
            this._styledMenuItem.setMoonImage(requestedImagePath);
        } catch (error) {
            console.error('StarWalk download failed, using symbolic fallback:', error);
            this._useSymbolicFallback(phase.name);
        }
    }

    _createCroppedImage(cachePath, date) {
        try {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file(cachePath);
            const originalWidth = pixbuf.get_width();
            const originalHeight = pixbuf.get_height();

            const bounds = this._findMoonDiskBounds(pixbuf);
            if (!bounds) {
                throw new Error("Unable to detect moon disk");
            }

            const diskDiameter = Math.max(bounds.width, bounds.height);
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;

            const margin = 3;
            const cropSize = diskDiameter + (margin * 2);

            let cropX = Math.max(0, Math.floor(centerX - cropSize / 2));
            let cropY = Math.max(0, Math.floor(centerY - cropSize / 2));
            
            cropX = Math.min(cropX, originalWidth - cropSize);
            cropY = Math.min(cropY, originalHeight - cropSize);
            
            const finalCropX = Math.max(0, cropX);
            const finalCropY = Math.max(0, cropY);
            const finalCropSize = Math.min(cropSize, originalWidth - finalCropX, originalHeight - finalCropY);

            console.log(`Adaptive cropping: disk diameter=${diskDiameter}, crop size=${finalCropSize}, position=(${finalCropX}, ${finalCropY}), margin=${margin}px`);

            const cropped = pixbuf.new_subpixbuf(finalCropX, finalCropY, finalCropSize, finalCropSize);

            const croppedPath = this._getFilePath(date, 'cropped');
            cropped.savev(croppedPath, 'png', [], []);
            
            this._createCroppedCircledImage(croppedPath, date, diskDiameter, margin);
            
            const circledPath = this._getFilePath(date, 'cropped-circled');
            const circledPixbuf = GdkPixbuf.Pixbuf.new_from_file(circledPath);
            this._createGrayScaleImage(circledPixbuf, date);
            
            const staticPath = this._getStaticMoonPhasePath();
            cropped.savev(staticPath, 'png', [], []);
            
            this._deleteFile(cachePath);
            this._deleteFile(croppedPath);
            
            this._styledMenuItem.setMoonImage(circledPath);

        } catch (error) {
            console.error('Error creating cropped image:', error);
            this._styledMenuItem.setMoonImage(cachePath);
        }
    }

    _findMoonDiskBounds(pixbuf) {
        const width = pixbuf.get_width();
        const height = pixbuf.get_height();
        const rowstride = pixbuf.get_rowstride();
        const n_channels = pixbuf.get_n_channels();
        const has_alpha = pixbuf.get_has_alpha();
        const pixels = pixbuf.get_pixels();

        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;

        const ALPHA_THRESHOLD = 1;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * rowstride + x * n_channels;
                
                if (has_alpha) {
                    const alpha = pixels[pixelIndex + 3];
                    if (alpha > ALPHA_THRESHOLD) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                } else {
                    const r = pixels[pixelIndex];
                    const g = pixels[pixelIndex + 1];
                    const b = pixels[pixelIndex + 2];
                    const brightness = (r + g + b) / 3;
                    
                    if (brightness < 240) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                }
            }
        }

        if (minX >= maxX || minY >= maxY) {
            console.warn('No valid moon disk detected, using fallback cropping');
            return this._getFallbackBounds(width, height);
        }

        const bounds = {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };

        console.log(`Moon disk detected: x=${bounds.x}, y=${bounds.y}, width=${bounds.width}, height=${bounds.height}`);
        return bounds;
    }

    _getFallbackBounds(width, height) {
        const size = Math.min(width, height) * 0.8;
        const x = (width - size) / 2;
        const y = (height - size) / 2;
        
        return {
            x: Math.floor(x),
            y: Math.floor(y),
            width: Math.floor(size),
            height: Math.floor(size)
        };
    }

    _createCroppedCircledImage(croppedPath, date, diskDiameter = null, margin = 3) {
        try {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file(croppedPath);
            const width = pixbuf.get_width();
            const height = pixbuf.get_height();
            const rowstride = pixbuf.get_rowstride();
            const n_channels = pixbuf.get_n_channels();
            const has_alpha = pixbuf.get_has_alpha();
            const pixels = pixbuf.get_pixels();
            
            const centerX = width / 2;
            const centerY = height / 2;
            const diskRadius = diskDiameter ? diskDiameter / 2 : Math.min(width, height) / 2 - margin;
            const circleRadius = diskRadius;
            
            console.log(`Circling debug: width=${width}, height=${height}, diskDiameter=${diskDiameter}, diskRadius=${diskRadius}, margin=${margin}`);

            const circleWidth = 2;
            const circleColor = [0, 0, 0, 128];
            const circledPixels = new Uint8Array(pixels);
            
            let circlePixelsCount = 0;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    
                    if (distance >= circleRadius - 1 && distance <= circleRadius + circleWidth) {
                        const pixelIndex = y * rowstride + x * n_channels;
                        
                        circledPixels[pixelIndex] = circleColor[0];
                        circledPixels[pixelIndex + 1] = circleColor[1];
                        circledPixels[pixelIndex + 2] = circleColor[2];
                        if (has_alpha) {
                            circledPixels[pixelIndex + 3] = circleColor[3];
                        }
                        
                        circlePixelsCount++;
                    }
                }
            }
            
            console.log(`Circle drawn: ${circlePixelsCount} pixels, radius=${circleRadius}`);
            
            const gbytes = GLib.Bytes.new(circledPixels);
            const circledPixbuf = GdkPixbuf.Pixbuf.new_from_bytes(
                gbytes,
                pixbuf.get_colorspace(),
                has_alpha,
                pixbuf.get_bits_per_sample(),
                width,
                height,
                rowstride
            );

            const circledPath = this._getFilePath(date, 'cropped-circled');
            circledPixbuf.savev(circledPath, 'png', [], []);
            
        } catch (error) {
            console.error('Error creating circled image:', error);
        }
    }

    _deleteFile(filePath) {
        try {
            const file = Gio.File.new_for_path(filePath);
            if (file.query_exists(null)) {
                file.delete(null);
            }
        } catch (error) {
            console.debug(`Error deleting file ${filePath}:`, error);
        }
    }

    _createGrayScaleImage(pixbuf, date) {
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

                    const r = src[pixelIndex];
                    const g = src[pixelIndex + 1];
                    const b = src[pixelIndex + 2];
                    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

                    dest[pixelIndex] = gray;
                    dest[pixelIndex + 1] = gray;
                    dest[pixelIndex + 2] = gray;

                    if (n_channels === 4)
                        dest[pixelIndex + 3] = src[pixelIndex + 3];
                }
            }

            const gbytes = GLib.Bytes.new(dest);
            const grayscalePixbuf = GdkPixbuf.Pixbuf.new_from_bytes(
                gbytes,
                colorspace,
                has_alpha,
                bits,
                width,
                height,
                rowstride
            );

            const grayscalePath = this._getFilePath(date, 'cropped-graygcale');
            grayscalePixbuf.savev(grayscalePath, 'png', [], []);

        } catch (error) {
            console.error('Error creating grayscale image:', error);
        }
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
        this._setIconWithFallback(this._styledMenuItem.icon, iconPath);
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
