import { get_stored_value, store_value } from "../module/storage.js";
import "../../scripts/common/sectionTargets.js";

const { parseSectionInput } = globalThis.SectionTargetUtils;

window.onclick = function(event) {
    const target = event.target;
    if (target.classList.contains("close")) {
        window.history.back();
    }
}


document.addEventListener('DOMContentLoaded', function  () {
    const form = document.querySelector('form');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        form.getElementsByTagName("button")[0].disabled = true;
        
        let data = {};
        const formData = new FormData(form);
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        data["section"] = parseSectionInput(data["section"]);
        data["platform"] = form.getElementsByTagName("button")[0].id;
        let array = await get_stored_value("autoBooking") || [];
        store_value(data["concert-id"], data);
        array.push(data);
        store_value("autoBooking", array);
        window.history.back();
    });
});
