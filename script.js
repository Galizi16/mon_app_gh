// Encapsulation dans un objet App
const App = {
    // Données
    tariffData: [],
    availabilityData: [],
    staffData: [],
    roomTypes: new Set(),
    tariffPlans: new Set(),
    services: new Set(),
    fileLoaded: {
        tariffs: false,
        availability: false,
        staff: false
    },

    // Constantes
    ROOM_CAPACITY: {
        "Double Classique": 25,
        "Double Deluxe": 5,
        "Twin Classique": 8,
        "Twin Deluxe": 2,
        "Terrasse Classique": 2,
        "Terrasse Deluxe": 1,
        "Double cClassique Adjacentes": 2
    },
    TOTAL_ROOMS: 45,

    // Ordre personnalisé pour le tri des services
    SERVICE_ORDER: [
        "RECEPTION JOUR",
        "RECEPTION NUIT",
        "GOUVERNANTE",
        "CAFFETTE",
        "FEMME DE CHAMBRE",
        "TECHNICIEN"
    ],

    // Éléments DOM
    elements: {},

    // Initialisation
    init() {
        console.log('App initializing...');
        this.cacheDOMElements();
        this.addEventListeners();
        this.applyInitialTheme();
        this.toggleDateInputs();
        this.updateSelectStates();
        console.log('App initialized.');
    },

    cacheDOMElements() {
        this.elements.body = document.body;
        this.elements.messageArea = document.getElementById('messageArea');
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.refreshButton = document.getElementById('refreshButton');

        // File inputs and statuses
        this.elements.tariffFileInput = document.getElementById('tariffFileInput');
        this.elements.availabilityFileInput = document.getElementById('availabilityFileInput');
        this.elements.staffFileInput = document.getElementById('staffFileInput');
        this.elements.tariffFileStatus = document.getElementById('tariffFileStatus');
        this.elements.availabilityFileStatus = document.getElementById('availabilityFileStatus');
        this.elements.staffFileStatus = document.getElementById('staffFileStatus');

        // Price section
        this.elements.reservationForm = document.getElementById('reservationForm');
        this.elements.dateSelectionMode = document.getElementById('dateSelectionMode');
        this.elements.arrivalDate = document.getElementById('arrivalDate');
        this.elements.nightsInput = document.getElementById('nightsInput');
        this.elements.numberOfNights = document.getElementById('numberOfNights');
        this.elements.departureInput = document.getElementById('departureInput');
        this.elements.departureDate = document.getElementById('departureDate');
        this.elements.roomTypeSelect = document.getElementById('roomType');
        this.elements.tariffPlanSelect = document.getElementById('tariffPlan');
        this.elements.discountInput = document.getElementById('discount');
        this.elements.tariffResultsDiv = document.getElementById('tariffResults');
        this.elements.priceTableBody = document.querySelector('#priceTable tbody');
        this.elements.totalPriceSpan = document.getElementById('totalPrice');
        this.elements.discountAmountSpan = document.getElementById('discountAmount');
        this.elements.totalAfterDiscountSpan = document.getElementById('totalAfterDiscount');
        this.elements.averagePriceSpan = document.getElementById('averagePrice');
        this.elements.summaryTextP = document.getElementById('summaryText');

        // Availability section
        this.elements.singleDayInput = document.getElementById('singleDay');
        this.elements.dashboardDiv = document.getElementById('dashboard');

        // Staff section
        this.elements.staffDateInput = document.getElementById('staffDate');
        this.elements.serviceFilterSelect = document.getElementById('serviceFilter');
        this.elements.staffResultsDiv = document.getElementById('staffResults');

        // Reload buttons
        this.elements.reloadButtons = document.querySelectorAll('.reloadButton');
    },

    addEventListeners() {
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.refreshButton.addEventListener('click', () => this.refreshApp());
        this.elements.tariffFileInput.addEventListener('change', (e) => this.handleFileLoad(e, 'tariffs'));
        this.elements.availabilityFileInput.addEventListener('change', (e) => this.handleFileLoad(e, 'availability'));
        this.elements.staffFileInput.addEventListener('change', (e) => this.handleFileLoad(e, 'staff'));
        this.elements.reloadButtons.forEach(button => {
            button.addEventListener('click', (e) => this.reloadFile(e.currentTarget.dataset.inputId));
        });
        this.elements.reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculatePrice();
        });
        this.elements.dateSelectionMode.addEventListener('change', () => this.toggleDateInputs());
        this.elements.roomTypeSelect.addEventListener('change', () => this.filterTariffPlans());
        this.elements.singleDayInput.addEventListener('change', () => this.updateDashboard());
        this.elements.staffDateInput.addEventListener('change', () => this.updateStaffPlanning());
        this.elements.serviceFilterSelect.addEventListener('change', () => this.updateStaffPlanning());
    },

    applyInitialTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
    },

    setTheme(themeName) {
        this.elements.body.setAttribute('data-theme', themeName);
        this.elements.themeToggle.innerHTML = themeName === 'dark'
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M10 2c-1.82 0-3.53.5-5 1.35 2.97 1.73 5 4.95 5 8.65s-2.03 6.92-5 8.65c1.47.85 3.18 1.35 5 1.35 5.52 0 10-4.48 10-10S15.52 2 10 2z"/></svg> Thème Clair'
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg> Thème Sombre';
        localStorage.setItem('theme', themeName);
    },

    toggleTheme() {
        const currentTheme = this.elements.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    refreshApp() {
        this.displayMessage('Réinitialisation de l\'application...', 'info');
        this.tariffData = [];
        this.availabilityData = [];
        this.staffData = [];
        this.roomTypes.clear();
        this.tariffPlans.clear();
        this.services.clear();
        this.fileLoaded = { tariffs: false, availability: false, staff: false };

        this.elements.reservationForm.reset();
        this.elements.singleDayInput.value = '';
        this.elements.staffDateInput.value = '';

        this.elements.tariffFileInput.value = '';
        this.elements.availabilityFileInput.value = '';
        this.elements.staffFileInput.value = '';
        this.elements.tariffFileStatus.textContent = '';
        this.elements.availabilityFileStatus.textContent = '';
        this.elements.staffFileStatus.textContent = '';

        this.elements.tariffResultsDiv.style.display = 'none';
        this.elements.dashboardDiv.innerHTML = '<p>Sélectionnez une date et chargez le fichier Disponibilités.</p>';
        this.elements.staffResultsDiv.innerHTML = '<p>Sélectionnez une date et chargez le fichier Personnel.</p>';

        this.fillSelectOptions(this.elements.roomTypeSelect, [], { placeholder: "Charger fichier tarifs" });
        this.fillSelectOptions(this.elements.tariffPlanSelect, [], { placeholder: "Choisir chambre d'abord" });
        this.fillSelectOptions(this.elements.serviceFilterSelect, [], { defaultOption: "Tous les services", placeholder: "Charger fichier personnel" });
        this.updateSelectStates();

        this.toggleDateInputs();
        this.clearMessages();
        this.displayMessage('Application réinitialisée.', 'success');
    },

    displayMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        this.elements.messageArea.appendChild(messageDiv);

        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (messageDiv.parentNode === this.elements.messageArea) {
                    this.elements.messageArea.removeChild(messageDiv);
                }
            }, 5000);
        }
    },

    clearMessages() {
        this.elements.messageArea.innerHTML = '';
    },

    handleFileLoad(event, type) {
        const file = event.target.files[0];
        if (!file) {
            this.displayMessage(`Aucun fichier sélectionné pour ${type}.`, 'error');
            return;
        }

        const statusElement = this.elements[`${type}FileStatus`];
        statusElement.textContent = 'Chargement...';
        this.displayMessage(`Chargement du fichier ${type}...`, 'info');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

                console.log(`Raw data for ${type}:`, jsonData); // Log pour déboguer
                this.processFileData(jsonData, type, file.name);
                statusElement.textContent = `Chargé: ${file.name}`;
                statusElement.style.color = 'var(--success-color)';
                this.displayMessage(`Fichier ${type} chargé avec succès.`, 'success');

            } catch (error) {
                console.error(`Error processing ${type} file:`, error);
                this.displayMessage(`Erreur lors de la lecture du fichier ${type}: ${error.message}`, 'error');
                statusElement.textContent = 'Erreur de chargement';
                statusElement.style.color = 'var(--alert-color)';
                event.target.value = '';
            }
        };
        reader.onerror = (error) => {
            console.error(`Error reading ${type} file:`, error);
            this.displayMessage(`Erreur lors de la lecture du fichier ${type}.`, 'error');
            statusElement.textContent = 'Erreur de lecture';
            statusElement.style.color = 'var(--alert-color)';
            event.target.value = '';
        };
        reader.readAsBinaryString(file);
    },

    processFileData(data, type, fileName) {
        if (!data || data.length < 2) {
            this.displayMessage(`Le fichier ${type} (${fileName}) semble vide ou incorrect.`, 'error');
            return;
        }

        if (type === 'tariffs') {
            this.tariffData = data;
            this.roomTypes.clear();
            this.tariffPlans.clear();
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length < 2) continue; // Ignorer les lignes vides ou incomplètes
                const roomType = row[0] ? String(row[0]).trim() : '';
                const tariffPlan = row[1] ? String(row[1]).trim() : '';
                if (roomType) this.roomTypes.add(roomType);
                if (tariffPlan) this.tariffPlans.add(tariffPlan);
            }
            console.log("Room Types:", Array.from(this.roomTypes));
            console.log("Tariff Plans:", Array.from(this.tariffPlans));
            this.fillSelectOptions(this.elements.roomTypeSelect, this.roomTypes, { placeholder: "Sélectionner type" });
            this.fillSelectOptions(this.elements.tariffPlanSelect, [], { placeholder: "Choisir chambre d'abord" });
            this.fileLoaded.tariffs = true;
        } else if (type === 'availability') {
            this.availabilityData = data;
            this.fileLoaded.availability = true;
            this.updateDashboard();
        } else if (type === 'staff') {
            this.staffData = data;
            this.services.clear();
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length < 2) continue;
                const service = row[1] ? String(row[1]).trim() : '';
                if (service) {
                    const normalizedService = service === 'FDC EXTRA' ? 'FEMME DE CHAMBRE' : service;
                    this.services.add(normalizedService);
                }
            }
            this.fillSelectOptions(this.elements.serviceFilterSelect, this.services, { defaultOption: "Tous les services" });
            this.fileLoaded.staff = true;
            this.updateStaffPlanning();
        }
        this.updateSelectStates();
    },

    updateSelectStates() {
        this.elements.roomTypeSelect.disabled = !this.fileLoaded.tariffs;
        this.elements.tariffPlanSelect.disabled = !this.fileLoaded.tariffs || !this.elements.roomTypeSelect.value;
        this.elements.serviceFilterSelect.disabled = !this.fileLoaded.staff;

        if (!this.fileLoaded.tariffs && this.elements.roomTypeSelect.options.length <= 1) {
            this.fillSelectOptions(this.elements.roomTypeSelect, [], { placeholder: "Charger fichier tarifs" });
        }
        if (!this.fileLoaded.staff && this.elements.serviceFilterSelect.options.length <= 1) {
            this.fillSelectOptions(this.elements.serviceFilterSelect, [], { defaultOption: "Tous les services", placeholder: "Charger fichier personnel" });
        }
    },

    reloadFile(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            const type = input.dataset.type;
            this.fileLoaded[type] = false;
            this.elements[`${type}FileStatus`].textContent = '';
            this.elements[`${type}FileStatus`].style.color = '';
            input.value = '';
            input.click();
            this.displayMessage(`Veuillez sélectionner le nouveau fichier pour ${type}.`, 'info');
            this.updateSelectStates();
        } else {
            console.error(`Input element with ID ${inputId} not found for reload.`);
        }
    },

    fillSelectOptions(selectElement, options, config = {}) {
        const { placeholder, defaultOption, keepDefault = false } = config;
        const currentValue = selectElement.value;

        if (!keepDefault) {
            selectElement.innerHTML = '';
        } else if (selectElement.options.length > 1) {
            while (selectElement.options.length > 1) {
                selectElement.remove(1);
            }
        }

        if (placeholder) {
            const phOption = document.createElement('option');
            phOption.value = "";
            phOption.textContent = placeholder;
            phOption.disabled = true;
            phOption.selected = true;
            selectElement.appendChild(phOption);
        } else if (defaultOption) {
            const defOption = document.createElement('option');
            defOption.value = "";
            defOption.textContent = defaultOption;
            if (!keepDefault) selectElement.appendChild(defOption);
        }

        const sortedOptions = Array.from(options).sort();
        sortedOptions.forEach(optionValue => {
            if (optionValue) {
                const optionElement = document.createElement('option');
                optionElement.value = optionValue;
                optionElement.textContent = optionValue;
                selectElement.appendChild(optionElement);
            }
        });

        if (keepDefault && currentValue) {
            selectElement.value = currentValue;
        } else if (!placeholder && !defaultOption && selectElement.options.length > 0) {
            selectElement.selectedIndex = 0;
        } else if (!placeholder && defaultOption) {
            selectElement.value = "";
        }

        selectElement.disabled = selectElement.options.length <= (placeholder || defaultOption ? 1 : 0);
    },

    filterTariffPlans() {
        const selectedRoomType = this.elements.roomTypeSelect.value;
        const filteredTariffPlans = new Set();

        if (selectedRoomType && this.tariffData.length > 1) {
            for (let i = 1; i < this.tariffData.length; i++) {
                const row = this.tariffData[i];
                if (!row || row.length < 2) continue;
                const roomType = row[0] ? String(row[0]).trim() : '';
                const tariffPlan = row[1] ? String(row[1]).trim() : '';
                if (roomType === selectedRoomType && tariffPlan) {
                    filteredTariffPlans.add(tariffPlan);
                }
            }
        }

        console.log(`Filtered Tariff Plans for ${selectedRoomType}:`, Array.from(filteredTariffPlans));
        const hasPlans = filteredTariffPlans.size > 0;
        this.fillSelectOptions(
            this.elements.tariffPlanSelect,
            filteredTariffPlans,
            { placeholder: hasPlans ? "Sélectionner plan" : "Aucun plan trouvé" }
        );
        this.elements.tariffPlanSelect.disabled = !hasPlans;
    },

    parseExcelDate(serialOrString) {
        if (typeof serialOrString === 'number') {
            const utc_days = Math.floor(serialOrString - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            return new Date(Date.UTC(date_info.getUTCFullYear(), date_info.getUTCMonth(), date_info.getUTCDate()));
        } else if (typeof serialOrString === 'string') {
            try {
                const d = new Date(serialOrString);
                if (!isNaN(d)) {
                    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                }
            } catch (e) { /* ignore parsing errors */ }
        } else if (serialOrString instanceof Date) {
            if (!isNaN(serialOrString)) {
                return new Date(Date.UTC(serialOrString.getFullYear(), serialOrString.getMonth(), serialOrString.getDate()));
            }
        }
        console.warn("Could not parse date:", serialOrString);
        return null;
    },

    formatDate(date) {
        if (!date || isNaN(date)) return "Date invalide";
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    },

    toggleDateInputs() {
        const mode = this.elements.dateSelectionMode.value;
        const isNightsMode = mode === 'nights';

        this.elements.nightsInput.style.display = isNightsMode ? 'block' : 'none';
        this.elements.numberOfNights.required = isNightsMode;

        this.elements.departureInput.style.display = !isNightsMode ? 'block' : 'none';
        this.elements.departureDate.required = !isNightsMode;
    },

    calculatePrice() {
        this.clearMessages();
        if (!this.fileLoaded.tariffs) {
            this.displayMessage("Veuillez d'abord charger le fichier des tarifs.", 'error');
            return;
        }

        const arrivalDateStr = this.elements.arrivalDate.value;
        const roomType = this.elements.roomTypeSelect.value;
        const tariffPlan = this.elements.tariffPlanSelect.value;
        const discount = parseFloat(this.elements.discountInput.value) || 0;
        const mode = this.elements.dateSelectionMode.value;

        if (!arrivalDateStr || !roomType || !tariffPlan) {
            this.displayMessage("Veuillez remplir la date d'arrivée, le type de chambre et le plan tarifaire.", 'error');
            return;
        }

        const arrivalDate = new Date(Date.UTC(
            parseInt(arrivalDateStr.substring(0, 4)),
            parseInt(arrivalDateStr.substring(5, 7)) - 1,
            parseInt(arrivalDateStr.substring(8, 10))
        ));
        if (isNaN(arrivalDate)) {
            this.displayMessage("Date d'arrivée invalide.", 'error');
            return;
        }
        console.log("Arrival Date:", this.formatDate(arrivalDate));

        let departureDate;
        let numberOfNights = 0;

        if (mode === 'nights') {
            numberOfNights = parseInt(this.elements.numberOfNights.value);
            if (!numberOfNights || numberOfNights < 1) {
                this.displayMessage("Le nombre de nuits doit être d'au moins 1.", 'error');
                return;
            }
            departureDate = new Date(arrivalDate);
            departureDate.setUTCDate(arrivalDate.getUTCDate() + numberOfNights);
            console.log("Departure Date (nights mode):", this.formatDate(departureDate));
        } else {
            const departureDateStr = this.elements.departureDate.value;
            if (!departureDateStr) {
                this.displayMessage("Veuillez sélectionner une date de départ.", 'error');
                return;
            }
            departureDate = new Date(Date.UTC(
                parseInt(departureDateStr.substring(0, 4)),
                parseInt(departureDateStr.substring(5, 7)) - 1,
                parseInt(departureDateStr.substring(8, 10))
            ));
            if (isNaN(departureDate)) {
                this.displayMessage("Date de départ invalide.", 'error');
                return;
            }
            if (arrivalDate >= departureDate) {
                this.displayMessage("La date de départ doit être postérieure à la date d'arrivée.", 'error');
                return;
            }
            numberOfNights = Math.round((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
            console.log("Departure Date (departure mode):", this.formatDate(departureDate));
        }

        let tariffRow = -1;
        for (let i = 1; i < this.tariffData.length; i++) {
            const row = this.tariffData[i];
            if (!row || row.length < 2) continue;
            const rowRoomType = row[0] ? String(row[0]).trim() : '';
            const rowTariffPlan = row[1] ? String(row[1]).trim() : '';
            if (rowRoomType === roomType && rowTariffPlan === tariffPlan) {
                tariffRow = i;
                break;
            }
        }

        if (tariffRow === -1) {
            this.displayMessage(`Combinaison chambre (${roomType}) / plan tarifaire (${tariffPlan}) non trouvée.`, 'error');
            return;
        }

        const prices = [];
        const dateHeaderRow = this.tariffData[0];
        console.log("Header Dates:", dateHeaderRow.slice(2).map(d => this.formatDate(this.parseExcelDate(d))));
        for (let j = 2; j < dateHeaderRow.length; j++) {
            const headerDate = this.parseExcelDate(dateHeaderRow[j]);
            if (!headerDate || isNaN(headerDate)) {
                console.warn(`Invalid date at column ${j}:`, dateHeaderRow[j]);
                continue;
            }

            console.log(`Comparing Header Date: ${this.formatDate(headerDate)}`);
            if (headerDate >= arrivalDate && headerDate < departureDate) {
                const priceValue = this.tariffData[tariffRow][j];
                const priceBeforeDiscount = (typeof priceValue === 'number' && !isNaN(priceValue)) ? Math.round(priceValue) : 0;
                if (priceBeforeDiscount === 0) {
                    console.warn(`Price is 0 or missing for ${roomType}/${tariffPlan} on ${this.formatDate(headerDate)}`);
                }
                const priceAfterDiscount = Math.round(priceBeforeDiscount * (1 - discount / 100));
                prices.push({
                    date: this.formatDate(headerDate),
                    priceBeforeDiscount,
                    priceAfterDiscount
                });
            }
        }

        console.log("Prices found:", prices);
        if (prices.length !== numberOfNights) {
            this.displayMessage(`Attention : Prix trouvés pour ${prices.length} nuit(s) sur les ${numberOfNights} demandées. Vérifiez la couverture des dates dans le fichier tarifs.`, 'info');
        }

        if (prices.length === 0) {
            this.displayMessage("Aucun prix trouvé pour les dates et la sélection spécifiées.", 'error');
            this.elements.tariffResultsDiv.style.display = 'none';
            return;
        }

        let totalPriceBeforeDiscount = 0;
        let totalPriceAfterDiscount = 0;
        prices.forEach(p => {
            totalPriceBeforeDiscount += p.priceBeforeDiscount;
            totalPriceAfterDiscount += p.priceAfterDiscount;
        });

        const discountAmount = Math.round(totalPriceBeforeDiscount - totalPriceAfterDiscount);
        const actualNights = prices.length;
        const averagePrice = actualNights > 0 ? Math.round(totalPriceAfterDiscount / actualNights) : 0;

        this.elements.priceTableBody.innerHTML = '';
        prices.forEach(price => {
            const row = this.elements.priceTableBody.insertRow();
            row.innerHTML = `<td>${price.date}</td><td>${price.priceBeforeDiscount} €</td><td>${price.priceAfterDiscount} €</td>`;
        });

        this.elements.totalPriceSpan.textContent = totalPriceBeforeDiscount;
        this.elements.discountAmountSpan.textContent = discountAmount;
        this.elements.totalAfterDiscountSpan.textContent = totalPriceAfterDiscount;
        this.elements.averagePriceSpan.textContent = averagePrice;

        this.elements.summaryTextP.textContent = `Le Prix Total d'une Chambre "${roomType}" du ${this.formatDate(arrivalDate)} au ${this.formatDate(departureDate)}, soit pour ${actualNights} nuitée(s) trouvée(s), est de ${totalPriceAfterDiscount} € (après une remise de ${discount}%).`;
        this.elements.tariffResultsDiv.style.display = 'block';
    },

    updateDashboard() {
        this.clearMessages();
        const selectedDateStr = this.elements.singleDayInput.value;

        if (!this.fileLoaded.availability) {
            this.elements.dashboardDiv.innerHTML = '<p>Chargez le fichier Disponibilités.</p>';
            return;
        }
        if (!selectedDateStr) {
            this.elements.dashboardDiv.innerHTML = '<p>Sélectionnez une date.</p>';
            return;
        }

        const selectedDate = new Date(Date.UTC(
            parseInt(selectedDateStr.substring(0, 4)),
            parseInt(selectedDateStr.substring(5, 7)) - 1,
            parseInt(selectedDateStr.substring(8, 10))
        ));
        if (isNaN(selectedDate)) {
            this.displayMessage("Date sélectionnée invalide.", "error");
            this.elements.dashboardDiv.innerHTML = '<p>Date sélectionnée invalide.</p>';
            return;
        }
        const dateStrFormatted = this.formatDate(selectedDate);

        const headerRow = this.availabilityData[0];
        let dateIndex = -1;
        for (let i = 1; i < headerRow.length; i++) {
            const headerDate = this.parseExcelDate(headerRow[i]);
            if (headerDate && !isNaN(headerDate) && headerDate.getTime() === selectedDate.getTime()) {
                dateIndex = i;
                break;
            }
        }

        if (dateIndex === -1) {
            this.elements.dashboardDiv.innerHTML = `<p>Aucune donnée de disponibilité trouvée pour le ${dateStrFormatted}.</p>`;
            return;
        }

        let totalAvailable = 0;
        let calculatedTotalCapacity = 0;
        let tableRowsHtml = '';

        for (let i = 1; i < this.availabilityData.length; i++) {
            const row = this.availabilityData[i];
            if (!row || row.length < 1) continue;
            const roomType = row[0]?.trim();
            if (!roomType) continue;

            const available = parseFloat(row[dateIndex]) || 0;
            totalAvailable += available;

            const capacityForType = this.ROOM_CAPACITY[roomType];
            if (capacityForType === undefined) {
                console.warn(`Capacité inconnue pour le type de chambre: "${roomType}". Elle ne sera pas comptée dans le total.`);
                tableRowsHtml += `<tr><td>${roomType}</td><td>${available}</td><td>Inconnu</td></tr>`;
            } else {
                const occupied = capacityForType - available;
                calculatedTotalCapacity += capacityForType;
                tableRowsHtml += `<tr><td>${roomType}</td><td>${available}</td><td>${occupied}</td></tr>`;
            }
        }

        const effectiveTotalRooms = calculatedTotalCapacity > 0 ? calculatedTotalCapacity : this.TOTAL_ROOMS;
        if (calculatedTotalCapacity > 0 && calculatedTotalCapacity !== this.TOTAL_ROOMS) {
            console.warn(`La capacité totale calculée (${calculatedTotalCapacity}) diffère de TOTAL_ROOMS (${this.TOTAL_ROOMS}). Utilisation de la valeur calculée.`);
        } else if (calculatedTotalCapacity === 0) {
            console.warn(`Impossible de calculer la capacité totale depuis les données. Utilisation de la constante TOTAL_ROOMS (${this.TOTAL_ROOMS}).`);
        }

        const totalOccupied = effectiveTotalRooms - totalAvailable;
        const occupancyRate = effectiveTotalRooms > 0 ? Math.round((totalOccupied / effectiveTotalRooms) * 100) : 0;

        let html = `<h3>Disponibilités le ${dateStrFormatted}</h3>`;
        html += `<p><strong>Il reste ${totalAvailable} chambres libres sur ${effectiveTotalRooms}. Taux d'occupation : ${occupancyRate}%.</strong></p>`;
        html += '<div class="table-container"><table><thead><tr><th>Type de chambre</th><th>Disponibles</th><th>Occupées</th></tr></thead><tbody>';
        html += tableRowsHtml;
        html += '</tbody></table></div>';

        this.elements.dashboardDiv.innerHTML = html;
    },

    updateStaffPlanning() {
        this.clearMessages();
        const selectedDateStr = this.elements.staffDateInput.value;
        const serviceFilter = this.elements.serviceFilterSelect.value;

        if (!this.fileLoaded.staff) {
            this.elements.staffResultsDiv.innerHTML = '<p>Chargez le fichier Personnel.</p>';
            return;
        }
        if (!selectedDateStr) {
            this.elements.staffResultsDiv.innerHTML = '<p>Sélectionnez une date.</p>';
            return;
        }

        const selectedDate = new Date(Date.UTC(
            parseInt(selectedDateStr.substring(0, 4)),
            parseInt(selectedDateStr.substring(5, 7)) - 1,
            parseInt(selectedDateStr.substring(8, 10))
        ));
        if (isNaN(selectedDate)) {
            this.displayMessage("Date sélectionnée invalide.", "error");
            this.elements.staffResultsDiv.innerHTML = '<p>Date sélectionnée invalide.</p>';
            return;
        }
        const dateStrFormatted = this.formatDate(selectedDate);

        const headerRow = this.staffData[0];
        let dateIndex = -1;
        for (let i = 2; i < headerRow.length; i++) {
            const headerDate = this.parseExcelDate(headerRow[i]);
            if (headerDate && !isNaN(headerDate) && headerDate.getTime() === selectedDate.getTime()) {
                dateIndex = i;
                break;
            }
        }

        if (dateIndex === -1) {
            this.elements.staffResultsDiv.innerHTML = `<p>Aucune donnée de planning trouvée pour le ${dateStrFormatted}.</p>`;
            return;
        }

        let allPresentStaff = [];
        let absentStaff = [];
        const staffCountByService = {};

        for (let i = 1; i < this.staffData.length; i++) {
            const row = this.staffData[i];
            if (!row || row.length < 2) continue;
            const name = row[0]?.trim();
            let service = row[1]?.trim();
            const status = row[dateIndex]?.toString().trim().toUpperCase() || '';

            if (!name || !service) continue;

            if (service === 'FDC EXTRA') {
                service = 'FEMME DE CHAMBRE';
            }

            if (!staffCountByService[service]) {
                staffCountByService[service] = 0;
            }

            if (status === 'P') {
                allPresentStaff.push({ name, service });
                staffCountByService[service]++;
            } else if (status) {
                let reason = 'Statut inconnu';
                switch (status) {
                    case 'R': reason = 'Repos'; break;
                    case 'CP': reason = 'Congé Payé'; break;
                    case 'AM': reason = 'Arrêt Maladie'; break;
                    default: reason = `Autre (${status})`; break;
                }
                absentStaff.push({ name, service, reason });
            }
        }

        let alerts = [];
        if ((staffCountByService["RECEPTION JOUR"] || 0) < 1) alerts.push("Alerte : Le poste de réceptionniste de jour n'est pas assuré.");
        if ((staffCountByService["RECEPTION NUIT"] || 0) < 1) alerts.push("Alerte : Le poste de réceptionniste de nuit n'est pas assuré.");
        if ((staffCountByService["GOUVERNANTE"] || 0) < 1) alerts.push("Info : La gouvernante n'est pas présente.");
        if ((staffCountByService["TECHNICIEN"] || 0) < 1) alerts.push("Info : Le technicien n'est pas présent.");
        if ((staffCountByService["FEMME DE CHAMBRE"] || 0) < 3) alerts.push("Alerte : Risque de sous-effectif pour les femmes de chambre (< 3).");

        let displayedPresentStaff = allPresentStaff;
        if (serviceFilter) {
            displayedPresentStaff = allPresentStaff.filter(employee => employee.service === serviceFilter);
        }

        displayedPresentStaff.sort((a, b) => {
            const indexA = this.SERVICE_ORDER.indexOf(a.service);
            const indexB = this.SERVICE_ORDER.indexOf(b.service);
            if (indexA !== -1 && indexB !== -1) {
                if (indexA !== indexB) return indexA - indexB;
            } else if (indexA !== -1) {
                return -1;
            } else if (indexB !== -1) {
                return 1;
            }
            if (a.service !== b.service) return a.service.localeCompare(b.service);
            return a.name.localeCompare(b.name);
        });

        const displayStaffCount = {};
        displayedPresentStaff.forEach(employee => {
            displayStaffCount[employee.service] = (displayStaffCount[employee.service] || 0) + 1;
        });

        let html = `<h3>Planning du ${dateStrFormatted}</h3>`;

        if (alerts.length > 0) {
            alerts.forEach(alertText => html += `<p class="alert">${alertText}</p>`);
        }

        const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        const dayName = dayNames[selectedDate.getUTCDay()];
        let summary = `${dayName} ${dateStrFormatted} : `;
        const staffSummaryParts = Object.entries(displayStaffCount)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([service, count]) => {
                const serviceName = service.toLowerCase().replace(/_/g, ' ');
                return `${count} ${serviceName}${count > 1 ? 's' : ''}`;
            });

        if (staffSummaryParts.length > 0) {
            summary += serviceFilter
                ? ` ${staffSummaryParts.join(", ")} du service "${serviceFilter}" seront présents.`
                : ` ${staffSummaryParts.join(", ")} seront présents.`;
        } else {
            summary += serviceFilter
                ? ` aucun employé du service "${serviceFilter}" n'est présent.`
                : " aucun employé n'est prévu comme présent.";
        }
        html += `<p>${summary}</p>`;

        html += '<h4>Employés Présents</h4>';
        if (displayedPresentStaff.length > 0) {
            html += '<div class="table-container"><table><thead><tr><th>Nom</th><th>Service</th></tr></thead><tbody>';
            displayedPresentStaff.forEach(employee => {
                html += `<tr><td>${employee.name}</td><td>${employee.service}</td></tr>`;
            });
            html += '</tbody></table></div>';
        } else {
            html += `<p>Aucun employé présent ${serviceFilter ? 'pour le service sélectionné' : ''}.</p>`;
        }

        if (!serviceFilter) {
            html += '<h4 style="margin-top: 20px;">Employés Absents / Autre Statut</h4>';
            if (absentStaff.length > 0) {
                absentStaff.sort((a, b) => a.name.localeCompare(b.name));
                html += '<div class="table-container"><table><thead><tr><th>Nom</th><th>Service</th><th>Raison / Statut</th></tr></thead><tbody>';
                absentStaff.forEach(employee => {
                    html += `<tr><td>${employee.name}</td><td>${employee.service}</td><td>${employee.reason}</td></tr>`;
                });
                html += '</tbody></table></div>';
            } else {
                html += '<p>Aucun employé enregistré comme absent ou avec un autre statut.</p>';
            }
        }

        this.elements.staffResultsDiv.innerHTML = html;
    },
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});