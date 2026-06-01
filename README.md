# DevOps Container Sandbox & Academy 🐳🚀

Welcome to the **Devops Container Sandbox & Academy**! This repository is designed to take you from a absolute beginner to an advanced practitioner of container infrastructure in DevOps.

Rather than just reading slides, you will explore these concepts through a **multi-service project**, **interactive visualizers**, **local host scripts**, and **practical lab challenges** with an automated validator.

---

## 🛠️ What is Included in this Sandbox?

```
Devops project/
├── README.md                   # You are here! Startup guide and overview
├── docker-compose.yml          # Connects Frontend, Backend, and Redis in a multi-container stack
├── frontend/                   # Premium Interactive Visual Academy UI
│   ├── index.html              # Glassmorphic visual structure
│   ├── styles.css              # Custom animations and dark-mode styling
│   └── app.js                  # Simulation logic (Namespaces, cgroups, Layer visualizer)
│
├── backend/                    # Node.js backend providing live container metrics
│   ├── index.js                # Core API with cgroups RAM-stress test tools
│   └── Dockerfile              # Multi-stage optimized Node.js build configuration
│
├── scripts/                    # Native scripts to inspect container engine internals
│   ├── inspect_namespaces.ps1  # Windows & WSL container process namespace auditor
│   └── trigger_cgroup_stress.sh# Memory-stress script to trigger cgroup limits
│
└── labs/                       # Hands-on exercises
    ├── lab1_dockerfile/        # Build & optimize standard Node/Alpine images
    ├── lab2_networking/        # Establish manual service-to-service networks
    ├── lab3_volumes/           # Configure persistent host mounts and named volumes
    └── validate_labs.js        # Automated test-runner to check your solutions
```

---

## 🧭 The Learning Roadmap

The academy is divided into 5 Core Learning Modules, all visualized beautifully inside the interactive dashboard:

1. **Origins & Evolution**: Chroot jail, BSD Jails, Solaris Zones, LXC (LinuX Containers), and the DevOps container revolution.
2. **Process Isolation & Namespaces**: Deep dive into the 6 standard Linux namespaces (`PID`, `NET`, `MNT`, `IPC`, `UTS`, `USER`) that create the illusion of a dedicated OS.
3. **Resource Limits with Control Groups (cgroups)**: Witnessing how the kernel restricts CPU, Memory, and Disk I/O, preventing a single container from crashing the host machine (OOM-killer).
4. **Images, Layers & Filesystems**: Demystifying UnionFS, Layer Caching, Copy-on-Write (CoW), and standard storage drivers like `overlay2`.
5. **Docker Architecture & Ecosystem**: Demystifying CLI-to-Daemon (`dockerd`) REST APIs, container standard interfaces (`containerd` & `runc`), custom container networks, and volumes.

---

## ⚡ How to Spin up the Academy & Sandbox

### Method 1: The Containerized Stack (Recommended)
If you have **Docker** and **Docker Compose** installed:
1. Open terminal in this folder.
2. Run:
   ```bash
   docker compose up --build
   ```
3. Open your browser and navigate to: [http://localhost:8080](http://localhost:8080)
4. Use the interface to trigger RAM-stress limits and inspect network layouts in real time!

### Method 2: Local Static View
If you don't have Docker installed yet, you can still access the complete interactive learning portal:
1. Double-click [frontend/index.html](file:///c:/Users/aryan/Desktop/SEMESTERS/ASEM-6/Devops%20project/frontend/index.html) to open the interactive UI directly in your browser.
2. Go through the theory and interactive layer / namespace visual simulators.
3. Follow the CLI scripts in the `scripts/` and `labs/` folders to execute Docker commands on your local command line!

---

## 🏆 The Lab Exercises

Once you have read the theory inside the Academy, head into the `labs/` folder.
To test your solutions at any time, run:
```bash
node labs/validate_labs.js
```
*(Requires Node.js installed on your host machine to run the test script).*
