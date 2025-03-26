import { Vector } from "../../utility/Vector.js";

export class DocumentManager {
    static setElementDimensions(elementName, desiredDimensionsVector) {
        document.getElementById(elementName).width = desiredDimensionsVector.x;
        document.getElementById(elementName).height = desiredDimensionsVector.y;
    }

    static getElementDimensions(elementName) {
        return new Vector(document.getElementById(elementName).clientWidth, document.getElementById(elementName).clientHeight)
    }

    static updateFuelBar(fuelPercentageRemaining) {
        const fuelBar = document.getElementById('fuel-bar');
        
        const lostPercent = 100 - fuelPercentageRemaining;
         
        fuelBar.style.background = `linear-gradient(to right, transparent 0% ${lostPercent}%, lime ${lostPercent}% 50%, yellow 50% 75%, red 75%)`;
    }

    static updateSparePartsBar(sparePartsPercentageRemaining) {
        const sparePartsBar = document.getElementById('spare-parts-bar');
        
        const lostPercent = 100 - sparePartsPercentageRemaining;
         
        sparePartsBar.style.background = `linear-gradient(to right, transparent 0% ${lostPercent}%, blue ${lostPercent}%)`;
    }

    static updateScore(score) {
        this.updateElementText("player-score", score);
    }

    static updateLives(lives) {
        this.updateElementText("player-lives", ` = ${lives}`);
    }

    static updateLevel(level) {
        this.updateElementText("level-number", level)
    }

    static addClassToElement(elementName, className) {
        document.getElementById(elementName).classList.add(className);
    }

    static removeClassFromElement(elementName, className) {
        document.getElementById(elementName).classList.remove(className);
    }

    static updateElementText(elementName, text) {
        document.getElementById(elementName).innerHTML = text;
    }

    static markScreenAsHidden(screenId) {
        const screen = document.getElementById(screenId);

        screen.style.display = 'none';
    }

    static markScreenAsShowing(screenId) {
        const screen = document.getElementById(screenId);

        screen.style.display = 'flex';
    }

    static setScannerAndRadarCanvasSizes() {
    let scannerDimensions = DocumentManager.getElementDimensions('scanner');
    DocumentManager.setElementDimensions('scannerCanvas', scannerDimensions);

    // Another canvas for another layer of the scanner drawing area
    DocumentManager.setElementDimensions('projectilesScannerCanvas', scannerDimensions);

    // Add hidden canvas for drawing effects on sprites before drawing on the actual scanner canvas
    DocumentManager.setElementDimensions('effectScannerCanvas', scannerDimensions);

    let radarDimensions = DocumentManager.getElementDimensions('radar');
    DocumentManager.setElementDimensions('radarCanvas', radarDimensions);
    }
}