import CopyButton from './CopyButton';

const START_COMMAND = `cd "C:\\Users\\John\\My Drive\\Business Operations\\theaipicker-platform" && claude`;
const STOP_COMMAND = `/exit`;

export default function ClaudeCodePage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">Operations</div>
          <h1>Launch Claude Code</h1>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Start a Claude Code session</h2>
              <div className="admin-card-sub">
                Three steps to spin up the local agent that powers the bridge.
              </div>
            </div>
          </div>

          <ol className="admin-cc-steps">
            <li className="admin-cc-step">
              <div className="admin-cc-step-number">1</div>
              <div className="admin-cc-step-body">
                <h3 className="admin-cc-step-title">Open Command Prompt</h3>
                <p className="admin-cc-step-text">
                  Press <kbd className="admin-cc-kbd">Win</kbd>
                  <span className="admin-cc-kbd-plus">+</span>
                  <kbd className="admin-cc-kbd">R</kbd> to open the Run dialog,
                  type <code className="admin-cc-inline">cmd</code>, then press{' '}
                  <kbd className="admin-cc-kbd">Enter</kbd>.
                </p>
              </div>
            </li>

            <li className="admin-cc-step">
              <div className="admin-cc-step-number">2</div>
              <div className="admin-cc-step-body">
                <h3 className="admin-cc-step-title">Start Claude Code</h3>
                <p className="admin-cc-step-text">
                  Paste this command into Command Prompt and press{' '}
                  <kbd className="admin-cc-kbd">Enter</kbd>. It moves into the
                  project folder and launches Claude Code.
                </p>
                <div className="admin-cc-command">
                  <code className="admin-cc-command-text">{START_COMMAND}</code>
                  <CopyButton text={START_COMMAND} />
                </div>
              </div>
            </li>

            <li className="admin-cc-step">
              <div className="admin-cc-step-number">3</div>
              <div className="admin-cc-step-body">
                <h3 className="admin-cc-step-title">Stop Claude Code</h3>
                <p className="admin-cc-step-text">
                  When you&apos;re done, type this inside the Claude Code session
                  and press <kbd className="admin-cc-kbd">Enter</kbd> to exit
                  cleanly.
                </p>
                <div className="admin-cc-command">
                  <code className="admin-cc-command-text">{STOP_COMMAND}</code>
                  <CopyButton text={STOP_COMMAND} />
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </>
  );
}
