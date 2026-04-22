(function () {
    const STORAGE_KEY = "zapassina_driver_settings";
    const DEFAULT_SETTINGS = {
        mercadoPagoConnected: false,
        mercadoPagoAccount: "",
        whatsappNumbers: [
            { label: "Bot Principal", number: "+55 11 99999-0101" }
        ],
        pricingMode: "monthly",
        pricePerKm: "3,50",
        pricePerRoute: "18,00",
        monthlyPrice: "420,00"
    };

    function loadSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
        } catch (error) {
            return { ...DEFAULT_SETTINGS };
        }
    }

    function saveSettings(settings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function injectModal() {
        if (document.getElementById("zapassina-settings-modal")) return;

        document.body.insertAdjacentHTML("beforeend", `
            <div id="zapassina-settings-modal" class="hidden fixed inset-0 z-[100]">
                <div data-settings-close class="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
                <section class="absolute inset-x-4 top-6 mx-auto max-w-4xl max-h-[calc(100vh-48px)] overflow-y-auto bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl shadow-2xl">
                    <header class="sticky top-0 bg-surface-container-lowest border-b border-outline-variant p-md flex items-start justify-between gap-md z-10">
                        <div>
                            <div class="flex items-center gap-sm text-primary">
                                <span class="material-symbols-outlined">settings</span>
                                <h2 class="font-headline-md text-headline-md">Configurações</h2>
                            </div>
                            <p class="font-body-dense text-body-dense text-outline mt-xs">Conecte pagamentos, números do bot e regras de cobrança da van.</p>
                        </div>
                        <button data-settings-close class="w-10 h-10 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </header>

                    <div class="p-md grid grid-cols-1 lg:grid-cols-2 gap-md">
                        <section class="bg-surface border border-outline-variant rounded-xl p-md space-y-md">
                            <div class="flex items-start justify-between gap-md">
                                <div>
                                    <div class="flex items-center gap-sm text-primary">
                                        <span class="material-symbols-outlined">account_balance_wallet</span>
                                        <h3 class="font-title-sm text-title-sm">Mercado Pago</h3>
                                    </div>
                                    <p class="font-body-dense text-body-dense text-outline mt-xs">Conta que receberá PIX, boleto e cartão.</p>
                                </div>
                                <span id="mp-status" class="px-3 py-1 rounded-lg font-label-caps text-label-caps border"></span>
                            </div>
                            <label class="block">
                                <span class="font-label-caps text-label-caps text-outline uppercase">E-mail ou ID da conta</span>
                                <input id="mp-account-input" class="mt-xs w-full rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-dense text-body-dense" placeholder="motorista@email.com"/>
                            </label>
                            <button id="mp-connect-button" class="w-full bg-primary text-on-primary rounded-lg py-3 px-md font-title-sm text-title-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-sm">
                                <span class="material-symbols-outlined">link</span>
                                Conectar Mercado Pago
                            </button>
                        </section>

                        <section class="bg-surface border border-outline-variant rounded-xl p-md space-y-md">
                            <div>
                                <div class="flex items-center gap-sm text-primary">
                                    <span class="material-symbols-outlined">smart_toy</span>
                                    <h3 class="font-title-sm text-title-sm">Números de WhatsApp do Bot</h3>
                                </div>
                                <p class="font-body-dense text-body-dense text-outline mt-xs">Adicione instâncias para cobrança, confirmações e avisos aos pais.</p>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr_auto] gap-sm">
                                <input id="wa-label-input" class="rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-dense text-body-dense" placeholder="Nome do número"/>
                                <input id="wa-number-input" class="rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-dense text-body-dense" placeholder="+55 11 99999-9999"/>
                                <button id="wa-add-button" class="bg-primary-container text-on-primary-container rounded-lg px-md py-2 font-body-dense text-body-dense hover:brightness-110 transition-colors flex items-center justify-center gap-xs">
                                    <span class="material-symbols-outlined text-[18px]">add</span>
                                    Adicionar
                                </button>
                            </div>
                            <div id="wa-number-list" class="space-y-sm"></div>
                        </section>

                        <section class="lg:col-span-2 bg-surface border border-outline-variant rounded-xl p-md space-y-md">
                            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-md">
                                <div>
                                    <div class="flex items-center gap-sm text-primary">
                                        <span class="material-symbols-outlined">payments</span>
                                        <h3 class="font-title-sm text-title-sm">Valores de Cobrança</h3>
                                    </div>
                                    <p class="font-body-dense text-body-dense text-outline mt-xs">Escolha se a van cobrará por quilômetro, por rota ou por valor fixo mensal.</p>
                                </div>
                                <div class="grid grid-cols-3 gap-xs bg-surface-container-lowest border border-outline-variant rounded-lg p-xs">
                                    <button data-pricing-mode="km" class="pricing-mode-button rounded px-3 py-2 font-body-dense text-[12px]">Por Km</button>
                                    <button data-pricing-mode="route" class="pricing-mode-button rounded px-3 py-2 font-body-dense text-[12px]">Por rota</button>
                                    <button data-pricing-mode="monthly" class="pricing-mode-button rounded px-3 py-2 font-body-dense text-[12px]">Mensal</button>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                                <label class="block">
                                    <span class="font-label-caps text-label-caps text-outline uppercase">Valor por Km</span>
                                    <div class="mt-xs flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-container-lowest px-sm">
                                        <span class="font-body-dense text-body-dense text-outline">R$</span>
                                        <input id="price-km-input" class="w-full border-0 bg-transparent text-on-surface font-body-dense text-body-dense focus:ring-0" placeholder="3,50"/>
                                    </div>
                                </label>
                                <label class="block">
                                    <span class="font-label-caps text-label-caps text-outline uppercase">Valor por Rota</span>
                                    <div class="mt-xs flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-container-lowest px-sm">
                                        <span class="font-body-dense text-body-dense text-outline">R$</span>
                                        <input id="price-route-input" class="w-full border-0 bg-transparent text-on-surface font-body-dense text-body-dense focus:ring-0" placeholder="18,00"/>
                                    </div>
                                </label>
                                <label class="block">
                                    <span class="font-label-caps text-label-caps text-outline uppercase">Valor Fixo Mensal</span>
                                    <div class="mt-xs flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-container-lowest px-sm">
                                        <span class="font-body-dense text-body-dense text-outline">R$</span>
                                        <input id="price-monthly-input" class="w-full border-0 bg-transparent text-on-surface font-body-dense text-body-dense focus:ring-0" placeholder="420,00"/>
                                    </div>
                                </label>
                            </div>
                            <div id="pricing-preview" class="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-dense text-body-dense text-on-surface"></div>
                        </section>
                    </div>

                    <footer class="sticky bottom-0 bg-surface-container-lowest border-t border-outline-variant p-md flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
                        <p id="settings-save-status" class="font-body-dense text-body-dense text-outline">As configurações ficam salvas neste navegador.</p>
                        <button id="settings-save-button" class="bg-primary text-on-primary rounded-lg px-lg py-3 font-title-sm text-title-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-sm">
                            <span class="material-symbols-outlined">save</span>
                            Salvar Configurações
                        </button>
                    </footer>
                </section>
            </div>
        `);
    }

    function setPricingMode(settings, mode) {
        settings.pricingMode = mode;
        document.querySelectorAll(".pricing-mode-button").forEach((button) => {
            const isActive = button.dataset.pricingMode === mode;
            button.classList.toggle("bg-primary", isActive);
            button.classList.toggle("text-on-primary", isActive);
            button.classList.toggle("text-on-surface", !isActive);
        });
        updatePricingPreview(settings);
    }

    function updatePricingPreview(settings) {
        const preview = document.getElementById("pricing-preview");
        if (!preview) return;

        const messages = {
            km: `Modo ativo: cobrança por quilômetro. Valor configurado: R$ ${settings.pricePerKm} por km rodado.`,
            route: `Modo ativo: cobrança por rota. Valor configurado: R$ ${settings.pricePerRoute} por viagem confirmada.`,
            monthly: `Modo ativo: mensalidade fixa. Valor configurado: R$ ${settings.monthlyPrice} por aluno/mês.`
        };
        preview.textContent = messages[settings.pricingMode];
    }

    function renderMercadoPago(settings) {
        const status = document.getElementById("mp-status");
        const input = document.getElementById("mp-account-input");
        const button = document.getElementById("mp-connect-button");
        if (!status || !input || !button) return;

        input.value = settings.mercadoPagoAccount || "";
        status.textContent = settings.mercadoPagoConnected ? "Conectado" : "Pendente";
        status.className = settings.mercadoPagoConnected
            ? "px-3 py-1 rounded-lg font-label-caps text-label-caps border bg-primary-container text-on-primary-container border-primary-container"
            : "px-3 py-1 rounded-lg font-label-caps text-label-caps border bg-surface-container-lowest text-outline border-outline-variant";
        button.innerHTML = settings.mercadoPagoConnected
            ? '<span class="material-symbols-outlined">verified</span> Mercado Pago conectado'
            : '<span class="material-symbols-outlined">link</span> Conectar Mercado Pago';
    }

    function renderWhatsappNumbers(settings) {
        const list = document.getElementById("wa-number-list");
        if (!list) return;

        if (!settings.whatsappNumbers.length) {
            list.innerHTML = '<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-dense text-body-dense text-outline">Nenhum número adicionado ainda.</div>';
            return;
        }

        list.innerHTML = settings.whatsappNumbers.map((item, index) => `
            <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm flex items-center justify-between gap-sm">
                <div>
                    <p class="font-body-dense text-body-dense font-medium text-on-surface">${escapeHtml(item.label)}</p>
                    <p class="font-numeric-data text-numeric-data text-outline mt-xs">${escapeHtml(item.number)}</p>
                </div>
                <button data-remove-wa="${index}" class="w-9 h-9 rounded-lg border border-outline-variant text-error hover:bg-error-container transition-colors flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
        `).join("");
    }

    function fillForm(settings) {
        renderMercadoPago(settings);
        renderWhatsappNumbers(settings);
        document.getElementById("price-km-input").value = settings.pricePerKm;
        document.getElementById("price-route-input").value = settings.pricePerRoute;
        document.getElementById("price-monthly-input").value = settings.monthlyPrice;
        setPricingMode(settings, settings.pricingMode);
    }

    function readForm(settings) {
        settings.mercadoPagoAccount = document.getElementById("mp-account-input").value.trim();
        settings.pricePerKm = document.getElementById("price-km-input").value.trim() || DEFAULT_SETTINGS.pricePerKm;
        settings.pricePerRoute = document.getElementById("price-route-input").value.trim() || DEFAULT_SETTINGS.pricePerRoute;
        settings.monthlyPrice = document.getElementById("price-monthly-input").value.trim() || DEFAULT_SETTINGS.monthlyPrice;
        return settings;
    }

    function openModal(settings) {
        fillForm(settings);
        document.getElementById("zapassina-settings-modal").classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
    }

    function closeModal() {
        const modal = document.getElementById("zapassina-settings-modal");
        if (modal) modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
    }

    document.addEventListener("DOMContentLoaded", () => {
        injectModal();
        const settings = loadSettings();

        document.querySelectorAll("a, button").forEach((trigger) => {
            if (trigger.closest("#zapassina-settings-modal")) return;
            if (trigger.textContent && trigger.textContent.trim().includes("Configurações")) {
                trigger.addEventListener("click", (event) => {
                    event.preventDefault();
                    openModal(settings);
                });
            }
        });

        document.querySelectorAll("[data-settings-close]").forEach((closeButton) => {
            closeButton.addEventListener("click", closeModal);
        });

        document.getElementById("mp-connect-button").addEventListener("click", () => {
            settings.mercadoPagoAccount = document.getElementById("mp-account-input").value.trim();
            settings.mercadoPagoConnected = true;
            saveSettings(readForm(settings));
            renderMercadoPago(settings);
            document.getElementById("settings-save-status").textContent = "Mercado Pago conectado ao perfil do motorista.";
        });

        document.getElementById("wa-add-button").addEventListener("click", () => {
            const labelInput = document.getElementById("wa-label-input");
            const numberInput = document.getElementById("wa-number-input");
            const label = labelInput.value.trim() || "Novo Bot";
            const number = numberInput.value.trim();
            if (!number) return;

            settings.whatsappNumbers.push({ label, number });
            labelInput.value = "";
            numberInput.value = "";
            saveSettings(readForm(settings));
            renderWhatsappNumbers(settings);
        });

        document.getElementById("wa-number-list").addEventListener("click", (event) => {
            const removeButton = event.target.closest("[data-remove-wa]");
            if (!removeButton) return;

            settings.whatsappNumbers.splice(Number(removeButton.dataset.removeWa), 1);
            saveSettings(readForm(settings));
            renderWhatsappNumbers(settings);
        });

        document.querySelectorAll(".pricing-mode-button").forEach((button) => {
            button.addEventListener("click", () => {
                readForm(settings);
                setPricingMode(settings, button.dataset.pricingMode);
                saveSettings(settings);
            });
        });

        ["price-km-input", "price-route-input", "price-monthly-input"].forEach((id) => {
            document.getElementById(id).addEventListener("input", () => {
                readForm(settings);
                updatePricingPreview(settings);
            });
        });

        document.getElementById("settings-save-button").addEventListener("click", () => {
            saveSettings(readForm(settings));
            document.getElementById("settings-save-status").textContent = "Configurações salvas com sucesso.";
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeModal();
        });
    });
})();
