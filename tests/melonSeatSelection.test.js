const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadSelectionUtils() {
    const context = vm.createContext({
        clearTimeout,
        console,
        setTimeout,
    });

    for (const relativePath of [
        "../scripts/common/sectionTargets.js",
        "../scripts/melonticket/seatSelection.js",
    ]) {
        const source = fs.readFileSync(path.join(__dirname, relativePath), "utf8");
        vm.runInContext(source, context);
    }

    return context.MelonSeatSelection;
}

class FakeElement {
    constructor({ className = "", textContent = "", visible = true, onClick } = {}) {
        this.children = [];
        this.className = className;
        this.clickCount = 0;
        this.hidden = false;
        this.isConnected = true;
        this.onClick = onClick;
        this.ownerDocument = null;
        this.parentElement = null;
        this.textContent = textContent;
        this.visible = visible;
    }

    append(...children) {
        for (const child of children) {
            child.parentElement = this;
            this.children.push(child);
            if (this.ownerDocument) {
                child.connect(this.ownerDocument);
            }
        }
    }

    click() {
        this.clickCount += 1;
        this.onClick?.();
    }

    connect(document) {
        this.ownerDocument = document;
        for (const child of this.children) {
            child.connect(document);
        }
    }

    getClientRects() {
        return this.visible ? [{}] : [];
    }

    getElementsByClassName(className) {
        const matches = [];
        for (const child of this.children) {
            if (child.className.split(/\s+/).includes(className)) {
                matches.push(child);
            }
            matches.push(...child.getElementsByClassName(className));
        }
        return matches;
    }
}

class FakeDocument {
    constructor() {
        this.body = new FakeElement();
        this.defaultView = {
            getComputedStyle: element => ({
                display: element.visible ? "block" : "none",
                visibility: "visible",
            }),
        };
        this.body.connect(this);
    }

    getElementsByClassName(className) {
        return this.body.getElementsByClassName(className);
    }
}

function addSeatGroup(document, options = {}) {
    const button = new FakeElement({ onClick: options.onClick });
    const title = new FakeElement({
        className: "seat_name",
        textContent: options.name ?? "All Seats",
    });
    button.append(title);
    document.body.append(button);
    return { button, title };
}

function addArea(document, label, visible = true) {
    const button = new FakeElement();
    const title = new FakeElement({
        className: "area_tit",
        textContent: label,
        visible,
    });
    button.append(title);
    document.body.append(button);
    return { button, title };
}

const selection = loadSelectionUtils();

test("exact target selects the combined Floor 2, Sec A area only", async () => {
    const document = new FakeDocument();
    addSeatGroup(document);
    const floor1 = addArea(document, "Floor 1,Sec A");
    const floor2 = addArea(document, "Floor\u00a0 2,  Sec A");

    const selected = await selection.selectTarget(document, "Floor 2 > Sec A");

    assert.equal(selected, true);
    assert.equal(floor1.button.clickCount, 0);
    assert.equal(floor2.button.clickCount, 1);
});

test("exact target waits for a ticket group to reveal its area", async () => {
    const document = new FakeDocument();
    const floor2 = addArea(document, "Floor 2,Sec A", false);
    const group = addSeatGroup(document, {
        onClick: () => setTimeout(() => {
            floor2.title.visible = true;
        }, 10),
    });

    const selected = await selection.selectTarget(
        document,
        "Floor 2 > Sec A",
        { interval: 5, timeout: 100 },
    );

    assert.equal(selected, true);
    assert.equal(group.button.clickCount, 1);
    assert.equal(floor2.button.clickCount, 1);
});

test("exact matching does not confuse floors or Sec A with Sec AA", async () => {
    const document = new FakeDocument();
    addSeatGroup(document);
    const wrongFloor = addArea(document, "Floor 1,Sec A");
    const wrongArea = addArea(document, "Floor 2,Sec AA");

    const selected = await selection.selectTarget(
        document,
        "Floor 2 > Sec A",
        { interval: 1, timeout: 5 },
    );

    assert.equal(selected, false);
    assert.equal(wrongFloor.button.clickCount, 0);
    assert.equal(wrongArea.button.clickCount, 0);
});

test("duplicate exact labels fail safely", async () => {
    const document = new FakeDocument();
    addSeatGroup(document);
    const first = addArea(document, "Floor 2,Sec A");
    const second = addArea(document, "Floor 2, Sec A");

    const selected = await selection.selectTarget(
        document,
        "Floor 2 > Sec A",
        { interval: 1, timeout: 5 },
    );

    assert.equal(selected, false);
    assert.equal(first.button.clickCount, 0);
    assert.equal(second.button.clickCount, 0);
});

test("legacy target keeps ordered, case-sensitive suffix behavior", async () => {
    const document = new FakeDocument();
    addSeatGroup(document);
    const f1 = addArea(document, "Floor FLOOR,Sec F1");
    const f2 = addArea(document, "Floor FLOOR,Sec F2");

    assert.equal(await selection.selectTarget(document, "f1"), false);
    assert.equal(await selection.selectTarget(document, "F1"), true);
    assert.equal(f1.button.clickCount, 1);
    assert.equal(f2.button.clickCount, 0);
});

test("target attempts stop at the first area with an available seat", async () => {
    const attempted = [];
    const seats = [false, true];

    const matched = await selection.trySeatTargets(
        ["f1", "f2"],
        async target => {
            attempted.push(target);
            return true;
        },
        async () => seats.shift(),
    );

    assert.equal(matched, "f2");
    assert.deepEqual(attempted, ["f1", "f2"]);
});

test("a missing target does not prevent the next target from succeeding", async () => {
    const attempted = [];

    const matched = await selection.trySeatTargets(
        ["Floor 9 > Sec Z", "Floor 2 > Sec A"],
        async target => {
            attempted.push(target);
            return target === "Floor 2 > Sec A";
        },
        async () => true,
    );

    assert.equal(matched, "Floor 2 > Sec A");
    assert.deepEqual(attempted, ["Floor 9 > Sec Z", "Floor 2 > Sec A"]);
});
