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
        this.updateElementTextByElementName("player-score", score);
    }

    static updateLives(lives) {
        this.updateElementTextByElementName("player-lives", ` = ${lives}`);
    }

    static updateLevel(level) {
        this.updateElementTextByElementName("level-number", level)
    }

    static addClassToElement(elementName, className) {
        document.getElementById(elementName).classList.add(className);
    }

    static removeClassFromElement(elementName, className) {
        document.getElementById(elementName).classList.remove(className);
    }

    static updateElementTextByElementName(elementName, text) {
        this.updateElementTextByElementObject(document.getElementById(elementName), text);
    }

    static updateElementTextByElementObject(element, text) {
        element.innerHTML = text;
    }

    static markScreenAsHidden(screenId) {
        const screen = document.getElementById(screenId);

        screen.style.display = 'none';
    }

    static markScreenAsShowing(screenId) {
        const screen = document.getElementById(screenId);

        screen.style.display = 'flex';
    }

    static focusOnElement(elementId) {
        const element = document.getElementById(elementId);
        element.focus();
    }

    static getValueOfInputElement(elementId) {
        const element = document.getElementById(elementId);
        return element.value;
    }

    static updateHighScoreElement(parentElementId, name, score, level, shouldHighlight) {
        const parentElement = document.getElementById(parentElementId);
        const nameElement = parentElement.querySelector(".highscore-row-name");
        const scoreElement = parentElement.querySelector(".highscore-row-score");
        const levelElement = parentElement.querySelector(".highscore-row-level");

        if (shouldHighlight) {
            parentElement.classList.add('highscore-highlight');
        } else {
            parentElement.classList.remove('highscore-highlight');
        }
        this.updateElementTextByElementObject(nameElement, name);
        this.updateElementTextByElementObject(scoreElement, score);
        this.updateElementTextByElementObject(levelElement, level);
    }

    static updateHighScoresElements(allScores, optionalScoreToHighlight) {
        let indexToHighlight = -1;
        if (optionalScoreToHighlight !== undefined) {
            indexToHighlight = allScores.findLastIndex((score) => score.score === optionalScoreToHighlight)
        }

        allScores.forEach((score, index) => {
            const matchingElementId = `highscore-${index + 1}`;
            this.updateHighScoreElement(matchingElementId, score.username, score.score, score.level, index === indexToHighlight);
        })
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