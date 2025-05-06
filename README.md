# TypeFighter
A web application that gamifies the process of learning one's own typing speed and provides a leaderboard to see where one ranks.
<br>

## Overview
- Low Latency Accurate **WPM Measurement**
- **Varied Text Displays** (Typing Prompts)
- **Game Leaderboard** (Retro / Arcade Style)

Supported Versions:
- Windows 11

## Install Dependencies <br>
- `Python`: 3.11.9
- `Flask`: 3.1.0
- `React`: 19.1.0

**1. Create Virtual Environment**
```powershell
python -m venv venv
```

**2a. Activate Virtual Environment**

| System  | Command                   |
|---------|---------------------------|
| Windows | venv/Scripts/Activate.ps1 |
| Linux   | . .venv/bin/activate      |
 
**3. Install Flask**

```powershell
pip install Flask
```

**4. Install Node.js for React**

- Be sure to restart your system after installing Node.js. Executable can be found on the Node.js website.

**5. Update matching version**

- Users may encounter the message "'react-scripts' is not recognized as an internal or external command" if the dependency versions are not matching.

Update command:
```powershell
python.exe -m pip install --upgrade pip
```

Check version
```powershell
Flask --version
npm version
npm view react version
```

## Run Project
**1. Activate Virtual Environment**

| System  | Command                   |
|---------|---------------------------|
| Windows | venv/Scripts/Activate.ps1 |
| Linux   | . .venv/bin/activate      |

**2. Create back-end instance (Linux)**
```powershell
npm run start-api
```

**3. Create browser instance (Windows)**
```powershell
npm run start
```

**4. Run Flask instance (Windows) in debug-mode**
```commandline
flask --app main run --debug
```

### Github Commit Legend:
📄 Documentation <br>
✨ New Feature <br>
🦄 Code Refactoring <br>
🔨 Build & Deployment <br>
🐞 Bugfix <br>

### Metadata
Developers: Keith Bui, Patton Tang
- Roles: project planning, development, documentation, and implementation
- **Technologies**: React, Flask, Github & Git (Version Control)
- **Language(s)**: Python, JavaScript
