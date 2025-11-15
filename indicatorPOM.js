// indicatorPOM.js - Moon Phase Indicator UI
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import GdkPixbuf from 'gi://GdkPixbuf';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { PopupCustom } from './popupPOM.js';
import { MoonPhaseCalculator, formatTimeOnly, getDetailedPhaseInfo } from './calculatorPOM.js';
import { 
    UPDATE_INTERVAL_SECONDS, 
    ICON_SIZE,
    LABELS,
    PHASE_ICONS,
    PHASE_TRANSLATION_MAP,
    STARWALK_URL_TEMPLATE,
    STARWALK_CALENDAR_URL,
    LANGUAGE
} from './constantesPOM.js';

function getExactPhaseTime() {
    const now = new Date();
    const result = getDetailedPhaseInfo(now);
    
    if (result.date) {
        const phaseDay = new Date(result.date.getFullYear(), result.date.getMonth(), result.date.getDate());
        const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (currentDay <= phaseDay) {
            return formatTimeOnly(result.date);
        }
    }
    
    return null;
}

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

    _formatSeconds(seconds, nextPhaseDate, nextPhaseExactDate) {
        if (!seconds || seconds === null || !nextPhaseDate || !nextPhaseExactDate) return '—';
        
        const now = new Date();
        const targetDate = new Date(now.getTime() + (seconds * 1000));
        
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        
        const daysDiff = Math.floor((targetDay - today) / (24 * 3600 * 1000));
        
        let countdownStr;
        
        if (daysDiff === 0) {
            const timeOnly = formatTimeOnly(nextPhaseExactDate);
            countdownStr = `${LABELS.TODAY} ${LABELS.AT} ${timeOnly}`;
        } else if (daysDiff === 1) {
            const timeOnly = formatTimeOnly(nextPhaseExactDate);
            countdownStr = `${LABELS.TOMORROW} ${LABELS.AT} ${timeOnly}`;
        } else if (daysDiff >= 2) {
            countdownStr = `${daysDiff} ${LABELS.DAYS}`;
            return `${countdownStr}${LABELS.ON}${nextPhaseDate}`;
        } else {
            return '—';
        }
        
        return countdownStr;
    }

    _formatDecimal(value) {
        const rounded = Math.round(value * 10) / 10;
        
        if (rounded % 1 === 0) {
            return rounded.toLocaleString(LANGUAGE, { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
            });
        } else {
            return rounded.toLocaleString(LANGUAGE, { 
                minimumFractionDigits: 1, 
                maximumFractionDigits: 1 
            });
        }
    }

    _updateUIText(moonData, translatedPhaseName) {
        let illuminationStr = '—';
        if (moonData.illumination !== null) {
            const value = moonData.illumination < 0.1 ? 0 : moonData.illumination;
            const formattedValue = value.toLocaleString(LANGUAGE, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1
            });
            illuminationStr = `${LABELS.ILLUMINATION}: ${formattedValue}%`;
        }

        let nextPhaseTime = '—';
        let nextPhaseDisplayName = '—';
        if (moonData.timeToNextPhase !== null && moonData.nextPhaseDate !== null && moonData.nextPhaseExactDate !== null) {
            const formattedTime = this._formatSeconds(moonData.timeToNextPhase, moonData.nextPhaseDate, moonData.nextPhaseExactDate);
            
            const now = new Date();
            const targetDate = new Date(now.getTime() + (moonData.timeToNextPhase * 1000));
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const daysDiff = Math.floor((targetDay - today) / (24 * 3600 * 1000));
            
            if (daysDiff >= 2) {
                nextPhaseTime = `${LABELS.IN} ${formattedTime}`;
            } else {
                nextPhaseTime = formattedTime;
            }
            
            nextPhaseDisplayName = this._getNextPhase(translatedPhaseName);
        }

        let displayAge = '—';
        if (moonData.age !== null) {
            const ageValue = moonData.age < 0.1 ? 0 : moonData.age;
            const formattedAge = ageValue.toLocaleString(LANGUAGE, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1
            });
            displayAge = `${LABELS.AGE}: ${formattedAge} ${LABELS.DAYS}`;
        }

        const exactPhaseTime = getExactPhaseTime();
        
        let phaseTimeDisplay = null;
        if (exactPhaseTime) {
            phaseTimeDisplay = `${LABELS.AT} ${exactPhaseTime}`;
        }

        this._styledMenuItem.ageLabel.text = displayAge;
        this._styledMenuItem.nextPhaseNameLabel.text = nextPhaseDisplayName;
        this._styledMenuItem.nextPhaseTimeLabel.text = nextPhaseTime;

        this._styledMenuItem.updateData({
            phaseName: translatedPhaseName,
            phaseTime: phaseTimeDisplay,
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
        const requestedImagePath = this._getFilePath(date, 'cropped-circled-grayscale');

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
            
            const circledGrayscalePath = this._getFilePath(date, 'cropped-circled-grayscale');
            this._createCircledGrayscaleImage(croppedPath, circledGrayscalePath, diskDiameter, margin);
            
            const staticPath = this._getStaticMoonPhasePath();
            this._moveFile(croppedPath, staticPath);
            
            this._deleteFile(cachePath);
            
            this._styledMenuItem.setMoonImage(circledGrayscalePath);

        } catch (error) {
            console.error('Error creating cropped image:', error);
            this._styledMenuItem.setMoonImage(cachePath);
        }
    }

    _moveFile(sourcePath, destPath) {
        try {
            const sourceFile = Gio.File.new_for_path(sourcePath);
            const destFile = Gio.File.new_for_path(destPath);
            
            if (destFile.query_exists(null)) {
                destFile.delete(null);
            }
            
            sourceFile.move(destFile, Gio.FileCopyFlags.OVERWRITE, null, null);
            console.log(`File moved: ${sourcePath} → ${destPath}`);
        } catch (error) {
            console.error(`Error moving file ${sourcePath} to ${destPath}:`, error);
            throw error;
        }
    }

    _createCircledGrayscaleImage(inputPath, outputPath, diskDiameter = null, margin = 3) {
        try {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file(inputPath);
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
            
            console.log(`Creating circled grayscale: width=${width}, height=${height}, diskRadius=${diskRadius}`);

            const circleWidth = 2;
            const circleColor = [0, 0, 0, 128];
            const processedPixels = new Uint8Array(pixels);
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = y * rowstride + x * n_channels;
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    
                    const r = processedPixels[pixelIndex];
                    const g = processedPixels[pixelIndex + 1];
                    const b = processedPixels[pixelIndex + 2];
                    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                    
                    processedPixels[pixelIndex] = gray;
                    processedPixels[pixelIndex + 1] = gray;
                    processedPixels[pixelIndex + 2] = gray;
                    
                    if (distance >= circleRadius - 1 && distance <= circleRadius + circleWidth) {
                        processedPixels[pixelIndex] = circleColor[0];
                        processedPixels[pixelIndex + 1] = circleColor[1];
                        processedPixels[pixelIndex + 2] = circleColor[2];
                        if (has_alpha) {
                            processedPixels[pixelIndex + 3] = circleColor[3];
                        }
                    }
                }
            }
            
            const gbytes = GLib.Bytes.new(processedPixels);
            const resultPixbuf = GdkPixbuf.Pixbuf.new_from_bytes(
                gbytes,
                pixbuf.get_colorspace(),
                has_alpha,
                pixbuf.get_bits_per_sample(),
                width,
                height,
                rowstride
            );

            resultPixbuf.savev(outputPath, 'png', [], []);
            console.log(`Circled grayscale image saved: ${outputPath}`);
            
        } catch (error) {
            console.error('Error creating circled grayscale image:', error);
            throw error;
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
