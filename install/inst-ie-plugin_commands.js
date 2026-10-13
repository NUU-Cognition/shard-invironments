'use strict';
// Invironments shard — NUU Flint plugin command module.
//
// Loaded at runtime by the NUU Flint Obsidian plugin, which scans
// `Shards/(Shards) Plugin Commands/` and calls `register(ctx)` on each module.
// This file is hand-written CommonJS (no build step) and runs as arbitrary code
// in Obsidian's renderer.
//
// ctx = {
//   plugin,            // the NUU Flint plugin instance
//   app,               // Obsidian App
//   obsidian,          // the live obsidian module (Modal, Setting, Notice, …)
//   addCommand,        // bound plugin.addCommand — commands unload with the plugin
// }
//
// Command: "IE: New note in a section" — pick a mesh section (a header found
// by a frontmatter scan), type a title, and create the note in the section
// folder, next to the header, with the section tag #ie/sections/<key>. The
// folder has meaning: a member of a section is in its section folder.

function register(ctx) {
	const { app, obsidian, addCommand } = ctx;
	const { Modal, Setting, Notice } = obsidian;

	// A section header is the file "(Section) <Name>.md" directly in its section
	// folder "(Section) <Name>/", with the tags "#ie" and "#ie/sections/<key>".
	function listHeaders() {
		const out = [];
		for (const file of app.vault.getMarkdownFiles()) {
			if (!file.name.startsWith('(Section) ')) continue;
			if (!file.parent || file.parent.name !== file.basename) continue;
			const fm = app.metadataCache.getFileCache(file)?.frontmatter;
			const tags = fm && Array.isArray(fm.tags) ? fm.tags : [];
			if (!tags.some((t) => String(t).replace(/^#/, '') === 'ie')) continue;
			const match = tags.map((t) => String(t).replace(/^#/, '')).find((t) => t.startsWith('ie/sections/'));
			if (!match) continue;
			const slug = match.slice('ie/sections/'.length);
			out.push({ file, slug, name: file.basename.replace(/^\(Section\)\s*/, '') });
		}
		return out.sort((a, b) => a.name.localeCompare(b.name));
	}

	async function createNoteInSection(header, rawTitle) {
		const heading = String(rawTitle).trim();
		if (!heading) throw new Error('Note title is required.');
		const fileTitle = heading.replace(/[\\/:]/g, '-');
		const folder = header.file.parent ? header.file.parent.path : '';
		const notePath = folder ? `${folder}/${fileTitle}.md` : `${fileTitle}.md`;
		if (app.vault.getAbstractFileByPath(notePath)) {
			throw new Error(`A note named "${fileTitle}" already exists in ${header.name}.`);
		}
		const today = new Date().toISOString().slice(0, 10);
		const uuid =
			globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
				? globalThis.crypto.randomUUID()
				: require('crypto').randomUUID();
		const content =
			'---\n' +
			`id: ${uuid}\n` +
			'tags:\n  - "#note"\n' +
			`  - "#ie/sections/${header.slug}"\n` +
			'description: \n' +
			'contact: \n' +
			'orbh-sessions: \n' +
			'template: "[[tmp-ie-note-v0.2]]"\n' +
			`created: ${today}\n` +
			`modified: ${today}\n` +
			'---\n\n' +
			`# ${heading}\n\n`;
		return app.vault.create(notePath, content);
	}

	class IeNewNoteModal extends Modal {
		constructor() {
			super(app);
			this.headers = listHeaders();
			// Default to New when present — the dump section.
			const dump = this.headers.find((h) => h.slug === 'new');
			this.selectedSlug = dump ? dump.slug : this.headers.length ? this.headers[0].slug : '';
			this.noteTitle = '';
		}

		onOpen() {
			this.contentEl.createEl('h3', { text: 'New note in a section' });
			if (this.headers.length === 0) {
				this.contentEl.createDiv({
					text: 'No section headers found. Create one first with `flint shard ie section "<Name>"`.',
				});
				return;
			}
			new Setting(this.contentEl).setName('Section').addDropdown((dropdown) => {
				for (const h of this.headers) {
					dropdown.addOption(h.slug, `${h.name} (ie/sections/${h.slug})`);
				}
				dropdown.setValue(this.selectedSlug);
				dropdown.onChange((value) => {
					this.selectedSlug = value;
				});
			});
			new Setting(this.contentEl).setName('Note title').addText((text) => {
				text.setPlaceholder('A complete claim or concept').onChange((value) => {
					this.noteTitle = value;
				});
				text.inputEl.addEventListener('keydown', (event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						void this.submit();
					}
				});
			});
			new Setting(this.contentEl).addButton((button) =>
				button
					.setButtonText('Create note')
					.setCta()
					.onClick(() => void this.submit()),
			);
		}

		async submit() {
			const header = this.headers.find((h) => h.slug === this.selectedSlug);
			if (!header) {
				new Notice('Select a section.');
				return;
			}
			if (!this.noteTitle.trim()) {
				new Notice('Note title is required.');
				return;
			}
			try {
				const file = await createNoteInSection(header, this.noteTitle);
				this.close();
				await app.workspace.getLeaf(true).openFile(file);
				new Notice(`Created note in ${header.name}`);
			} catch (error) {
				new Notice(error instanceof Error ? error.message : String(error));
			}
		}

		onClose() {
			this.contentEl.empty();
		}
	}

	addCommand({
		id: 'ie-new-note',
		name: 'IE: New note in a section',
		callback: () => new IeNewNoteModal().open(),
	});
}

module.exports = { register };
