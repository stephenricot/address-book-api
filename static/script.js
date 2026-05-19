const API_BASE = "/addresses";

async function apiCall(url, options = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Request failed");
    }
    if (res.status !== 204) return res.json();
    return null;
}

// Load all addresses and render
async function loadAddresses() {
    try {
        const addresses = await apiCall(API_BASE);
        renderAddressList(addresses);
    } catch (err) {
        showError("addressList", err.message);
    }
}

function renderAddressList(addresses) {
    const container = document.getElementById("addressList");
    if (!addresses.length) {
        container.innerHTML = "<p>No addresses found.</p>";
        return;
    }
    const html = addresses.map(addr => `
        <div class="address-item" data-id="${addr.id}">
            <div class="address-info">
                <strong>${addr.street}, ${addr.city}, ${addr.state} ${addr.zip_code}, ${addr.country}</strong><br>
                📍 (${addr.latitude}, ${addr.longitude})<br>
                🆔 ID: ${addr.id}
            </div>
            <div class="address-actions">
                <button class="edit" onclick="editAddress(${addr.id})">✏️ Edit</button>
                <button onclick="deleteAddress(${addr.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join("");
    container.innerHTML = html;
}

// Create address
document.getElementById("createForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        street: document.getElementById("street").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip_code: document.getElementById("zip").value,
        country: document.getElementById("country").value,
        latitude: parseFloat(document.getElementById("lat").value),
        longitude: parseFloat(document.getElementById("lon").value)
    };
    try {
        await apiCall(API_BASE, { method: "POST", body: JSON.stringify(payload) });
        alert("Address created!");
        loadAddresses();
        e.target.reset();
    } catch (err) {
        alert("Error: " + err.message);
    }
});

// Delete address
window.deleteAddress = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
        await apiCall(`${API_BASE}/${id}`, { method: "DELETE" });
        loadAddresses();
    } catch (err) {
        alert("Delete failed: " + err.message);
    }
};

// Get modal elements
const modal = document.getElementById("editModal");
const closeBtn = document.getElementsByClassName("close")[0];
const cancelBtn = document.getElementById("cancelEdit");

// Function to open modal with address data
window.editAddress = async (id) => {
    try {
        const address = await apiCall(`${API_BASE}/${id}`);
        // Fill form fields
        document.getElementById("editId").value = address.id;
        document.getElementById("editStreet").value = address.street;
        document.getElementById("editCity").value = address.city;
        document.getElementById("editState").value = address.state;
        document.getElementById("editZip").value = address.zip_code;
        document.getElementById("editCountry").value = address.country;
        document.getElementById("editLat").value = address.latitude;
        document.getElementById("editLon").value = address.longitude;
        modal.style.display = "block";
    } catch (err) {
        alert("Failed to load address: " + err.message);
    }
};

// Close modal
function closeModal() {
    modal.style.display = "none";
}
closeBtn.onclick = closeModal;
cancelBtn.onclick = closeModal;
window.onclick = function(event) {
    if (event.target == modal) closeModal();
};

// Handle edit form submission
document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editId").value;
    const updatedData = {
        street: document.getElementById("editStreet").value,
        city: document.getElementById("editCity").value,
        state: document.getElementById("editState").value,
        zip_code: document.getElementById("editZip").value,
        country: document.getElementById("editCountry").value,
        latitude: parseFloat(document.getElementById("editLat").value),
        longitude: parseFloat(document.getElementById("editLon").value)
    };
    try {
        await apiCall(`${API_BASE}/${id}`, {
            method: "PUT",
            body: JSON.stringify(updatedData)
        });
        alert("Address updated successfully!");
        closeModal();
        loadAddresses();  // refresh list
    } catch (err) {
        alert("Update failed: " + err.message);
    }
});

// Nearby search
document.getElementById("nearbyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lat = parseFloat(document.getElementById("centerLat").value);
    const lon = parseFloat(document.getElementById("centerLon").value);
    const dist = parseFloat(document.getElementById("radius").value);
    try {
        const nearby = await apiCall(`${API_BASE}/nearby`, {
            method: "POST",
            body: JSON.stringify({ lat, lon, distance_km: dist })
        });
        const container = document.getElementById("nearbyResults");
        if (nearby.length === 0) {
            container.innerHTML = "<p>No addresses within that distance.</p>";
        } else {
            container.innerHTML = nearby.map(addr => 
                `<div>📌 ${addr.street}, ${addr.city} – ${addr.latitude},${addr.longitude} (ID ${addr.id})</div>`
            ).join("");
        }
    } catch (err) {
        document.getElementById("nearbyResults").innerHTML = `<span class="error">${err.message}</span>`;
    }
});

// Clear nearby search inputs and results
document.getElementById("clearNearbyBtn").addEventListener("click", () => {
    document.getElementById("centerLat").value = "";
    document.getElementById("centerLon").value = "";
    document.getElementById("radius").value = "";
    document.getElementById("nearbyResults").innerHTML = ""; // clear previous results
});

// Refresh button
document.getElementById("refreshBtn").addEventListener("click", loadAddresses);

// Initial load
loadAddresses();