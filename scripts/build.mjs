// Vinext calls process.exit immediately after closing its prerender server.
// On Windows, allow pending native handle-close callbacks to drain first.
const exit = process.exit.bind(process);
if (process.platform === 'win32') {
  process.exit = (code) => {
    if (code !== undefined && code !== 0) return exit(code);
    process.exitCode = 0;
    setTimeout(() => exit(process.exitCode ?? 0), 1500);
  };
}
process.argv = [process.argv[0], 'vinext', 'build', ...process.argv.slice(2)];
await import('../node_modules/vinext/dist/cli.js');

