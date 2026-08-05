(function initializeMelonSeatSelection(root) {
    const targetUtils = root.SectionTargetUtils;
    if (!targetUtils) {
        throw new Error("SectionTargetUtils must be loaded before seatSelection.js");
    }

    function normalizeLabel(value) {
        return String(value ?? "")
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function normalizeAreaLabel(value) {
        return normalizeLabel(value).replace(/\s*,\s*/g, ",");
    }

    function isVisible(element) {
        if (!element || element.hidden || element.isConnected === false) {
            return false;
        }

        const view = element.ownerDocument?.defaultView;
        const style = view?.getComputedStyle?.(element);
        if (style && (style.display === "none" || style.visibility === "hidden")) {
            return false;
        }

        if (typeof element.getClientRects === "function") {
            return element.getClientRects().length > 0;
        }

        return true;
    }

    function findUniqueExactArea(elements, floorName, areaName) {
        const expected = normalizeAreaLabel(`${floorName},${areaName}`);
        const matches = Array.from(elements).filter(element => {
            return isVisible(element) &&
                normalizeAreaLabel(element.textContent) === expected;
        });

        return matches.length === 1 ? matches[0] : null;
    }

    async function waitFor(getValue, options = {}) {
        const timeout = options.timeout ?? 2000;
        const interval = options.interval ?? 50;
        const deadline = Date.now() + timeout;

        while (Date.now() <= deadline) {
            const value = getValue();
            if (value) {
                return value;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        return null;
    }

    function clickParent(element) {
        if (!element?.parentElement || typeof element.parentElement.click !== "function") {
            return false;
        }

        element.parentElement.click();
        return true;
    }

    function openEverySection(document) {
        const sections = document.getElementsByClassName("seat_name");
        for (const section of Array.from(sections)) {
            clickParent(section);
        }
    }

    function selectLegacyArea(document, areaName) {
        const expected = normalizeLabel(areaName);
        if (!expected) {
            return false;
        }

        const areas = document.getElementsByClassName("area_tit");
        for (const area of Array.from(areas)) {
            if (normalizeLabel(area.textContent).endsWith(expected)) {
                return clickParent(area);
            }
        }

        return false;
    }

    async function selectExactArea(document, floorName, areaName, options = {}) {
        const findArea = () => findUniqueExactArea(
            document.getElementsByClassName("area_tit"),
            floorName,
            areaName,
        );

        let area = findArea();
        if (!area) {
            openEverySection(document);
            area = await waitFor(findArea, options);
        }

        return area ? clickParent(area) : false;
    }

    async function selectTarget(document, value, options = {}) {
        const target = typeof value === "string"
            ? targetUtils.parseSectionTarget(value)
            : value;

        if (!target) {
            return false;
        }

        if (target.mode === "exact") {
            return selectExactArea(document, target.floor, target.area, options);
        }

        openEverySection(document);
        return selectLegacyArea(document, target.area);
    }

    async function trySeatTargets(targets, select, findSeat) {
        for (const target of targets) {
            if (!await select(target)) {
                continue;
            }

            if (await findSeat()) {
                return target;
            }
        }

        return null;
    }

    root.MelonSeatSelection = Object.freeze({
        findUniqueExactArea,
        isVisible,
        normalizeAreaLabel,
        normalizeLabel,
        selectExactArea,
        selectLegacyArea,
        selectTarget,
        trySeatTargets,
        waitFor,
    });
})(globalThis);
