import subprocess
import sys
import os
import signal
from pathlib import Path
from typing import List, Optional


def _run_command(command: List[str], cwd: Optional[Path] = None) -> subprocess.Popen:
    """
    Helper that starts a subprocess with the given command.

    Parameters
    ----------
    command: List[str]
        The command and its arguments.
    cwd: Optional[Path]
        Working directory for the command. If ``None`` the current
        working directory is used.

    Returns
    -------
    subprocess.Popen
        The started process.
    """
    try:
        proc = subprocess.Popen(
            command,
            cwd=str(cwd) if cwd else None,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        return proc
    except FileNotFoundError as exc:
        print(f"Error: command not found: {command[0]}", file=sys.stderr)
        raise exc
    except Exception as exc:
        print(f"Failed to start command {' '.join(command)}: {exc}", file=sys.stderr)
        raise exc


def _stream_output(proc: subprocess.Popen) -> None:
    """
    Stream the subprocess output to the console in real time.
    """
    assert proc.stdout is not None  # for mypy
    try:
        for line in proc.stdout:
            print(line, end="")  # line already contains newline
    except KeyboardInterrupt:
        # Propagate the interrupt to the child process
        proc.send_signal(signal.SIGINT)


def _terminate_process(proc: subprocess.Popen) -> None:
    """
    Gracefully terminate a subprocess, falling back to kill if needed.
    """
    if proc.poll() is None:  # still running
        proc.send_signal(signal.SIGINT)
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


def _install_dependencies(project_root: Path) -> bool:
    """
    Run ``npm install`` in the project root.

    Returns
    -------
    bool
        ``True`` if the installation succeeded, ``False`` otherwise.
    """
    print("Installing npm dependencies...")
    proc = _run_command(["npm", "install"], cwd=project_root)
    _stream_output(proc)
    success = proc.wait() == 0
    if not success:
        print("npm install failed.", file=sys.stderr)
    return success


def _run_dev_server(project_root: Path) -> None:
    """
    Starts the Vite development server (``npm run dev``) and streams its output.
    The function blocks until the server exits or the user interrupts with Ctrl+C.
    """
    print("Starting Vite development server...")
    proc = _run_command(["npm", "run", "dev"], cwd=project_root)

    try:
        _stream_output(proc)
        proc.wait()
    except KeyboardInterrupt:
        print("\nInterrupted by user – shutting down dev server...")
        _terminate_process(proc)


def _run_build(project_root: Path) -> None:
    """
    Runs ``npm run build`` to produce a production bundle.
    """
    print("Building the application...")
    proc = _run_command(["npm", "run", "build"], cwd=project_root)
    _stream_output(proc)
    if proc.wait() == 0:
        print("Build completed successfully.")
    else:
        print("Build failed.", file=sys.stderr)


def main(argv: Optional[List[str]] = None) -> int:
    """
    Entry point for the Python side of the project.

    Supported commands:
        * ``dev``   – start the Vite dev server (default)
        * ``build`` – create a production build
        * ``install`` – only install npm dependencies

    Returns
    -------
    int
        Exit code (0 = success, non‑zero = error).
    """
    if argv is None:
        argv = sys.argv[1:]

    # Resolve the repository root (directory containing this file)
    project_root = Path(__file__).resolve().parent

    # Simple command parsing
    command = argv[0] if argv else "dev"

    if command not in {"dev", "build", "install"}:
        print(f"Unknown command: {command!r}", file=sys.stderr)
        print("Available commands: dev, build, install", file=sys.stderr)
        return 1

    # Ensure node & npm are available before proceeding
    for tool in ("node", "npm"):
        if not shutil.which(tool):
            print(f"Required tool '{tool}' is not installed or not on PATH.", file=sys.stderr)
            return 1

    # Install dependencies unless the user explicitly asked only for install
    if command != "install":
        if not _install_dependencies(project_root):
            return 1

    if command == "dev":
        _run_dev_server(project_root)
    elif command == "build":
        _run_build(project_root)
    elif command == "install":
        # Already performed the install step above
        pass

    return 0


if __name__ == "__main__":
    import shutil

    sys.exit(main())