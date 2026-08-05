(function initializeSectionTargetUtils(root) {
    if (root.SectionTargetUtils) {
        return;
    }

    function cleanTargets(values) {
        return values
            .map(value => String(value ?? "").trim())
            .filter(Boolean);
    }

    function parseSectionInput(value) {
        if (Array.isArray(value)) {
            return cleanTargets(value);
        }

        const input = String(value ?? "").trim();
        if (!input) {
            return [];
        }

        const delimiter = input.includes(">") ? ";" : ",";
        return cleanTargets(input.split(delimiter));
    }

    function formatSectionInput(value) {
        const targets = parseSectionInput(value);
        const delimiter = targets.some(target => target.includes(">")) ? "; " : ", ";
        return targets.join(delimiter);
    }

    function parseSectionTarget(value) {
        const target = String(value ?? "").trim();
        if (!target) {
            return null;
        }

        const separatorIndex = target.indexOf(">");
        if (separatorIndex === -1) {
            return {
                mode: "legacy",
                floor: null,
                area: target,
            };
        }

        const floor = target.slice(0, separatorIndex).trim();
        const area = target.slice(separatorIndex + 1).trim();
        if (!floor || !area) {
            return null;
        }

        return {
            mode: "exact",
            floor,
            area,
        };
    }

    root.SectionTargetUtils = Object.freeze({
        formatSectionInput,
        parseSectionInput,
        parseSectionTarget,
    });
})(globalThis);
