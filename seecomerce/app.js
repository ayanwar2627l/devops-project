// ==========================================
// SeeCommerce - DevOps Storefront Engine
// ==========================================

// Shopping Cart State
let cart = [];
let serverProducts = [];
let currentUser = null;

// DOM Elements
const productsGrid = document.getElementById("products-catalog-grid");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartCount = document.getElementById("cart-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const sqlSizeSim = document.getElementById("sql-size-sim");
const btnClearCart = document.getElementById("btn-clear-cart");
const btnCheckout = document.getElementById("btn-checkout");
const dbLogsConsole = document.getElementById("db-logs-console");
const latencyVal = document.getElementById("latency-val");

// Authentication DOM Elements
const authBtn = document.getElementById("auth-btn");
const authLabel = document.getElementById("auth-label");
const loginModal = document.getElementById("login-modal-overlay");
const btnCloseLogin = document.getElementById("btn-close-login");
const loginForm = document.getElementById("login-form-submit");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");

// Telemetry Drawer DOM Elements
const devopsDrawer = document.getElementById("devops-drawer");
const btnToggleTelemetry = document.getElementById("btn-toggle-telemetry");
const btnCloseTelemetry = document.getElementById("btn-close-telemetry");
const btnOpenTelemetryHero = document.getElementById("btn-open-telemetry-hero");

// Navbar Cart Button Scroll Trigger
const cartBtn = document.getElementById("cart-btn");
if (cartBtn) {
    cartBtn.addEventListener("click", () => {
        const cartPanel = document.getElementById("cart-panel");
        if (cartPanel) {
            cartPanel.scrollIntoView({ behavior: "smooth", block: "center" });
            // Apply temporary glowing visual alert
            cartPanel.style.boxShadow = "0 0 35px rgba(99, 102, 241, 0.7)";
            cartPanel.style.borderColor = "var(--primary)";
            setTimeout(() => {
                cartPanel.style.boxShadow = "";
                cartPanel.style.borderColor = "";
            }, 1500);
        }
    });
}

// Jenkins Pipeline DOM Elements
const btnTriggerJenkins = document.getElementById("btn-trigger-jenkins");
const pipelineFill = document.getElementById("pipeline-fill");
const stages = {
    checkout: document.getElementById("stage-checkout"),
    build: document.getElementById("stage-build"),
    test: document.getElementById("stage-test"),
    deploy: document.getElementById("stage-deploy")
};

// ==========================================
// TELEMETRY DRAWER TOGGLES
// ==========================================
if (btnToggleTelemetry) {
    btnToggleTelemetry.addEventListener("click", () => {
        devopsDrawer.classList.add("open");
    });
}

if (btnOpenTelemetryHero) {
    btnOpenTelemetryHero.addEventListener("click", () => {
        devopsDrawer.classList.add("open");
    });
}

if (btnCloseTelemetry) {
    btnCloseTelemetry.addEventListener("click", () => {
        devopsDrawer.classList.remove("open");
    });
}

if (devopsDrawer) {
    devopsDrawer.addEventListener("click", (e) => {
        if (e.target === devopsDrawer) {
            devopsDrawer.classList.remove("open");
        }
    });
}

// ==========================================
// LOAD CATALOG FROM API
// ==========================================
async function loadProducts() {
    try {
        const start = Date.now();
        const res = await fetch('/api/products');
        const data = await res.json();
        const queryLatency = Date.now() - start;

        latencyVal.textContent = `${data.latency || queryLatency}ms`;
        if (data.cache === 'HIT') {
            latencyVal.style.color = "var(--success)";
        } else {
            latencyVal.style.color = "var(--warning)";
        }

        if (data.success) {
            serverProducts = data.products;
            renderProducts(serverProducts);
            
            // Print actual Postgres and Redis server queries to the telemetry drawer
            if (data.logs && data.logs.length > 0) {
                data.logs.forEach(log => {
                    if (log.includes('REDIS')) {
                        logConsole('redis', log.replace('[REDIS] ', ''));
                    } else if (log.includes('POSTGRES')) {
                        logConsole('postgres', log.replace('[POSTGRES] ', ''));
                    } else {
                        logConsole('system', log);
                    }
                });
            }
        } else {
            logConsole('system', `Error fetching products: ${data.error}`);
        }
    } catch (err) {
        logConsole('system', `Error contacting backend API server: ${err.message}`);
    }
}

// Render Products catalog
function renderProducts(productsList) {
    if (!productsList || productsList.length === 0) {
        productsGrid.innerHTML = `<p class="empty-msg">No products loaded in database.</p>`;
        return;
    }
    
    productsGrid.innerHTML = productsList.map(prod => `
        <div class="product-card">
            <div class="product-icon">
                <i class="${prod.icon || 'fa-solid fa-box'}"></i>
            </div>
            <div class="product-info">
                <h4>${prod.name}</h4>
                <p>${prod.description}</p>
                <div style="font-size: 11px; color: var(--text-dim); margin-top: -8px; margin-bottom: 8px;">
                    Stock Left: <strong style="color: ${prod.stock_quantity > 10 ? 'var(--success)' : 'var(--warning)'}">${prod.stock_quantity}</strong>
                </div>
            </div>
            <div class="product-footer">
                <span class="product-price">$${prod.price.toFixed(2)}</span>
                <button class="btn-add-cart" onclick="addToCart(${prod.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Add Item to Cart
window.addToCart = function(productId) {
    const product = serverProducts.find(p => p.id === productId);
    if (!product) return;

    if (product.stock_quantity <= 0) {
        alert(`Sorry, ${product.name} is out of stock!`);
        return;
    }

    const existing = cart.find(item => item.product.id === productId);

    if (existing) {
        if (existing.quantity >= product.stock_quantity) {
            alert(`Cannot add more. Only ${product.stock_quantity} units available in stock!`);
            return;
        }
        existing.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }

    updateCart();
    logConsole("system", `Cart updated: added ${product.name}.`);
};

// Update Cart UI
function updateCart() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    cartCount.textContent = totalCount;
    cartSubtotal.textContent = `$${totalAmount.toFixed(2)}`;

    // Customize checkout button style and label based on session auth
    if (!currentUser) {
        btnCheckout.innerHTML = '<i class="fa-solid fa-lock"></i> Please Sign In to Buy';
        btnCheckout.style.background = 'linear-gradient(135deg, var(--text-dim), #161e2e)';
        btnCheckout.style.border = '1px solid rgba(255,255,255,0.03)';
    } else {
        btnCheckout.innerHTML = '<i class="fa-solid fa-circle-check"></i> Commit Buy Transaction';
        btnCheckout.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        btnCheckout.style.border = 'none';
    }

    // Estimate SQL query size (mock byte length calculation)
    const sqlBytes = totalCount > 0 ? (120 + (cart.length * 85)) : 0;
    sqlSizeSim.textContent = `${sqlBytes} bytes`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-msg">Your shopping cart is empty.</p>`;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item-row">
                <span class="item-name">${item.product.name}</span>
                <span class="item-pricing">
                    <span class="item-qty">x${item.quantity}</span>
                    <span class="item-price">$${(item.product.price * item.quantity).toFixed(2)}</span>
                </span>
            </div>
        `).join('');
    }
}

// Clear Cart
btnClearCart.addEventListener("click", () => {
    cart = [];
    updateCart();
    logConsole("system", "Shopping cart cleared by user.");
});

// ==========================================
// SESSION AUTHENTICATION
// ==========================================

// Sign In / Sign Out click
authBtn.addEventListener("click", () => {
    if (currentUser) {
        // Logout
        currentUser = null;
        authBtn.classList.remove("user-active");
        authLabel.textContent = "Sign In";
        cart = [];
        updateCart();
        logConsole("system", "User session terminated. Logged out safely.");
        alert("Logged out successfully. Cart and session cleared.");
    } else {
        loginModal.classList.add("open");
    }
});

btnCloseLogin.addEventListener("click", () => {
    loginModal.classList.remove("open");
});

loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove("open");
    }
});

// Handle Login Form Submission (Connects to API)
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            authBtn.classList.add("user-active");
            authLabel.textContent = `Sign Out (${email})`;
            loginModal.classList.remove("open");
            
            // Print backend queries to telemetry drawer
            if (data.logs) {
                data.logs.forEach(log => {
                    if (log.includes('POSTGRES')) {
                        logConsole('postgres', log.replace('[POSTGRES] ', ''));
                    } else {
                        logConsole('system', log);
                    }
                });
            }

            updateCart();
            alert(`Welcome back, ${currentUser.name}!\nYou have been authenticated against the Postgres user table.`);
        } else {
            alert(`Authentication failed: ${data.error}`);
            logConsole('system', `Authentication failure for email '${email}': ${data.error}`);
        }
    } catch (err) {
        alert('Could not contact authenticator gateway: ' + err.message);
    }
});

// ==========================================
// COMMIT REAL BUY TRANSACTION
// ==========================================
btnCheckout.addEventListener("click", async () => {
    if (!currentUser) {
        logConsole("system", "WARNING: Checkout blocked. Reason: Unauthorized anonymous user session.");
        alert("🔒 Authentication Required!\nPlease sign in using the 'Sign In' button at the top navbar before checking out.");
        loginModal.classList.add("open");
        return;
    }

    if (cart.length === 0) {
        alert("Please add items to your shopping cart first!");
        return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    logConsole("system", `Sending order transaction payload for customer ${currentUser.email}...`);

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: currentUser.email,
                items: cart,
                totalAmount: totalAmount
            })
        });
        const data = await response.json();

        if (data.success) {
            // Print real SQL transaction statements and caching actions to logs drawer
            if (data.logs) {
                data.logs.forEach(log => {
                    if (log.includes('POSTGRES')) {
                        logConsole('postgres', log.replace('[POSTGRES] ', ''));
                    } else if (log.includes('REDIS')) {
                        logConsole('redis', log.replace('[REDIS] ', ''));
                    } else {
                        logConsole('system', log);
                    }
                });
            }

            alert(`🎉 Order Committed Successfully!\nTransaction ID: #${data.orderId}\nAmount charged: $${totalAmount.toFixed(2)}\n\nOpen the DevOps Telemetry drawer to inspect the real SQL transaction and Cache Eviction!`);
            
            // Clear cart
            cart = [];
            updateCart();
            
            // Reload catalog from database to fetch updated stock sizes!
            await loadProducts();
        } else {
            alert(`Transaction failed: ${data.error}`);
            logConsole('system', `Transaction execution error: ${data.error}`);
        }
    } catch (err) {
        alert('Error connecting to checkout gateway: ' + err.message);
    }
});

