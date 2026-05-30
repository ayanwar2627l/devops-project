# ==============================================================================
# run-jenkins.ps1 - SeeCommerce DevOps Automation Script
# ==============================================================================
# Helper script to launch local Jenkins container linked to your Docker Desktop daemon.
# ==============================================================================

Write-Host "" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       SeeCommerce Jenkins Local Infrastructure Spinner   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Docker daemon is running
Write-Host "[1/3] Verifying Docker Desktop connectivity..." -ForegroundColor Gray
$dockerCheck = ""
try {
    $dockerCheck = docker info --format '{{.Name}}' 2>$null
} catch {
    $dockerCheck = ""
}

if ([string]::IsNullOrEmpty($dockerCheck)) {
    Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
    Write-Host "Please start the 'Docker Desktop' application and wait for it to be ready," -ForegroundColor Red
    Write-Host "then run this script again." -ForegroundColor Red
    Write-Host ""
    Exit
}
Write-Host "[OK] Docker Desktop is running. Node name: $dockerCheck" -ForegroundColor Green

# 2. Check if Jenkins container already exists
Write-Host "[2/3] Auditing existing Jenkins containers..." -ForegroundColor Gray
$existingContainer = ""
try {
    $existingContainer = docker ps -a --filter "name=jenkins-control" --format "{{.ID}}" 2>$null
} catch {
    $existingContainer = ""
}

if (![string]::IsNullOrEmpty($existingContainer)) {
    Write-Host "Found existing Jenkins container ('jenkins-control'). Starting it..." -ForegroundColor Yellow
    docker start jenkins-control > $null
} else {
    Write-Host "Creating fresh Docker-enabled Jenkins instance..." -ForegroundColor Yellow
    # Create persistent volume for Jenkins configurations
    docker volume create jenkins_configs > $null
    
    # Spin up Jenkins container mounting the Windows Docker Desktop socket
    # Mounting the docker socket allows Jenkins to run "docker build" directly on your host daemon!
    docker run -d `
      -p 8090:8080 `
      -p 50000:50000 `
      --name jenkins-control `
      -v jenkins_configs:/var/jenkins_home `
      -v //var/run/docker.sock:/var/run/docker.sock `
      -u root `
      jenkins/jenkins:lts > $null
}

# 3. Retrieve Initial Admin Password
Write-Host "[3/3] Waiting for Jenkins container to start..." -ForegroundColor Gray
Start-Sleep -Seconds 6

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "[OK] Jenkins is online and ready!" -ForegroundColor Green
Write-Host "  URL: http://localhost:8090" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Fetching Jenkins Administrator Setup Password..." -ForegroundColor Green
Write-Host "Please wait a moment while Jenkins sets up files..." -ForegroundColor Gray
Start-Sleep -Seconds 5

$jenkinsPass = ""
try {
    $jenkinsPass = docker exec jenkins-control cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
    $jenkinsPass = $jenkinsPass.Trim()
} catch {
    $jenkinsPass = ""
}

if (![string]::IsNullOrEmpty($jenkinsPass)) {
    Write-Host "--------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "  YOUR SETUP PASSWORD:  $jenkinsPass" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------------" -ForegroundColor Yellow
} else {
    Write-Host "Container is taking a bit longer to generate credentials." -ForegroundColor Yellow
    Write-Host "To fetch it manually later, run this command in terminal:" -ForegroundColor Yellow
    Write-Host "  docker exec jenkins-control cat /var/jenkins_home/secrets/initialAdminPassword" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "HOW TO CONFIGURE PIPELINE IN JENKINS UI:" -ForegroundColor Green
Write-Host "1. Open http://localhost:8090 in browser." -ForegroundColor Gray
Write-Host "2. Paste the setup password shown above and install recommended plugins." -ForegroundColor Gray
Write-Host "3. Create a 'Pipeline' project named 'SeeCommerce'." -ForegroundColor Gray
Write-Host "4. Under 'Pipeline' settings, select 'Pipeline script from SCM'." -ForegroundColor Gray
Write-Host "5. Set SCM to 'Git' and point Repository URL to this folder." -ForegroundColor Gray
Write-Host "6. Enter 'Jenkinsfile' as the Script Path and click 'Save' then 'Build Now'!" -ForegroundColor Gray
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
