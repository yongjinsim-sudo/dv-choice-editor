export const choiceEditorStyles = `
:root {
	--dv-bg: #111314;
	--dv-surface: #1f2123;
	--dv-surface-2: #24272a;
	--dv-border: #33373b;
	--dv-border-soft: #2b2f33;
	--dv-text: #d6d6d6;
	--dv-muted: #a0a5aa;
	--dv-accent: #2f8ec3;
	--dv-accent-soft: rgba(47, 142, 195, 0.18);
	--dv-warning: #d8a93b;
	--dv-danger: #df7b69;
	--dv-success: #67c587;
}

* { box-sizing: border-box; }
body {
	margin: 0;
	padding: 24px;
	background: var(--vscode-editor-background, var(--dv-bg));
	color: var(--vscode-editor-foreground, var(--dv-text));
	font-family: var(--vscode-font-family);
	font-size: var(--vscode-font-size);
}

.dv-shell { max-width: 1440px; margin: 0 auto; }
.dv-hero {
	display: flex;
	justify-content: space-between;
	gap: 24px;
	align-items: center;
	padding: 24px;
	border: 1px solid var(--dv-border);
	border-radius: 14px;
	background: linear-gradient(135deg, rgba(37,39,42,0.98), rgba(31,33,35,0.98));
	box-shadow: 0 8px 28px rgba(0,0,0,0.18);
}
.dv-kicker {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 11px;
	color: var(--dv-muted);
	margin-bottom: 10px;
}
.dv-hero h1 { margin: 0; font-size: 30px; line-height: 1.15; }
.dv-subtitle { margin: 10px 0 0; color: var(--dv-muted); }
.dv-logo-card {
	width: 88px;
	height: 88px;
	border: 1px solid var(--dv-border);
	border-radius: 18px;
	display: grid;
	place-items: center;
	background: rgba(0,0,0,0.22);
	flex: 0 0 auto;
}
.dv-logo-card img { width: 76px; height: 76px; object-fit: contain; }


.dv-message {
	margin: 0 0 18px;
	border: 1px solid var(--dv-border);
	border-radius: 10px;
	padding: 10px 12px;
	background: rgba(255,255,255,0.035);
	color: var(--dv-muted);
}
.dv-message.Error { border-color: rgba(223,123,105,.7); color: #ffd8d2; }
.dv-message.Warning { border-color: rgba(216,169,59,.7); color: #ffe6a3; }
.dv-message.Info { border-color: rgba(47,142,195,.7); color: #dff4ff; }

.dv-toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	margin: 18px 0;
	flex-wrap: wrap;
}
.dv-pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
.dv-pill {
	border: 1px solid var(--dv-border);
	border-radius: 999px;
	padding: 6px 10px;
	color: var(--dv-muted);
	background: rgba(255,255,255,0.03);
}
.dv-pill.accent { color: #dff4ff; border-color: rgba(47,142,195,0.48); background: var(--dv-accent-soft); }
.dv-pill.grey { color: #d6d6d6; border-color: rgba(160,165,170,0.55); background: rgba(160,165,170,0.12); }
.dv-pill.success { color: #daf8e4; border-color: rgba(103,197,135,0.55); background: rgba(103,197,135,0.13); }
.dv-pill.warning { color: #ffe6a3; border-color: rgba(216,169,59,0.55); background: rgba(216,169,59,0.13); }
.dv-pill.danger { color: #ffd8d2; border-color: rgba(223,123,105,0.55); background: rgba(223,123,105,0.13); }
.dv-actions { display: flex; gap: 8px; flex-wrap: wrap; }
button {
	border: 1px solid var(--dv-border);
	border-radius: 8px;
	padding: 8px 12px;
	background: var(--dv-surface-2);
	color: var(--dv-text);
	cursor: pointer;
}
button.primary { background: var(--dv-accent); border-color: var(--dv-accent); color: #fff; }
button.warning-primary { background: #b98716; border-color: #d8a93b; color: #fff; }
button.danger-primary { background: #b94c3f; border-color: #df7b69; color: #fff; }
button:disabled { opacity: .55; cursor: not-allowed; }

.dv-summary-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(160px, 1fr));
	gap: 12px;
	margin-bottom: 18px;
}
.dv-card {
	border: 1px solid var(--dv-border);
	border-radius: 12px;
	background: var(--dv-surface);
	padding: 16px;
}
.dv-card.highlight { border-left: 4px solid var(--dv-accent); }
.dv-card.warning { border-left: 4px solid var(--dv-warning); }
.dv-card-title { color: var(--dv-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
.dv-card-value { font-size: 28px; font-weight: 700; margin-top: 8px; }
.dv-card-caption { color: var(--dv-muted); margin-top: 6px; }

.dv-section { margin-top: 18px; }
.dv-section h2 { margin: 0 0 8px; font-size: 21px; }
.dv-section p { margin: 0 0 14px; color: var(--dv-muted); }
.dv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dv-field label { display: block; color: var(--dv-muted); margin-bottom: 6px; }
select, input {
	width: 100%;
	border: 1px solid var(--dv-border);
	border-radius: 8px;
	padding: 9px 10px;
	background: var(--vscode-input-background, #151719);
	color: var(--vscode-input-foreground, var(--dv-text));
}

.dv-table-wrap {
	border: 1px solid var(--dv-border);
	border-radius: 12px;
	overflow: hidden;
	background: var(--dv-surface);
}
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 11px 12px; border-bottom: 1px solid var(--dv-border-soft); }
th { color: var(--dv-muted); font-size: 12px; background: rgba(255,255,255,.025); }
.dv-row-pending { background: rgba(103,197,135,0.06); }
.dv-pending-list { display: grid; gap: 8px; margin: 0 0 14px; }
.dv-pending-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--dv-border-soft); border-radius: 10px; background: rgba(255,255,255,0.03); }
.dv-empty { padding: 34px; text-align: center; color: var(--dv-muted); }

.dv-preview-card { border-left: 4px solid var(--dv-warning); }
.dv-preview-card.grey-preview { border-left-color: var(--dv-muted); }
.dv-preview-card.warning-preview { border-left-color: var(--dv-warning); }
.dv-preview-card.danger-preview { border-left-color: var(--dv-danger); }
.dv-preview-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 14px; }
.dv-preview-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(140px, 1fr));
	gap: 10px;
	margin: 12px 0 16px;
}
.dv-preview-grid div {
	border: 1px solid var(--dv-border-soft);
	border-radius: 10px;
	background: rgba(255,255,255,0.025);
	padding: 12px;
}
.dv-preview-grid span { display: block; color: var(--dv-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px; }
.dv-preview-grid strong { display: block; overflow-wrap: anywhere; }
.dv-preview-grid em { display: block; margin-top: 6px; color: var(--dv-muted); font-style: normal; font-size: 12px; }
.dv-preview-card h3 { margin: 8px 0 10px; }
.dv-preview-operations { display: grid; gap: 10px; margin-bottom: 14px; }
.dv-preview-operation { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border: 1px solid var(--dv-border-soft); border-radius: 10px; background: rgba(255,255,255,0.03); }
.dv-preview-operation div { line-height: 1.55; }
.dv-preview-operation span:not(.dv-pill) { color: var(--dv-muted); }
.dv-preview-note { color: var(--dv-muted); border: 1px solid rgba(216,169,59,0.35); background: rgba(216,169,59,0.08); border-radius: 10px; padding: 10px 12px; margin-bottom: 14px; }

.dv-footer-note { margin-top: 20px; color: var(--dv-muted); font-size: 12px; }

@media (max-width: 900px) {
	.dv-summary-grid, .dv-form-grid, .dv-preview-grid { grid-template-columns: 1fr; }
	.dv-hero { align-items: flex-start; }
}
`;
