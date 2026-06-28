'use strict';
// Map shard — NUU Flint plugin command module.
//
// Loaded at runtime by the NUU Flint Obsidian plugin, which scans
// `Shards/(Shards) Plugin Commands/` and calls `register(ctx)` on each module.
// This file is hand-written CommonJS (no build step) and runs as arbitrary code
// in Obsidian's renderer.
//
// ctx = {
//   plugin,            // the NUU Flint plugin instance
//   app,               // Obsidian App
//   obsidian,          // the live obsidian module (Modal, Setting, Notice, TFolder, …)
//   addCommand,        // bound plugin.addCommand — commands unload with the plugin
// }
//
// Command: "Map: New note in a map" — pick a map, type a title, create the note
// inside that map's folder, populated to match tmp-map-note-v0.1.

function register(ctx) {
	const { app, obsidian, addCommand } = ctx;
	const { Modal, Setting, Notice, TFolder } = obsidian;

	function listMapFolders() {
		const root = app.vault.getAbstractFileByPath('Mesh/Maps');
		if (!(root instanceof TFolder)) return [];
		return root.children
			.filter((child) => child instanceof TFolder && child.name.startsWith('(Map) '))
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	async function createNoteInMap(mapFolder, rawTitle) {
		const heading = String(rawTitle).trim();
		if (!heading) throw new Error('Note title is required.');
		const fileTitle = heading.replace(/[\\/:]/g, '-');
		const mapName = mapFolder.name.replace(/^\(Map\)\s*/, '');
		const notePath = `${mapFolder.path}/${fileTitle}.md`;
		if (app.vault.getAbstractFileByPath(notePath)) {
			throw new Error(`A note named "${fileTitle}" already exists in ${mapName}.`);
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
			`map: "[[(Map) ${mapName}]]"\n` +
			'description: \n' +
			'contact: \n' +
			'orbh-sessions: \n' +
			'template: "[[tmp-map-note-v0.1]]"\n' +
			`created: ${today}\n` +
			`modified: ${today}\n` +
			'---\n\n' +
			`# ${heading}\n\n`;
		return app.vault.create(notePath, content);
	}

	class MapNewNoteModal extends Modal {
		constructor() {
			super(app);
			this.mapFolders = listMapFolders();
			this.selectedPath = this.mapFolders.length ? this.mapFolders[0].path : '';
			this.noteTitle = '';
		}

		onOpen() {
			this.contentEl.createEl('h3', { text: 'New note in a map' });
			if (this.mapFolders.length === 0) {
				this.contentEl.createDiv({
					text: 'No maps found under Mesh/Maps. Create one first with `flint shard map create "<Name>"`.',
				});
				return;
			}
			new Setting(this.contentEl).setName('Map').addDropdown((dropdown) => {
				for (const folder of this.mapFolders) {
					dropdown.addOption(folder.path, folder.name.replace(/^\(Map\)\s*/, ''));
				}
				dropdown.setValue(this.selectedPath);
				dropdown.onChange((value) => {
					this.selectedPath = value;
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
			const folder = this.mapFolders.find((item) => item.path === this.selectedPath);
			if (!folder) {
				new Notice('Select a map.');
				return;
			}
			if (!this.noteTitle.trim()) {
				new Notice('Note title is required.');
				return;
			}
			try {
				const file = await createNoteInMap(folder, this.noteTitle);
				this.close();
				await app.workspace.getLeaf(true).openFile(file);
				new Notice(`Created note in ${folder.name.replace(/^\(Map\)\s*/, '')}`);
			} catch (error) {
				new Notice(error instanceof Error ? error.message : String(error));
			}
		}

		onClose() {
			this.contentEl.empty();
		}
	}

	addCommand({
		id: 'map-new-note',
		name: 'Map: New note in a map',
		callback: () => new MapNewNoteModal().open(),
	});
}

module.exports = { register };
