const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadTargetUtils() {
    const context = vm.createContext({});
    const source = fs.readFileSync(
        path.join(__dirname, "../scripts/common/sectionTargets.js"),
        "utf8",
    );
    vm.runInContext(source, context);
    return context.SectionTargetUtils;
}

const utils = loadTargetUtils();

test("parses and trims legacy comma-separated areas", () => {
    assert.deepEqual([...utils.parseSectionInput(" f1, f2, ")], ["f1", "f2"]);
});

test("parses semicolon-separated exact floor and area targets", () => {
    const targets = utils.parseSectionInput(
        "Floor 2 > Sec A; Floor 1 > Sec B; ",
    );

    assert.deepEqual([...targets], ["Floor 2 > Sec A", "Floor 1 > Sec B"]);
    assert.equal(
        utils.formatSectionInput(targets),
        "Floor 2 > Sec A; Floor 1 > Sec B",
    );
});

test("keeps existing stored arrays backward compatible", () => {
    assert.deepEqual([...utils.parseSectionInput(["f1", " f2", ""])], ["f1", "f2"]);
    assert.equal(utils.formatSectionInput(["f1", "f2"]), "f1, f2");
});

test("parses exact and legacy targets without changing their labels", () => {
    assert.deepEqual(
        { ...utils.parseSectionTarget("Floor 2 > Sec A") },
        { mode: "exact", floor: "Floor 2", area: "Sec A" },
    );
    assert.deepEqual(
        { ...utils.parseSectionTarget("f1") },
        { mode: "legacy", floor: null, area: "f1" },
    );
    assert.equal(utils.parseSectionTarget("Floor 2 > "), null);
});

test("manifest loads Melon selection helpers before the seat runner", () => {
    const manifest = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../manifest.json"), "utf8"),
    );
    const melonScript = manifest.content_scripts.find(entry => {
        return entry.matches.some(match => match.includes("onestop.htm"));
    });

    assert.deepEqual(melonScript.js.slice(-3), [
        "scripts/common/sectionTargets.js",
        "scripts/melonticket/seatSelection.js",
        "scripts/melonticket/seat.js",
    ]);
});