// Helper for writing logs
function logConsole(type, message) {
    const line = document.createElement("div");
    line.className = `log-line text-${type}`;
    line.textContent = `[${type.toUpperCase()}] ${message}`;
    dbLogsConsole.appendChild(line);
    
    // Auto-scroll logs
    dbLogsConsole.scrollTop = dbLogsConsole.scrollHeight;
}

// ==========================================
// JENKINS DECLARATIVE CI/CD SIMULATOR
// ==========================================
let isPipelineRunning = false;

btnTriggerJenkins.addEventListener("click", () => {
    if (isPipelineRunning) return;
    isPipelineRunning = true;
    btnTriggerJenkins.disabled = true;
    btnTriggerJenkins.style.opacity = "0.5";

    // Reset pipeline UI states
    pipelineFill.style.height = "0%";
    Object.keys(stages).forEach(key => {
        stages[key].className = "jenkins-stage-step";
        stages[key].querySelector(".stage-status-text").textContent = "Pending";
    });

    logConsole("jenkins", "Jenkins controller detected push request on branch: 'main'");
    logConsole("jenkins", "Pipeline agent allocated. Launching SeeCommerce pipeline...");

    // Stage 1: Checkout & Lint
    setTimeout(() => {
        setStageState("checkout", "active", "Running");
        logConsole("jenkins", "Stage 1: Cloning git repository: 'https://github.com/seecommerce/sandbox.git'...");
        logConsole("jenkins", "Checking code quality parameters...");
        logConsole("jenkins", "Linting configuration: package.json structures verified - PASS.");

        setTimeout(() => {
            setStageState("checkout", "success", "Completed");
            pipelineFill.style.height = "25%";

            // Stage 2: Build Custom Dockerfile
            setTimeout(() => {
                setStageState("build", "active", "Running");
                logConsole("jenkins", "Stage 2: Building image from local Dockerfile [seecomerce/Dockerfile]...");
                logConsole("jenkins", "Sending build context to Docker daemon... 12.5MB");
                logConsole("jenkins", "Step 1/4 : FROM alpine:3.18 AS preparer -- OK");
                logConsole("jenkins", "Step 2/4 : RUN echo \"Running static asset audit...\" && grep -q -i \"seecomerce\" index.html -- PASS");
                logConsole("jenkins", "Step 3/4 : FROM nginx:alpine-slim -- OK");
                logConsole("jenkins", "Step 4/4 : COPY --from=preparer /app/index.html ./ -- OK");
                logConsole("jenkins", "Successfully tagged image: 'seecommerce-web:latest'");

                setTimeout(() => {
                    setStageState("build", "success", "Completed");
                    pipelineFill.style.height = "50%";

                    // Stage 3: Integration Tests
                    setTimeout(() => {
                        setStageState("test", "active", "Running");
                        logConsole("jenkins", "Stage 3: Launching dry-run integration containers...");
                        logConsole("jenkins", "Verifying service linkages between 'seecommerce-web' and Docker Hub images 'postgres-db' and 'redis-cache'...");
                        logConsole("jenkins", "Running HTTP endpoint response tests... (HTTP GET /index.html: 200 OK) - PASS");
                        logConsole("jenkins", "Verifying database connection checks... postgres - PASS; redis - PASS");

                        setTimeout(() => {
                            setStageState("test", "success", "Completed");
                            pipelineFill.style.height = "75%";

                            // Stage 4: Docker Compose Up
                            setTimeout(() => {
                                setStageState("deploy", "active", "Running");
                                logConsole("jenkins", "Stage 4: Executing final deployment orchestrations...");
                                logConsole("jenkins", "Running command: 'docker compose up -d --force-recreate'...");
                                logConsole("jenkins", "Container 'seecommerce_redis' - Recreated & healthy");
                                logConsole("jenkins", "Container 'seecommerce_postgres' - Recreated & healthy");
                                logConsole("jenkins", "Container 'seecommerce_web' - Recreated & healthy on http://localhost:8085");
                                logConsole("jenkins", "Pipeline successfully executed! All stages completed.");

                                setTimeout(() => {
                                    setStageState("deploy", "success", "Completed");
                                    pipelineFill.style.height = "100%";
                                    logConsole("success", "DEPLOYMENT SUCCESSFUL - Stacks verified healthy!");
                                    
                                    isPipelineRunning = false;
                                    btnTriggerJenkins.disabled = false;
                                    btnTriggerJenkins.style.opacity = "1";
                                }, 800);

                            }, 1200);

                        }, 1200);

                    }, 1200);

                }, 1500);

            }, 1200);

        }, 1200);

    }, 800);
});

function setStageState(stageKey, stateClass, statusText) {
    const stage = stages[stageKey];
    stage.className = `jenkins-stage-step ${stateClass}`;
    stage.querySelector(".stage-status-text").textContent = statusText;
}

// Initialise Catalog & load API on startup
loadProducts();
updateCart();
