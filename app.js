// Initialize Lucide Icons
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initDragAndDrop();
    updateLivePrompt();
});

// App Global State Machine
const appState = {
    service: "Web + Dominio ($45,000)", // Default active plan in UI
    colorPalette: "Tech Corporate",
    fontStyle: "Modern Sans-serif",
    logoUploaded: false,
    logoFileName: "",
    logoFileSize: "",
    comments: ""
};

// 1. Plan selection sync logic (from pricing cards)
function selectPlan(planName) {
    appState.service = planName;
    
    // Sync pricing card visual styling
    const pricingCards = document.querySelectorAll(".pricing-card");
    const selectButtons = document.querySelectorAll(".select-plan-btn");
    
    pricingCards.forEach((card, idx) => {
        const btn = selectButtons[idx];
        const btnPlan = btn.getAttribute("data-plan");
        
        if (btnPlan === planName) {
            card.classList.add("active-card");
            btn.className = "btn btn-mint btn-block select-plan-btn";
        } else {
            card.classList.remove("active-card");
            btn.className = "btn btn-outline btn-block select-plan-btn";
        }
    });

    // Sync interactive customizer badges visual styling
    const badgePlan1 = document.getElementById("badge-plan-1");
    const badgePlan2 = document.getElementById("badge-plan-2");
    
    if (planName.includes("25,000")) {
        badgePlan1.classList.add("active");
        badgePlan2.classList.remove("active");
    } else {
        badgePlan2.classList.add("active");
        badgePlan1.classList.remove("active");
    }

    updateLivePrompt();
}

// 2. Customizer plan badge selections sync back to pricing cards
function updatePlanState(planName) {
    selectPlan(planName);
    
    // Scroll smoothly to customizer form if plan was selected from pricing cards
    // No need to scroll if toggling from inside the form
}

// 3. Palette Select trigger
function selectPalette(paletteName) {
    appState.colorPalette = paletteName;
    
    // Update active classes on grid tiles
    const tiles = document.querySelectorAll(".palette-tile");
    tiles.forEach(tile => {
        if (tile.getAttribute("data-palette") === paletteName) {
            tile.classList.add("active");
        } else {
            tile.classList.remove("active");
        }
    });
    
    updateLivePrompt();
}

// 4. Font Select trigger
function selectFont(fontName) {
    appState.fontStyle = fontName;
    
    // Update active classes on chips
    const chips = document.querySelectorAll(".font-chip");
    chips.forEach(chip => {
        if (chip.textContent.trim() === fontName) {
            chip.classList.add("active");
        } else {
            chip.classList.remove("active");
        }
    });
    
    // Dynamically change font family on the Live Prompt Preview panel for an immersive UX!
    const promptPreview = document.getElementById("compiled-prompt-preview");
    promptPreview.className = "console-prompt-content"; // reset
    
    if (fontName === "Modern Sans-serif") {
        promptPreview.classList.add("font-sans-preview");
    } else if (fontName === "Tech Mono") {
        promptPreview.classList.add("font-mono-preview");
    } else if (fontName === "Elegant Serif") {
        promptPreview.classList.add("font-serif-preview");
    } else if (fontName === "Bold Geometric") {
        promptPreview.classList.add("font-geom-preview");
    }

    updateLivePrompt();
}

// 5. Logo drag-and-drop zone setup
function initDragAndDrop() {
    const dropzone = document.getElementById("logo-dropzone");
    const logoInput = document.getElementById("logo-input");

    // Click triggers hidden input explore
    dropzone.addEventListener("click", () => {
        // Only trigger click if logo isn't uploaded yet
        if (!appState.logoUploaded) {
            logoInput.click();
        }
    });

    logoInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleUploadedFile(e.target.files[0]);
        }
    });

    // Drag-and-drop visual handlers
    ["dragenter", "dragover"].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("dragover");
        }, false);
    });

    dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleUploadedFile(files[0]);
        }
    }, false);
}

// File handling
function handleUploadedFile(file) {
    appState.logoUploaded = true;
    appState.logoFileName = file.name;
    
    // Format file size
    const sizeInKb = (file.size / 1024).toFixed(1);
    appState.logoFileSize = `${sizeInKb} KB`;

    // Update UI elements
    document.getElementById("dropzone-idle").classList.add("hidden");
    document.getElementById("dropzone-success").classList.remove("hidden");
    document.getElementById("uploaded-filename").textContent = appState.logoFileName;
    document.getElementById("uploaded-filesize").textContent = appState.logoFileSize;

    updateLivePrompt();
}

// Remove uploaded logo state and restore idle UI
function removeLogo(event) {
    event.stopPropagation(); // prevent triggering input click
    
    appState.logoUploaded = false;
    appState.logoFileName = "";
    appState.logoFileSize = "";

    document.getElementById("logo-input").value = ""; // Clear file path
    document.getElementById("dropzone-idle").classList.remove("hidden");
    document.getElementById("dropzone-success").classList.add("hidden");

    updateLivePrompt();
}

// 6. Comments area sync
function updateComments(val) {
    appState.comments = val.trim();
    updateLivePrompt();
}

// 7. Dynamic AI Prompt compiler logic
function updateLivePrompt() {
    const previewEl = document.getElementById("compiled-prompt-preview");
    
    const logoStatus = appState.logoUploaded 
        ? `Sí, archivo cargado: "${appState.logoFileName}" (${appState.logoFileSize})` 
        : "No, el cliente no requiere logotipo inicial";
        
    const businessComments = appState.comments !== "" 
        ? `"${appState.comments}"` 
        : "(Ninguno provisto. AI definirá detalles creativos)";

    // Format prompt text clearly
    const promptString = `Servicio contratado: ${appState.service} | Paleta de colores: ${appState.colorPalette} | Estilo de fuente: ${appState.fontStyle} | Logotipo cargado: ${logoStatus} | Instrucciones y descripción del negocio: ${businessComments}`;
    
    previewEl.textContent = promptString;
}

// 8. Submit Order & WhatsApp Deep Link opening
function submitOrder() {
    const logoStatus = appState.logoUploaded 
        ? `Sí, archivo cargado: "${appState.logoFileName}" (${appState.logoFileSize})` 
        : "No, el cliente no requiere logotipo inicial";
        
    const businessComments = appState.comments !== "" 
        ? `"${appState.comments}"` 
        : "Ninguno provisto. AI definirá detalles creativos";

    // Strictly starts with 'QUIERO MI WEB: ' followed immediately by the prompt string
    const finalPrompt = `Servicio contratado: ${appState.service} | Paleta de colores: ${appState.colorPalette} | Estilo de fuente: ${appState.fontStyle} | Logotipo cargado: ${logoStatus} | Instrucciones y descripción del negocio: ${businessComments}`;
    
    const messageText = `QUIERO MI WEB: ${finalPrompt}`;
    const whatsappNumber = "56943997298";
    
    // Create redirection URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
    
    // Visual button feedback before redirecting
    const submitBtn = document.getElementById("btn-create-submit");
    const originalContent = submitBtn.innerHTML;
    
    submitBtn.innerHTML = `<i data-lucide="check" class="icon-zap"></i> ¡ORDEN GENERADA!`;
    submitBtn.style.backgroundColor = "#00c865";
    
    setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        submitBtn.innerHTML = originalContent;
        submitBtn.style.backgroundColor = "";
        lucide.createIcons();
    }, 800);
}

