import { delete_value, get_stored_value, store_value } from "../module/storage.js";

let loadAutoBooking = async () => {
    let autoBooking = await get_stored_value("autoBooking");
    let test = await get_stored_value("209206");
    console.log(test);
    if (!autoBooking || autoBooking.length < 1) {
        return (document.getElementById("list-booking").innerHTML =
            "No auto booking");
    }

    let listContainer = document.getElementById("list-booking");

    autoBooking.forEach((booking, index) => {
        let concertItem = createConcertItem(booking, index);
        listContainer.appendChild(concertItem);
    });
};

function createConcertItem(booking, index) {
    let div = document.createElement("div");
    div.classList.add("booking-item");
    div.setAttribute("data-index", index);

    // 创建按钮容器
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // 编辑按钮
    let editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.innerHTML = "&#9998;"; // 编辑符号
    editButton.title = "Edit";
    editButton.addEventListener("click", async(event) => {
        event.stopPropagation();
        let dataIndex = event.currentTarget.parentNode.parentNode.getAttribute("data-index");
        await editConcertItem(dataIndex);
    });

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = "&#10006;"; // Cross symbol
    deleteButton.title = "Delete";
    deleteButton.addEventListener("click", async(event) => {
        event.stopPropagation(); // Prevent the click event from propagating
        let dataIndex = event.currentTarget.parentNode.parentNode.getAttribute("data-index");
        await deleteConcertItem(dataIndex);
    });

    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    let concertInfo = document.createElement("div");
    concertInfo.classList.add("concert-info");
    let concertName = document.createElement("p");
    concertName.classList.add("concert-name");
    concertName.textContent = booking["concert-name"] || "";

    let concertId = document.createElement("p");
    concertId.textContent = `Concert ID: ${booking["concert-id"] || ""}`;

    let date = document.createElement("p");
    date.textContent = `Date: ${booking.date || ""}`;

    let time = document.createElement("p");
    time.textContent = `Time: ${booking.time || ""}`;

    let section = document.createElement("p");
    section.textContent = `Sections: ${Array.isArray(booking.section) ? booking.section.join(", ") : ""}`;

    concertInfo.appendChild(concertName);
    concertInfo.appendChild(concertId);
    concertInfo.appendChild(date);
    concertInfo.appendChild(time);
    concertInfo.appendChild(section);

    let platformImage = document.createElement("img");
    platformImage.classList.add("platform-image");
    platformImage.src = getPlatformImageSrc(booking.platform);
    platformImage.alt = booking.platform;

    div.appendChild(concertInfo);
    div.appendChild(platformImage);
    div.appendChild(buttonContainer);

    div.addEventListener("click", () => {
        openBookingUrl(booking.platform, booking["concert-id"]);
    });

    return div;
}

function openBookingUrl(platform, concertId) {
    let url;
    switch (platform) {
        case "melon":
            url = `https://tkglobal.melon.com/performance/index.htm?langCd=EN&prodId=${concertId}`;
            break;
        case "yes24":
            url = `http://ticket.yes24.com/Pages/English/Perf/FnPerfDeail.aspx?IdPerf=${concertId}`;
            break;
        case "interpark":
            url = `https://www.globalinterpark.com/product/${concertId}?lang=en`;
            break;
        // Add more cases for other platforms if needed
        default:
            console.error("Unknown platform");
            return;
    }
    
    window.open(url, "_blank");
}

async function deleteConcertItem(index) {
    let listContainer = document.getElementById("list-booking");
    let autoBooking = await get_stored_value("autoBooking");
    delete_value(autoBooking[index]["concert-id"]);
    // Remove the item from the array
    autoBooking.splice(index, 1);

    // Update the stored values
    store_value("autoBooking", autoBooking);

    // Remove the corresponding DOM element
    let deletedElement = listContainer.children[index];
    listContainer.removeChild(deletedElement);

    // Update indices of remaining DOM elements
    for (let i = index; i < listContainer.children.length; i++) {
        // Update data-index attribute if needed
        listContainer.children[i].dataset.index = i;
    }
}

async function editConcertItem(index) {
    let autoBooking = await get_stored_value("autoBooking");
    let concertItem = autoBooking[index];
    
    // 将要编辑的数据存储到临时键
    store_value("editingConcertItem", {
        data: concertItem,
        index: index
    });
    
    // 根据平台跳转到对应的编辑页面
    let editUrl;
    switch (concertItem.platform) {
        case "melon":
            editUrl = "../editForm/editMelon.html";
            break;
        case "yes24":
            editUrl = "../editForm/editYes24.html";
            break;
        case "interpark":
            editUrl = "../editForm/editInterpark.html";
            break;
        default:
            console.error("Unknown platform");
            return;
    }
    
    window.location.href = editUrl;
}

function getPlatformImageSrc(platform) {
    switch (platform) {
        case "melon":
            return "../../assets/melonticket_logo.png";
        case "yes24":
            return "../../assets/yes24_logo.png";
        case "interpark":
            return "../../assets/interpark_logo.png";
        // Add more cases for other platforms if needed
        default:
            return ""; // Default image source for unknown platforms
    }
}

loadAutoBooking();
